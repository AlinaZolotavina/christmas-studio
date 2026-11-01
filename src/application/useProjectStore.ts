import { useEffect, useSyncExternalStore } from 'react';
import { ProjectStore } from './projectStore';
import type { StorageAdapter } from '../infrastructure/storage/repository';

let browserStore: ProjectStore | undefined;
function getBrowserStore(): ProjectStore {
  if (!browserStore) {
    let storage: StorageAdapter | null = null;
    try { storage = window.localStorage; } catch { /* Private mode can deny even property access. */ }
    browserStore = new ProjectStore(storage);
    browserStore.initialize();
  }
  return browserStore;
}

export function useProjectStore() {
  const store = getBrowserStore();
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  useEffect(() => store.attachBrowserLifecycle(window, document), [store]);
  return {
    ...state,
    dispatch: store.dispatch, create: store.create, undo: store.undo, redo: store.redo,
    retryRecovery: store.retryRecovery, discardRecovery: store.discardRecovery,
    clearNotice: store.clearNotice, addRecentColor: store.addRecentColor, flush: store.flush,
  };
}
