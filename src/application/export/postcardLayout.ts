import { getPostcardSize, type Postcard } from '../../domain/postcards/types';
import { PRINT_PAGE } from './layout';

export type PostcardExportScope = 'current' | 'all';
export interface PostcardPlacement { postcardId: string; x: number; y: number; width: number; height: number; rotation: 0 | 90 }
export interface PostcardPrintPage { placements: PostcardPlacement[] }
export interface PostcardPrintLayout { width: number; height: number; pages: PostcardPrintPage[] }
interface OrientedCard { postcardId: string; width: number; height: number; rotation: 0 | 90 }
interface Row { cards: OrientedCard[]; width: number; height: number; rotations: number }
interface Packing { rows: Row[]; height: number; rotations: number }

function orientations(card: Postcard): OrientedCard[] {
  const size = getPostcardSize(card);
  const values: OrientedCard[] = [{ postcardId: card.id, ...size, rotation: 0 }];
  if (size.width !== size.height) values.push({ postcardId: card.id, width: size.height, height: size.width, rotation: 90 });
  return values;
}

/** Ordered row packing extends the tag algorithm with rotation and mixed sizes. */
function packPage(cards: Postcard[]): { page: PostcardPrintPage; rotations: number } | null {
  const availableWidth = PRINT_PAGE.width - PRINT_PAGE.margin * 2;
  const availableHeight = PRINT_PAGE.height - PRINT_PAGE.margin * 2;
  const frontier: Packing[][] = Array.from({ length: cards.length + 1 }, () => []);
  frontier[0].push({ rows: [], height: -PRINT_PAGE.gap, rotations: 0 });
  for (let start = 0; start < cards.length; start++) {
    if (!frontier[start].length) continue;
    let rows: Row[] = [{ cards: [], width: -PRINT_PAGE.gap, height: 0, rotations: 0 }];
    for (let end = start; end < cards.length && rows.length; end++) {
      const next: Row[] = [];
      for (const row of rows) for (const card of orientations(cards[end])) {
        const width = row.width + PRINT_PAGE.gap + card.width;
        const height = Math.max(row.height, card.height);
        if (width > availableWidth + 0.001 || height > availableHeight + 0.001) continue;
        const value = { cards: [...row.cards, card], width, height, rotations: row.rotations + (card.rotation ? 1 : 0) };
        next.push(value);
        for (const previous of frontier[start]) {
          const candidate: Packing = { rows: [...previous.rows, value], height: previous.height + PRINT_PAGE.gap + height, rotations: previous.rotations + value.rotations };
          if (candidate.height > availableHeight + 0.001) continue;
          const target = frontier[end + 1];
          if (target.some(item => item.height <= candidate.height && item.rotations <= candidate.rotations)) continue;
          frontier[end + 1] = target.filter(item => !(candidate.height <= item.height && candidate.rotations <= item.rotations));
          frontier[end + 1].push(candidate);
        }
      }
      rows = next;
    }
  }
  const packing = frontier[cards.length].sort((a, b) => a.rotations - b.rotations || a.height - b.height)[0];
  if (!packing) return null;
  let y = PRINT_PAGE.margin + (availableHeight - packing.height) / 2;
  const placements: PostcardPlacement[] = [];
  for (const row of packing.rows) {
    let x = PRINT_PAGE.margin + (availableWidth - row.width) / 2;
    for (const card of row.cards) {
      placements.push({ ...card, x, y: y + (row.height - card.height) / 2 });
      x += card.width + PRINT_PAGE.gap;
    }
    y += row.height + PRINT_PAGE.gap;
  }
  return { page: { placements }, rotations: packing.rotations };
}

export function calculatePostcardPrintLayout(cards: Postcard[], scope: PostcardExportScope = 'all'): PostcardPrintLayout {
  if (scope === 'current') {
    const card = cards[0];
    if (!card) return { width: 105, height: 148, pages: [] };
    const size = getPostcardSize(card);
    return { ...size, pages: [{ placements: [{ postcardId: card.id, x: 0, y: 0, ...size, rotation: 0 }] }] };
  }
  const cache = new Map<string, ReturnType<typeof packPage>>();
  const pack = (start: number, end: number) => {
    const key = `${start}:${end}`;
    if (!cache.has(key)) cache.set(key, packPage(cards.slice(start, end)));
    return cache.get(key)!;
  };
  const plans: Array<{ pages: PostcardPrintPage[]; rotations: number } | undefined> = new Array(cards.length + 1);
  plans[cards.length] = { pages: [], rotations: 0 };
  for (let start = cards.length - 1; start >= 0; start--) {
    for (let end = cards.length; end > start; end--) {
      const page = pack(start, end), rest = plans[end];
      if (!page || !rest) continue;
      const candidate = { pages: [page.page, ...rest.pages], rotations: page.rotations + rest.rotations };
      const best = plans[start];
      if (!best || candidate.pages.length < best.pages.length || candidate.pages.length === best.pages.length && candidate.rotations < best.rotations) plans[start] = candidate;
    }
  }
  if (cards.length && !plans[0]) throw new Error('Открытка не помещается в печатную область A4 без уменьшения.');
  return { width: PRINT_PAGE.width, height: PRINT_PAGE.height, pages: plans[0]?.pages ?? [] };
}
