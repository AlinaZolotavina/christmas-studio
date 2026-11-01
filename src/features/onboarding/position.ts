export interface TourRectangle { left: number; top: number; width: number; height: number }
export interface TourPanelPosition { left: number; top: number; width: number; height: number }

export function positionTourPanel(target: TourRectangle | null, viewport: { width: number; height: number }): TourPanelPosition {
  const inset = 16;
  const gap = 20;
  const width = Math.max(0, Math.min(560, viewport.width - inset * 2));
  const height = Math.max(0, Math.min(480, viewport.height - inset * 2));
  const clampX = (value: number) => Math.max(inset, Math.min(value, viewport.width - inset - width));
  const clampY = (value: number) => Math.max(inset, Math.min(value, viewport.height - inset - height));
  const center = { left: (viewport.width - width) / 2, top: (viewport.height - height) / 2 };
  if (!target) return { ...center, width, height };
  const centeredX = clampX(target.left + target.width / 2 - width / 2);
  const centeredY = clampY(target.top + target.height / 2 - height / 2);
  const candidates = [
    { left: target.left + target.width + gap, top: centeredY },
    { left: target.left - gap - width, top: centeredY },
    { left: centeredX, top: target.top + target.height + gap },
    { left: centeredX, top: target.top - gap - height },
  ];
  const fits = candidates.find(candidate => candidate.left >= inset && candidate.top >= inset && candidate.left + width <= viewport.width - inset && candidate.top + height <= viewport.height - inset);
  if (fits) return { ...fits, width, height };
  const overlap = (candidate: { left: number; top: number }) => Math.max(0, Math.min(candidate.left + width, target.left + target.width) - Math.max(candidate.left, target.left)) * Math.max(0, Math.min(candidate.top + height, target.top + target.height) - Math.max(candidate.top, target.top));
  const fallbacks = [...candidates.map(candidate => ({ left: clampX(candidate.left), top: clampY(candidate.top) })), center];
  fallbacks.sort((a, b) => overlap(a) - overlap(b));
  return { ...fallbacks[0], width, height };
}
