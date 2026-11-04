import type { ProjectDocument } from '../domain/types';
import { HISTORY_LIMIT } from '../domain/types';

/** History is session-only and contains immutable document snapshots. */
export class ProjectHistory<T = ProjectDocument> {
  private past: T[] = [];
  private future: T[] = [];

  get canUndo() { return this.past.length > 0; }
  get canRedo() { return this.future.length > 0; }

  record(previous: T) {
    this.past = [...this.past, previous].slice(-HISTORY_LIMIT);
    this.future = [];
  }

  undo(current: T): T | null {
    const previous = this.past.at(-1);
    if (!previous) return null;
    this.past = this.past.slice(0, -1);
    this.future = [...this.future, current];
    return previous;
  }

  redo(current: T): T | null {
    const next = this.future.at(-1);
    if (!next) return null;
    this.future = this.future.slice(0, -1);
    this.past = [...this.past, current].slice(-HISTORY_LIMIT);
    return next;
  }

  clear() { this.past = []; this.future = []; }
}
