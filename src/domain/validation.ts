import { t } from '../i18n';
import type { Card, ProjectDocument, ValidationIssue } from './types';
import { boxInShape, isHoleInside } from './geometry';
export function validateCard(card: Card, options: {
    textOverflow?: boolean;
    assetExists?: boolean;
} = {}): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const issue = (code: string, severity: ValidationIssue['severity'], element: ValidationIssue['element'], message: string) => issues.push({ code, severity, cardId: card.id, element, message });
    if (![card.width, card.height].every(value => Number.isFinite(value) && value > 0))
        issue('invalid-card-size', 'error', 'card', t("validation.tags.dimensions"));
    if (options.textOverflow)
        issue('text-overflow', 'error', 'text', t("validation.tags.textOverflow", { number: card.number }));
    if (!boxInShape(card, card.text))
        issue('text-outside-card', 'error', 'text', t("validation.tags.textOutsideBounds", { number: card.number }));
    if (!boxInShape(card, card.illustration, card.illustration.rotation))
        issue('illustration-outside-card', 'warning', 'illustration', t("validation.tags.imageClipped", { number: card.number }));
    if (options.assetExists === false)
        issue('missing-asset', 'error', 'illustration', t("validation.tags.imageUnavailable", { number: card.number }));
    if (card.decorations.some(decoration => !boxInShape(card, decoration)))
        issue('decoration-outside-card', 'warning', 'decoration', t("validation.tags.decorationClipped", { number: card.number }));
    if (card.hole && !isHoleInside(card, card.hole))
        issue('hole-outside-card', 'error', 'hole', t("validation.tags.holeOutsideBounds"));
    return issues;
}
export function validateProjectGeometry(project: ProjectDocument): ValidationIssue[] { return project.cards.flatMap(card => validateCard(card)); }
