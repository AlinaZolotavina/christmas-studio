import { executeCommand } from '../domain/commands';
import type { Command, OperationResult } from '../domain/commands';
import { createProject } from '../domain/project';
import type { ProjectDocument } from '../domain/types';
import { ProjectHistory } from './history';
import { ProjectRepository } from '../infrastructure/storage/repository';
import type { Recovery, StorageAdapter } from '../infrastructure/storage/repository';
import { isColor, validateProject } from '../infrastructure/storage/schema';

export type SaveStatus = 'loading' | 'saving' | 'saved' | 'error';
export interface ProjectStoreState {
  project: ProjectDocument | null;
  revision: number;
  canUndo: boolean;
  canRedo: boolean;
  saveStatus: SaveStatus;
  recovery: Recovery | null;
  notice: string | null;
  recentColors: string[];
}
const SAVE_WARNING = 'Не удалось сохранить изменения. Скачайте PDF, чтобы не потерять результат';
const BROWSER_NOTICE = 'Проект сохраняется только в текущем браузере. Очистка данных браузера удалит его. PDF сохраняет результат печати, но не заменяет редактируемый проект.';
const failure = (error: string): OperationResult => ({ changed: false, changedCardIds: [], warnings: [], skippedCardIds: [], error });

/** One synchronous command transaction feeds history, subscribers and debounced persistence. */
export class ProjectStore {
  private state: ProjectStoreState = { project: null, revision: 0, canUndo: false, canRedo: false, saveStatus: 'loading', recovery: null, notice: null, recentColors: [] };
  private repository: ProjectRepository;
  private history = new ProjectHistory();
  private listeners = new Set<() => void>();
  private timer: ReturnType<typeof setTimeout> | null = null;
  private savedRevision = 0;
  private initialized = false;
  private storageFailed = false;

