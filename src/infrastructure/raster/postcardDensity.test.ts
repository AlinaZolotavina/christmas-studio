import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { postcardPixelSize, withJpegDensity, withPngDensity } from './postcardDensity';

describe('postcard raster physical dimensions', () => {
  it('rounds 300 DPI dimensions within half a pixel of each supported format', () => {
    for (const [width, height] of [[105, 148], [148, 105], [105, 105]]) {
      const size = postcardPixelSize(width, height);
      expect(Math.abs(size.width - width * 300 / 25.4)).toBeLessThanOrEqual(0.5);
      expect(Math.abs(size.height - height * 300 / 25.4)).toBeLessThanOrEqual(0.5);
    }
    expect(postcardPixelSize(105, 148)).toEqual({ width: 1240, height: 1748 });
  });
  it.each(['png', 'jpeg'] as const)('writes actual 300 DPI metadata into a decodable %s without changing pixels', async format => {
    const original = await sharp({ create: { width: 7, height: 9, channels: 3, background: '#923c42' } }).toFormat(format).toBuffer();
    const updated = format === 'png' ? withPngDensity(original) : withJpegDensity(original);
    const metadata = await sharp(updated).metadata();
    expect(metadata).toMatchObject({ format, width: 7, height: 9, density: 300 });
    expect(await sharp(updated).raw().toBuffer()).toEqual(await sharp(original).raw().toBuffer());
    const second = format === 'png' ? withPngDensity(updated) : withJpegDensity(updated);
    expect(second).toEqual(updated);
  });
  it('rejects invalid bytes rather than silently returning a file with misleading density', () => {
    expect(() => withPngDensity(new Uint8Array([1, 2, 3]))).toThrow('PNG');
    expect(() => withJpegDensity(new Uint8Array([1, 2, 3]))).toThrow('JPG');
  });
});
