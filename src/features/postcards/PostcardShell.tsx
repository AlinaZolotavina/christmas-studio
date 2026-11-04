import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { AlertCircle, AlertTriangle, ArrowDown, ArrowUp, Check, Copy, Download, FileDown, Image, Layers, Layers2, LayoutTemplate, Menu, Palette, Plus, Settings2, Shapes, Trash2, Type, X } from 'lucide-react';
import type { PostcardProject } from '../../domain/postcards/types';
import { getPostcardSize, type PostcardFormat } from '../../domain/postcards/types';
import type { PostcardCommand } from '../../domain/postcards/commands';
import type { OperationResult } from '../../domain/commands';
import { validatePostcardProject, type PostcardValidationIssue } from '../../application/export/postcardValidation';
import { subscribePostcardFonts } from '../../rendering/postcard-fonts';
import { PostcardSvg } from '../../rendering/PostcardSvg';
import { PostcardCanvas } from '../../rendering/interaction/PostcardCanvas';
import { EditorFrame, EditorNavigation, EditorStatus, HistoryControls, useEditorLayout } from '../../shared/layout/EditorFrame';
import { Button, Field, IconButton } from '../../shared/ui/Controls';
import { BrandMark } from '../../shared/ui/BrandMark';
import { BrandName } from '../../shared/ui/BrandName';
import { Modal } from '../../shared/ui/Modal';
import { HelpDialog } from '../help/HelpDialog';
import { PostcardInspector, postcardFormatLabels, type PostcardTab } from './PostcardInspector';
import './postcard-editor.css';
import '../editor/studio-updates.css';

const tabs: { id: PostcardTab; label: string; icon: typeof Type }[] = [
  { id: 'text', label: 'Текст', icon: Type }, { id: 'image', label: 'Иллюстрации', icon: Image }, { id: 'decoration', label: 'Декор', icon: Shapes }, { id: 'background', label: 'Фон и форма', icon: Palette }, { id: 'layers', label: 'Слои', icon: Layers },
];
const serviceTabs = [{ id: 'cards' as const, label: 'Открытки', icon: Layers2 }, { id: 'export' as const, label: 'Экспорт', icon: FileDown }];
export interface PostcardShellProps {
  project: PostcardProject;
  saveStatus: 'loading' | 'saving' | 'saved' | 'error';
  canUndo: boolean; canRedo: boolean;
  onUndo: () => void; onRedo: () => void;
  onCommand: (command: PostcardCommand) => OperationResult;
  onSelectPostcard: (id: string) => unknown;
  onHome: () => void; onTemplates: () => void; onExport: () => void; onStartTour: () => void;
  focusTarget?: { postcardId: string; elementId?: string; requestId: number } | null;
}

