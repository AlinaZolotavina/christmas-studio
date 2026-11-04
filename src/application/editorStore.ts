import type { OperationResult } from '../domain/commands';
import { ProjectHistory } from './history';
import { DocumentRepository, StorageConflictError } from '../infrastructure/storage/repository';
import type { Recovery } from '../infrastructure/storage/repository';
import { isColor } from '../infrastructure/storage/schema';

export type SaveStatus = 'loading' | 'saving' | 'saved' | 'error';
export interface EditorStoreState<P> {
  project: P | null;
  revision: number;
  canUndo: boolean;
  canRedo: boolean;
  saveStatus: SaveStatus;
  recovery: Recovery | null;
  notice: string | null;
  recentColors: string[];
}
export interface EditorStorePolicy<P, C> {
  validate(value: unknown): P;
  execute(project: P, command: C): { project: P; result: OperationResult };
  cardIds(project: P): string[];
  typingKey(command: C): string | null;
}
const SAVE_WARNING = 'Не удалось сохранить изменения. Скачайте PDF, чтобы не потерять результат';
const BROWSER_NOTICE = 'Проект сохраняется только в текущем браузере. Очистка данных браузера удалит его. PDF сохраняет результат печати, но не заменяет редактируемый проект.';
const failure = (error: string): OperationResult => ({ changed: false, changedCardIds: [], warnings: [], skippedCardIds: [], error });

/** One synchronous command transaction feeds history, subscribers and debounced persistence. */
export class EditorStore<P, C> {
  private state: EditorStoreState<P> = { project: null, revision: 0, canUndo: false, canRedo: false, saveStatus: 'loading', recovery: null, notice: null, recentColors: [] };

  private history = new ProjectHistory<P>();
  private listeners = new Set<() => void>();
  private timer: ReturnType<typeof setTimeout> | null = null;
  private savedRevision = 0;
  private initialized = false;
  private storageFailed = false;
  private textGroup: { key: string; lastAt: number } | null = null;

  constructor(private repository: DocumentRepository<P>, private policy: EditorStorePolicy<P, C>) {}
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

  dispatch = (command: C): OperationResult => {
    const key = this.policy.typingKey(command);
    const now = Date.now();
    const coalesced = key !== null && this.textGroup?.key === key && now >= this.textGroup.lastAt && now - this.textGroup.lastAt <= 800;
    if (key === null) this.textGroup = null;
    if (!this.state.project) return this.reportFailure('Сначала создайте или восстановите проект.');
    const outcome = this.policy.execute(this.state.project, command);
    if (outcome.result.error) return this.reportFailure(outcome.result.error);
    if (!outcome.result.changed) {
      if (outcome.result.warnings.length) this.setState({ notice: outcome.result.warnings.join(' ') });
      return outcome.result;
    }
    try { this.policy.validate(outcome.project); }
    catch (error) { return this.reportFailure(error instanceof Error ? error.message : 'Некорректные данные проекта.'); }
    if (!coalesced) this.history.record(this.state.project);
    this.textGroup = key !== null ? { key, lastAt: now } : null;
    this.commit(outcome.project, outcome.result.warnings.join(' ') || null);
    return outcome.result;
  };

  protected replaceProject(factory: () => P, replace = true): OperationResult {
    this.textGroup = null;
    this.initialize();
    if (this.state.recovery) return this.reportFailure('Сначала сохраните повреждённые данные и явно удалите их или повторите восстановление.');
    if (this.state.project && !replace) return this.reportFailure('Подтвердите замену сохранённого проекта, чтобы начать новый.');
    try {
      const project = this.policy.validate(factory());
      this.history.clear();
      this.commit(project, this.state.notice);
      return { changed: true, changedCardIds: this.policy.cardIds(project), warnings: [], skippedCardIds: [] };
    } catch (error) { return this.reportFailure(error instanceof Error ? error.message : 'Не удалось создать проект.'); }
  }

  protected updateUiProject(project: P): OperationResult {
    this.textGroup = null;
    this.policy.validate(project);
    this.commit(project);
    return { changed: true, changedCardIds: [], warnings: [], skippedCardIds: [] };
  }

  undo = () => {
    this.textGroup = null;
    if (!this.state.project) return;
    const project = this.history.undo(this.state.project);
    if (project) this.commit(project);
  };
  redo = () => {
    this.textGroup = null;
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
    } catch (error) {
      this.storageFailed = true;
      this.setState({ saveStatus: 'error', notice: error instanceof StorageConflictError ? `${SAVE_WARNING}. ${error.message}` : SAVE_WARNING });
      return false;
    }
  };

  retryRecovery = () => {
    this.textGroup = null;
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
    this.textGroup = null;
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
    const breakTextGroup = () => { this.textGroup = null; };
    const visibility = () => { if (targetDocument.visibilityState === 'hidden') { breakTextGroup(); this.flush(); } };
    const pagehide = () => { breakTextGroup(); this.flush(); };
    const beforeunload = (event: BeforeUnloadEvent) => {
      breakTextGroup();
      if (!this.isDirty() || this.flush()) return;
      event.preventDefault();
      event.returnValue = '';
    };
    targetDocument.addEventListener('visibilitychange', visibility);
    targetDocument.addEventListener('focusout', breakTextGroup);
    targetWindow.addEventListener('pagehide', pagehide);
    targetWindow.addEventListener('beforeunload', beforeunload);
    return () => {
      targetDocument.removeEventListener('visibilitychange', visibility);
      targetDocument.removeEventListener('focusout', breakTextGroup);
      targetWindow.removeEventListener('pagehide', pagehide);
      targetWindow.removeEventListener('beforeunload', beforeunload);
    };
  };

  private commit(project: P, notice: string | null = null) {
    const nextNotice = this.storageFailed && !notice?.includes(SAVE_WARNING) ? [notice, SAVE_WARNING].filter(Boolean).join(' ') : notice;
    this.setState({ project, revision: this.state.revision + 1, canUndo: this.history.canUndo, canRedo: this.history.canRedo, saveStatus: 'saving', notice: nextNotice });
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = setTimeout(this.flush, 400);
  }
  protected reportFailure(error: string): OperationResult { this.textGroup = null; this.setState({ notice: error }); return failure(error); }
  private setState(patch: Partial<EditorStoreState<P>>) {
    this.state = { ...this.state, ...patch };
    for (const listener of this.listeners) listener();
  }
}
