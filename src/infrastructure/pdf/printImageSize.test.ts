import { describe, expect, it } from 'vitest';
import { printImageSize } from './generatePdf';
import type { AssetDefinition, Card } from '../../domain/types';

const asset = { id: 'sample', width: 2000, height: 1000 } as AssetDefinition;
const card = (width: number, height: number) => ({ illustration: { x: 0, y: 0, width, height } } as Card);
describe('print raster resolution', () => {
  it('retains 300dpi for the largest actual drawing of a reused image', () => {
    const size = printImageSize(asset, [card(50, 20), card(80, 40)]);
    expect(size.width).toBe(Math.ceil(80 / 25.4 * 300));
    expect(size.height).toBe(Math.ceil(40 / 25.4 * 300));
  });
  it('fits the image aspect ratio instead of sampling the entire frame', () => {
    const size = printImageSize(asset, [card(50, 20)]);
    expect(size.width).toBe(Math.ceil(40 / 25.4 * 300));
    expect(size.height).toBe(Math.ceil(20 / 25.4 * 300));
  });
  it('never upscales the source', () => {
    expect(printImageSize(asset, [card(1000, 1000)])).toEqual({ width: 2000, height: 1000 });
  });
});
