import type { Card, ProjectDocument, ValidationIssue } from '../../domain/types';

export const PRINT_PAGE = { width: 210, height: 297, margin: 10, gap: 3, maxCards: 20 } as const;
export interface CardPlacement { cardId: string; x: number; y: number; width: number; height: number }
export interface PrintPage { placements: CardPlacement[] }
export interface PrintLayout { pages: PrintPage[]; issues: ValidationIssue[]; width: number; height: number }

// Exhaustive row-break dynamic programming for ordered, unrotated card boxes.
function packRows(cards: Card[]): PrintPage | null {
  const { width, height, margin, gap } = PRINT_PAGE;
  const availableWidth = width - margin * 2;
  const availableHeight = height - margin * 2;
  const best = new Array<number>(cards.length + 1).fill(Infinity);
  const previous = new Array<number>(cards.length + 1).fill(-1);
  best[0] = -gap;
  for (let end = 1; end <= cards.length; end++) {
    let rowWidth = -gap;
    let rowHeight = 0;
    for (let start = end - 1; start >= 0; start--) {
      rowWidth += cards[start].width + gap;
      rowHeight = Math.max(rowHeight, cards[start].height);
      if (rowWidth > availableWidth + 0.001) break;
      const candidate = best[start] + gap + rowHeight;
      if (candidate <= availableHeight + 0.001 && candidate < best[end]) { best[end] = candidate; previous[end] = start; }
    }
  }
  if (!Number.isFinite(best[cards.length])) return null;
  const rows: Card[][] = [];
  for (let end = cards.length; end > 0;) { const start = previous[end]; rows.unshift(cards.slice(start, end)); end = start; }
  let y = margin + (availableHeight - best[cards.length]) / 2;
  const placements: CardPlacement[] = [];
  for (const row of rows) {
    const rowWidth = row.reduce((sum, card) => sum + card.width, 0) + (row.length - 1) * gap;
    const rowHeight = Math.max(...row.map(card => card.height));
    let x = margin + (availableWidth - rowWidth) / 2;
    for (const card of row) {
      placements.push({ cardId: card.id, x, y: y + (rowHeight - card.height) / 2, width: card.width, height: card.height });
      x += card.width + gap;
    }
    y += rowHeight + gap;
  }
  return { placements };
}

export function calculatePrintLayout(project: ProjectDocument): PrintLayout {
  const cards = project.cards;
  const issues: ValidationIssue[] = [];
  const cached = new Map<string, PrintPage | null>();
  const pack = (start: number, count: number) => {
    const key = `${start}:${count}`;
    if (!cached.has(key)) cached.set(key, packRows(cards.slice(start, start + count)));
    return cached.get(key) || null;
  };
  const best = new Array<number>(cards.length + 1).fill(Infinity);
  const counts = new Array<number>(cards.length + 1).fill(0);
  best[cards.length] = 0;
  for (let start = cards.length - 1; start >= 0; start--) {
    for (let count = Math.min(PRINT_PAGE.maxCards, cards.length - start); count >= 1; count--) {
      if (count < 4 && start + count !== cards.length) continue;
      if (pack(start, count) && best[start + count] + 1 < best[start]) { best[start] = best[start + count] + 1; counts[start] = count; }
    }
  }
  const pages: PrintPage[] = [];
  if (Number.isFinite(best[0])) {
    for (let start = 0; start < cards.length;) { pages.push(pack(start, counts[start])!); start += counts[start]; }
  } else {
    // Retain a useful preview of what fits and explain why export is blocked.
    for (let start = 0; start < cards.length;) {
      let count = Math.min(PRINT_PAGE.maxCards, cards.length - start);
      while (count > 0 && !pack(start, count)) count--;
      if (!count) {
        const card = cards[start];
        issues.push({ code: 'card-outside-print-area', severity: 'error', cardId: card.id, element: 'card', message: `Карточка ${card.number} не помещается в печатную область A4 без уменьшения.` });
        pages.push({ placements: [{ cardId: card.id, x: PRINT_PAGE.margin, y: PRINT_PAGE.margin, width: card.width, height: card.height }] });
        start++;
      } else { pages.push(pack(start, count)!); start += count; }
    }
    pages.forEach((page, index) => {
      if (index < pages.length - 1 && page.placements.length < 4) issues.push({ code: 'page-density', severity: 'error', pageIndex: index, message: 'На обычной странице должны помещаться как минимум четыре карточки. Уменьшите размеры карточек вручную.' });
    });
  }
  return { pages, issues, width: PRINT_PAGE.width, height: PRINT_PAGE.height };
}
