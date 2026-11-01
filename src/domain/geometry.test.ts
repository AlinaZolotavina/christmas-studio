import { describe, expect, it } from 'vitest';
import { boxInShape, containBox, defaultHole, holeDiameter, isHoleInside, pointInShape, shapePath } from './geometry';

describe('physical card geometry', () => {
  it('keeps holes fully inside all supported shapes', () => {
    for (const shape of ['rectangle', 'square', 'circle', 'oval', 'tag'] as const) {
      const card = { shape, width: 50, height: 80 };
      expect(isHoleInside(card, defaultHole(card))).toBe(true);
      expect(isHoleInside(card, { x: 0, y: 0 })).toBe(false);
      expect(shapePath(card)).toContain('Z');
    }
    expect(holeDiameter({ width: 100 })).toBe(5);
    expect(holeDiameter({ width: 50 })).toBeCloseTo(3.5);
    expect(defaultHole({ width: 50 })).toEqual({ x: 25, y: 5.75 });
    expect(defaultHole({ width: 100 })).toEqual({ x: 50, y: 6.5 });
  });
  it('checks silhouette rather than only its rectangular bounds', () => {
    const circle = { shape: 'circle' as const, width: 50, height: 50 };
    expect(pointInShape(circle, 1, 1)).toBe(false);
    expect(boxInShape(circle, { x: 20, y: 20, width: 10, height: 10 })).toBe(true);
    expect(boxInShape(circle, { x: 0, y: 0, width: 10, height: 10 })).toBe(false);
    expect(boxInShape({ shape: 'rectangle', width: 50, height: 80 }, { x: 0, y: 20, width: 48, height: 20 }, 45)).toBe(false);
  });
  it('contains different aspect ratios without stretching or cropping', () => {
    expect(containBox({ x: 0, y: 0, width: 20, height: 20 }, 100, 200)).toEqual({ x: 5, y: 0, width: 10, height: 20 });
  });
});
