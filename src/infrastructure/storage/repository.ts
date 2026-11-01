import type { ProjectDocument } from '../../domain/types';
import { decodeProject, isColor, repairProject } from './schema';

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
export const STORAGE_KEYS = {
  project: 'advent-tag-studio:project',
  backup: 'advent-tag-studio:recovery-backup',
  colors: 'advent-tag-studio:recent-colors',
  browserNotice: 'advent-tag-studio:browser-notice',
} as const;
export interface Recovery { raw: string; error: string }
export interface RestoreResult {
  project: ProjectDocument | null;
  recovery: Recovery | null;
  error: string | null;
  repaired: boolean;
}
const message = (error: unknown) => error instanceof Error ? error.message : 'Хранилище браузера недоступно.';

export class ProjectRepository {
  constructor(private storage: StorageAdapter | null) {}

  load(): RestoreResult {
    let raw: string | null;
    try { raw = this.requiredStorage().getItem(STORAGE_KEYS.project); }
    catch (error) { return { project: null, recovery: null, error: message(error), repaired: false }; }
    if (raw === null) return { project: null, recovery: null, error: null, repaired: false };
    try { return { project: decodeProject(raw), recovery: null, error: null, repaired: false }; }
    catch (error) { return this.recover(raw, message(error)); }
  }

  recover(raw: string, initialError = 'Не удалось восстановить проект.'): RestoreResult {
    try {
      // setItem is atomic: a failed backup leaves the active original untouched.
      this.requiredStorage().setItem(STORAGE_KEYS.backup, raw);
    } catch (error) {
      return { project: null, recovery: { raw, error: `${initialError} Не удалось записать резервную копию: ${message(error)}. Скачайте исходные данные перед удалением.` }, error: message(error), repaired: false };
    }
    let project: ProjectDocument;
    try { project = repairProject(raw); }
    catch { return { project: null, recovery: { raw, error: initialError }, error: null, repaired: false }; }
    try {
      this.save(project);
      return { project, recovery: null, error: null, repaired: true };
    } catch (error) {
      return { project, recovery: null, error: message(error), repaired: true };
    }
  }

  save(project: ProjectDocument) { this.requiredStorage().setItem(STORAGE_KEYS.project, JSON.stringify(project)); }
  discard() { this.requiredStorage().removeItem(STORAGE_KEYS.project); }

  readRecentColors(): string[] {
    try {
      const parsed: unknown = JSON.parse(this.requiredStorage().getItem(STORAGE_KEYS.colors) ?? '[]');
      return Array.isArray(parsed) ? [...new Set(parsed.filter(isColor).map(color => color.toUpperCase()))].slice(0, 6) : [];
    } catch { return []; }
  }
  saveRecentColors(colors: string[]) { this.requiredStorage().setItem(STORAGE_KEYS.colors, JSON.stringify(colors)); }

  shouldShowBrowserNotice(): boolean {
    try {
      if (this.requiredStorage().getItem(STORAGE_KEYS.browserNotice) === 'shown') return false;
      this.requiredStorage().setItem(STORAGE_KEYS.browserNotice, 'shown');
      return true;
    } catch { return true; }
  }

  private requiredStorage(): StorageAdapter {
    if (!this.storage) throw new Error('Хранилище браузера недоступно.');
    return this.storage;
  }
}
