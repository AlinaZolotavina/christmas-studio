export const TOUR_OFFER_KEY = 'advent-tag-studio:tour-offered';
const offeredInSession = new Set<string>();

export function wasTourOffered(key = TOUR_OFFER_KEY): boolean {
  if (offeredInSession.has(key)) return true;
  try { return window.localStorage.getItem(key) === 'shown'; }
  catch { return false; }
}

export function markTourOffered(key = TOUR_OFFER_KEY) {
  offeredInSession.add(key);
  try { window.localStorage.setItem(key, 'shown'); }
  catch { /* The offer remains dismissed for this session if local storage is denied. */ }
}
