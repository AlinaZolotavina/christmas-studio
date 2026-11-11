import { t } from '../i18n';
import { parse, type Font, type PathCommand, type RenderOptions } from 'opentype.js';
import { fonts } from '../content/fonts';
import { loadLocalResourceBytes } from '../infrastructure/resources';
import { ptToMm, type Box, type FontId } from '../domain/types';
import type { Postcard, PostcardTextElement } from '../domain/postcards/types';
import { fontFile, fontStyle, type MeasureText, type TextLayout } from './text';
import type { PathOperation } from '../domain/geometry';
export interface PostcardFontResource {
    key: string;
    font: Font;
    file: string;
    bytes: Uint8Array;
    fontId: FontId;
    weight: 'normal' | 'bold';
    italic: boolean;
}
export interface PostcardFontIssue {
    code: string;
    severity: 'error' | 'warning';
    postcardId: string;
    elementId: string;
    message: string;
}
interface FontState {
    status: 'loading' | 'ready' | 'error';
    resource?: PostcardFontResource;
    message?: string;
}
const states = new Map<string, FontState>();
const requests = new Map<string, Promise<PostcardFontResource>>();
const files = new Map<string, Promise<PostcardFontResource>>();
const listeners = new Set<() => void>();
const inkBoundsCache = new Map<string, Box | null>();
const announce = () => { for (const listener of listeners)
    listener(); };
