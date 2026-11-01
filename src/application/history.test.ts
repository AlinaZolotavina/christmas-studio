import { describe, expect, it } from 'vitest';
import { ProjectHistory } from './history';
import type { ProjectDocument } from '../domain/types';

const snapshot = (name: string) => ({ schemaVersion: 1, id: 'project', name, templateId: 'winter', cardCount: 24, cards: [], holeEnabled: false }) as ProjectDocument;

describe('session history', () => {
  it('keeps exactly 15 steps and treats a batch document as one step', () => {
    const history = new ProjectHistory();
    for (let index = 0; index < 18; index += 1) history.record(snapshot(String(index)));
    let current = snapshot('18');
    for (let index = 17; index >= 3; index -= 1) {
      current = history.undo(current)!;
      expect(current.name).toBe(String(index));
    }
    expect(history.canUndo).toBe(false);
    expect(history.undo(current)).toBeNull();
    expect(history.redo(current)?.name).toBe('4');
  });

  it('clears redo on a new operation and resets when the session resets', () => {
    const history = new ProjectHistory();
    history.record(snapshot('before'));
    const previous = history.undo(snapshot('after'))!;
    expect(history.canRedo).toBe(true);
    history.record(previous);
    expect(history.canRedo).toBe(false);
    history.clear();
    expect(history.canUndo).toBe(false);
    expect(history.canRedo).toBe(false);
  });
});
