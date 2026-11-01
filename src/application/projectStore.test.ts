import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProjectStore } from './projectStore';
import { STORAGE_KEYS } from '../infrastructure/storage/repository';
import type { StorageAdapter } from '../infrastructure/storage/repository';
import { decodeProject } from '../infrastructure/storage/schema';

class MemoryStorage implements StorageAdapter {
  values = new Map<string, string>();
  projectWrites = 0;
  failProjectWrite = false;
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) {
    if (key === STORAGE_KEYS.project) {
      if (this.failProjectWrite) throw new Error('quota');
      this.projectWrites += 1;
    }
    this.values.set(key, value);
  }
  removeItem(key: string) { this.values.delete(key); }
}
const setup = () => {
  const storage = new MemoryStorage();
  const store = new ProjectStore(storage);
  store.initialize();
  store.create('woodland', 24);
  return { storage, store, cardId: store.getSnapshot().project!.cards[0].id };
};
afterEach(() => { vi.useRealTimers(); });

describe('project command pipeline and autosave', () => {
  it('debounces for 400 ms after the latest command and saves the matching revision', () => {
    vi.useFakeTimers();
    const { store, storage, cardId } = setup();
    vi.advanceTimersByTime(250);
    store.dispatch({ type: 'update-text', cardId, patch: { content: 'Праздник' } });
    vi.advanceTimersByTime(399);
    expect(storage.projectWrites).toBe(0);
    expect(store.getSnapshot().saveStatus).toBe('saving');
    vi.advanceTimersByTime(1);
    expect(storage.projectWrites).toBe(1);
    expect(store.getSnapshot().saveStatus).toBe('saved');
    expect(store.isDirty()).toBe(false);
    expect(decodeProject(storage.getItem(STORAGE_KEYS.project)!).cards[0].text.content).toBe('Праздник');
  });

  it('treats a mass command as one undo step and starts fresh history after reload', () => {
    vi.useFakeTimers();
    const { store, storage, cardId } = setup();
    store.dispatch({ type: 'update-text', cardId, scope: 'all', patch: { fontSize: 18 } });
    expect(store.getSnapshot().project!.cards.every(card => card.text.fontSize === 18)).toBe(true);
    store.undo();
    expect(store.getSnapshot().project!.cards.every(card => card.text.fontSize === 28)).toBe(true);
    expect(store.getSnapshot().canRedo).toBe(true);
    store.redo();
    store.flush();
    const restored = new ProjectStore(storage);
    restored.initialize();
    expect(restored.getSnapshot().project!.cards[0].text.fontSize).toBe(18);
    expect(restored.getSnapshot().canUndo).toBe(false);
    expect(restored.getSnapshot().canRedo).toBe(false);
  });

  it('keeps editing on quota failure and removes the warning only after successful saving', () => {
    vi.useFakeTimers();
    const { store, storage, cardId } = setup();
    storage.failProjectWrite = true;
    expect(store.flush()).toBe(false);
    expect(store.getSnapshot().saveStatus).toBe('error');
    store.dispatch({ type: 'update-text', cardId, patch: { content: 'Сохраним позже' } });
    expect(store.getSnapshot().notice).toContain('Не удалось сохранить');
    storage.failProjectWrite = false;
    expect(store.flush()).toBe(true);
    expect(store.getSnapshot().notice ?? '').not.toContain('Не удалось сохранить');
    expect(decodeProject(storage.getItem(STORAGE_KEYS.project)!).cards[0].text.content).toBe('Сохраним позже');
  });

  it('rejects an invalid reference without recording a partial document or history step', () => {
    vi.useFakeTimers();
    const { store, cardId } = setup();
    const before = store.getSnapshot().project;
    const revision = store.getSnapshot().revision;
    const result = store.dispatch({ type: 'update-illustration', cardId, patch: { assetId: 'missing-art' } });
    expect(result.error).toContain('не найдена');
    expect(store.getSnapshot().project).toBe(before);
    expect(store.getSnapshot().revision).toBe(revision);
    expect(store.getSnapshot().canUndo).toBe(false);
  });

  it('keeps malformed raw data until explicit discard and blocks accidental replacement', () => {
    vi.useFakeTimers();
    const storage = new MemoryStorage();
    storage.values.set(STORAGE_KEYS.project, '{original raw');
    const store = new ProjectStore(storage);
    store.initialize();
    expect(store.getSnapshot().recovery?.raw).toBe('{original raw');
    expect(store.create('woodland', 24).error).toBeDefined();
    store.retryRecovery();
    vi.advanceTimersByTime(1000);
    expect(storage.getItem(STORAGE_KEYS.project)).toBe('{original raw');
    store.discardRecovery();
    expect(storage.getItem(STORAGE_KEYS.project)).toBeNull();
    expect(storage.getItem(STORAGE_KEYS.backup)).toBe('{original raw');
    expect(store.create('woodland', 24).changed).toBe(true);
    store.flush();
  });

  it('persists six case-insensitive recent colors separately from the document', () => {
    vi.useFakeTimers();
    const { store, storage } = setup();
    for (const color of ['#112233', '#223344', '#334455', '#445566', '#556677', '#667788', '#aabbcc', '#AABBCC']) store.addRecentColor(color);
    expect(store.getSnapshot().recentColors).toEqual(['#AABBCC', '#667788', '#556677', '#445566', '#334455', '#223344']);
    store.flush();
    expect(storage.getItem(STORAGE_KEYS.project)).not.toContain('recentColors');
    const restored = new ProjectStore(storage);
    restored.initialize();
    expect(restored.getSnapshot().recentColors).toEqual(store.getSnapshot().recentColors);
    expect(restored.getSnapshot().notice).not.toContain('Очистка данных');
  });

  it('uses lifecycle best efforts and requests a browser warning only while saving fails', () => {
    vi.useFakeTimers();
    const { store, storage } = setup();
    const targetWindow = new EventTarget();
    const targetDocument = Object.assign(new EventTarget(), { visibilityState: 'hidden' });
    const cleanup = store.attachBrowserLifecycle(targetWindow as unknown as Window, targetDocument as unknown as Document);
    targetDocument.dispatchEvent(new Event('visibilitychange'));
    expect(store.isDirty()).toBe(false);
    store.dispatch({ type: 'rename-project', name: 'Новое имя' });
    storage.failProjectWrite = true;
    const failedUnload = new Event('beforeunload', { cancelable: true });
    targetWindow.dispatchEvent(failedUnload);
    expect(failedUnload.defaultPrevented).toBe(true);
    storage.failProjectWrite = false;
    const savedUnload = new Event('beforeunload', { cancelable: true });
    targetWindow.dispatchEvent(savedUnload);
    expect(savedUnload.defaultPrevented).toBe(false);
    expect(store.isDirty()).toBe(false);
    cleanup();
  });

  it('coalesces five typed characters into one undo step while keeping every revision', () => {
    vi.useFakeTimers();
    const { store, storage, cardId } = setup();
    const initialRevision = store.getSnapshot().revision;
    for (const content of ['С', 'Сн', 'Сне', 'Снег', 'Снега']) {
      store.dispatch({ type: 'update-text', cardId, patch: { content } });
      vi.advanceTimersByTime(100);
    }
    expect(store.getSnapshot().revision).toBe(initialRevision + 5);
    vi.advanceTimersByTime(400);
    expect(decodeProject(storage.getItem(STORAGE_KEYS.project)!).cards[0].text.content).toBe('Снега');
    store.undo();
    expect(store.getSnapshot().project!.cards[0].text.content).toBe('1');
    expect(store.getSnapshot().canUndo).toBe(false);
    store.redo();
    expect(store.getSnapshot().project!.cards[0].text.content).toBe('Снега');
    store.flush();
  });

  it('separates typing sessions by a pause and by another command', () => {
    vi.useFakeTimers();
    const { store, cardId } = setup();
    store.dispatch({ type: 'update-text', cardId, patch: { content: 'Первая' } });
    vi.advanceTimersByTime(801);
    store.dispatch({ type: 'update-text', cardId, patch: { content: 'Вторая' } });
    store.dispatch({ type: 'update-text', cardId, patch: { fontSize: 20 } });
    store.dispatch({ type: 'update-text', cardId, patch: { content: 'Третья' } });
    store.undo();
    expect(store.getSnapshot().project!.cards[0].text).toMatchObject({ content: 'Вторая', fontSize: 20 });
    store.undo();
    expect(store.getSnapshot().project!.cards[0].text).toMatchObject({ content: 'Вторая', fontSize: 28 });
    store.undo();
    expect(store.getSnapshot().project!.cards[0].text.content).toBe('Первая');
    store.undo();
    expect(store.getSnapshot().project!.cards[0].text.content).toBe('1');
    store.flush();
  });

  it('ends typing groups on blur and removes lifecycle listeners on cleanup', () => {
    vi.useFakeTimers();
    const { store, cardId } = setup();
    const targetWindow = new EventTarget();
    const targetDocument = Object.assign(new EventTarget(), { visibilityState: 'visible' });
    const cleanup = store.attachBrowserLifecycle(targetWindow as unknown as Window, targetDocument as unknown as Document);
    store.dispatch({ type: 'update-text', cardId, patch: { content: 'Сессия 1' } });
    targetDocument.dispatchEvent(new Event('focusout'));
    store.dispatch({ type: 'update-text', cardId, patch: { content: 'Сессия 2' } });
    store.undo();
    expect(store.getSnapshot().project!.cards[0].text.content).toBe('Сессия 1');
    cleanup();
    targetWindow.dispatchEvent(new Event('pagehide'));
    expect(store.isDirty()).toBe(true);
    store.flush();
  });

  it('records a full template reset as one undoable operation and saves its new revision', () => {
    vi.useFakeTimers();
    const { store, storage, cardId } = setup();
    store.dispatch({ type: 'update-text', cardId, patch: { content: 'Особенный день', fontSize: 18 } });
    store.dispatch({ type: 'update-background', cardId, scope: 'all', patch: { colors: ['#123456'] } });
    const before = structuredClone(store.getSnapshot().project!);
    const revision = store.getSnapshot().revision;
    const reset = store.dispatch({ type: 'reset-project' });
    expect(reset.changed).toBe(true);
    expect(store.getSnapshot().revision).toBe(revision + 1);
    expect(store.getSnapshot().project!.cards[0].text.content).toBe('1');
    expect(store.getSnapshot().project!.cards.map(card => card.illustration.assetId)).toEqual(before.cards.map(card => card.illustration.assetId));
    store.undo();
    expect(store.getSnapshot().project).toEqual(before);
    store.redo();
    store.flush();
    expect(decodeProject(storage.getItem(STORAGE_KEYS.project)!).cards[0].text.content).toBe('1');
    expect(store.isDirty()).toBe(false);
  });
});
