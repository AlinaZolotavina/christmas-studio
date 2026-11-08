import { afterEach, describe, expect, it, vi } from 'vitest';
import { PostcardStore } from './postcardStore';
import { ProjectStore } from './projectStore';
import { createTextElement } from '../domain/postcards/project';
import { decodePostcardProject } from '../infrastructure/storage/postcardSchema';
import { POSTCARD_STORAGE_KEYS, STORAGE_KEYS } from '../infrastructure/storage/repository';
import type { StorageAdapter } from '../infrastructure/storage/repository';

class MemoryStorage implements StorageAdapter {
  values = new Map<string, string>();
  failWrites = false;
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { if (this.failWrites) throw new Error('quota'); this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}
const options = { count: 2, format: 'a6-portrait' as const };
const setup = () => {
  const storage = new MemoryStorage();
  const store = new PostcardStore(storage);
  store.initialize();
  expect(store.create(options).changed).toBe(true);
  return { store, storage };
};
afterEach(() => vi.useRealTimers());

describe('shared store with independent postcard persistence', () => {
  it('opens older v1 projects without rounding fields and keeps invalid new values out', () => {
    const { store } = setup();
    const legacy = structuredClone(store.getSnapshot().project!);
    delete legacy.defaultCornerRadius;
    for (const card of legacy.postcards) delete card.cornerRadius;
    expect(decodePostcardProject(JSON.stringify(legacy))).toEqual(legacy);
    for (const cornerRadius of [-1, 21, null, '5']) {
      const raw = { ...legacy, postcards: [{ ...legacy.postcards[0], cornerRadius }] };
      expect(() => decodePostcardProject(JSON.stringify(raw))).toThrow();
      expect(() => decodePostcardProject(JSON.stringify({ ...legacy, defaultCornerRadius: cornerRadius }))).toThrow();
    }
  });

  it('keeps saved tag and postcard documents, colors and history in separate namespaces', () => {
    vi.useFakeTimers();
    const { store, storage } = setup();
    const tags = new ProjectStore(storage);
    tags.initialize(); tags.create('woodland', 24); tags.flush();
    const tagRaw = storage.getItem(STORAGE_KEYS.project);
    store.dispatch({ type: 'rename-project', name: 'Открытки' });
    store.addRecentColor('#123456'); store.flush();
    expect(storage.getItem(STORAGE_KEYS.project)).toBe(tagRaw);
    expect(storage.getItem(POSTCARD_STORAGE_KEYS.project)).toContain('Открытки');
    expect(storage.getItem(STORAGE_KEYS.colors)).toBeNull();
    expect(storage.getItem(POSTCARD_STORAGE_KEYS.colors)).toContain('#123456');
    expect(tags.getSnapshot().canUndo).toBe(false);
    expect(store.getSnapshot().canUndo).toBe(true);
  });

  it('persists active-card UI selection without consuming an undo step and restores deletion selection', () => {
    vi.useFakeTimers();
    const { store, storage } = setup();
    const project = store.getSnapshot().project!;
    store.selectPostcard(project.postcards[1].id);
    expect(store.getSnapshot().canUndo).toBe(false);
    vi.advanceTimersByTime(400);
    expect(decodePostcardProject(storage.getItem(POSTCARD_STORAGE_KEYS.project)!).activePostcardId).toBe(project.postcards[1].id);
    store.dispatch({ type: 'remove-postcard', postcardId: project.postcards[1].id });
    expect(store.getSnapshot().project!.postcards).toHaveLength(1);
    store.undo();
    expect(store.getSnapshot().project!.postcards).toHaveLength(2);
    expect(store.getSnapshot().project!.activePostcardId).toBe(project.postcards[1].id);
    store.flush();
    const restored = new PostcardStore(storage); restored.initialize();
    expect(restored.getSnapshot().project!.activePostcardId).toBe(project.postcards[1].id);
    expect(restored.getSnapshot().canUndo).toBe(false);
  });

  it('requires explicit project replacement and cancellation preserves the saved document', () => {
    vi.useFakeTimers();
    const { store, storage } = setup(); store.flush();
    const project = store.getSnapshot().project;
    const raw = storage.getItem(POSTCARD_STORAGE_KEYS.project);
    expect(store.create({ count: 1, format: 'square' }).error).toContain('Подтвердите');
    expect(store.getSnapshot().project).toBe(project);
    expect(storage.getItem(POSTCARD_STORAGE_KEYS.project)).toBe(raw);
    expect(store.create({ count: 1, format: 'square' }, { replace: true }).changed).toBe(true);
    expect(store.getSnapshot().project!.postcards).toHaveLength(1);
    expect(store.getSnapshot().project!.id).not.toBe(project!.id);
  });

  it('coalesces typing per element, saves at400ms, and records at most15 design steps', () => {
    vi.useFakeTimers();
    const { store, storage } = setup();
    const postcardId = store.getSnapshot().project!.activePostcardId;
    const text = createTextElement({ content: '' });
    store.dispatch({ type: 'add-element', postcardId, element: text });
    for (const content of ['С', 'Сн', 'Сне', 'Снег']) { store.dispatch({ type: 'update-element', postcardId, elementId: text.id, patch: { content } }); vi.advanceTimersByTime(100); }
    vi.advanceTimersByTime(400);
    expect(decodePostcardProject(storage.getItem(POSTCARD_STORAGE_KEYS.project)!).postcards[0].elements[0]).toMatchObject({ content: 'Снег' });
    store.undo();
    expect(store.getSnapshot().project!.postcards[0].elements[0]).toMatchObject({ content: '' });
    store.redo();
    for (let index = 0; index < 20; index++) store.dispatch({ type: 'rename-project', name: `Название ${index}` });
    for (let index = 0; index < 15; index++) store.undo();
    expect(store.getSnapshot().project!.name).toBe('Название 4');
    expect(store.getSnapshot().canUndo).toBe(false);
    store.flush();
  });

  it.each(['{broken postcard', JSON.stringify({ schemaVersion: 99, product: 'postcards' })])('retains corrupt or unknown-version originals until explicit discard', raw => {
    vi.useFakeTimers();
    const storage = new MemoryStorage(); storage.values.set(POSTCARD_STORAGE_KEYS.project, raw);
    const store = new PostcardStore(storage); store.initialize();
    expect(store.getSnapshot().recovery?.raw).toBe(raw);
    expect(storage.getItem(POSTCARD_STORAGE_KEYS.backup)).toBe(raw);
    expect(store.create(options, { replace: true }).error).toBeDefined();
    expect(storage.getItem(POSTCARD_STORAGE_KEYS.project)).toBe(raw);
    store.discardRecovery();
    expect(store.create(options).changed).toBe(true);
    expect(storage.getItem(POSTCARD_STORAGE_KEYS.backup)).toBe(raw);
    store.flush();
  });

  it('backs up the exact original before repairing omitted safe defaults', () => {
    vi.useFakeTimers();
    const { store, storage } = setup();
    const postcardId = store.getSnapshot().project!.activePostcardId;
    store.dispatch({ type: 'add-element', postcardId, element: createTextElement() }); store.flush();
    const rawValue = JSON.parse(storage.getItem(POSTCARD_STORAGE_KEYS.project)!);
    delete rawValue.postcards[0].elements[0].lineHeight;
    const original = JSON.stringify(rawValue); storage.values.set(POSTCARD_STORAGE_KEYS.project, original);
    const restored = new PostcardStore(storage); restored.initialize();
    expect(restored.getSnapshot().project!.postcards[0].elements[0]).toMatchObject({ lineHeight: 1.2 });
    expect(storage.getItem(POSTCARD_STORAGE_KEYS.backup)).toBe(original);
  });

  it('continues editing after quota failure and protects a foreign tab from overwrite', () => {
    vi.useFakeTimers();
    const { store, storage } = setup(); store.flush();
    storage.failWrites = true;
    store.dispatch({ type: 'rename-project', name: 'Не потерять' });
    expect(store.flush()).toBe(false);
    expect(store.isDirty()).toBe(true);
    storage.failWrites = false;
    expect(store.flush()).toBe(true);
    const other = new PostcardStore(storage); other.initialize();
    other.dispatch({ type: 'rename-project', name: 'Другая вкладка' }); other.flush();
    const foreign = storage.getItem(POSTCARD_STORAGE_KEYS.project);
    store.dispatch({ type: 'rename-project', name: 'Первый редактор' });
    expect(store.flush()).toBe(false);
    expect(storage.getItem(POSTCARD_STORAGE_KEYS.project)).toBe(foreign);
    expect(store.getSnapshot().notice).toContain('другие данные');
  });

  it('handles denied storage without replacing unknown data and leaves rejected commands out of history', () => {
    vi.useFakeTimers();
    const store = new PostcardStore(null); store.initialize();
    expect(store.getSnapshot().saveStatus).toBe('error');
    expect(store.create({ count: 1, format: 'square' }).changed).toBe(true);
    expect(store.flush()).toBe(false);
    const before = store.getSnapshot().project;
    expect(store.dispatch({ type: 'remove-postcard', postcardId: before!.activePostcardId }).error).toBeDefined();
    expect(store.getSnapshot().project).toBe(before);
    expect(store.getSnapshot().canUndo).toBe(false);
  });
});
