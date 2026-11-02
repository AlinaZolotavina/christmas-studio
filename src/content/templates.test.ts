import { describe, expect, it } from 'vitest';
import { images } from '../data/images';
import { createProject } from '../domain/project';
import { decodeProject } from '../infrastructure/storage/schema';
import { templates } from './templates';

describe('ready-to-use template collections', () => {
  it('preserves the original template IDs and supplies six real collections', () => {
    expect(templates).toHaveLength(6);
    expect(templates.slice(0, 3).map(template => template.id)).toEqual(['woodland', 'winter', 'vintage']);
  });
  it.each(templates)('$name supports 24 and 31 unique cards from its curated artwork', template => {
    const allowed = new Set(template.assetIds);
    expect(allowed.size).toBe(template.assetIds.length);
    expect(allowed.size).toBeGreaterThanOrEqual(31);
    expect(template.assetIds.every(id => images.some(image => image.id === id))).toBe(true);
    for (const count of [24, 31] as const) {
      const project = createProject(template.id, count, () => 0.4);
      expect(new Set(project.cards.map(card => card.illustration.assetId)).size).toBe(count);
      expect(project.cards.every(card => allowed.has(card.illustration.assetId))).toBe(true);
      expect(decodeProject(JSON.stringify(project))).toEqual(project);
    }
  });
});
