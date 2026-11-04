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
export function EditorFrame({ compact, showStrip, className = '', children }: { compact: boolean; showStrip: boolean; className?: string; children: ReactNode }) {
  return <div className={`studio ${compact ? 'studio--compact' : ''} ${!showStrip ? 'studio--without-strip' : ''} ${className}`}>{children}</div>;
}

export function EditorStatus({ errors, warnings, saveStatus = 'saved', onIssues }: { errors: number; warnings: number; saveStatus?: 'loading' | 'saving' | 'saved' | 'error'; onIssues: () => void }) {
  const summary = [errors ? `Ошибок: ${errors}` : '', warnings ? `Предупреждений: ${warnings}` : ''].filter(Boolean).join(' · ') || 'Все в порядке, проблем нет';
  const status = { loading: 'Загрузка…', saving: 'Сохранение…', saved: 'Сохранено', error: 'Не сохранено' }[saveStatus];
  return <div className="studio-header__status"><button type="button" className="project-state" onClick={onIssues} aria-label="Проверка всего проекта" title={summary}>
    {errors > 0 && <span className="project-issue-count project-issue-count--error"><AlertCircle size={13} aria-hidden="true" /><span>Ошибок: {errors}</span></span>}
    {warnings > 0 && <span className="project-issue-count project-issue-count--warning"><AlertTriangle size={13} aria-hidden="true" /><span>Предупреждений: {warnings}</span></span>}
    {!errors && !warnings && <span className="project-state__success"><Check size={13} aria-hidden="true" /><span>Все в порядке, проблем нет</span></span>}
  </button><span className="header-divider" aria-hidden="true" /><span className={`save-status ${saveStatus === 'error' ? 'save-status--error' : ''}`} title={status}><CloudCheck size={15} /><span>{status}</span></span></div>;
}

export function EditorNavigation({ onTemplates, onSettings, onHelp }: { onTemplates: () => void; onSettings: () => void; onHelp: () => void }) {
  return <aside className="studio-nav" aria-label="Навигация"><div><button type="button" className="nav-button" onClick={onTemplates}><LayoutTemplate size={23} strokeWidth={1.8} /><span>Шаблоны</span></button><button type="button" className="nav-button" onClick={onSettings}><Settings2 size={23} strokeWidth={1.8} /><span>Настройки</span></button></div><div className="studio-nav__bottom"><button type="button" className="nav-button" onClick={onHelp}><CircleHelp size={23} strokeWidth={1.8} /><span>Справка</span></button></div></aside>;
}

export function HistoryControls({ canUndo, canRedo, onUndo, onRedo }: { canUndo?: boolean; canRedo?: boolean; onUndo?: () => void; onRedo?: () => void }) {
  return <div className="history-controls"><IconButton label="Отменить (Ctrl+Z)" disabled={!canUndo} onClick={onUndo}><Undo2 size={19} /></IconButton><IconButton label="Повторить (Ctrl+Shift+Z)" disabled={!canRedo} onClick={onRedo}><Redo2 size={19} /></IconButton></div>;
}
