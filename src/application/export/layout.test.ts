import { describe, expect, it } from 'vitest';
import { calculatePrintLayout, PRINT_PAGE } from './layout';
import type { Card, ProjectDocument } from '../../domain/types';

const project = (count: 24 | 31, width = 50, height = 80) => ({ cards: Array.from({ length: count }, (_, index) => ({ id: `${index}`, width, height } as Card)) } as ProjectDocument);

describe('ordered A4 packing', () => {
  it.each([24, 31] as const)('packs %i cards at their original sizes', count => {
    const layout = calculatePrintLayout(project(count));
    expect(layout.issues).toEqual([]);
    expect(layout.pages.flatMap(page => page.placements).map(card => card.cardId)).toEqual(Array.from({ length: count }, (_, i) => `${i}`));
    layout.pages.forEach((page, index) => {
      expect(page.placements.length).toBeLessThanOrEqual(20);
      if (index < layout.pages.length - 1) expect(page.placements.length).toBeGreaterThanOrEqual(4);
      for (const card of page.placements) {
        expect(card.width).toBe(50); expect(card.height).toBe(80);
        expect(card.x).toBeGreaterThanOrEqual(PRINT_PAGE.margin);
        expect(card.x + card.width).toBeLessThanOrEqual(PRINT_PAGE.width - PRINT_PAGE.margin + 0.001);
        expect(card.y + card.height).toBeLessThanOrEqual(PRINT_PAGE.height - PRINT_PAGE.margin + 0.001);
      }
    });
  });
  it('uses different row breaks for mixed sizes and keeps gaps', () => {
    const document = project(24);
    document.cards.forEach((card, i) => { card.width = i % 2 ? 40 : 70; card.height = i % 3 ? 45 : 65; });
    const layout = calculatePrintLayout(document);
    expect(layout.issues).toEqual([]);
    for (const page of layout.pages) for (let i = 0; i < page.placements.length; i++) for (let j = i + 1; j < page.placements.length; j++) {
      const a = page.placements[i]; const b = page.placements[j];
      const horizontal = a.x + a.width + 2.999 <= b.x || b.x + b.width + 2.999 <= a.x;
      const vertical = a.y + a.height + 2.999 <= b.y || b.y + b.height + 2.999 <= a.y;
      expect(horizontal || vertical).toBe(true);
    }
  });
  it('blocks impossible and sparse non-final pages without automatic scaling', () => {
    expect(calculatePrintLayout(project(24, 201, 80)).issues.some(issue => issue.code === 'card-outside-print-area')).toBe(true);
    expect(calculatePrintLayout(project(24, 150, 140)).issues.some(issue => issue.code === 'page-density')).toBe(true);
  });
});
