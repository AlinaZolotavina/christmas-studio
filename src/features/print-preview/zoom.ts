export const CSS_PIXELS_PER_MM = 96 / 25.4;
export const A4_CSS_SIZE = { width: 210 * CSS_PIXELS_PER_MM, height: 297 * CSS_PIXELS_PER_MM } as const;
export const MIN_PRINT_ZOOM = 10;
export const MAX_PRINT_ZOOM = 200;
export const PRINT_PAGE_PADDING = 24;

export function clampPrintZoom(value: number): number {
  return Math.max(MIN_PRINT_ZOOM, Math.min(MAX_PRINT_ZOOM, value));
}

export function pageSizeAtZoom(zoom: number, page = { width: 210, height: 297 }): { width: number; height: number } {
  return { width: page.width * CSS_PIXELS_PER_MM * zoom / 100, height: page.height * CSS_PIXELS_PER_MM * zoom / 100 };
}

export function fitPageZoom(viewportWidth: number, viewportHeight: number, padding = PRINT_PAGE_PADDING, page = { width: 210, height: 297 }): number {
  const availableWidth = Math.max(0, viewportWidth - padding * 2);
  const availableHeight = Math.max(0, viewportHeight - padding * 2);
  return clampPrintZoom(Math.floor(Math.min(availableWidth / (page.width * CSS_PIXELS_PER_MM), availableHeight / (page.height * CSS_PIXELS_PER_MM)) * 100));
}
