import type { ProjectDocument, ValidationIssue } from '../../domain/types';
import { validateCard } from '../../domain/validation';
import { assets } from '../../content/assets';
import { layoutText } from '../../rendering/text';
import { calculatePrintLayout } from './layout';

export function validateProject(project: ProjectDocument): ValidationIssue[] {
  return [
    ...project.cards.flatMap(card => validateCard(card, { textOverflow: layoutText(card.text).overflow, assetExists: assets.some(asset => asset.id === card.illustration.assetId) })),
    ...calculatePrintLayout(project).issues,
  ];
}
