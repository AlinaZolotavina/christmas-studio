import { describe, expect, it } from 'vitest';
import { readdirSync } from 'node:fs';
import { postcardIllustrations } from '../content/postcard-assets';
import { categories, getAvailableMotifs, getImage, imageMatchesCategory, images, motifs, searchImages, subcategories } from './images';

describe('explicit illustration metadata', () => {
  it('exposes the complete shared illustration library in the postcard editor', () => {
    expect(postcardIllustrations.map(entry => entry.id)).toEqual(images.map(entry => entry.id));
  });
  it('keeps one unique kebab ID and source per image with valid taxonomy', () => {
    expect(images.length).toBeGreaterThanOrEqual(31);
    expect(new Set(images.map(i => i.id)).size).toBe(images.length);
    expect(new Set(images.map(i => i.source)).size).toBe(images.length);
    expect(new Set(categories.map(i => i.id)).size).toBe(categories.length);
    expect(new Set(subcategories.map(i => i.id)).size).toBe(subcategories.length);
    expect(categories).toHaveLength(8);
    expect(new Set(images.map(i => i.src))).toEqual(new Set(readdirSync('assets/art').filter(file => file.endsWith('.webp') && !file.endsWith('-preview.webp')).map(file => `art/${file}`)));
    for (const image of images) {
      expect(image.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(image.source).toBe(`original-assets/${image.id}.png`);
      expect(image.src).toBe(`art/${image.id}.webp`);
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
    expect(results.map(image => image.id)).toContain('velvet-bow-wreath');
    expect(results.every(image => imageMatchesCategory(image, 'botanical'))).toBe(true);
    expect(new Set(results.map(image => image.id)).size).toBe(results.length);
    expect(searchImages('', { background: 'ivory' })).toEqual([]);
    expect(searchImages('definitelymissingterm')).toEqual([]);
  });
  it('includes IDs, taxonomy labels and new locale tags in the same search', () => {
    expect(searchImages('ornaments-stars').length).toBeGreaterThan(0);
    expect(searchImages('Персонажи').length).toBeGreaterThan(0);
    expect(searchImages('Персонажи').every(i => imageMatchesCategory(i, 'characters'))).toBe(true);
    const image = images[0];
    const previous = image.tagsByLocale;
    image.tagsByLocale = { de: ['Weihnachtsstern'] };
    try { expect(searchImages('weihnachtsstern')).toContain(image); }
    finally { image.tagsByLocale = previous; }
  });
  it('finds the same Soviet ornament in its object and cultural collections without changing its primary category', () => {
    const image = getImage('glass-bird-ornament')!;
    expect(image.category).toBe('ornaments');
    expect(searchImages('', { category: 'ornaments', subcategory: 'ornaments-soviet' })).toContain(image);
    expect(searchImages('', { category: 'russian-traditions' })).toContain(image);
    expect(searchImages('', { category: 'animals', subcategory: 'animals-birds' })).toContain(image);
    expect(searchImages('Русские новогодние традиции')).toContain(image);
    expect(images.filter(item => item.id === image.id)).toHaveLength(1);
  });
  it('keeps Father Frost with a tree a character and uses tags for secondary themes', () => {
    const image = getImage('father-frost-christmas-tree')!;
    expect(image.category).toBe('characters');
    expect(image.tagsEn).toEqual(expect.arrayContaining(['christmas-tree', 'winter', 'new-year']));
    expect(searchImages('', { category: 'characters', subcategory: 'characters-father-frost' })).toContain(image);
    expect(searchImages('', { category: 'ornaments' })).not.toContain(image);
    expect(searchImages('christmas-tree winter')).toContain(image);
    expect(searchImages('', { category: 'characters', subcategory: 'animals-deer' })).toEqual([]);
  });
  it('classifies sleighs and a city by object type while keeping their Russian cultural motifs', () => {
    const troika = getImage('russian-troika-snow')!;
    expect(troika.category).toBe('seasonal-objects');
    expect(searchImages('', { category: 'seasonal-objects', subcategory: 'seasonal-objects-sleighs' })).toContain(troika);
    expect(searchImages('', { category: 'russian-traditions', subcategory: 'russian-traditions-troikas' })).toContain(troika);
    const city = getImage('winter-kremlin-panorama')!;
    expect(city.category).toBe('landscapes');
    expect(searchImages('', { category: 'landscapes', subcategory: 'landscapes-cities' })).toContain(city);
    expect(searchImages('', { category: 'russian-traditions', subcategory: 'russian-traditions-symbols' })).toContain(city);
  });
  it('hides empty future motifs and exposes them when matching art is explicitly registered', () => {
    motifs.push({ id: 'characters-future', category: 'characters', name: { ru: 'Будущий персонаж', en: 'Future character' } });
    expect(getAvailableMotifs('characters').some(motif => motif.id === 'characters-future')).toBe(false);
    images.push({ ...images[0], id: 'future-character', category: 'characters', subcategory: 'characters-future' });
    try { expect(getAvailableMotifs('characters').some(motif => motif.id === 'characters-future')).toBe(true); }
    finally { images.pop(); motifs.pop(); }
    expect(getAvailableMotifs('unknown')).toEqual([]);
  });
  it('exposes the supplied Santas and elves independently from Father Frost', () => {
    expect(searchImages('santa', { category: 'characters', subcategory: 'characters-santa' })).toHaveLength(5);
    expect(searchImages('эльф', { category: 'characters', subcategory: 'characters-elves' })).toHaveLength(5);
    expect(getAvailableMotifs('characters').map(motif => motif.id)).toEqual(expect.arrayContaining(['characters-santa', 'characters-elves']));
    expect(searchImages('', { subcategory: 'characters-santa' }).every(image => !image.id.startsWith('father-frost'))).toBe(true);
  });
  it('resolves the removed duplicate ID without duplicating a library entry', () => {
    expect(getImage('watercolor-snowy-alpine-village-1')).toBe(getImage('watercolor-snowy-alpine-village'));
    expect(images.some(image => image.id === 'watercolor-snowy-alpine-village-1')).toBe(false);
  });
  it('finds the new folk objects in both object and cultural collections', () => {
    const boots = getImage('embroidered-felt-boots-rowan')!;
    expect(boots.category).toBe('seasonal-objects');
    expect(searchImages('ВАЛЁНКИ', { category: 'seasonal-objects', subcategory: 'seasonal-objects-felt-boots' })).toContain(boots);
    expect(searchImages('felt boots', { category: 'russian-traditions', subcategory: 'russian-traditions-folk' })).toContain(boots);
    const doll = getImage('snowy-nesting-doll-spruce-branches')!;
    expect(searchImages('матрешка', { category: 'seasonal-objects', subcategory: 'seasonal-objects-nesting-dolls' })).toContain(doll);
    expect(searchImages('matryoshka', { category: 'russian-traditions', subcategory: 'russian-traditions-folk' })).toContain(doll);
    expect(getAvailableMotifs('seasonal-objects').map(motif => motif.id)).toEqual(expect.arrayContaining(['seasonal-objects-felt-boots', 'seasonal-objects-nesting-dolls']));
  });
  it('keeps new troikas as sleighs and new villages as landscapes', () => {
    const troika = getImage('winter-russian-troika-gifts')!;
    expect(troika.category).toBe('seasonal-objects');
    expect(searchImages('gifts', { category: 'seasonal-objects', subcategory: 'seasonal-objects-sleighs' })).toContain(troika);
    expect(searchImages('тройка', { category: 'russian-traditions', subcategory: 'russian-traditions-troikas' })).toContain(troika);
    const village = getImage('winter-village-golden-domes')!;
    expect(village.category).toBe('landscapes');
    expect(searchImages('golden domes', { category: 'landscapes', subcategory: 'landscapes-villages' })).toContain(village);
    expect(searchImages('деревня', { category: 'russian-traditions', subcategory: 'russian-traditions-houses' })).toContain(village);
  });
  it('makes both animals in the new fox and rabbit illustration discoverable', () => {
    const friends = getImage('fox-rabbit-snowy-branch')!;
    expect(searchImages('fox', { category: 'animals', subcategory: 'animals-foxes' })).toContain(friends);
    expect(searchImages('rabbit', { category: 'animals', subcategory: 'animals-hares' })).toContain(friends);
    expect(searchImages('зайчик', { category: 'animals', subcategory: 'animals-hares' })).toContain(friends);
  });
});