export const fontKey = (element: Pick<PostcardTextElement, 'fontId' | 'weight' | 'italic'>) => `${element.fontId}:${fontStyle(element)}`;
export const subscribePostcardFonts = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export function getPostcardFontState(element: PostcardTextElement): {
    status: FontState['status'];
    text: PostcardTextElement;
    message?: string;
} {
    const state = states.get(fontKey(element));
    return { status: state?.status ?? 'loading', text: state?.resource ? { ...element, fontId: state.resource.fontId, weight: state.resource.weight, italic: state.resource.italic } : element, message: state?.message };
}
function renderOptions(element: PostcardTextElement): RenderOptions {
    return { kerning: true, letterSpacing: element.fontSize ? element.letterSpacing / element.fontSize : 0 };
}
export function fontTextMeasurer(resource: PostcardFontResource, element: PostcardTextElement): MeasureText {
    return value => value ? Math.max(0, resource.font.getAdvanceWidth(value, ptToMm(element.fontSize), renderOptions(element)) - ptToMm(element.letterSpacing)) : 0;
}
export function getPostcardTextMeasurer(element: PostcardTextElement): MeasureText | undefined {
    const resource = states.get(fontKey(element))?.resource;
    return resource ? fontTextMeasurer(resource, element) : undefined;
}
/** Content can change without loading another face; live checks still detect missing glyphs. */
export function getPostcardMissingGlyphs(element: PostcardTextElement): string[] {
    const resource = states.get(fontKey(element))?.resource;
    return resource ? [...new Set(Array.from(element.content).filter(char => !/\s/u.test(char) && !resource.font.hasChar(char)))] : [];
}
async function readFont(fontId: FontId, style: ReturnType<typeof fontStyle>): Promise<PostcardFontResource> {
    const definition = fonts.find(font => font.id === fontId);
    const file = definition && fontFile(definition, style);
    if (!definition || !file)
        throw new Error(t("errors.fonts.styleUnavailable"));
    if (!files.has(file)) {
        const request = (async () => {
            const bytes = await loadLocalResourceBytes(file);
            const font = parse(bytes.slice().buffer);
            const weight = style === 'bold' || style === 'bolditalic' ? 'bold' : 'normal';
            const italic = style === 'italic' || style === 'bolditalic';
            if (typeof document !== 'undefined' && typeof FontFace !== 'undefined') {
                const face = new FontFace(definition.family, bytes.slice().buffer, { weight: weight === 'bold' ? '700' : '400', style: italic ? 'italic' : 'normal' });
                document.fonts.add(await face.load());
            }
            return { key: `${fontId}:${style}`, font, file, bytes, fontId, weight, italic } as PostcardFontResource;
        })().catch(reason => { files.delete(file); throw reason; });
        files.set(file, request);
    }
    return files.get(file)!;
}
async function loadFont(element: PostcardTextElement): Promise<PostcardFontResource> {
    const key = fontKey(element);
    if (!requests.has(key)) {
        states.set(key, { status: 'loading' });
        const request = (async () => {
            const style = fontStyle(element);
            const choices: Array<[
                FontId,
                ReturnType<typeof fontStyle>
            ]> = [[element.fontId, style], ['sans', style], ['sans', 'normal']];
            for (const [id, variant] of choices.filter(([id, variant], i, all) => all.findIndex(value => value[0] === id && value[1] === variant) === i)) {
                try {
                    const resource = await readFont(id, variant);
                    const replaced = resource.key !== key;
                    states.set(key, { status: 'ready', resource, message: replaced ? t("errors.fonts.fallback") : undefined });
                    states.set(resource.key, { status: 'ready', resource });
                    announce();
                    return resource;
                }
                catch { /* Try the local fallback before treating font availability as critical. */ }
            }
            const message = t("errors.fonts.unavailable");
            states.set(key, { status: 'error', message });
            announce();
            throw new Error(message);
        })().catch(reason => { requests.delete(key); throw reason; });
        requests.set(key, request);
    }
    return requests.get(key)!;
}
export async function preparePostcardFonts(postcards: Postcard[]) {
    const snapshot = structuredClone(postcards);
    const issues: PostcardFontIssue[] = [];
    const resources = new Map<string, PostcardFontResource>();
    const texts = snapshot.flatMap(postcard => postcard.elements.filter((element): element is PostcardTextElement => element.type === 'text').map(element => ({ postcard, element })));
    await Promise.all(texts.map(async ({ postcard, element }) => {
        try {
            const resource = await loadFont(element);
            resources.set(resource.key, resource);
            const resolved = getPostcardFontState(element);
            if (resolved.message)
                issues.push({ code: 'font-replaced', severity: 'warning', postcardId: postcard.id, elementId: element.id, message: resolved.message });
            Object.assign(element, resolved.text);
            const missing = [...new Set(Array.from(element.content).filter(char => !/\s/u.test(char) && !resource.font.hasChar(char)))];
            if (missing.length)
                issues.push({ code: 'missing-glyph', severity: 'error', postcardId: postcard.id, elementId: element.id, message: t("errors.fonts.missingCharacters", { characters: missing.slice(0, 8).join(' ') }) });
        }
        catch (reason) {
            issues.push({ code: 'missing-font', severity: 'error', postcardId: postcard.id, elementId: element.id, message: reason instanceof Error ? reason.message : t("errors.fonts.fontUnavailable") });
        }
    }));
    return { postcards: snapshot, fonts: resources, issues, measureText: (element: PostcardTextElement): MeasureText => {
            const resource = resources.get(fontKey(element));
            return resource ? fontTextMeasurer(resource, element) : () => 0;
        } };
}
function pdfCommands(commands: PathCommand[]): PathOperation[] {
    const operations: PathOperation[] = [];
    let x = 0, y = 0;
    for (const command of commands) {
        if (command.type === 'M' || command.type === 'L') {
            operations.push({ op: command.type === 'M' ? 'm' : 'l', c: [command.x, command.y] });
            x = command.x;
            y = command.y;
        }
        else if (command.type === 'C') {
            operations.push({ op: 'c', c: [command.x1, command.y1, command.x2, command.y2, command.x, command.y] });
            x = command.x;
            y = command.y;
        }
        else if (command.type === 'Q') {
            operations.push({ op: 'c', c: [x + (command.x1 - x) * 2 / 3, y + (command.y1 - y) * 2 / 3, command.x + (command.x1 - command.x) * 2 / 3, command.y + (command.y1 - command.y) * 2 / 3, command.x, command.y] });
            x = command.x;
            y = command.y;
        }
        else
            operations.push({ op: 'h', c: [] });
    }
    return operations;
}
export function postcardTextPaths(element: PostcardTextElement, layout: TextLayout, resource: PostcardFontResource): PathOperation[][] {
    return layout.lines.map((line, i) => {
        const x = element.x + (element.align === 'center' ? (element.width - layout.widths[i]) / 2 : element.align === 'right' ? element.width - layout.widths[i] : 0);
        return pdfCommands(resource.font.getPath(line, x, layout.baselines[i], ptToMm(element.fontSize), renderOptions(element)).commands);
    });
}
/** True glyph ink can overhang a text frame, especially in italic and script fonts. */
export function getPostcardTextInkBounds(element: PostcardTextElement, layout: TextLayout): Box | undefined {
    const resource = states.get(fontKey(element))?.resource;
    if (!resource)
        return undefined;
    // Position is excluded so pointer moves reuse the calculated glyph geometry.
    const key = JSON.stringify([resource.key, element.fontSize, element.letterSpacing, element.width, element.align, layout.lines, layout.widths, layout.baselines.map(value => value - element.y)]);
    if (!inkBoundsCache.has(key)) {
        let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
        layout.lines.forEach((line, i) => {
            if (!line.trim())
                return;
            const x = element.align === 'center' ? (element.width - layout.widths[i]) / 2 : element.align === 'right' ? element.width - layout.widths[i] : 0;
            const path = resource.font.getPath(line, x, layout.baselines[i] - element.y, ptToMm(element.fontSize), renderOptions(element));
            if (!path.commands.length)
                return;
            const bounds = path.getBoundingBox();
            left = Math.min(left, bounds.x1);
            top = Math.min(top, bounds.y1);
            right = Math.max(right, bounds.x2);
            bottom = Math.max(bottom, bounds.y2);
        });
        inkBoundsCache.set(key, Number.isFinite(left) ? { x: left, y: top, width: right - left, height: bottom - top } : null);
        if (inkBoundsCache.size > 512)
            inkBoundsCache.delete(inkBoundsCache.keys().next().value!);
    }
    const bounds = inkBoundsCache.get(key);
    return bounds ? { ...bounds, x: element.x + bounds.x, y: element.y + bounds.y } : undefined;
}
