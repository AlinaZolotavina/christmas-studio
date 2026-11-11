import { t } from '../../i18n';
import { images, imageAliases } from '../../data/images';
import { backgrounds } from '../../data/backgrounds';
import { lettering } from '../../data/lettering';
import { decorations } from '../../data/decorations';
import { MAX_TEXT_LENGTH } from '../types';
import { FORMAT_SIZES, MAX_POSTCARDS, MAX_POSTCARD_ELEMENTS, MAX_POSTCARD_CORNER_RADIUS } from './types';
import type { Postcard, PostcardBackground, PostcardElement, PostcardProject } from './types';
const imageIds = new Set([...images.map(image => image.id), ...Object.keys(imageAliases)]);
const backgroundIds = new Set(backgrounds.map(image => image.id));
const letteringIds = new Set(lettering.map(image => image.id));
const decorationIds = new Set(decorations.map(image => image.id));
export const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const positive = (value: unknown): value is number => finite(value) && value > 0;
const isId = (value: unknown): value is string => typeof value === 'string' && value.length > 0 && value.length <= 256;
const color = (value: unknown): value is string => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
export function assert(condition: unknown, message: string): asserts condition { if (!condition)
    throw new Error(message); }
export const isPostcardFormat = (value: unknown) => typeof value === 'string' && Object.hasOwn(FORMAT_SIZES, value);
const validCornerRadius = (value: unknown) => value === undefined || finite(value) && value >= 0 && value <= MAX_POSTCARD_CORNER_RADIUS;
export function validatePostcardBackground(value: unknown): PostcardBackground {
    assert(isRecord(value), t("errors.postcards.validation.backgroundMissing"));
    if (value.kind === 'image') {
        assert(typeof value.assetId === 'string' && backgroundIds.has(value.assetId), t("errors.postcards.validation.backgroundAssetMissing"));
        assert(color(value.color), t("errors.postcards.validation.backgroundOpacity"));
    }
    else {
        assert(['solid', 'linear', 'radial'].includes(String(value.kind)), t("errors.postcards.validation.backgroundType"));
        assert(Array.isArray(value.colors) && value.colors.length >= 1 && value.colors.length <= 3 && value.colors.every(color), t("errors.postcards.validation.backgroundColors"));
        assert(finite(value.angle) && finite(value.centerX) && finite(value.centerY) && value.centerX >= 0 && value.centerX <= 1 && value.centerY >= 0 && value.centerY <= 1, t("errors.postcards.validation.gradientGeometry"));
    }
    return value as unknown as PostcardBackground;
}
export function validatePostcardElement(value: unknown): PostcardElement {
    assert(isRecord(value) && isId(value.id), t("errors.postcards.validation.elementId"));
    assert(finite(value.x) && finite(value.y) && positive(value.width) && positive(value.height), t("errors.postcards.validation.elementGeometry"));
    assert(Number.isFinite(value.x + value.width) && Number.isFinite(value.y + value.height), t("errors.postcards.validation.elementDimensions"));
    assert(finite(value.rotation) && Math.abs(value.rotation / 15 - Math.round(value.rotation / 15)) < 0.000001, t("errors.postcards.validation.rotationStep"));
    assert(typeof value.locked === 'boolean', t("errors.postcards.validation.elementLock"));
    if (value.type === 'text') {
        assert(typeof value.content === 'string' && value.content.length <= MAX_TEXT_LENGTH, t("errors.postcards.validation.textLength", { maxLength: MAX_TEXT_LENGTH }));
        assert(['sans', 'serif', 'script'].includes(String(value.fontId)), t("errors.postcards.validation.fontMissing"));
        assert(finite(value.fontSize) && value.fontSize >= 6 && value.fontSize <= 200, t("errors.postcards.validation.fontSize"));
        assert(['normal', 'bold'].includes(String(value.weight)) && typeof value.italic === 'boolean' && color(value.color) && ['left', 'center', 'right'].includes(String(value.align)), t("errors.postcards.validation.textStyle"));
        assert(finite(value.lineHeight) && value.lineHeight >= 0.5 && value.lineHeight <= 4, t("errors.postcards.validation.lineHeight"));
        assert(finite(value.letterSpacing) && value.letterSpacing >= -20 && value.letterSpacing <= 100, t("errors.postcards.validation.letterSpacing"));
        assert(value.stroke === null || isRecord(value.stroke) && color(value.stroke.color) && finite(value.stroke.width) && value.stroke.width >= 0 && value.stroke.width <= 20, t("errors.postcards.validation.textStroke"));
        assert(value.shadow === null || isRecord(value.shadow) && color(value.shadow.color) && finite(value.shadow.offsetX) && finite(value.shadow.offsetY) && finite(value.shadow.blur) && value.shadow.blur >= 0 && value.shadow.blur <= 30, t("errors.postcards.validation.textShadow"));
    }
    else {
        assert(finite(value.opacity) && value.opacity >= 0 && value.opacity <= 1, t("errors.postcards.validation.opacity"));
        if (value.type === 'image')
            assert(typeof value.assetId === 'string' && imageIds.has(value.assetId), t("errors.postcards.validation.illustrationMissing"));
        else if (value.type === 'lettering')
            assert(typeof value.assetId === 'string' && letteringIds.has(value.assetId), t("errors.postcards.validation.letteringMissing"));
        else if (value.type === 'decoration') {
            assert(['circle', 'star', 'line'].includes(String(value.shape)), t("errors.postcards.validation.decorationShape"));
            assert(value.assetId === undefined || typeof value.assetId === 'string' && decorationIds.has(value.assetId), t("errors.postcards.validation.decorationMissing"));
            assert((value.fill === null || color(value.fill)) && (value.stroke === null || color(value.stroke)), t("errors.postcards.validation.decorationColors"));
            assert(finite(value.strokeWidth) && value.strokeWidth >= 0 && value.strokeWidth <= 20, t("errors.postcards.validation.decorationStroke"));
            assert(finite(value.points) && Number.isInteger(value.points) && value.points >= 4 && value.points <= 12, t("errors.postcards.validation.starPoints"));
        }
        else
            throw new Error(t("errors.postcards.validation.elementType"));
    }
    return value as unknown as PostcardElement;
}
export function validatePostcard(value: unknown): Postcard {
    assert(isRecord(value) && isId(value.id), t("errors.postcards.validation.postcardId"));
    assert(isPostcardFormat(value.format), t("errors.postcards.validation.format"));
    assert(validCornerRadius(value.cornerRadius), t("errors.postcards.validation.cornerRadius", { maxRadius: MAX_POSTCARD_CORNER_RADIUS }));
    validatePostcardBackground(value.background);
    assert(Array.isArray(value.elements) && value.elements.length <= MAX_POSTCARD_ELEMENTS, t("errors.postcards.validation.elementCount", { maxElements: MAX_POSTCARD_ELEMENTS }));
    const ids = new Set<string>();
    for (const element of value.elements) {
        const validated = validatePostcardElement(element);
        assert(!ids.has(validated.id), t("errors.postcards.validation.duplicateElementId"));
        ids.add(validated.id);
    }
    return value as unknown as Postcard;
}
/** Validate every persisted leaf before it reaches the scene or exporter. */
export function validatePostcardProject(value: unknown): PostcardProject {
    assert(isRecord(value), t("errors.postcards.validation.invalidProject"));
    assert(value.schemaVersion === 1 && value.product === 'postcards', t("errors.postcards.validation.unsupportedVersion"));
    assert(isId(value.id), t("errors.postcards.validation.projectId"));
    assert(typeof value.name === 'string' && value.name.trim().length > 0 && value.name.length <= 120, t("errors.postcards.validation.projectName"));
    assert(isPostcardFormat(value.defaultFormat), t("errors.postcards.validation.defaultFormat"));
    assert(validCornerRadius(value.defaultCornerRadius), t("errors.postcards.validation.defaultCornerRadius"));
    assert(Array.isArray(value.postcards) && value.postcards.length >= 1 && value.postcards.length <= MAX_POSTCARDS, t("errors.postcards.validation.postcardCount", { maxPostcards: MAX_POSTCARDS }));
    const cardIds = new Set<string>();
    const elementIds = new Set<string>();
    for (const card of value.postcards) {
        const validated = validatePostcard(card);
        assert(!cardIds.has(validated.id), t("errors.postcards.validation.duplicatePostcardId"));
        cardIds.add(validated.id);
        for (const element of validated.elements) {
            assert(!elementIds.has(element.id), t("errors.postcards.validation.sharedElementId"));
            elementIds.add(element.id);
        }
    }
    assert(typeof value.activePostcardId === 'string' && cardIds.has(value.activePostcardId), t("errors.postcards.validation.activePostcardMissing"));
    return value as unknown as PostcardProject;
}