export function PostcardShell({ project, saveStatus, canUndo, canRedo, onUndo, onRedo, onCommand, onSelectPostcard, onHome, onTemplates, onExport, onStartTour, focusTarget }: PostcardShellProps) {
  const layout = useEditorLayout(), compact = layout.compact, showStrip = layout.wide && !compact;
  const [tab, setTab] = useState<PostcardTab>('text'), [selection, setSelection] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false), [menu, setMenu] = useState(false), [settings, setSettings] = useState(false), [help, setHelp] = useState(false), [problems, setProblems] = useState(false), [adding, setAdding] = useState(false);
  const [name, setName] = useState(project.name), [defaultFormat, setDefaultFormat] = useState(project.defaultFormat);
  const [fontVersion, refreshFonts] = useReducer(value => value + 1, 0);
  const strip = useRef<HTMLDivElement>(null), panel = useRef<HTMLElement>(null);
  const pendingIssue = useRef<{ postcardId: string; elementId?: string } | null>(null);
  const postcard = project.postcards.find(item => item.id === project.activePostcardId) ?? project.postcards[0];
  const index = project.postcards.indexOf(postcard), size = getPostcardSize(postcard), full = project.postcards.length >= 20;
  const issues = useMemo(() => validatePostcardProject(project), [project, fontVersion]);
  const errorCount = issues.filter(issue => issue.severity === 'error').length;
  useEffect(() => subscribePostcardFonts(refreshFonts), []);
  useEffect(() => { const issue = pendingIssue.current; pendingIssue.current = null; setSelection(issue?.postcardId === postcard.id ? issue.elementId ?? null : null); }, [postcard.id]);
  useEffect(() => { if (selection && !postcard.elements.some(item => item.id === selection)) setSelection(null); }, [postcard.elements, selection]);
  useEffect(() => { if (!compact) setSheet(false); }, [compact]);
  useEffect(() => {
    if (!focusTarget) return;
    setSelection(focusTarget.elementId ?? null);
    const item = project.postcards.find(card => card.id === focusTarget.postcardId)?.elements.find(element => element.id === focusTarget.elementId);
    if (item) setTab(item.type === 'lettering' ? 'text' : item.type);
    setSheet(false);
  }, [focusTarget]);
  useEffect(() => {
    const keys = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).closest('input,textarea,[contenteditable="true"]')) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); if (event.shiftKey) onRedo(); else onUndo(); }
      if (event.key === 'Escape') { setSheet(false); setMenu(false); }
    };
    window.addEventListener('keydown', keys); return () => window.removeEventListener('keydown', keys);
  }, [onUndo, onRedo]);
  useEffect(() => {
    if (!sheet || !compact) return;
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>('button')?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || document.querySelector('.modal-overlay')) return;
      const items = panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]');
      if (!items?.length) return;
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items[items.length - 1].focus(); }
      else if (!event.shiftKey && document.activeElement === items[items.length - 1]) { event.preventDefault(); items[0].focus(); }
    };
    document.addEventListener('keydown', trap); return () => { document.removeEventListener('keydown', trap); if (previous?.isConnected) previous.focus(); };
  }, [sheet, compact]);
  const select = (id: string | null) => { setSelection(id); const element = postcard.elements.find(item => item.id === id); if (element) setTab(element.type === 'lettering' ? 'text' : element.type); };
  const chooseTab = (id: PostcardTab) => { if (id === 'export') { onExport(); return; } setTab(id); setSheet(compact); requestAnimationFrame(() => document.querySelector<HTMLElement>(`.postcard-dock [data-tab="${id}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center' })); };
  const selectCard = (id: string) => { pendingIssue.current = null; onSelectPostcard(id); requestAnimationFrame(() => strip.current?.querySelector<HTMLElement>(`[data-postcard-id="${id}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center' })); };
  const fix = (issue: PostcardValidationIssue) => { if (issue.postcardId) { pendingIssue.current = { postcardId: issue.postcardId, elementId: issue.elementId }; onSelectPostcard(issue.postcardId); } setSelection(issue.elementId ?? null); const item = project.postcards.find(card => card.id === issue.postcardId)?.elements.find(element => element.id === issue.elementId); if (item) setTab(item.type === 'lettering' ? 'text' : item.type); setProblems(false); setSheet(false); };
  const cards = (inPanel = false) => <div className={`thumbnail-list ${inPanel ? 'thumbnail-list--panel' : ''}`} ref={inPanel ? undefined : strip}>{project.postcards.map((card, number) => <button type="button" key={card.id} className={`thumbnail ${card.id === postcard.id ? 'is-selected' : ''}`} aria-label={`Открытка ${number + 1} из ${project.postcards.length}`} aria-pressed={card.id === postcard.id} data-postcard-id={card.id} draggable onDragStart={event => event.dataTransfer.setData('text/postcard-id', card.id)} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); const id = event.dataTransfer.getData('text/postcard-id'); if (id && id !== card.id) onCommand({ type: 'reorder-postcard', postcardId: id, index: number }); }} onClick={() => selectCard(card.id)}><span className="thumbnail__art"><PostcardSvg postcard={card} idPrefix={`postcard-thumb-${inPanel ? 'panel' : 'strip'}-${card.id}`} /></span><span className="thumbnail__number">{number + 1}</span><span className="thumbnail__indicators">{issues.some(issue => issue.postcardId === card.id && issue.severity === 'error') && <span className="error" />}</span></button>)}<button type="button" className="thumbnail postcard-add-thumbnail" aria-label="Добавить открытку" disabled={full} onClick={() => setAdding(true)}><Plus size={26} /><span>Добавить</span></button></div>;
  const cardActions = <div className="postcard-card-actions"><Button variant="secondary" disabled={full} onClick={() => onCommand({ type: 'duplicate-postcard', postcardId: postcard.id })}><Copy size={15} /> Копировать открытку</Button><IconButton label="Переместить открытку раньше" disabled={index === 0} onClick={() => onCommand({ type: 'reorder-postcard', postcardId: postcard.id, index: index - 1 })}><ArrowUp size={16} /></IconButton><IconButton label="Переместить открытку позже" disabled={index === project.postcards.length - 1} onClick={() => onCommand({ type: 'reorder-postcard', postcardId: postcard.id, index: index + 1 })}><ArrowDown size={16} /></IconButton><IconButton label="Удалить открытку" disabled={project.postcards.length === 1} onClick={() => onCommand({ type: 'remove-postcard', postcardId: postcard.id })}><Trash2 size={16} /></IconButton></div>;
  const panelContent = tab === 'cards' ? <><div className="panel-heading"><h2>Открытки проекта</h2><p>{project.postcards.length} из 20</p></div>{cards(true)}{cardActions}</> : <PostcardInspector key={`${postcard.id}:${tab}`} postcard={postcard} tab={tab} selection={selection} onSelect={select} onCommand={onCommand} />;
  return <EditorFrame compact={compact} showStrip={showStrip} className="postcard-studio">
    <header className="studio-header"><a className="studio-home" href="#home" onClick={onHome} aria-label="Новогодняя мастерская — главная"><BrandMark /></a><IconButton label="Открыть меню" className="mobile-menu-button" onClick={() => setMenu(true)}><Menu size={22} /></IconButton><div className="studio-header__project"><div className="project-title-row"><span className="studio-wordmark" title={project.name}>{project.name}</span></div></div><EditorStatus errors={errorCount} warnings={issues.length - errorCount} saveStatus={saveStatus} onIssues={() => setProblems(true)} /></header>
    <EditorNavigation onTemplates={onTemplates} onSettings={() => { setName(project.name); setDefaultFormat(project.defaultFormat); setSettings(true); }} onHelp={() => setHelp(true)} />
    <section className="workspace" inert={compact && sheet} aria-label={`Рабочая область, открытка ${index + 1}`}><HistoryControls canUndo={canUndo} canRedo={canRedo} onUndo={onUndo} onRedo={onRedo} /><div className="workspace__canvas workspace__canvas--interactive"><PostcardCanvas postcard={postcard} selection={selection} onSelectionChange={select} onCommit={onCommand} fitKey={postcard.id} /></div><div className="workspace-card-info"><span>Открытка <strong>{index + 1}</strong> из {project.postcards.length}</span><span>{size.width} × {size.height} мм</span></div></section>
    <aside className="inspector" aria-label="Настройки открытки"><div className="inspector-tabs postcard-tabs" role="tablist" aria-label="Инструменты открытки">{[...tabs, ...(!showStrip ? serviceTabs : [])].map(({ id, label, icon: Icon }) => <button type="button" key={id} role="tab" data-tab={id} aria-selected={tab === id} className={tab === id ? 'is-active' : ''} onClick={() => chooseTab(id)}><Icon size={20} /><span>{label}</span></button>)}</div><div className="inspector-content">{!compact && panelContent}</div>{showStrip && <footer className="inspector-footer"><Button onClick={onExport}><Download size={18} /> Предпросмотр и экспорт</Button><span>PDF · PNG · JPG · 300 DPI</span><button className="text-link" onClick={() => chooseTab('cards')}>Управление открытками</button></footer>}</aside>
    {showStrip && <section className="thumbnail-strip" aria-label="Открытки проекта">{cards()}<div className="postcard-strip-actions">{cardActions}</div></section>}
    <nav className="mobile-dock postcard-dock" aria-label="Инструменты открытки">{[...tabs, ...serviceTabs].map(({ id, label, icon: Icon }) => <button type="button" key={id} data-tab={id} aria-label={label} aria-pressed={sheet && tab === id} className={sheet && tab === id ? 'is-active' : ''} onClick={() => chooseTab(id)}><Icon size={22} /><span>{label}</span></button>)}</nav>
    {compact && sheet && <div className="sheet-backdrop" onClick={event => { if (event.target === event.currentTarget) setSheet(false); }}><section ref={panel} className="bottom-sheet" role="dialog" aria-modal="true" aria-label={[...tabs, ...serviceTabs].find(item => item.id === tab)?.label}><span className="sheet-handle" /><header><h2>{[...tabs, ...serviceTabs].find(item => item.id === tab)?.label}</h2><IconButton label="Закрыть панель" onClick={() => setSheet(false)}><X size={20} /></IconButton></header><div className="bottom-sheet__content">{panelContent}</div></section></div>}
    {menu && <div className="mobile-navigation"><header><a className="brand" href="#home" onClick={onHome}><BrandMark /><BrandName /></a><IconButton label="Закрыть меню" onClick={() => setMenu(false)}><X size={22} /></IconButton></header><div className="mobile-navigation__actions"><Button variant="secondary" onClick={() => { setMenu(false); onTemplates(); }}><LayoutTemplate size={19} /> Шаблоны открыток</Button><Button variant="secondary" onClick={() => { setMenu(false); setName(project.name); setDefaultFormat(project.defaultFormat); setSettings(true); }}><Settings2 size={19} /> Настройки проекта</Button><Button variant="quiet" onClick={() => { setMenu(false); setHelp(true); }}>Справка</Button></div></div>}
    {settings && <Modal title="Настройки проекта открыток" onClose={() => setSettings(false)} footer={<><Button variant="secondary" onClick={() => setSettings(false)}>Отмена</Button><Button onClick={() => { if (name !== project.name && onCommand({ type: 'rename-project', name }).error) return; if (defaultFormat !== project.defaultFormat && onCommand({ type: 'set-default-format', format: defaultFormat }).error) return; setSettings(false); }}>Сохранить</Button></>}><Field label="Название проекта"><input value={name} maxLength={120} onChange={event => setName(event.target.value)} /></Field><p className="muted">Открыток: {project.postcards.length} из 20. Добавляйте, копируйте и удаляйте открытки в ленте или панели «Открытки».</p><Field label="Формат по умолчанию"><select value={defaultFormat} onChange={event => setDefaultFormat(event.target.value as PostcardFormat)}>{Object.entries(postcardFormatLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></Field><p className="field__hint">Новый формат применяется только к создаваемым открыткам. Формат существующих открыток сохраняется.</p></Modal>}
    {adding && <Modal title="Добавить открытку" onClose={() => setAdding(false)}><div className="postcard-dialog-actions"><Button variant="secondary" onClick={() => { if (!onCommand({ type: 'add-postcard', afterId: postcard.id }).error) setAdding(false); }}><Plus size={17} /> Чистая открытка</Button><Button variant="secondary" onClick={() => { if (!onCommand({ type: 'duplicate-postcard', postcardId: postcard.id }).error) setAdding(false); }}><Copy size={17} /> Копия текущей</Button><Button variant="quiet" onClick={() => { setAdding(false); onTemplates(); }}>Выбрать шаблон</Button></div></Modal>}
    {problems && <Modal title="Проверка всего проекта" onClose={() => setProblems(false)}><div className="validation-summary">{issues.length ? issues.map((issue, number) => <div key={`${issue.code}-${issue.elementId}-${number}`} className={`validation-item validation-item--${issue.severity}`}>{issue.severity === 'error' ? <AlertCircle size={18} /> : <AlertTriangle size={18} />}<div><strong>Открытка {project.postcards.findIndex(card => card.id === issue.postcardId) + 1}</strong><p>{issue.message}</p></div><button onClick={() => fix(issue)}>Исправить</button></div>) : <div className="validation-success"><Check size={28} /><strong>Ошибок нет</strong><p>При подготовке экспорта дополнительно проверяются отступы и разрешение изображений.</p></div>}</div></Modal>}
    {help && <HelpDialog product="postcards" saveStatus={saveStatus} issues={issues} onClose={() => setHelp(false)} onStartTour={onStartTour} />}
  </EditorFrame>;
}
