import { SheetHandle } from '../../shared/ui/SheetHandle';
import { t } from '../../i18n';
import { rich } from '../../i18n/rich';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { AlertCircle, AlertTriangle, ArrowDown, ArrowUp, Check, Copy, Download, FileDown, Image, Layers, Layers2, LayoutTemplate, Menu, Palette, Plus, Settings2, Trash2, Type, X } from 'lucide-react';
import type { PostcardElement, PostcardProject } from '../../domain/postcards/types';
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
import { PostcardCornerRadiusField } from './PostcardCornerRadiusField';
import './postcard-editor.css';
import '../editor/studio-updates.css';
const tabs: {
    id: PostcardTab;
    label: string;
    icon: typeof Type;
}[] = [
    { id: 'text', label: t("editor.postcards.shell.tabs.text"), icon: Type }, { id: 'image', label: t("editor.postcards.shell.tabs.illustrations"), icon: Image }, { id: 'background', label: t("editor.postcards.shell.tabs.background"), icon: Palette }, { id: 'layers', label: t("editor.postcards.shell.tabs.layers"), icon: Layers },
];
const serviceTabs = [{ id: 'cards' as const, label: t("editor.postcards.shell.tabs.cards"), icon: Layers2 }, { id: 'export' as const, label: t("editor.postcards.shell.tabs.export"), icon: FileDown }];
export interface PostcardShellProps {
    project: PostcardProject;
    saveStatus: 'loading' | 'saving' | 'saved' | 'error';
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
    onCommand: (command: PostcardCommand) => OperationResult;
    onSelectPostcard: (id: string) => unknown;
    onHome: () => void;
    onTemplates: () => void;
    onExport: () => void;
    onStartTour: () => void;
    focusTarget?: {
        postcardId: string;
        elementId?: string;
        requestId: number;
    } | null;
}
export function PostcardShell({ project, saveStatus, canUndo, canRedo, onUndo, onRedo, onCommand, onSelectPostcard, onHome, onTemplates, onExport, onStartTour, focusTarget }: PostcardShellProps) {
    const layout = useEditorLayout(), compact = layout.compact, showStrip = layout.wide && !compact;
    const [tab, setTab] = useState<PostcardTab>('text'), [selection, setSelection] = useState<string | null>(null);
    const [sheet, setSheet] = useState(false), [menu, setMenu] = useState(false), [settings, setSettings] = useState(false), [help, setHelp] = useState(false), [problems, setProblems] = useState(false), [adding, setAdding] = useState(false);
    const [name, setName] = useState(project.name), [defaultFormat, setDefaultFormat] = useState(project.defaultFormat);
    const [defaultCornerRadius, setDefaultCornerRadius] = useState(project.defaultCornerRadius ?? 0);
    const openSettings = () => { setName(project.name); setDefaultFormat(project.defaultFormat); setDefaultCornerRadius(project.defaultCornerRadius ?? 0); setSettings(true); };
    const [fontVersion, refreshFonts] = useReducer(value => value + 1, 0);
    const strip = useRef<HTMLDivElement>(null), panel = useRef<HTMLElement>(null);
    const pendingIssue = useRef<{
        postcardId: string;
        elementId?: string;
    } | null>(null);
    const postcard = project.postcards.find(item => item.id === project.activePostcardId) ?? project.postcards[0];
    const index = project.postcards.indexOf(postcard), size = getPostcardSize(postcard), full = project.postcards.length >= 20;
    const issues = useMemo(() => validatePostcardProject(project), [project, fontVersion]);
    const errorCount = issues.filter(issue => issue.severity === 'error').length;
    useEffect(() => subscribePostcardFonts(refreshFonts), []);
    useEffect(() => { const issue = pendingIssue.current; pendingIssue.current = null; setSelection(issue?.postcardId === postcard.id ? issue.elementId ?? null : null); }, [postcard.id]);
    useEffect(() => { if (selection && !postcard.elements.some(item => item.id === selection))
        setSelection(null); }, [postcard.elements, selection]);
    useEffect(() => { if (!compact)
        setSheet(false); }, [compact]);
    useEffect(() => {
        if (!focusTarget)
            return;
        setSelection(focusTarget.elementId ?? null);
        const item = project.postcards.find(card => card.id === focusTarget.postcardId)?.elements.find(element => element.id === focusTarget.elementId);
        if (item)
            setTab(item.type === 'text' ? 'text' : 'image');
        setSheet(false);
    }, [focusTarget]);
    useEffect(() => {
        const keys = (event: KeyboardEvent) => {
            if ((event.target as HTMLElement).closest('input,textarea,[contenteditable="true"]'))
                return;
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
                event.preventDefault();
                if (event.shiftKey)
                    onRedo();
                else
                    onUndo();
            }
            if (event.key === 'Escape') {
                setSheet(false);
                setMenu(false);
            }
        };
        window.addEventListener('keydown', keys);
        return () => window.removeEventListener('keydown', keys);
    }, [onUndo, onRedo]);
    useEffect(() => {
        if (!sheet || !compact)
            return;
        const previous = document.activeElement as HTMLElement | null;
        panel.current?.querySelector<HTMLElement>('button')?.focus();
        const trap = (event: KeyboardEvent) => {
            if (event.key !== 'Tab' || document.querySelector('.modal-overlay'))
                return;
            const items = panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]');
            if (!items?.length)
                return;
            if (event.shiftKey && document.activeElement === items[0]) {
                event.preventDefault();
                items[items.length - 1].focus();
            }
            else if (!event.shiftKey && document.activeElement === items[items.length - 1]) {
                event.preventDefault();
                items[0].focus();
            }
        };
        document.addEventListener('keydown', trap);
        return () => { document.removeEventListener('keydown', trap); if (previous?.isConnected)
            previous.focus(); };
    }, [sheet, compact]);
    const select = (id: string | null, addedType?: PostcardElement['type']) => { setSelection(id); const type = addedType ?? postcard.elements.find(item => item.id === id)?.type; if (type)
        setTab(type === 'text' ? 'text' : 'image'); };
    const chooseTab = (id: PostcardTab) => { if (id === 'export') {
        onExport();
        return;
    } setTab(id); setSheet(compact); requestAnimationFrame(() => document.querySelector<HTMLElement>(`.postcard-dock [data-tab="${id}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center' })); };
    const selectCard = (id: string) => { pendingIssue.current = null; onSelectPostcard(id); requestAnimationFrame(() => strip.current?.querySelector<HTMLElement>(`[data-postcard-id="${id}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center' })); };
    const fix = (issue: PostcardValidationIssue) => { if (issue.postcardId) {
        pendingIssue.current = { postcardId: issue.postcardId, elementId: issue.elementId };
        onSelectPostcard(issue.postcardId);
    } setSelection(issue.elementId ?? null); const item = project.postcards.find(card => card.id === issue.postcardId)?.elements.find(element => element.id === issue.elementId); if (item)
        setTab(item.type === 'text' ? 'text' : 'image'); setProblems(false); setSheet(false); };
    const cards = (inPanel = false) => <div className={`thumbnail-list ${inPanel ? 'thumbnail-list--panel' : ''}`} ref={inPanel ? undefined : strip}>{project.postcards.map((card, number) => <button type="button" key={card.id} className={`thumbnail ${card.id === postcard.id ? 'is-selected' : ''}`} aria-label={t("editor.postcards.shell.cardPosition", { position: number + 1, total: project.postcards.length })} aria-pressed={card.id === postcard.id} data-postcard-id={card.id} draggable onDragStart={event => event.dataTransfer.setData('text/postcard-id', card.id)} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); const id = event.dataTransfer.getData('text/postcard-id'); if (id && id !== card.id)
        onCommand({ type: 'reorder-postcard', postcardId: id, index: number }); }} onClick={() => selectCard(card.id)}><span className="thumbnail__art"><PostcardSvg postcard={card} idPrefix={`postcard-thumb-${inPanel ? 'panel' : 'strip'}-${card.id}`}/></span><span className="thumbnail__number">{number + 1}</span><span className="thumbnail__indicators">{issues.some(issue => issue.postcardId === card.id && issue.severity === 'error') && <span className="error"/>}</span></button>)}<button type="button" className="thumbnail postcard-add-thumbnail" aria-label={t("editor.postcards.shell.addCard")} disabled={full} onClick={() => setAdding(true)}><Plus size={26}/>{rich("editor.postcards.shell.addLabel", {}, { span: <span /> })}</button></div>;
    const cardActions = <div className="postcard-card-actions"><Button variant="secondary" disabled={full} onClick={() => onCommand({ type: 'duplicate-postcard', postcardId: postcard.id })}><Copy size={15}/>{t("editor.postcards.shell.duplicateCard")}</Button><IconButton label={t("editor.postcards.shell.moveEarlier")} disabled={index === 0} onClick={() => onCommand({ type: 'reorder-postcard', postcardId: postcard.id, index: index - 1 })}><ArrowUp size={16}/></IconButton><IconButton label={t("editor.postcards.shell.moveLater")} disabled={index === project.postcards.length - 1} onClick={() => onCommand({ type: 'reorder-postcard', postcardId: postcard.id, index: index + 1 })}><ArrowDown size={16}/></IconButton><IconButton label={t("editor.postcards.shell.deleteCard")} disabled={project.postcards.length === 1} onClick={() => onCommand({ type: 'remove-postcard', postcardId: postcard.id })}><Trash2 size={16}/></IconButton></div>;
    const panelContent = tab === 'cards' ? <><div className="panel-heading"><h2>{t("editor.postcards.shell.cardsLabel")}</h2><p>{t("editor.postcards.shell.cardCount", { count: project.postcards.length })}</p></div>{cards(true)}{cardActions}<h3>{t("editor.postcards.shell.cardPosition", { position: index + 1, total: project.postcards.length })}</h3><PostcardInspector key={`format:${postcard.id}`} postcard={postcard} tab="cards" selection={selection} onSelect={select} onCommand={onCommand}/></> : <PostcardInspector key={`${postcard.id}:${tab}`} postcard={postcard} tab={tab} selection={selection} onSelect={select} onCommand={onCommand}/>;
    return <EditorFrame compact={compact} showStrip={showStrip} panelOpen={sheet} className="postcard-studio">
    <header className="studio-header"><a className="studio-home" href="#home" onClick={onHome} aria-label={t("editor.postcards.shell.homeLink")}><BrandMark /></a><IconButton label={t("editor.postcards.shell.openMenu")} className="mobile-menu-button" onClick={() => setMenu(true)}><Menu size={22}/></IconButton><div className="studio-header__project"><div className="project-title-row"><span className="studio-wordmark" title={project.name}>{project.name}</span></div></div><EditorStatus errors={errorCount} warnings={issues.length - errorCount} saveStatus={saveStatus} onIssues={() => setProblems(true)}/></header>
    <EditorNavigation onTemplates={onTemplates} onSettings={openSettings} onHelp={() => setHelp(true)}/>
    <section className="workspace" inert={compact && sheet} aria-label={t("editor.postcards.shell.canvasLabel", { position: index + 1 })}><HistoryControls canUndo={canUndo} canRedo={canRedo} onUndo={onUndo} onRedo={onRedo}/><div className="workspace__canvas workspace__canvas--interactive"><PostcardCanvas postcard={postcard} selection={selection} onSelectionChange={select} onCommit={onCommand} fitKey={postcard.id}/></div><div className="workspace-card-info">{rich("editor.postcards.shell.cardSummary", { position: index + 1, count: project.postcards.length, width: size.width, height: size.height }, { span: <span />, strong: <strong />, span2: <span /> })}</div></section>
    <aside className="inspector" aria-label={t("editor.postcards.shell.settingsTitle")}><div className={`inspector-tabs postcard-tabs ${showStrip ? 'postcard-tabs--primary' : ''}`} role="tablist" aria-label={t("editor.postcards.shell.tools")}>{[...tabs, ...(!showStrip ? serviceTabs : [])].map(({ id, label, icon: Icon }) => <button type="button" key={id} role="tab" data-tab={id} aria-selected={tab === id} className={tab === id ? 'is-active' : ''} onClick={() => chooseTab(id)}><Icon size={18}/><span>{label}</span></button>)}</div><div className="inspector-content">{!compact && panelContent}</div>{showStrip && <footer className="inspector-footer"><Button onClick={onExport}><Download size={18}/>{t("editor.postcards.shell.previewAction")}</Button><span>PDF · PNG · JPG · 300 DPI</span><button className="text-link" onClick={() => chooseTab('cards')}>{t("editor.postcards.shell.manageCards")}</button></footer>}</aside>
    {showStrip && <section className="thumbnail-strip" aria-label={t("editor.postcards.shell.cardsLabel")}>{cards()}<div className="postcard-strip-actions">{cardActions}</div></section>}
    <nav className="mobile-dock postcard-dock" aria-label={t("editor.postcards.shell.tools")}>{[...tabs, ...serviceTabs].map(({ id, label, icon: Icon }) => <button type="button" key={id} data-tab={id} aria-label={label} aria-pressed={sheet && tab === id} className={sheet && tab === id ? 'is-active' : ''} onClick={() => chooseTab(id)}><Icon size={22}/><span>{label}</span></button>)}</nav>
    {compact && sheet && <div className="sheet-backdrop" onClick={event => { if (event.target === event.currentTarget)
        setSheet(false); }}><section ref={panel} className="bottom-sheet" role="dialog" aria-modal="true" aria-label={[...tabs, ...serviceTabs].find(item => item.id === tab)?.label}><SheetHandle onClose={() => setSheet(false)}/><header><h2>{[...tabs, ...serviceTabs].find(item => item.id === tab)?.label}</h2><IconButton label={t("common.closePanel")} onClick={() => setSheet(false)}><X size={20}/></IconButton></header><div className="bottom-sheet__content">{panelContent}</div></section></div>}
    {menu && <div className="mobile-navigation"><header><a className="brand" href="#home" onClick={onHome}><BrandMark /><BrandName /></a><IconButton label={t("common.closeMenu")} onClick={() => setMenu(false)}><X size={22}/></IconButton></header><div className="mobile-navigation__actions"><Button variant="secondary" onClick={() => { setMenu(false); onTemplates(); }}><LayoutTemplate size={19}/>{t("editor.postcards.shell.templatesAction")}</Button><Button variant="secondary" onClick={() => { setMenu(false); openSettings(); }}><Settings2 size={19}/>{t("editor.postcards.shell.settingsAction")}</Button><Button variant="quiet" onClick={() => { setMenu(false); setHelp(true); }}>{t("editor.postcards.shell.helpAction")}</Button></div></div>}
    {settings && <Modal title={t("editor.postcards.shell.projectSettingsTitle")} onClose={() => setSettings(false)} footer={<><Button variant="secondary" onClick={() => setSettings(false)}>{t("common.cancel")}</Button><Button onClick={() => { if (name !== project.name && onCommand({ type: 'rename-project', name }).error)
        return; if (defaultFormat !== project.defaultFormat && onCommand({ type: 'set-default-format', format: defaultFormat }).error)
        return; if (defaultCornerRadius !== (project.defaultCornerRadius ?? 0) && onCommand({ type: 'set-default-corner-radius', cornerRadius: defaultCornerRadius }).error)
        return; setSettings(false); }}>{t("common.save")}</Button></>}><Field label={t("editor.postcards.shell.projectName")}><input value={name} maxLength={120} onChange={event => setName(event.target.value)}/></Field><p className="muted">{t("editor.postcards.shell.projectCount", { count: project.postcards.length })}</p><Field label={t("editor.postcards.shell.defaultFormat")}><select value={defaultFormat} onChange={event => setDefaultFormat(event.target.value as PostcardFormat)}>{Object.entries(postcardFormatLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></Field><PostcardCornerRadiusField value={defaultCornerRadius} onChange={setDefaultCornerRadius}/><p className="field__hint">{t("editor.postcards.shell.defaultFormatHint")}</p></Modal>}
    {adding && <Modal title={t("editor.postcards.shell.addCard")} onClose={() => setAdding(false)}><div className="postcard-dialog-actions"><Button variant="secondary" onClick={() => { if (!onCommand({ type: 'add-postcard', afterId: postcard.id }).error)
        setAdding(false); }}><Plus size={17}/>{t("editor.postcards.shell.addBlank")}</Button><Button variant="secondary" onClick={() => { if (!onCommand({ type: 'duplicate-postcard', postcardId: postcard.id }).error)
        setAdding(false); }}><Copy size={17}/>{t("editor.postcards.shell.addCopy")}</Button><Button variant="quiet" onClick={() => { setAdding(false); onTemplates(); }}>{t("editor.postcards.shell.selectTemplate")}</Button></div></Modal>}
    {problems && <Modal title={t("editor.postcards.shell.validationTitle")} onClose={() => setProblems(false)}><div className="validation-summary">{issues.length ? issues.map((issue, number) => <div key={`${issue.code}-${issue.elementId}-${number}`} className={`validation-item validation-item--${issue.severity}`}>{issue.severity === 'error' ? <AlertCircle size={18}/> : <AlertTriangle size={18}/>}<div>{rich("editor.postcards.shell.issueCard", { position: project.postcards.findIndex(card => card.id === issue.postcardId) + 1 }, { strong: <strong /> })}<p>{issue.message}</p></div><button onClick={() => fix(issue)}>{t("common.fix")}</button></div>) : <div className="validation-success"><Check size={28}/>{rich("editor.postcards.shell.noErrors", {}, { strong: <strong /> })}<p>{t("editor.postcards.shell.validationHint")}</p></div>}</div></Modal>}
    {help && <HelpDialog product="postcards" saveStatus={saveStatus} issues={issues} onClose={() => setHelp(false)} onStartTour={onStartTour}/>}
  </EditorFrame>;
}
