import type { Box, Card, Hole } from './types';

export type PathOperation = { op: 'm' | 'l'; c: [number, number] } | { op: 'c'; c: [number, number, number, number, number, number] } | { op: 'h'; c: [] };
const k = 0.552284749831;
export const holeDiameter = (card: Pick<Card, 'width'>) => Math.min(card.width * 0.07, 5);
export const defaultHole = (card: Pick<Card, 'width'>): Hole => ({ x: card.width / 2, y: holeDiameter(card) / 2 + 4 });

export function ellipsePath(cx: number, cy: number, rx: number, ry: number): PathOperation[] {
  return [
    { op: 'm', c: [cx + rx, cy] },
    { op: 'c', c: [cx + rx, cy + ry * k, cx + rx * k, cy + ry, cx, cy + ry] },
    { op: 'c', c: [cx - rx * k, cy + ry, cx - rx, cy + ry * k, cx - rx, cy] },
    { op: 'c', c: [cx - rx, cy - ry * k, cx - rx * k, cy - ry, cx, cy - ry] },
    { op: 'c', c: [cx + rx * k, cy - ry, cx + rx, cy - ry * k, cx + rx, cy] },
    { op: 'h', c: [] },
  ];
}

export function outlinePath(card: Pick<Card, 'width' | 'height' | 'shape'>): PathOperation[] {
  const { width: w, height: h, shape } = card;
  if (shape === 'circle' || shape === 'oval') return ellipsePath(w / 2, h / 2, w / 2, h / 2);
  const r = Math.min(2.3, w / 8, h / 8);
  if (shape === 'tag') {
    const shoulder = Math.min(h * 0.15, w * 0.3);
    return [
      { op: 'm', c: [w * 0.37, 0] },
      { op: 'l', c: [w * 0.63, 0] },
      { op: 'l', c: [w, shoulder] },
      { op: 'l', c: [w, h - r] },
      { op: 'c', c: [w, h - r + r * k, w - r + r * k, h, w - r, h] },
      { op: 'l', c: [r, h] },
      { op: 'c', c: [r - r * k, h, 0, h - r + r * k, 0, h - r] },
      { op: 'l', c: [0, shoulder] },
      { op: 'h', c: [] },
    ];
  }
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

export const pathToSvg = (operations: PathOperation[]) => operations.map(({ op, c }) => `${op.toUpperCase()} ${c.join(' ')}`).join(' ').replace(/H /g, 'Z ');
export const shapePath = (card: Pick<Card, 'width' | 'height' | 'shape'>) => pathToSvg(outlinePath(card));

export function pointInShape(card: Pick<Card, 'width' | 'height' | 'shape'>, x: number, y: number): boolean {
  const { width: w, height: h, shape } = card;
  const epsilon = 0.001;
  if (!Number.isFinite(x + y) || x < -epsilon || y < -epsilon || x > w + epsilon || y > h + epsilon) return false;
  if (shape === 'circle' || shape === 'oval') return ((x - w / 2) / (w / 2)) ** 2 + ((y - h / 2) / (h / 2)) ** 2 <= 1 + epsilon;
  if (shape === 'tag') {
    const shoulder = Math.min(h * 0.15, w * 0.3);
    if (y < shoulder) return x >= w * 0.37 * (1 - y / shoulder) - epsilon && x <= w - w * 0.37 * (1 - y / shoulder) + epsilon;
  }
  const r = Math.min(2.3, w / 8, h / 8);
  if (shape === 'tag' && y < h - r) return true;
  if (x >= r && x <= w - r || y >= r && y <= h - r) return true;
  const cx = x < r ? r : w - r;
  const cy = y < r ? r : h - r;
  return (x - cx) ** 2 + (y - cy) ** 2 <= r ** 2 + epsilon;
}

export function isHoleInside(card: Pick<Card, 'width' | 'height' | 'shape'>, hole: Hole): boolean {
  const radius = holeDiameter(card) / 2;
  return Array.from({ length: 32 }, (_, i) => {
    const angle = i / 32 * Math.PI * 2;
    return pointInShape(card, hole.x + Math.cos(angle) * radius, hole.y + Math.sin(angle) * radius);
  }).every(Boolean);
}

export function rotatePoint(x: number, y: number, cx: number, cy: number, degrees: number): [number, number] {
  const a = degrees * Math.PI / 180;
  return [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)];
}

export function boxPoints(box: Box, rotation = 0): [number, number][] {
  return [[box.x, box.y], [box.x + box.width, box.y], [box.x + box.width, box.y + box.height], [box.x, box.y + box.height]].map(([x, y]) => rotatePoint(x, y, box.x + box.width / 2, box.y + box.height / 2, rotation));
}

export function boxInShape(card: Pick<Card, 'width' | 'height' | 'shape'>, box: Box, rotation = 0): boolean {
  const corners = boxPoints(box, rotation);
  return corners.every(([x, y], i) => {
    const next = corners[(i + 1) % 4];
    return Array.from({ length: 9 }, (_, j) => pointInShape(card, x + (next[0] - x) * j / 8, y + (next[1] - y) * j / 8)).every(Boolean);
  });
}

export function containBox(box: Box, imageWidth: number, imageHeight: number): Box {
  const scale = Math.min(box.width / imageWidth, box.height / imageHeight);
  const width = imageWidth * scale;
  const height = imageHeight * scale;
  return { x: box.x + (box.width - width) / 2, y: box.y + (box.height - height) / 2, width, height };
}

export function starPoints(box: Box, points: number): [number, number][] {
  return Array.from({ length: points * 2 }, (_, i) => {
    const angle = -Math.PI / 2 + i * Math.PI / points;
    const radius = i % 2 ? 0.44 : 1;
    return [box.x + box.width / 2 + Math.cos(angle) * box.width / 2 * radius, box.y + box.height / 2 + Math.sin(angle) * box.height / 2 * radius];
  });
}
