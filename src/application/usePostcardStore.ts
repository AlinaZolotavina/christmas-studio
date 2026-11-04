import { useEffect, useSyncExternalStore } from 'react';
import { PostcardStore } from './postcardStore';
import type { StorageAdapter } from '../infrastructure/storage/repository';

let browserStore: PostcardStore | undefined;
function getBrowserStore(): PostcardStore {
  if (!browserStore) {
    let storage: StorageAdapter | null = null;
    try { storage = window.localStorage; } catch { /* Private mode can deny property access. */ }
    browserStore = new PostcardStore(storage);
    browserStore.initialize();
  }
  return browserStore;
}
export function usePostcardStore() {
  const store = getBrowserStore();
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  useEffect(() => {
    const cleanup = store.attachBrowserLifecycle(window, document);
    return () => { store.flush(); cleanup(); };
  }, [store]);
  return {
    ...state, dispatch: store.dispatch, create: store.create, selectPostcard: store.selectPostcard,
    undo: store.undo, redo: store.redo, flush: store.flush,
    retryRecovery: store.retryRecovery, discardRecovery: store.discardRecovery,
    clearNotice: store.clearNotice, addRecentColor: store.addRecentColor,
  };
}
