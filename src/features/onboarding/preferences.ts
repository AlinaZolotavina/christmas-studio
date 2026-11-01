export const TOUR_OFFER_KEY = 'advent-tag-studio:tour-offered';
let offeredInSession = false;

export function wasTourOffered(): boolean {
  if (offeredInSession) return true;
  try { return window.localStorage.getItem(TOUR_OFFER_KEY) === 'shown'; }
  catch { return false; }
}

export function markTourOffered() {
  offeredInSession = true;
  try { window.localStorage.setItem(TOUR_OFFER_KEY, 'shown'); }
  catch { /* The offer remains dismissed for this session if local storage is denied. */ }
}
