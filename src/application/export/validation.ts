import type { ProjectDocument, ValidationIssue } from '../../domain/types';
import { validateCard } from '../../domain/validation';
import { assets } from '../../content/assets';
import { layoutText } from '../../rendering/text';
import { boxPoints, containBox } from '../../domain/geometry';
import { ptToMm } from '../../domain/types';
import { calculatePrintLayout, PRINT_PAGE } from './layout';

export function validateProject(project: ProjectDocument): ValidationIssue[] {
  const layout = calculatePrintLayout(project);
  const printIssues: ValidationIssue[] = [];
  project.cards.forEach(card => {
    const asset = assets.find(asset => asset.id === card.illustration.assetId);
    if (!asset) return;
    const actual = containBox(card.illustration, asset.width, asset.height);
    const dpi = Math.min(asset.width / actual.width, asset.height / actual.height) * 25.4;
    if (dpi < 150) printIssues.push({ code: 'image-resolution', severity: 'recommendation', cardId: card.id, element: 'illustration', message: `Иллюстрация карточки ${card.number} имеет разрешение около ${Math.round(dpi)} dpi в выбранном размере. Для более чёткой печати уменьшите её.` });
  });
  layout.pages.forEach((page, pageIndex) => page.placements.forEach(placement => {
    const card = project.cards.find(card => card.id === placement.cardId);
    if (!card) return;
    const elements = [
      { kind: 'text' as const, box: card.text, rotation: 0 },
      { kind: 'illustration' as const, box: card.illustration, rotation: card.illustration.rotation },
      ...card.decorations.map(decoration => {
        const stroke = decoration.stroke ? ptToMm(decoration.strokeWidth) / 2 : 0;
        return { kind: 'decoration' as const, box: { x: decoration.x - stroke, y: decoration.y - stroke, width: decoration.width + stroke * 2, height: decoration.height + stroke * 2 }, rotation: 0 };
      }),
    ];
    const seen = new Set<string>();
    for (const element of elements) {
      const outside = boxPoints(element.box, element.rotation).some(([x, y]) => x + placement.x < PRINT_PAGE.margin - 0.001 || y + placement.y < PRINT_PAGE.margin - 0.001 || x + placement.x > PRINT_PAGE.width - PRINT_PAGE.margin + 0.001 || y + placement.y > PRINT_PAGE.height - PRINT_PAGE.margin + 0.001);
      if (outside && !seen.has(element.kind)) {
        seen.add(element.kind);
        printIssues.push({ code: 'content-outside-print-area', severity: 'error', cardId: card.id, element: element.kind, pageIndex, message: `Содержимое карточки ${card.number} выходит за печатную область A4. Переместите или уменьшите элемент вручную.` });
      }
    }
  }));
  return [
    ...project.cards.flatMap(card => validateCard(card, { textOverflow: layoutText(card.text).overflow, assetExists: assets.some(asset => asset.id === card.illustration.assetId) })),
    ...layout.issues,
    ...printIssues,
  ];
}
