import { describe, expect, it } from 'vitest';
import type { Postcard, PostcardFormat } from '../../domain/postcards/types';
import { calculatePostcardPrintLayout } from './postcardLayout';

const cards = (...formats: PostcardFormat[]) => formats.map((format, i) => ({ id: `card-${i}`, format }) as Postcard);

describe('postcard physical print layout', () => {
  it.each(['a6-portrait', 'a6-landscape', 'square'] as const)('keeps one %s PDF page at its actual physical size', format => {
    const layout = calculatePostcardPrintLayout(cards(format), 'current');
    const expected = format === 'a6-portrait' ? [105, 148] : format === 'a6-landscape' ? [148, 105] : [105, 105];
    expect([layout.width, layout.height]).toEqual(expected);
    expect(layout.pages[0].placements[0]).toMatchObject({ x: 0, y: 0, width: expected[0], height: expected[1], rotation: 0 });
  });
  it('rotates only when needed, preserves order and never scales four A6 onto A4', () => {
    const input = cards('a6-portrait', 'a6-portrait', 'a6-landscape', 'square', 'a6-portrait');
    const first = calculatePostcardPrintLayout(input);
    expect(first).toEqual(calculatePostcardPrintLayout(input));
    expect(first.pages).toHaveLength(3);
    expect(first.pages.flatMap(page => page.placements).map(item => item.postcardId)).toEqual(input.map(card => card.id));
    const pair = calculatePostcardPrintLayout(cards('a6-portrait', 'a6-portrait'));
    expect(pair.pages).toHaveLength(1);
    expect(pair.pages[0].placements.filter(item => item.rotation === 90)).toHaveLength(1);
    expect(calculatePostcardPrintLayout(cards('a6-portrait', 'a6-portrait', 'a6-portrait', 'a6-portrait')).pages).toHaveLength(2);
    for (const page of first.pages) for (let i = 0; i < page.placements.length; i++) {
      const a = page.placements[i];
      expect(a.x).toBeGreaterThanOrEqual(10);
      expect(a.y).toBeGreaterThanOrEqual(10);
      expect(a.x + a.width).toBeLessThanOrEqual(200.001);
      expect(a.y + a.height).toBeLessThanOrEqual(287.001);
      for (const b of page.placements.slice(i + 1)) expect(a.x + a.width + 2.999 <= b.x || b.x + b.width + 2.999 <= a.x || a.y + a.height + 2.999 <= b.y || b.y + b.height + 2.999 <= a.y).toBe(true);
    }
  });
  it('accepts sparse pages and all twenty mixed postcards without tag density restrictions', () => {
    const input = cards(...Array.from({ length: 20 }, (_, i) => (['square', 'a6-landscape', 'a6-portrait'] as const)[i % 3]));
    const layout = calculatePostcardPrintLayout(input);
    expect(layout.pages).toHaveLength(10);
    expect(layout.pages.flatMap(page => page.placements)).toHaveLength(20);
    expect(calculatePostcardPrintLayout(cards('square')).pages).toHaveLength(1);
  });
});
