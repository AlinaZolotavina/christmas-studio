import { describe, expect, it } from 'vitest';
import { hitCanvasElements, resizeCanvasBox, type CanvasElement } from './scene-interaction';

const element = (patch: Partial<CanvasElement<string>> = {}): CanvasElement<string> => ({ key: 'picture', selection: 'picture', box: { x: 20, y: 30, width: 40, height: 20 }, rotation: 0, locked: false, resize: 'aspect', ...patch });
describe('shared scene interaction policies', () => {
  it('selects the top unlocked painted element and respects a rotated local frame', () => {
    const bottom = element({ key: 'bottom', selection: 'bottom' });
    const top = element({ key: 'top', selection: 'top', locked: true });
    expect(hitCanvasElements([bottom, top], 30, 35).map(item => item.key)).toEqual(['bottom']);
    const rotated = element({ rotation: 90 });
    expect(hitCanvasElements([rotated], 40, 25)).toHaveLength(1);
    expect(hitCanvasElements([rotated], 22, 40)).toHaveLength(0);
  });
  it('keeps postcard graphics proportional at edge and corner handles', () => {
    for (const handle of ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']) {
      const resized = resizeCanvasBox(element({ rotation: 30 }), handle, 12, 7);
      expect(resized.width / resized.height).toBeCloseTo(2, 8);
      expect(resized.width).toBeGreaterThan(0); expect(resized.height).toBeGreaterThan(0);
    }
    expect(resizeCanvasBox(element(), 'se', 10, 7)).toEqual({ x: 20, y: 30, width: 50, height: 25 });
  });
  it('preserves the existing free tag decoration policy unless Shift is pressed', () => {
    const tag = element({ resize: 'tag-decoration' });
    expect(resizeCanvasBox(tag, 'se', 10, 5)).toEqual({ x: 20, y: 30, width: 50, height: 25 });
    expect(resizeCanvasBox(tag, 'se', 10, 9).height).toBe(29);
    expect(resizeCanvasBox(tag, 'se', 10, 9, true).height).toBe(25);
    expect(resizeCanvasBox(element({ resize: 'free' }), 'e', 10, 0).height).toBe(20);
  });
});
