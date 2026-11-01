import { describe, expect, it } from 'vitest';
import { createProject } from '../../domain/project';
import { executeCommand } from '../../domain/commands';
import { decodeProject, validateProject } from './schema';
import { ProjectRepository, STORAGE_KEYS } from './repository';
import type { StorageAdapter } from './repository';

class MemoryStorage implements StorageAdapter {
  values = new Map<string, string>();
  failWrites = false;
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { if (this.failWrites) throw new Error('quota exceeded'); this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}
const fixture = () => createProject('woodland', 24, () => 0.5);

describe('persisted project validation', () => {
  it('round-trips a real catalog project', () => {
    const project = fixture();
    expect(decodeProject(JSON.stringify(project))).toEqual(project);
  });

  it('restores all 25 decorations and rejects a saved card above the new limit', () => {
    let project = fixture();
    for (let index = 0; index < 25; index += 1) {
      project = executeCommand(project, { type: 'add-decoration', cardId: project.cards[0].id, patch: { type: 'star' } }).project;
    }
    expect(project.cards[0].decorations).toHaveLength(25);
    expect(decodeProject(JSON.stringify(project))).toEqual(project);
    project.cards[0].decorations.push({ ...project.cards[0].decorations[0], id: 'decoration-26' });
    expect(() => validateProject(project)).toThrow('не более 25');
  });

  it('rejects deeply nested non-finite values, invalid leaves and missing catalog references', () => {
    const invalid = [
      (project: ReturnType<typeof fixture>) => { project.cards[0].text.x = Infinity; },
      (project: ReturnType<typeof fixture>) => { project.cards[0].text.fontSize = 80; },
      (project: ReturnType<typeof fixture>) => { project.cards[0].illustration.assetId = 'removed-image'; },
      (project: ReturnType<typeof fixture>) => { project.cards[0].background.centerX = 2; },
      (project: ReturnType<typeof fixture>) => { project.cards[1].id = project.cards[0].id; },
      (project: ReturnType<typeof fixture>) => { project.cards[0].hole = { x: -10, y: 0 }; },
      (project: ReturnType<typeof fixture>) => { project.cards[0].decorations = [{ id: 'bad', type: 'star', x: 0, y: 0, width: 21, height: 10, points: 5, stroke: null, fill: '#FFFFFF', strokeWidth: 0.5 }]; },
    ];
    for (const mutate of invalid) {
      const project = fixture();
      mutate(project);
      expect(() => validateProject(project)).toThrow();
    }
    expect(() => decodeProject('{"schemaVersion":1e309}')).toThrow();
  });
});

describe('recovery without loss of the original', () => {
  it.each(['{broken json', JSON.stringify({ ...fixture(), schemaVersion: 2 })])('preserves raw data and backs it up when recovery is impossible', raw => {
    const storage = new MemoryStorage();
    storage.values.set(STORAGE_KEYS.project, raw);
    const repository = new ProjectRepository(storage);
    const restored = repository.load();
    expect(restored.project).toBeNull();
    expect(restored.recovery?.raw).toBe(raw);
    expect(storage.getItem(STORAGE_KEYS.project)).toBe(raw);
    expect(storage.getItem(STORAGE_KEYS.backup)).toBe(raw);
    repository.recover(raw);
    expect(storage.getItem(STORAGE_KEYS.project)).toBe(raw);
  });

  it('backs up the exact original before repairing only omitted v1 defaults', () => {
    const storage = new MemoryStorage();
    const value = fixture() as unknown as Record<string, unknown>;
    delete value.holeEnabled;
    const raw = JSON.stringify(value);
    storage.values.set(STORAGE_KEYS.project, raw);
    const restored = new ProjectRepository(storage).load();
    expect(restored.repaired).toBe(true);
    expect(restored.project?.holeEnabled).toBe(false);
    expect(storage.getItem(STORAGE_KEYS.backup)).toBe(raw);
    expect(decodeProject(storage.getItem(STORAGE_KEYS.project)!)).toEqual(restored.project);
  });

  it('does not repair or replace the active raw document when backup cannot be written', () => {
    const storage = new MemoryStorage();
    const value = fixture() as unknown as Record<string, unknown>;
    delete value.holeEnabled;
    const raw = JSON.stringify(value);
    storage.values.set(STORAGE_KEYS.project, raw);
    storage.failWrites = true;
    const restored = new ProjectRepository(storage).load();
    expect(restored.project).toBeNull();
    expect(restored.recovery?.raw).toBe(raw);
    expect(restored.recovery?.error).toContain('Скачайте исходные данные');
    expect(storage.getItem(STORAGE_KEYS.project)).toBe(raw);
  });

  it('handles denied browser storage without throwing during initialization', () => {
    const restored = new ProjectRepository(null).load();
    expect(restored.project).toBeNull();
    expect(restored.error).toContain('недоступно');
  });

  it('does not overwrite an existing document that could not be read during startup', () => {
    const storage = new MemoryStorage();
    const raw = JSON.stringify(fixture());
    storage.values.set(STORAGE_KEYS.project, raw);
    const adapter: StorageAdapter = { getItem: () => { throw new Error('temporarily denied'); }, setItem: storage.setItem.bind(storage), removeItem: storage.removeItem.bind(storage) };
    const repository = new ProjectRepository(adapter);
    expect(repository.load().error).toContain('denied');
    adapter.getItem = storage.getItem.bind(storage);
    expect(() => repository.save(fixture())).toThrow('другие данные');
    expect(storage.getItem(STORAGE_KEYS.project)).toBe(raw);
  });

  it('detects another tab changing the saved document before a write or discard', () => {
    const storage = new MemoryStorage();
    const raw = JSON.stringify(fixture());
    storage.values.set(STORAGE_KEYS.project, raw);
    const repository = new ProjectRepository(storage);
    repository.load();
    const foreign = JSON.stringify({ ...fixture(), name: 'Из другой вкладки' });
    storage.values.set(STORAGE_KEYS.project, foreign);
    expect(() => repository.save(fixture())).toThrow('другие данные');
    expect(() => repository.discard()).toThrow('изменился');
    expect(storage.getItem(STORAGE_KEYS.project)).toBe(foreign);
  });

  it('restores existing manual hole coordinates without adopting a new default position', () => {
    const storage = new MemoryStorage();
    const project = fixture();
    project.cards[0].hole = { x: 25, y: 3.75 };
    const raw = JSON.stringify(project);
    storage.values.set(STORAGE_KEYS.project, raw);
    const restored = new ProjectRepository(storage).load();
    expect(restored.project!.cards[0].hole).toEqual({ x: 25, y: 3.75 });
    expect(restored.repaired).toBe(false);
    expect(storage.getItem(STORAGE_KEYS.project)).toBe(raw);
  });
});
