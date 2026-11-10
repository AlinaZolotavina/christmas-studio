import { describe, expect, it } from 'vitest';
import { getImage, imageMatchesCategory, images, searchImages } from '../data/images';
import warmGiftReference from '../../tests/tags.json';
import { createProject } from '../domain/project';
import { decodeProject } from '../infrastructure/storage/schema';
import { templates } from './templates';

describe('ready-to-use template collections', () => {
  it('preserves the original template IDs and supplies six real collections', () => {
    expect(templates).toHaveLength(6);
    expect(templates.slice(0, 3).map(template => template.id)).toEqual(['woodland', 'winter', 'vintage']);
  });
  it.each(templates)('$name stays within its curated artwork for both card counts', template => {
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
  it.each([24, 31] as const)('keeps the supplied warm gifts and alternates subcategories for %i cards', count => {
    const supplied = warmGiftReference.map(card => card.illustration.assetId);
    for (const seed of [1, 17, 73, 419]) {
      let state = seed;
      const project = createProject('warm-gifts', count, () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 2 ** 32; });
      const ids = project.cards.map(card => card.illustration.assetId);
      expect(ids).toEqual(expect.arrayContaining(supplied));
      expect(new Set(ids).size).toBe(count);
      ids.forEach((id, index) => {
        const subcategory = getImage(id)!.subcategory;
        if (index) expect(subcategory).not.toBe(getImage(ids[index - 1])!.subcategory);
        if (!supplied.includes(id)) expect(['seasonal-objects-candles', 'seasonal-objects-skates']).toContain(subcategory);
      });
    }
  });
  it('uses only the requested categories and exclusions in the redesigned collections', () => {
    const collection = (id: string) => templates.find(template => template.id === id)!.assetIds.map(assetId => getImage(assetId)!);
    expect(collection('woodland').every(image => image.category === 'botanical')).toBe(true);
    expect(collection('forest-friends').every(image => image.category === 'animals')).toBe(true);
    const birds = new Set(searchImages('', { subcategory: 'animals-birds' }).map(image => image.id));
    expect(collection('winter').every(image => !imageMatchesCategory(image, 'russian-traditions') && !birds.has(image.id) && ['landscapes', 'animals'].includes(image.category) && !image.tagsEn.includes('gingerbread-house'))).toBe(true);
    expect(collection('vintage').every(image => image.category === 'treats' || image.subcategory === 'seasonal-objects-drinks')).toBe(true);
  });
});
