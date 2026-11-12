import { useEffect, useState } from 'react';
import { t } from '../../i18n';
import { decodeGiftList, GIFT_STORAGE_KEY, type SavedGiftItem } from './giftIdeas';

export function useGiftList() {
  const [initial] = useState(() => {
    try { return { items: decodeGiftList(localStorage.getItem(GIFT_STORAGE_KEY)), error: '', canSave: true }; }
    catch { return { items: [] as SavedGiftItem[], error: t('pages.giftIdeas.storage.readError'), canSave: false }; }
  });
  const [items, setItems] = useState(initial.items);
  const [error, setError] = useState(initial.error);
  useEffect(() => {
    // A failed initial read must not overwrite an existing list with an empty array.
    if (!initial.canSave) return;
    try { localStorage.setItem(GIFT_STORAGE_KEY, JSON.stringify(items)); setError(''); }
    catch { setError(t('pages.giftIdeas.storage.writeError')); }
  }, [items, initial.canSave]);
  return { items, setItems, storageError: error };
}
