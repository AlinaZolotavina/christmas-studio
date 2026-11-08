import type { PathOperation } from '../geometry';
import type { Box } from '../types';
import { getPostcardSize, type Postcard } from './types';

type PostcardOutline = Pick<Postcard, 'format' | 'cornerRadius'>;
const k = 0.552284749831;

/** One outline for the SVG renderer and the vector PDF clipping path. */
export function postcardOutlinePath(postcard: PostcardOutline): PathOperation[] {
  const { width: w, height: h } = getPostcardSize(postcard), r = postcard.cornerRadius ?? 0;
  if (!r) return [{ op: 'm', c: [0, 0] }, { op: 'l', c: [w, 0] }, { op: 'l', c: [w, h] }, { op: 'l', c: [0, h] }, { op: 'h', c: [] }];
  return [
    { op: 'm', c: [r, 0] }, { op: 'l', c: [w - r, 0] },
    { op: 'c', c: [w - r + r * k, 0, w, r - r * k, w, r] },
    { op: 'l', c: [w, h - r] },
    { op: 'c', c: [w, h - r + r * k, w - r + r * k, h, w - r, h] },
    { op: 'l', c: [r, h] },
    { op: 'c', c: [r - r * k, h, 0, h - r + r * k, 0, h - r] },
    { op: 'l', c: [0, r] },
    { op: 'c', c: [0, r - r * k, r - r * k, 0, r, 0] }, { op: 'h', c: [] },
  ];
}

/** Bounding boxes must also clear the trimmed corners, including a print safety inset. */
export function postcardContainsBox(postcard: PostcardOutline, box: Box, inset = 0): boolean {
  const { width, height } = getPostcardSize(postcard), radius = Math.max(0, (postcard.cornerRadius ?? 0) - inset);
  return [[box.x, box.y], [box.x + box.width, box.y], [box.x + box.width, box.y + box.height], [box.x, box.y + box.height]].every(([x, y]) => {
    const epsilon = inset ? 1e-8 : 0.001;
    if (x < inset - epsilon || y < inset - epsilon || x > width - inset + epsilon || y > height - inset + epsilon) return false;
    const cx = Math.max(inset + radius, Math.min(width - inset - radius, x));
    const cy = Math.max(inset + radius, Math.min(height - inset - radius, y));
    return (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2 + epsilon;
  });
}
