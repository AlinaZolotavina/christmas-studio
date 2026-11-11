import { t } from '../../i18n';
import { assets } from '../../content/assets';
import { imageAliases } from '../../data/images';
import { templates } from '../../content/templates';
import { isHoleInside } from '../../domain/geometry';
import { MAX_DECORATIONS, MAX_TEXT_LENGTH } from '../../domain/types';
import type { Card, ProjectDocument } from '../../domain/types';
const assetIds = new Set([...assets.map(asset => asset.id), ...Object.keys(imageAliases)]);
const templateIds = new Set(templates.map(template => template.id));
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const positive = (value: unknown): value is number => finite(value) && value > 0;
const id = (value: unknown): value is string => typeof value === 'string' && value.length > 0 && value.length <= 256;
export const isColor = (value: unknown): value is string => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
function assert(condition: unknown, message: string): asserts condition {
    if (!condition)
        throw new Error(message);
}
function box(value: Record<string, unknown>, label: string) {
    assert(finite(value.x) && finite(value.y) && positive(value.width) && positive(value.height), t("errors.storage.tags.geometry", { label: label }));
    assert(Number.isFinite(value.x + value.width) && Number.isFinite(value.y + value.height), t("errors.storage.tags.dimensions", { label: label }));
}
/** Validate all persisted leaves before the document reaches React, SVG or PDF. */
export function validateProject(value: unknown): ProjectDocument {
    assert(isRecord(value), t("errors.storage.tags.invalidDocument"));
    assert(value.schemaVersion === 1, t("errors.storage.tags.unsupportedVersion"));
    assert(id(value.id), t("errors.storage.tags.projectId"));
    assert(typeof value.name === 'string' && value.name.trim().length > 0 && value.name.length <= 120, t("errors.storage.tags.projectName"));
    assert(typeof value.templateId === 'string' && templateIds.has(value.templateId), t("errors.storage.tags.templateMissing"));
    assert(value.cardCount === 24 || value.cardCount === 31, t("errors.storage.tags.cardCount"));
    assert(typeof value.holeEnabled === 'boolean', t("errors.storage.tags.holeSettings"));
    assert(Array.isArray(value.cards) && value.cards.length === value.cardCount, t("errors.storage.tags.cardSet"));
    const cardIds = new Set<string>();
    for (const [index, card] of value.cards.entries()) {
        const label = t("errors.storage.tags.cardLabel", { position: index + 1 });
        assert(isRecord(card) && id(card.id) && !cardIds.has(card.id), t("errors.storage.tags.cardId", { label: label }));
        cardIds.add(card.id);
        assert(card.number === index + 1, t("errors.storage.tags.cardOrder", { label: label }));
        assert(typeof card.shape === 'string' && ['rectangle', 'square', 'circle', 'oval', 'tag'].includes(card.shape), t("errors.storage.tags.shape", { label: label }));
        assert(positive(card.width) && positive(card.height), t("errors.storage.tags.sizeValues", { label: label }));
        assert(card.shape !== 'circle' && card.shape !== 'square' || Math.abs(card.width - card.height) < 0.000001, t("errors.storage.tags.squareDimensions", { label: label }));
        const text = card.text;
        assert(isRecord(text), t("errors.storage.tags.textMissing", { label: label }));
        box(text, t("errors.storage.tags.textLabel", { label: label }));
        assert(typeof text.content === 'string' && text.content.length <= MAX_TEXT_LENGTH, t("errors.storage.tags.textContent", { label: label }));
        assert(finite(text.fontSize) && text.fontSize >= 6 && text.fontSize <= 72, t("errors.storage.tags.fontSize", { label: label }));
        assert(typeof text.fontId === 'string' && ['sans', 'serif', 'script'].includes(text.fontId), t("errors.storage.tags.fontFamily", { label: label }));
        assert(text.weight === 'normal' || text.weight === 'bold', t("errors.storage.tags.fontWeight", { label: label }));
        assert(typeof text.italic === 'boolean' && isColor(text.color), t("errors.storage.tags.fontStyle", { label: label }));
        assert(typeof text.align === 'string' && ['left', 'center', 'right'].includes(text.align), t("errors.storage.tags.textAlign", { label: label }));
        const illustration = card.illustration;
        assert(isRecord(illustration), t("errors.storage.tags.illustrationMissing", { label: label }));
        box(illustration, t("errors.storage.tags.illustrationLabel", { label: label }));
        assert(typeof illustration.assetId === 'string' && assetIds.has(illustration.assetId), t("errors.storage.tags.illustrationAsset", { label: label }));
        assert(finite(illustration.rotation), t("errors.storage.tags.illustrationAngle", { label: label }));
        const background = card.background;
        assert(isRecord(background), t("errors.storage.tags.backgroundMissing", { label: label }));
        assert(typeof background.kind === 'string' && ['solid', 'linear', 'radial'].includes(background.kind), t("errors.storage.tags.backgroundType", { label: label }));
        assert(Array.isArray(background.colors) && background.colors.length >= 1 && background.colors.length <= 3 && background.colors.every(isColor), t("errors.storage.tags.backgroundColors", { label: label }));
        assert(finite(background.angle) && finite(background.centerX) && finite(background.centerY) && background.centerX >= 0 && background.centerX <= 1 && background.centerY >= 0 && background.centerY <= 1, t("errors.storage.tags.gradientGeometry", { label: label }));
        assert(Array.isArray(card.decorations) && card.decorations.length <= MAX_DECORATIONS, t("errors.storage.tags.decorationCount", { label: label, maxDecorations: MAX_DECORATIONS }));
        const decorationIds = new Set<string>();
        for (const decoration of card.decorations) {
            assert(isRecord(decoration) && id(decoration.id) && !decorationIds.has(decoration.id), t("errors.storage.tags.decorationId", { label: label }));
            decorationIds.add(decoration.id);
            box(decoration, t("errors.storage.tags.decorationLabel", { label: label }));
            assert((decoration.width as number) <= 20 && (decoration.height as number) <= 20, t("errors.storage.tags.decorationDimensions", { label: label }));
            assert(decoration.type === 'circle' || decoration.type === 'star', t("errors.storage.tags.decorationType", { label: label }));
            assert((decoration.fill === null || isColor(decoration.fill)) && (decoration.stroke === null || isColor(decoration.stroke)), t("errors.storage.tags.decorationColors", { label: label }));
            assert(finite(decoration.strokeWidth) && decoration.strokeWidth >= 0.25 && decoration.strokeWidth <= 3, t("errors.storage.tags.decorationStroke", { label: label }));
            assert(finite(decoration.points) && Number.isInteger(decoration.points) && decoration.points >= 4 && decoration.points <= 8, t("errors.storage.tags.starPoints", { label: label }));
        }
        if (card.hole !== null) {
            assert(isRecord(card.hole) && finite(card.hole.x) && finite(card.hole.y), t("errors.storage.tags.hole", { label: label }));
            assert(isHoleInside(card as unknown as Card, { x: card.hole.x, y: card.hole.y }), t("errors.storage.tags.holeOutsideBounds", { label: label }));
        }
    }
    return value as unknown as ProjectDocument;
}
export function decodeProject(raw: string): ProjectDocument {
    let value: unknown;
    try {
        value = JSON.parse(raw);
    }
    catch {
        throw new Error(t("errors.storage.tags.json"));
    }
    return validateProject(value);
}
/** Repair only omitted, unambiguous v1 defaults; never invent missing artwork or text. */
export function repairProject(raw: string): ProjectDocument {
    const value: unknown = JSON.parse(raw);
    assert(isRecord(value) && value.schemaVersion === 1 && Array.isArray(value.cards), t("errors.storage.tags.recovery"));
    value.holeEnabled ??= false;
    for (const card of value.cards) {
        if (!isRecord(card))
            continue;
        card.decorations ??= [];
        card.hole ??= null;
        if (isRecord(card.background)) {
            card.background.angle ??= 90;
            card.background.centerX ??= 0.5;
            card.background.centerY ??= 0.5;
        }
        if (isRecord(card.illustration))
            card.illustration.rotation ??= 0;
        if (isRecord(card.text)) {
            card.text.weight ??= 'normal';
            card.text.italic ??= false;
        }
    }
    return validateProject(value);
}
