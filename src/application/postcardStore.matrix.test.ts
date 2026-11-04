import { afterEach, describe, expect, it, vi } from 'vitest';
import { PostcardStore } from './postcardStore';
import type { PostcardCommand } from '../domain/postcards/commands';
import { blankPostcardBackground, createDecorationElement, createImageElement, createLetteringElement, createPostcardProject, createTextElement } from '../domain/postcards/project';
import type { PostcardProject, PostcardTemplate } from '../domain/postcards/types';
import { POSTCARD_STORAGE_KEYS, STORAGE_KEYS, type StorageAdapter } from '../infrastructure/storage/repository';

class MemoryStorage implements StorageAdapter {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

const template: PostcardTemplate = {
  id: 'test-editable-composition', name: { ru: 'Тестовая композиция', en: 'Test composition' }, format: 'square', background: blankPostcardBackground(),
  elements: [createTextElement(), createImageElement('rustic-wooden-star'), createLetteringElement('golden-merry-christmas-calligraphy'), createDecorationElement()],
};
type Scenario = [string, (project: PostcardProject) => PostcardCommand];
const card = (project: PostcardProject) => project.postcards[0];
const element = (project: PostcardProject, index = 0) => ({ postcardId: card(project).id, elementId: card(project).elements[index].id });
const scenarios: Scenario[] = [
  ['project title with Cyrillic and punctuation', () => ({ type: 'rename-project', name: 'Ёлка — 2027 / «Семья & друзья» ♥' })],
  ['default format', () => ({ type: 'set-default-format', format: 'a6-landscape' })],
  ['adding a blank postcard', () => ({ type: 'add-postcard', format: 'a6-landscape' })],
  ['adding an editable composition', () => ({ type: 'add-postcard', template })],
  ['duplicating a postcard', project => ({ type: 'duplicate-postcard', postcardId: card(project).id })],
  ['deleting the active postcard', project => ({ type: 'remove-postcard', postcardId: card(project).id })],
  ['reordering postcards', project => ({ type: 'reorder-postcard', postcardId: card(project).id, index: 1 })],
  ['changing physical format', project => ({ type: 'set-format', postcardId: card(project).id, format: 'square' })],
  ['replacing a composition', project => ({ type: 'apply-template', postcardId: card(project).id, template, format: 'square' })],
  ['solid background color', project => ({ type: 'update-background', postcardId: card(project).id, background: { ...blankPostcardBackground(), colors: ['#123456'] } })],
  ['linear background colors and direction', project => ({ type: 'update-background', postcardId: card(project).id, background: { kind: 'linear', colors: ['#123456', '#FFFFFF', '#D9E7EC'], angle: 135, centerX: 0.5, centerY: 0.5 } })],
  ['radial background colors and center', project => ({ type: 'update-background', postcardId: card(project).id, background: { kind: 'radial', colors: ['#FFFFFF', '#36523C'], angle: 90, centerX: 0.25, centerY: 0.75 } })],
  ['image background', project => ({ type: 'update-background', postcardId: card(project).id, background: { kind: 'image', assetId: 'watercolor-winter-sky-snowflakes', color: '#FFFFFF' } })],
  ['adding another text', project => ({ type: 'add-element', postcardId: card(project).id, element: createTextElement({ content: 'Независимый текст' }) })],
  ['all text appearance settings', project => ({ type: 'update-element', ...element(project), patch: { content: 'Зима\nWinter', fontId: 'serif', fontSize: 18, weight: 'bold', italic: true, color: '#123456', align: 'left', lineHeight: 1.5, letterSpacing: 0.6, stroke: { color: '#FFFFFF', width: 0.8 }, shadow: { color: '#36523C', offsetX: 1, offsetY: -1, blur: 0.5 } } })],
  ['moving and rotating an element', project => ({ type: 'update-element', ...element(project), patch: { x: 12, y: 35, rotation: 31 } })],
  ['resizing an illustration proportionally', project => ({ type: 'update-element', ...element(project, 1), patch: { width: 30 } })],
  ['lettering opacity', project => ({ type: 'update-element', ...element(project, 2), patch: { opacity: 0.65 } })],
  ['primitive decoration appearance', project => ({ type: 'update-element', ...element(project, 3), patch: { shape: 'star', fill: '#FFFFFF', stroke: '#36523C', strokeWidth: 1, points: 7, opacity: 0.8 } })],
  ['adding decorative artwork', project => ({ type: 'add-element', postcardId: card(project).id, element: createDecorationElement({ assetId: 'burgundy-velvet-bow-with-gold-trim', width: 40, height: 40 * 1199 / 1312 }) })],
  ['deleting an element', project => ({ type: 'remove-element', ...element(project) })],
  ['duplicating an element', project => ({ type: 'duplicate-element', ...element(project) })],
  ['locking a layer', project => ({ type: 'set-element-lock', ...element(project), locked: true })],
  ['reordering layers', project => ({ type: 'reorder-element', ...element(project), index: 3 })],
];

afterEach(() => vi.useRealTimers());
describe('postcard operations survive undo, redo and an autosaved reload', () => {
  it.each(scenarios)('%s', (_name, command) => {
    vi.useFakeTimers();
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEYS.project, 'untouched tag document');
    const store = new PostcardStore(storage); store.initialize();
    expect(store.create({ count: 2, format: 'a6-portrait', template }).changed).toBe(true);
    store.flush();
    const before = structuredClone(store.getSnapshot().project!);
    expect(store.dispatch(command(before)).changed).toBe(true);
    const after = structuredClone(store.getSnapshot().project!);
    store.undo(); expect(store.getSnapshot().project).toEqual(before);
    store.redo(); expect(store.getSnapshot().project).toEqual(after);
    // No flush: verify the production debounce persists every operation, including order and nested effects.
    vi.advanceTimersByTime(400);
    const reopened = new PostcardStore(storage); reopened.initialize();
    expect(reopened.getSnapshot().project).toEqual(after);
    expect(reopened.getSnapshot().canUndo).toBe(false);
    expect(storage.getItem(POSTCARD_STORAGE_KEYS.backup)).toBeNull();
    expect(storage.getItem(STORAGE_KEYS.project)).toBe('untouched tag document');
  });

  it.each(['', '   ', 'x'.repeat(121)])('rejects an invalid project name atomically: %j', name => {
    expect(() => createPostcardProject({ name, count: 1, format: 'square' })).toThrow();
    const storage = new MemoryStorage(); const store = new PostcardStore(storage); store.initialize();
    store.create({ count: 1, format: 'square' }); store.flush();
    const before = store.getSnapshot().project;
    expect(store.dispatch({ type: 'rename-project', name }).error).toBeDefined();
    expect(store.getSnapshot().project).toBe(before);
    expect(store.getSnapshot().canUndo).toBe(false);
  });
});
