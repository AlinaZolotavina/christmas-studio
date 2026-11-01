import type { ProjectDocument } from '../domain/types';
import { HISTORY_LIMIT } from '../domain/types';

/** History is session-only and contains immutable document snapshots. */
export class ProjectHistory {
  private past: ProjectDocument[] = [];
  private future: ProjectDocument[] = [];

  get canUndo() { return this.past.length > 0; }
  get canRedo() { return this.future.length > 0; }

  record(previous: ProjectDocument) {
    this.past = [...this.past, previous].slice(-HISTORY_LIMIT);
    this.future = [];
  }

  undo(current: ProjectDocument): ProjectDocument | null {
    const previous = this.past.at(-1);
    if (!previous) return null;
    this.past = this.past.slice(0, -1);
    this.future = [...this.future, current];
    return previous;
  }

  redo(current: ProjectDocument): ProjectDocument | null {
    const next = this.future.at(-1);
    if (!next) return null;
    this.future = this.future.slice(0, -1);
    this.past = [...this.past, current].slice(-HISTORY_LIMIT);
    return next;
  }

  clear() { this.past = []; this.future = []; }
}
