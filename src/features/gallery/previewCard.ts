import type { Card, TemplateDefinition } from '../../domain/types';

export function previewCard(template: TemplateDefinition, number = 1, assetId?: string): Card {
  const width = template.shape === 'circle' || template.shape === 'square' ? 60 : 55;
  const height = template.shape === 'circle' || template.shape === 'square' ? 60 : 85;
  return {
    id: `preview-${template.id}-${number}`, number, shape: template.shape, width, height,
    background: { kind: 'solid', colors: [template.background], angle: 90, centerX: 0.5, centerY: 0.5 },
    text: { content: String(number).padStart(2, '0'), x: 7, y: height - 23, width: width - 14, height: 17, fontId: template.fontId, fontSize: 25, weight: 'normal', italic: false, color: template.color, align: 'center' },
    illustration: { assetId: assetId ?? template.assetIds[(number - 1) % template.assetIds.length], x: 6, y: 11, width: width - 12, height: height - 37, rotation: 0 },
    decorations: [], hole: { x: width / 2, y: 6 },
  };
}
