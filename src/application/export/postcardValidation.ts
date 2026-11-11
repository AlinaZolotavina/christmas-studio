import { t } from '../../i18n';
import { getPostcardResource } from '../../content/postcard-assets';
import { getPostcardSize, type Postcard, type PostcardElement, type PostcardProject } from '../../domain/postcards/types';
import { postcardContainsBox } from '../../domain/postcards/geometry';
import { createPostcardScene, type PostcardSceneOptions } from '../../rendering/scene';
import { getPostcardFontState, getPostcardMissingGlyphs } from '../../rendering/postcard-fonts';
import type { PostcardExportScope } from './postcardLayout';
export interface PostcardValidationIssue {
    code: string;
    severity: 'error' | 'warning';
    message: string;
    postcardId?: string;
    elementId?: string;
    pageIndex?: number;
}
export interface PostcardValidationOptions extends PostcardSceneOptions {
    scope?: PostcardExportScope;
    preflight?: boolean;
}
function validatePostcards(cards: Postcard[], options: PostcardValidationOptions): PostcardValidationIssue[] {
    const issues: PostcardValidationIssue[] = [];
    for (const postcard of cards) {
        const { width, height } = getPostcardSize(postcard);
        const issue = (code: string, severity: PostcardValidationIssue['severity'], message: string, element?: PostcardElement) => issues.push({ code, severity, message, postcardId: postcard.id, elementId: element?.id });
        if (postcard.background.kind === 'image') {
            const resource = getPostcardResource('background', postcard.background.assetId);
            if (!resource)
                issue('missing-background', 'error', t("validation.postcards.backgroundMissing"));
            else if (options.preflight && resource.format !== 'svg') {
                // Cover crops the source at its largest scale; cropped pixels do not increase DPI.
                const dpi = 25.4 / Math.max(width / resource.width, height / resource.height);
                if (dpi < 299.5)
                    issue('background-resolution', 'warning', t("validation.postcards.backgroundResolution", { dpi: Math.round(dpi) }));
            }
        }
        const scene = createPostcardScene(postcard, options);
        for (const node of scene.nodes) {
            const element = node.element;
            const bounds = node.bounds;
            const outside = !postcardContainsBox(postcard, bounds);
            if (outside)
                issue('element-outside-postcard', 'error', t("validation.postcards.outsideBounds"), element);
            else if (options.preflight && !postcardContainsBox(postcard, bounds, 3))
                issue('safe-margin', 'warning', t("validation.postcards.nearEdge"), element);
            if (node.type === 'text') {
                if (node.layout.overflow)
                    issue('text-overflow', 'error', t("validation.postcards.textOverflow"), element);
                const original = postcard.elements.find(item => item.id === node.id);
                const state = getPostcardFontState(original?.type === 'text' ? original : node.element);
                if (state.status === 'error')
                    issue('missing-font', 'error', state.message ?? t("validation.fontUnavailable"), element);
                else if (state.message)
                    issue('font-replaced', 'warning', state.message, element);
                const missing = getPostcardMissingGlyphs(node.element);
                if (missing.length)
                    issue('missing-glyph', 'error', t("validation.missingCharacters", { characters: missing.slice(0, 8).join(' ') }), element);
            }
            else if (element.type !== 'text') {
                const resource = element.type === 'decoration' ? element.assetId && getPostcardResource('decoration', element.assetId) : getPostcardResource(element.type, element.assetId);
                if (element.type === 'decoration' && !element.assetId)
                    continue;
                if (!resource) {
                    issue('missing-resource', 'error', t("validation.postcards.graphicMissing"), element);
                    continue;
                }
                if (options.preflight && resource.format !== 'svg') {
                    const dpi = 25.4 / Math.min(element.width / resource.width, element.height / resource.height);
                    if (dpi < 299.5)
                        issue('image-resolution', 'warning', t("validation.postcards.imageResolution", { dpi: Math.round(dpi) }), element);
                }
            }
        }
    }
    return issues;
}
export function validatePostcard(postcard: Postcard, options: PostcardValidationOptions = {}): PostcardValidationIssue[] {
    return validatePostcards([postcard], options);
}
export function validatePostcardProject(project: PostcardProject, options: PostcardValidationOptions = {}): PostcardValidationIssue[] {
    return validatePostcards(options.scope === 'current' ? project.postcards.filter(card => card.id === project.activePostcardId) : project.postcards, options);
}
