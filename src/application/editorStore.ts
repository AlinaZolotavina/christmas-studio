import { t } from '../i18n';
import type { OperationResult } from '../domain/commands';
import { ProjectHistory } from './history';
import { DocumentRepository, StorageConflictError } from '../infrastructure/storage/repository';
import type { Recovery } from '../infrastructure/storage/repository';
import { isColor } from '../infrastructure/storage/schema';
export type SaveStatus = 'loading' | 'saving' | 'saved' | 'error';
export interface EditorNotice {
    type: 'restored' | 'browser-storage' | 'save-error' | 'info' | 'error';
    message: string;
}
export interface EditorStoreState<P> {
    project: P | null;
    revision: number;
    canUndo: boolean;
    canRedo: boolean;
    saveStatus: SaveStatus;
    recovery: Recovery | null;
    notice: string | null;
    notices: EditorNotice[];
    recentColors: string[];
}
export interface EditorStorePolicy<P, C> {
    validate(value: unknown): P;
    execute(project: P, command: C): {
        project: P;
        result: OperationResult;
    };
    cardIds(project: P): string[];
    typingKey(command: C): string | null;
}
const SAVE_WARNING = t("errors.storage.saveFailed");
const BROWSER_NOTICE = t("projects.notifications.browserStorage");
const failure = (error: string): OperationResult => ({ changed: false, changedCardIds: [], warnings: [], skippedCardIds: [], error });
/** One synchronous command transaction feeds history, subscribers and debounced persistence. */
export class EditorStore<P, C> {
    private state: EditorStoreState<P> = { project: null, revision: 0, canUndo: false, canRedo: false, saveStatus: 'loading', recovery: null, notice: null, notices: [], recentColors: [] };
    private history = new ProjectHistory<P>();
    private listeners = new Set<() => void>();
    private timer: ReturnType<typeof setTimeout> | null = null;
    private savedRevision = 0;
    private initialized = false;
    private storageFailed = false;
    private textGroup: {
        key: string;
        lastAt: number;
    } | null = null;
    constructor(private repository: DocumentRepository<P>, private policy: EditorStorePolicy<P, C>) { }
    getSnapshot = () => this.state;
    subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
    initialize = () => {
        if (this.initialized)
            return;
        this.initialized = true;
        const restored = this.repository.load();
        this.storageFailed = Boolean(restored.error);
        this.savedRevision = restored.error && restored.project ? -1 : 0;
        const notices: EditorNotice[] = [];
        if (this.repository.shouldShowBrowserNotice()) notices.push({ type: 'browser-storage', message: BROWSER_NOTICE });
        if (restored.project) notices.push({ type: 'restored', message: t(restored.repaired ? 'projects.notifications.repaired' : 'projects.notifications.restored') });
        if (restored.error) notices.push({ type: 'save-error', message: SAVE_WARNING });
        this.setState({ project: restored.project, recovery: restored.recovery, saveStatus: restored.error ? 'error' : 'saved', notices, recentColors: this.repository.readRecentColors() });
    };
    dispatch = (command: C): OperationResult => {
        const key = this.policy.typingKey(command);
        const now = Date.now();
        const coalesced = key !== null && this.textGroup?.key === key && now >= this.textGroup.lastAt && now - this.textGroup.lastAt <= 800;
        if (key === null)
            this.textGroup = null;
        if (!this.state.project)
            return this.reportFailure(t("errors.projects.missing"));
        const outcome = this.policy.execute(this.state.project, command);
        if (outcome.result.error)
            return this.reportFailure(outcome.result.error);
        if (!outcome.result.changed) {
            if (outcome.result.warnings.length)
                this.setState({ notice: outcome.result.warnings.join(' ') });
            return outcome.result;
        }
        try {
            this.policy.validate(outcome.project);
        }
        catch (error) {
            return this.reportFailure(error instanceof Error ? error.message : t("errors.projects.invalid"));
        }
        if (!coalesced)
            this.history.record(this.state.project);
        this.textGroup = key !== null ? { key, lastAt: now } : null;
        this.commit(outcome.project, outcome.result.warnings.map(message => ({ type: 'info', message })));
        return outcome.result;
    };
    protected replaceProject(factory: () => P, replace = true): OperationResult {
        this.textGroup = null;
        this.initialize();
        if (this.state.recovery)
            return this.reportFailure(t("projects.recovery.resolveBeforeCreate"));
        if (this.state.project && !replace)
            return this.reportFailure(t("projects.replace.confirmFirst"));
        try {
            const project = this.policy.validate(factory());
            this.history.clear();
            this.commit(project, this.state.notices);
            return { changed: true, changedCardIds: this.policy.cardIds(project), warnings: [], skippedCardIds: [] };
        }
        catch (error) {
            return this.reportFailure(error instanceof Error ? error.message : t("errors.projects.createFailed"));
        }
    }
    protected updateUiProject(project: P): OperationResult {
        this.textGroup = null;
        this.policy.validate(project);
        this.commit(project);
        return { changed: true, changedCardIds: [], warnings: [], skippedCardIds: [] };
    }
    undo = () => {
        this.textGroup = null;
        if (!this.state.project)
            return;
        const project = this.history.undo(this.state.project);
        if (project)
            this.commit(project);
    };
    redo = () => {
        this.textGroup = null;
        if (!this.state.project)
            return;
        const project = this.history.redo(this.state.project);
        if (project)
            this.commit(project);
    };
    flush = (): boolean => {
        if (this.timer !== null) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        if (!this.state.project || this.state.recovery || !this.isDirty())
            return true;
        const revision = this.state.revision;
        try {
            this.repository.save(this.state.project);
            this.savedRevision = revision;
            this.storageFailed = false;
            this.setState({ saveStatus: 'saved', notices: this.state.notices.filter(notice => notice.type !== 'save-error') });
            return true;
        }
        catch (error) {
            this.storageFailed = true;
            this.setState({ saveStatus: 'error', notices: [{ type: 'save-error', message: error instanceof StorageConflictError ? t("errors.storage.saveConflict", { saveWarning: SAVE_WARNING, reason: error.message }) : SAVE_WARNING }] });
            return false;
        }
    };
    retryRecovery = () => {
        this.textGroup = null;
        const recovery = this.state.recovery;
        if (!recovery) {
            this.flush();
            return;
        }
        const restored = this.repository.recover(recovery.raw, recovery.error);
        this.storageFailed = Boolean(restored.error);
        this.history.clear();
        const revision = this.state.revision + (restored.project ? 1 : 0);
        this.savedRevision = restored.error && restored.project ? revision - 1 : revision;
        const notices: EditorNotice[] = restored.project
            ? [restored.error ? { type: 'save-error', message: SAVE_WARNING } : { type: 'restored', message: t('projects.notifications.restored') }]
            : [{ type: 'error', message: t('projects.recovery.retryFailed') }];
        this.setState({ project: restored.project, revision, recovery: restored.recovery, saveStatus: restored.error ? 'error' : 'saved', canUndo: false, canRedo: false, notices });
    };
    discardRecovery = () => {
        this.textGroup = null;
        if (!this.state.recovery)
            return;
        try {
            this.repository.discard();
            this.history.clear();
            if (this.timer !== null) {
                clearTimeout(this.timer);
                this.timer = null;
            }
            const revision = this.state.revision + 1;
            this.savedRevision = revision;
            this.storageFailed = false;
            this.setState({ project: null, revision, recovery: null, canUndo: false, canRedo: false, saveStatus: 'saved', notice: t("projects.recovery.discarded") });
        }
        catch {
            this.setState({ notice: t("projects.recovery.discardFailed") });
        }
    };
    clearNotice = () => this.setState({ notice: null });
    addRecentColor = (color: string) => {
        if (!isColor(color))
            return;
        const normalized = color.toUpperCase();
        const recentColors = [normalized, ...this.state.recentColors.filter(item => item !== normalized)].slice(0, 6);
        this.setState({ recentColors });
        try {
            this.repository.saveRecentColors(recentColors);
        }
        catch {
            this.setState({ notice: t("errors.storage.recentColors") });
        }
    };
    isDirty = () => Boolean(this.state.project) && this.savedRevision !== this.state.revision;
    attachBrowserLifecycle = (targetWindow: Window, targetDocument: Document) => {
        const breakTextGroup = () => { this.textGroup = null; };
        const visibility = () => { if (targetDocument.visibilityState === 'hidden') {
            breakTextGroup();
            this.flush();
        } };
        const pagehide = () => { breakTextGroup(); this.flush(); };
        const beforeunload = (event: BeforeUnloadEvent) => {
            breakTextGroup();
            if (!this.isDirty() || this.flush())
                return;
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
    private commit(project: P, notices: EditorNotice[] = []) {
        const nextNotices: EditorNotice[] = this.storageFailed && !notices.some(notice => notice.type === 'save-error')
            ? [...notices, { type: 'save-error', message: SAVE_WARNING }] : notices;
        this.setState({ project, revision: this.state.revision + 1, canUndo: this.history.canUndo, canRedo: this.history.canRedo, saveStatus: 'saving', notices: nextNotices });
        if (this.timer !== null)
            clearTimeout(this.timer);
        this.timer = setTimeout(this.flush, 400);
    }
    protected reportFailure(error: string): OperationResult { this.textGroup = null; this.setState({ notices: [{ type: 'error', message: error }] }); return failure(error); }
    private setState(patch: Partial<EditorStoreState<P>>) {
        if (patch.notices !== undefined) patch.notice = patch.notices.map(notice => notice.message).join(' ') || null;
        else if (Object.hasOwn(patch, 'notice')) patch.notices = patch.notice ? [{ type: 'info', message: patch.notice }] : [];
        this.state = { ...this.state, ...patch };
        for (const listener of this.listeners)
            listener();
    }
}
