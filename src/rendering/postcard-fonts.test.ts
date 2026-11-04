import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createPostcard, createTextElement } from '../domain/postcards/project';
import { layoutText } from './text';

beforeEach(() => vi.resetModules());
afterEach(() => vi.unstubAllGlobals());
function localFonts(missing = '') {
  vi.stubGlobal('fetch', async (url: string) => {
    if (missing && url.includes(missing)) return new Response('', { status: 404 });
    try { return new Response(await readFile(resolve('public', url.replace(/^\.\//, '').replace(/^\//, '')))); }
    catch { return new Response('', { status: 404 }); }
  });
}

describe('shared postcard font outlines', () => {
  it('uses the same kerning, spacing and wrapped baselines for Cyrillic and Latin outlines', async () => {
    localFonts();
    const module = await import('./postcard-fonts');
    const card = createPostcard('a6-portrait');
    card.elements.push(createTextElement({ content: 'С Новым годом!\nMerry Christmas AV', letterSpacing: 1.3, width: 90, height: 40, align: 'right' }));
    const print = await module.preparePostcardFonts([card]);
    expect(print.issues).toEqual([]);
    const text = print.postcards[0].elements[0];
    if (text.type !== 'text') throw new Error('Expected text');
    const measure = print.measureText(text);
    const layout = layoutText(text, measure);
    const paths = module.postcardTextPaths(text, layout, print.fonts.get(module.fontKey(text))!);
    expect(layout.lines).toHaveLength(2);
    expect(paths).toHaveLength(2);
    expect(paths.every(path => path.some(command => command.op === 'c'))).toBe(true);
    expect(paths.flatMap(path => path.flatMap(operation => operation.c)).every(Number.isFinite)).toBe(true);
    const noSpacing = print.measureText({ ...text, letterSpacing: 0 });
    expect(measure('AV') - noSpacing('AV')).toBeCloseTo(1.3 * 25.4 / 72, 5);
    // Cached font resolution must retain the current element's content and geometry.
    expect(module.getPostcardFontState({ ...text, x: 71, content: 'Другой текст' }).text).toMatchObject({ x: 71, content: 'Другой текст' });
    expect(module.getPostcardMissingGlyphs({ ...text, content: '😀' })).toContain('😀');
    const { validatePostcard } = await import('../application/export/postcardValidation');
    expect(validatePostcard({ ...card, elements: [{ ...text, content: '😀' }] })).toContainEqual(expect.objectContaining({ code: 'missing-glyph', severity: 'error', elementId: text.id }));
  });
  it('falls back to local PT Sans and checks text again without changing the source document', async () => {
    localFonts('PTSerif-Italic');
    const module = await import('./postcard-fonts');
    const card = createPostcard('square');
    card.elements.push(createTextElement({ fontId: 'serif', italic: true, content: 'Длинный текст для крошечного блока', height: 1 }));
    const print = await module.preparePostcardFonts([card]);
    const text = print.postcards[0].elements[0];
    if (text.type !== 'text' || card.elements[0].type !== 'text') throw new Error('Expected text');
    expect(text.fontId).toBe('sans');
    expect(card.elements[0].fontId).toBe('serif');
    expect(print.issues.some(issue => issue.code === 'font-replaced')).toBe(true);
    const { validatePostcard } = await import('../application/export/postcardValidation');
    expect(validatePostcard(card)).toContainEqual(expect.objectContaining({ code: 'font-replaced', severity: 'warning', elementId: card.elements[0].id }));
    expect(layoutText(text, print.measureText(text)).overflow).toBe(true);
  });
  it('reports a critical failure if all local fonts are unavailable', async () => {
    vi.stubGlobal('fetch', async () => new Response('', { status: 404 }));
    const module = await import('./postcard-fonts');
    const card = createPostcard('square');
    card.elements.push(createTextElement());
    const print = await module.preparePostcardFonts([card]);
    expect(print.issues).toContainEqual(expect.objectContaining({ code: 'missing-font', severity: 'error' }));
    expect(print.fonts.size).toBe(0);
  });
  it('detects script glyph ink above the frame and retains relative bounds during a move', async () => {
    localFonts();
    const module = await import('./postcard-fonts');
    const card = createPostcard('square');
    card.elements.push(createTextElement({ fontId: 'script', content: 'Merry Christmas', x: 10, y: 10, width: 80, height: 25 }));
    const prepared = await module.preparePostcardFonts([card]);
    const text = prepared.postcards[0].elements[0];
    if (text.type !== 'text') throw new Error('Expected text');
    const layout = layoutText(text, prepared.measureText(text));
    const first = module.getPostcardTextInkBounds(text, layout)!;
    expect(first.y).toBeLessThan(text.y);
    const moved = { ...text, x: 13, y: 17 };
    const next = module.getPostcardTextInkBounds(moved, layoutText(moved, prepared.measureText(moved)))!;
    expect(next.x - first.x).toBeCloseTo(3);
    expect(next.y - first.y).toBeCloseTo(7);
    expect(next.width).toBeCloseTo(first.width);
    const { validatePostcard } = await import('../application/export/postcardValidation');
    const nearEdge = { ...card, elements: [{ ...text, y: 0.1 }] };
    // Its frame is inside the card, but the visible script ascender is outside.
    expect(validatePostcard(nearEdge)).toContainEqual(expect.objectContaining({ code: 'element-outside-postcard', severity: 'error', elementId: text.id }));
  });
});
