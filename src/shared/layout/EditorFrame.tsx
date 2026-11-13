import { t } from '../../i18n';
import { rich } from '../../i18n/rich';
import { useEffect, useState, type ReactNode } from 'react';
import { AlertCircle, AlertTriangle, Check, CircleHelp, CloudCheck, LayoutTemplate, Redo2, Settings2, Undo2 } from 'lucide-react';
import { IconButton } from '../ui/Controls';
const editorLayout = () => ({ compact: window.matchMedia('(max-width: 1150px) and (orientation: portrait), (max-width: 650px)').matches, wide: window.matchMedia('(min-width: 1151px)').matches });
export function useEditorLayout() {
    const [layout, setLayout] = useState(editorLayout);
    useEffect(() => { const update = () => setLayout(editorLayout()); window.addEventListener('resize', update); return () => window.removeEventListener('resize', update); }, []);
    return layout;
}
/** Both products use the same grid, header/status positions and compact breakpoints. */
export function EditorFrame({ compact, showStrip, panelOpen = false, className = '', children }: {
    compact: boolean;
    showStrip: boolean;
    panelOpen?: boolean;
    className?: string;
    children: ReactNode;
}) {
    useEffect(() => {
        if (!compact || !panelOpen) return;
        const preventBackgroundScroll = (event: TouchEvent | WheelEvent) => {
            const target = event.target;
            if (target instanceof Element && target.closest('.bottom-sheet, .modal, .mobile-dock')) return;
            if (event.cancelable) event.preventDefault();
        };
        document.addEventListener('touchmove', preventBackgroundScroll, { passive: false });
        document.addEventListener('wheel', preventBackgroundScroll, { passive: false });
        return () => {
            document.removeEventListener('touchmove', preventBackgroundScroll);
            document.removeEventListener('wheel', preventBackgroundScroll);
        };
    }, [compact, panelOpen]);
    return <div className={`studio ${compact ? 'studio--compact' : ''} ${compact && panelOpen ? 'studio--panel-open' : ''} ${!showStrip ? 'studio--without-strip' : ''} ${className}`}>{children}</div>;
}
export function EditorStatus({ errors, warnings, saveStatus = 'saved', onIssues }: {
    errors: number;
    warnings: number;
    saveStatus?: 'loading' | 'saving' | 'saved' | 'error';
    onIssues: () => void;
}) {
    const summary = [errors ? t("editor.common.issues.errors", { errors: errors }) : '', warnings ? t("editor.common.issues.warnings", { warnings: warnings }) : ''].filter(Boolean).join(' · ') || t("editor.common.issues.none");
    const status = { loading: t("editor.common.loading"), saving: t("editor.common.saving"), saved: t("editor.common.saved"), error: t("editor.common.unsaved") }[saveStatus];
    return <div className="studio-header__status"><button type="button" className="project-state" onClick={onIssues} aria-label={t("editor.common.issues.label")} title={summary}>
    {errors > 0 && <span className="project-issue-count project-issue-count--error"><AlertCircle size={13} aria-hidden="true"/>{rich("editor.common.issues.errorBadge", { errors: errors }, { span: <span /> })}</span>}
    {warnings > 0 && <span className="project-issue-count project-issue-count--warning"><AlertTriangle size={13} aria-hidden="true"/>{rich("editor.common.issues.warningBadge", { warnings: warnings }, { span: <span /> })}</span>}
    {!errors && !warnings && <span className="project-state__success"><Check size={13} aria-hidden="true"/>{rich("editor.common.issues.successBadge", {}, { span: <span /> })}</span>}
  </button><span className="header-divider" aria-hidden="true"/><span className={`save-status ${saveStatus === 'error' ? 'save-status--error' : ''}`} title={status}><CloudCheck size={15}/><span>{status}</span></span></div>;
}
export function EditorNavigation({ onTemplates, onSettings, onHelp }: {
    onTemplates: () => void;
    onSettings: () => void;
    onHelp: () => void;
}) {
    return <aside className="studio-nav" aria-label={t("editor.common.navigationLabel")}><div><button type="button" className="nav-button" onClick={onTemplates}><LayoutTemplate size={23} strokeWidth={1.8}/>{rich("editor.common.templatesAction", {}, { span: <span /> })}</button><button type="button" className="nav-button" onClick={onSettings}><Settings2 size={23} strokeWidth={1.8}/>{rich("editor.common.settingsAction", {}, { span: <span /> })}</button></div><div className="studio-nav__bottom"><button type="button" className="nav-button" onClick={onHelp}><CircleHelp size={23} strokeWidth={1.8}/>{rich("editor.common.helpAction", {}, { span: <span /> })}</button></div></aside>;
}
export function HistoryControls({ canUndo, canRedo, onUndo, onRedo }: {
    canUndo?: boolean;
    canRedo?: boolean;
    onUndo?: () => void;
    onRedo?: () => void;
}) {
    return <div className="history-controls"><IconButton label={t("editor.common.undo")} disabled={!canUndo} onClick={onUndo}><Undo2 size={19}/></IconButton><IconButton label={t("editor.common.redo")} disabled={!canRedo} onClick={onRedo}><Redo2 size={19}/></IconButton></div>;
}
