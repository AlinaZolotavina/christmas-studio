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
export interface StorageKeys { project: string; backup: string; colors: string; browserNotice: string }
export const POSTCARD_STORAGE_KEYS: StorageKeys = {
  project: 'christmas-studio:postcards:project',
  backup: 'christmas-studio:postcards:recovery-backup',
  colors: 'christmas-studio:postcards:recent-colors',
  browserNotice: 'christmas-studio:postcards:browser-notice',
};
export interface DocumentCodec<T> { decode(raw: string): T; repair(raw: string): T }
export interface Recovery { raw: string; error: string }
export interface RestoreResult<T = ProjectDocument> {
  project: T | null;
  recovery: Recovery | null;
  error: string | null;
  repaired: boolean;
}
const message = (error: unknown) => error instanceof Error ? error.message : 'Хранилище браузера недоступно.';
export class StorageConflictError extends Error {}

export class DocumentRepository<T> {
  private expectedRaw: string | null | undefined;
  constructor(private storage: StorageAdapter | null, private keys: StorageKeys, private codec: DocumentCodec<T>) {}

  load(): RestoreResult<T> {
    let raw: string | null;
    try { raw = this.requiredStorage().getItem(this.keys.project); this.expectedRaw = raw; }
    catch (error) { return { project: null, recovery: null, error: message(error), repaired: false }; }
    if (raw === null) return { project: null, recovery: null, error: null, repaired: false };
    try { return { project: this.codec.decode(raw), recovery: null, error: null, repaired: false }; }
    catch (error) { return this.recover(raw, message(error)); }
  }

  recover(raw: string, initialError = 'Не удалось восстановить проект.'): RestoreResult<T> {
    try {
      // setItem is atomic: a failed backup leaves the active original untouched.
      this.requiredStorage().setItem(this.keys.backup, raw);
    } catch (error) {
      return { project: null, recovery: { raw, error: `${initialError} Не удалось записать резервную копию: ${message(error)}. Скачайте исходные данные перед удалением.` }, error: message(error), repaired: false };
    }
    let project: T;
    try { project = this.codec.repair(raw); }
    catch { return { project: null, recovery: { raw, error: initialError }, error: null, repaired: false }; }
    try {
      this.save(project);
      return { project, recovery: null, error: null, repaired: true };
    } catch (error) {
      return { project, recovery: null, error: message(error), repaired: true };
    }
  }

  save(project: T) {
    const storage = this.requiredStorage();
    const currentRaw = storage.getItem(this.keys.project);
    // A previously unread project, or a change from another tab, must never be overwritten.
    if (this.expectedRaw === undefined && currentRaw !== null || this.expectedRaw !== undefined && currentRaw !== this.expectedRaw) throw new StorageConflictError('В браузере уже сохранены другие данные проекта. Скачайте текущий PDF и обновите страницу, чтобы восстановить сохранённый проект.');
    const serialized = JSON.stringify(project);
    storage.setItem(this.keys.project, serialized);
    this.expectedRaw = serialized;
  }
  discard() {
    const storage = this.requiredStorage();
    if (storage.getItem(this.keys.project) !== this.expectedRaw) throw new StorageConflictError('Сохранённый проект изменился. Обновите страницу перед удалением данных.');
    storage.removeItem(this.keys.project);
    this.expectedRaw = null;
  }

  readRecentColors(): string[] {
    try {
      const parsed: unknown = JSON.parse(this.requiredStorage().getItem(this.keys.colors) ?? '[]');
      return Array.isArray(parsed) ? [...new Set(parsed.filter(isColor).map(color => color.toUpperCase()))].slice(0, 6) : [];
    } catch { return []; }
  }
  saveRecentColors(colors: string[]) { this.requiredStorage().setItem(this.keys.colors, JSON.stringify(colors)); }

  shouldShowBrowserNotice(): boolean {
    try {
      if (this.requiredStorage().getItem(this.keys.browserNotice) === 'shown') return false;
      this.requiredStorage().setItem(this.keys.browserNotice, 'shown');
      return true;
    } catch { return true; }
  }

  private requiredStorage(): StorageAdapter {
    if (!this.storage) throw new Error('Хранилище браузера недоступно.');
    return this.storage;
  }
}

/** Compatible tag facade: keys and schema-v1 codec remain unchanged. */
export class ProjectRepository extends DocumentRepository<ProjectDocument> {
  constructor(storage: StorageAdapter | null) { super(storage, STORAGE_KEYS, { decode: decodeProject, repair: repairProject }); }
}
