import type { Box } from '../../domain/types';
import { rotatePoint } from '../../domain/geometry';

export interface CanvasElement<S> {
  key: string;
  selection: S;
  box: Box;
  rotation: number;
  locked: boolean;
  resize: 'free' | 'aspect' | 'tag-decoration' | 'none';
  rotationStep?: number;
  /** A free tag rotation can be constrained while Shift is held. */
  shiftRotationStep?: number;
  maxSize?: number;
  hitPadding?: number;
  hitShape?: 'box' | 'circle';
  snapReference?: boolean;
  deleteAction?: boolean;
}

/** Reverse paint order, skipping locked nodes, and account for rotated local bounds. */
export function hitCanvasElements<S>(elements: CanvasElement<S>[], x: number, y: number): CanvasElement<S>[] {
  return elements.slice().reverse().filter(element => {
    if (element.locked) return false;
    const { box, rotation, hitPadding = 0 } = element;
    const [px, py] = rotatePoint(x, y, box.x + box.width / 2, box.y + box.height / 2, -rotation);
    if (element.hitShape === 'circle') return Math.hypot(px - box.x - box.width / 2, py - box.y - box.height / 2) <= box.width / 2 + hitPadding;
    return px >= box.x - hitPadding && py >= box.y - hitPadding && px <= box.x + box.width + hitPadding && py <= box.y + box.height + hitPadding;
  });
}

/** Resize around the opposite handle, preserving the product's aspect policy. */
export function resizeCanvasBox<S>(element: CanvasElement<S>, handle: string, dx: number, dy: number, shift = false): Box {
  const { box: origin, rotation } = element;
  const [localDx, localDy] = rotatePoint(dx, dy, 0, 0, -rotation);
  const signX = handle.includes('w') ? -1 : handle.includes('e') ? 1 : 0;
  const signY = handle.includes('n') ? -1 : handle.includes('s') ? 1 : 0;
  let width = Math.max(1, origin.width + localDx * signX), height = Math.max(1, origin.height + localDy * signY);
  if (element.resize === 'aspect' || element.resize === 'tag-decoration' && shift) {
    const ratio = origin.width / origin.height;
    if (signX) height = width / ratio; else width = height * ratio;
    if (element.maxSize) { const factor = Math.min(1, element.maxSize / width, element.maxSize / height); width *= factor; height *= factor; }
  } else if (element.maxSize) { width = Math.min(element.maxSize, width); height = Math.min(element.maxSize, height); }
  const [shiftX, shiftY] = rotatePoint(signX * (width - origin.width) / 2, signY * (height - origin.height) / 2, 0, 0, rotation);
  return { x: origin.x + origin.width / 2 + shiftX - width / 2, y: origin.y + origin.height / 2 + shiftY - height / 2, width, height };
}
