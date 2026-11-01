import { describe, expect, it } from 'vitest';
import { categories, images, searchImages, subcategories } from './images';

describe('explicit illustration metadata', () => {
  it('keeps one unique kebab ID and source per image with valid taxonomy', () => {
    expect(images.length).toBeGreaterThanOrEqual(31);
    expect(new Set(images.map(i => i.id)).size).toBe(images.length);
    expect(new Set(images.map(i => i.source)).size).toBe(images.length);
    expect(new Set(categories.map(i => i.id)).size).toBe(categories.length);
    expect(new Set(subcategories.map(i => i.id)).size).toBe(subcategories.length);
    for (const image of images) {
      expect(image.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(categories.some(c => c.id === image.category)).toBe(true);
      expect(subcategories.some(c => c.id === image.subcategory && c.category === image.category)).toBe(true);
      expect(image.tags.length).toBeGreaterThan(0);
      expect(image.tagsEn.length).toBeGreaterThan(0);
    }
  });
  it('searches both languages, aliases and normalizes case and ё', () => {
    expect(searchImages('ЕЛОЧКА').map(i => i.id)).toContain('woodland-christmas-tree');
    expect(searchImages('CHRISTMAS TREE').map(i => i.id)).toContain('woodland-christmas-tree');
    expect(searchImages('зарянка').map(i => i.id)).toContain('robin-bird-feeder');
    expect(searchImages('kissing bough').map(i => i.id)).toContain('mistletoe-burgundy-bow');
  });
  it('combines category, subcategory, tags and background without duplicate images', () => {
    const results = searchImages('bow', { category: 'botanical', subcategory: 'botanical-wreaths', background: 'transparent', tags: ['шишки'] });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every(i => i.category === 'botanical' && i.subcategory === 'botanical-wreaths')).toBe(true);
    expect(searchImages('', { background: 'ivory' })).toEqual([]);
    expect(searchImages('definitelymissingterm')).toEqual([]);
  });
  it('includes IDs, taxonomy labels and new locale tags in the same search', () => {
    expect(searchImages('ornaments-stars').length).toBeGreaterThan(0);
    expect(searchImages('Сказочные герои').every(i => i.category === 'characters')).toBe(true);
    const image = images[0];
    const previous = image.tagsByLocale;
    image.tagsByLocale = { de: ['Weihnachtsstern'] };
    try { expect(searchImages('weihnachtsstern')).toContain(image); }
    finally { image.tagsByLocale = previous; }
  });
});