  constructor(storage: StorageAdapter | null) { this.repository = new ProjectRepository(storage); }
  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };

  initialize = () => {
    if (this.initialized) return;
    this.initialized = true;
    const restored = this.repository.load();
    this.storageFailed = Boolean(restored.error);
    this.savedRevision = restored.error && restored.project ? -1 : 0;
    const notices = [this.repository.shouldShowBrowserNotice() ? BROWSER_NOTICE : null, restored.project ? restored.repaired ? 'Проект восстановлен из сохранённых данных. Исходник оставлен в локальной резервной копии.' : 'Проект восстановлен' : null, restored.error ? SAVE_WARNING : null].filter(Boolean);
    this.setState({ project: restored.project, recovery: restored.recovery, saveStatus: restored.error ? 'error' : 'saved', notice: notices.join(' ') || null, recentColors: this.repository.readRecentColors() });
  };

  dispatch = (command: Command): OperationResult => {
    if (!this.state.project) return this.reportFailure('Сначала создайте или восстановите проект.');
    const outcome = executeCommand(this.state.project, command);
    if (outcome.result.error) return this.reportFailure(outcome.result.error);
    if (!outcome.result.changed) {
      if (outcome.result.warnings.length) this.setState({ notice: outcome.result.warnings.join(' ') });
      return outcome.result;
    }
    try { validateProject(outcome.project); }
    catch (error) { return this.reportFailure(error instanceof Error ? error.message : 'Некорректные данные проекта.'); }
    this.history.record(this.state.project);
    this.commit(outcome.project, outcome.result.warnings.join(' ') || null);
    return outcome.result;
  };

  create = (templateId: string, count: 24 | 31): OperationResult => {
    if (this.state.recovery) return this.reportFailure('Сначала сохраните повреждённые данные и явно удалите их или повторите восстановление.');
    try {
      const project = validateProject(createProject(templateId, count));
      this.history.clear();
      this.commit(project, this.state.notice);
      return { changed: true, changedCardIds: project.cards.map(card => card.id), warnings: [], skippedCardIds: [] };
    } catch (error) { return this.reportFailure(error instanceof Error ? error.message : 'Не удалось создать проект.'); }
  };

  undo = () => {
    if (!this.state.project) return;
    const project = this.history.undo(this.state.project);
    if (project) this.commit(project);
  };
  redo = () => {
    if (!this.state.project) return;
    const project = this.history.redo(this.state.project);
    if (project) this.commit(project);
  };

  flush = (): boolean => {
    if (this.timer !== null) { clearTimeout(this.timer); this.timer = null; }
    if (!this.state.project || this.state.recovery || !this.isDirty()) return true;
    const revision = this.state.revision;
    try {
      this.repository.save(this.state.project);
      this.savedRevision = revision;
      this.storageFailed = false;
      this.setState({ saveStatus: 'saved', notice: this.state.notice?.replace(SAVE_WARNING, '').trim() || null });
      return true;
    } catch {
      this.storageFailed = true;
      this.setState({ saveStatus: 'error', notice: SAVE_WARNING });
      return false;
    }
  };

  retryRecovery = () => {
    const recovery = this.state.recovery;
    if (!recovery) { this.flush(); return; }
    const restored = this.repository.recover(recovery.raw, recovery.error);
    this.storageFailed = Boolean(restored.error);
    this.history.clear();
    const revision = this.state.revision + (restored.project ? 1 : 0);
    this.savedRevision = restored.error && restored.project ? revision - 1 : revision;
    this.setState({ project: restored.project, revision, recovery: restored.recovery, saveStatus: restored.error ? 'error' : 'saved', canUndo: false, canRedo: false, notice: restored.project ? restored.error ? SAVE_WARNING : 'Проект восстановлен' : 'Восстановить проект пока не удалось. Исходные данные сохранены.' });
  };

  discardRecovery = () => {
    if (!this.state.recovery) return;
    try {
      this.repository.discard();
      this.history.clear();
      if (this.timer !== null) { clearTimeout(this.timer); this.timer = null; }
      const revision = this.state.revision + 1;
      this.savedRevision = revision;
      this.storageFailed = false;
      this.setState({ project: null, revision, recovery: null, canUndo: false, canRedo: false, saveStatus: 'saved', notice: 'Повреждённые данные удалены. Можно создать новый проект.' });
    } catch { this.setState({ notice: 'Не удалось удалить повреждённые данные. Исходник сохранён; повторите попытку.' }); }
  };

  clearNotice = () => this.setState({ notice: null });
  addRecentColor = (color: string) => {
    if (!isColor(color)) return;
    const normalized = color.toUpperCase();
    const recentColors = [normalized, ...this.state.recentColors.filter(item => item !== normalized)].slice(0, 6);
    this.setState({ recentColors });
    try { this.repository.saveRecentColors(recentColors); }
    catch { this.setState({ notice: 'Не удалось сохранить недавние цвета в браузере.' }); }
  };
  isDirty = () => Boolean(this.state.project) && this.savedRevision !== this.state.revision;

  attachBrowserLifecycle = (targetWindow: Window, targetDocument: Document) => {
    const visibility = () => { if (targetDocument.visibilityState === 'hidden') this.flush(); };
    const pagehide = () => { this.flush(); };
    const beforeunload = (event: BeforeUnloadEvent) => {
      if (!this.isDirty() || this.flush()) return;
      event.preventDefault();
      event.returnValue = '';
    };
    targetDocument.addEventListener('visibilitychange', visibility);
    targetWindow.addEventListener('pagehide', pagehide);
    targetWindow.addEventListener('beforeunload', beforeunload);
    return () => {
      targetDocument.removeEventListener('visibilitychange', visibility);
      targetWindow.removeEventListener('pagehide', pagehide);
      targetWindow.removeEventListener('beforeunload', beforeunload);
    };
  };

  private commit(project: ProjectDocument, notice: string | null = null) {
    const nextNotice = this.storageFailed && !notice?.includes(SAVE_WARNING) ? [notice, SAVE_WARNING].filter(Boolean).join(' ') : notice;
    this.setState({ project, revision: this.state.revision + 1, canUndo: this.history.canUndo, canRedo: this.history.canRedo, saveStatus: 'saving', notice: nextNotice });
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = setTimeout(this.flush, 400);
  }
  private reportFailure(error: string): OperationResult { this.setState({ notice: error }); return failure(error); }
  private setState(patch: Partial<ProjectStoreState>) {
    this.state = { ...this.state, ...patch };
    for (const listener of this.listeners) listener();
  }
}
