import { describe, expect, it } from 'vitest';
import { positionTourPanel } from './position';

describe('tour context placement', () => {
  it('uses free space to the left of a desktop inspector without hiding it', () => {
    const target = { left: 1080, top: 64, width: 340, height: 700 };
    const panel = positionTourPanel(target, { width: 1440, height: 900 });
    expect(panel.left + panel.width).toBeLessThan(target.left);
    expect(panel.width).toBe(560); expect(panel.height).toBe(480);
  });
  it('places a bounded mobile dialog above the bottom toolbar', () => {
    const target = { left: 0, top: 780, width: 390, height: 64 };
    const panel = positionTourPanel(target, { width: 390, height: 844 });
    expect(panel.top + panel.height).toBeLessThan(target.top);
    expect(panel.left).toBeGreaterThanOrEqual(16);
    expect(panel.left + panel.width).toBeLessThanOrEqual(374);
  });
  it('keeps the same dimensions across steps and fits a short viewport', () => {
    const viewport = { width: 600, height: 400 };
    const a = positionTourPanel({ left: 0, top: 0, width: 600, height: 400 }, viewport);
    const b = positionTourPanel(null, viewport);
    expect({ width: a.width, height: a.height }).toEqual({ width: b.width, height: b.height });
    expect(a.top).toBeGreaterThanOrEqual(16);
    expect(a.top + a.height).toBeLessThanOrEqual(384);
  });
});
