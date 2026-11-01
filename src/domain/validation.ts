import type { Card, ProjectDocument, ValidationIssue } from './types';
import { boxInShape, isHoleInside } from './geometry';

export function validateCard(card: Card, options: { textOverflow?: boolean; assetExists?: boolean } = {}): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const issue = (code: string, severity: ValidationIssue['severity'], element: ValidationIssue['element'], message: string) => issues.push({ code, severity, cardId: card.id, element, message });
  if (![card.width, card.height].every(value => Number.isFinite(value) && value > 0)) issue('invalid-card-size', 'error', 'card', 'Размеры карточки должны быть положительными числами.');
  if (options.textOverflow) issue('text-overflow', 'error', 'text', `Текст карточки ${card.number} не помещается в блок. Измените его размер или размер шрифта.`);
  if (!boxInShape(card, card.text)) issue('text-outside-card', 'error', 'text', `Текстовый блок карточки ${card.number} выходит за её границы.`);
  if (!boxInShape(card, card.illustration, card.illustration.rotation)) issue('illustration-outside-card', 'warning', 'illustration', `Иллюстрация карточки ${card.number} выходит за силуэт и будет обрезана по контуру.`);
  if (options.assetExists === false) issue('missing-asset', 'error', 'illustration', `Иллюстрация карточки ${card.number} недоступна. Выберите другую из библиотеки.`);
  if (card.decorations.some(decoration => !boxInShape(card, decoration))) issue('decoration-outside-card', 'warning', 'decoration', `Декорации карточки ${card.number} выходят за силуэт и будут обрезаны по контуру.`);
  if (card.hole && !isHoleInside(card, card.hole)) issue('hole-outside-card', 'error', 'hole', 'Отверстие должно целиком находиться внутри карточки.');
  return issues;
}

export function validateProjectGeometry(project: ProjectDocument): ValidationIssue[] { return project.cards.flatMap(card => validateCard(card)); }
