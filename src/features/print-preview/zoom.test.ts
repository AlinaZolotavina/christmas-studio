import { describe, expect, it } from 'vitest';
import { fitPageZoom, pageSizeAtZoom } from './zoom';

describe('physical print-preview zoom', () => {
  it('uses CSS 96dpi for a physical A4 page at 100%', () => {
    expect(pageSizeAtZoom(100).width).toBeCloseTo(793.7007874, 5);
    expect(pageSizeAtZoom(100).height).toBeCloseTo(1122.519685, 5);
    expect(pageSizeAtZoom(200).width).toBeCloseTo(pageSizeAtZoom(100).width * 2, 8);
  });
  it('fits both axes with padding and reports the actual scale', () => {
    const zoom = fitPageZoom(600, 450);
    const page = pageSizeAtZoom(zoom);
    expect(zoom).toBe(35);
    expect(page.width).toBeLessThanOrEqual(600 - 48);
    expect(page.height).toBeLessThanOrEqual(450 - 48);
    expect(pageSizeAtZoom(zoom + 1).height).toBeGreaterThan(450 - 48);
  });
  it('respects a narrow viewport and the supported zoom range', () => {
    expect(fitPageZoom(260, 1000)).toBe(26);
    expect(fitPageZoom(10, 10)).toBe(10);
    expect(fitPageZoom(5000, 5000)).toBe(200);
  });
});
