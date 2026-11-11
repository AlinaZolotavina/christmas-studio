import { t } from '../../i18n';
import { rich } from '../../i18n/rich';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertCircle, AlertTriangle, ArrowRight, Check, ChevronLeft, ChevronRight, Download, FileDown, Image as ImageIcon, Layers2, LayoutTemplate, Menu, Palette, RectangleVertical, RotateCcw, Settings2, Type, X } from 'lucide-react';
import type { Card, ElementKind, ProjectDocument, Selection, ValidationIssue } from '../../domain/types';
import type { Command, OperationResult } from '../../domain/commands';
import { CardSvg } from '../../rendering/CardSvg';
import { Button, IconButton } from '../../shared/ui/Controls';
import { Modal } from '../../shared/ui/Modal';
import { Inspector } from './Inspector';
import { ProjectSettings } from './ProjectSettings';
import { HelpDialog } from '../help/HelpDialog';
import { BrandMark } from '../../shared/ui/BrandMark';
import { BrandName } from '../../shared/ui/BrandName';
import { EditorFrame, EditorNavigation, EditorStatus, HistoryControls, useEditorLayout } from '../../shared/layout/EditorFrame';
import './studio-updates.css';
export type InspectorTab = 'text' | 'illustration' | 'background' | 'card' | 'cards' | 'export';
const tabs: {
    id: InspectorTab;
    label: string;
    icon: typeof Type;
}[] = [
    { id: 'text', label: t("editor.tags.tabs.text"), icon: Type }, { id: 'illustration', label: t("editor.tags.tabs.image"), icon: ImageIcon },
    { id: 'background', label: t("editor.tags.tabs.background"), icon: Palette }, { id: 'card', label: t("editor.tags.tabs.shape"), icon: RectangleVertical },
    { id: 'cards', label: t("editor.tags.tabs.cards"), icon: Layers2 }, { id: 'export', label: t("editor.tags.tabs.export"), icon: FileDown },
];
const elementTab = (kind?: ElementKind): InspectorTab => kind === 'text' ? 'text' : kind === 'illustration' ? 'illustration' : kind === 'decoration' ? 'background' : 'card';
export interface StudioShellProps {
    project: ProjectDocument;
    onHome: () => void;
    onTemplates: () => void;
    onCommand: (command: Command) => OperationResult;
    focusTarget?: {
        cardId: string;
        element?: ElementKind;
        requestId: number;
    } | null;
    saveStatus?: 'loading' | 'saving' | 'saved' | 'error';
    canUndo?: boolean;
    canRedo?: boolean;
    onUndo?: () => void;
    onRedo?: () => void;
    onExport?: () => void;
    onStartTour?: () => void;
    canvas?: (card: Card, selection: Selection, onSelectionChange: (selection: Selection) => void) => ReactNode;
    recentColors?: string[];
    onRecentColor?: (color: string) => void;
    issues?: ValidationIssue[];
}
export function StudioShell({ project, onHome, onTemplates, onCommand, focusTarget, saveStatus = 'saved', canUndo = false, canRedo = false, onUndo, onRedo, onExport, onStartTour = () => undefined, canvas, recentColors = [], onRecentColor = () => undefined, issues = [] }: StudioShellProps) {
    const [cardIndex, setCardIndex] = useState(0);
    const [tab, setTab] = useState<InspectorTab>('text');
    const [sheet, setSheet] = useState(false);
    const [menu, setMenu] = useState(false);
    const [settings, setSettings] = useState(false);
    const [help, setHelp] = useState(false);
    const [problems, setProblems] = useState(false);
    const [reset, setReset] = useState(false);
    const layout = useEditorLayout();
    const [selection, setSelection] = useState<Selection>({ kind: 'card' });
    const thumbsRef = useRef<HTMLDivElement>(null);
    const panelThumbsRef = useRef<HTMLDivElement>(null);
    const sheetRef = useRef<HTMLElement>(null);
    const compact = layout.compact;
    const showStrip = layout.wide && !compact;
    const showExportButton = layout.wide && !compact;
    const visibleTabs = tabs.filter(item => (item.id !== 'cards' || !showStrip) && (item.id !== 'export' || !showExportButton));
    const activeTab = visibleTabs.some(item => item.id === tab) ? tab : 'text';
    const card = project.cards[Math.min(cardIndex, project.cards.length - 1)];
    const errorCount = issues.filter(issue => issue.severity === 'error').length;
    const warningCount = issues.length - errorCount;
    useEffect(() => { if (!compact)
        setSheet(false); }, [compact]);
    useEffect(() => {
        if (!compact || !sheet)
            return;
        const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        sheetRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
        const trap = (event: KeyboardEvent) => {
            if (event.key !== 'Tab' || document.querySelector('.modal-overlay'))
                return;
            const items = sheetRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),[tabindex="0"]');
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
    }, [compact, sheet]);
    const scrollToCard = (index: number) => requestAnimationFrame(() => {
        const target = showStrip ? thumbsRef.current : panelThumbsRef.current;
        target?.querySelector<HTMLElement>(`[data-card-index="${index}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    });
    useEffect(() => {
        if (!focusTarget)
            return;
        const index = project.cards.findIndex(item => item.id === focusTarget.cardId);
        if (index < 0)
            return;
        setCardIndex(index);
        setSelection({ kind: focusTarget.element ?? 'card' });
        setTab(elementTab(focusTarget.element));
        scrollToCard(index);
    }, [focusTarget, project.id]);
    const selectCard = (index: number) => { setCardIndex(index); setSelection({ kind: 'card' }); scrollToCard(index); };
    const selectTab = (next: InspectorTab) => { if (next === 'export') {
        onExport?.();
        return;
    } setTab(next); setSheet(compact); };
    const selectElement = (next: Selection) => { setSelection(next); setTab(elementTab(next.kind)); };
    const selectIssue = (issue: ValidationIssue) => {
        if (issue.cardId) {
            const index = project.cards.findIndex(item => item.id === issue.cardId);
            if (index >= 0)
                selectCard(index);
        }
        selectElement({ kind: issue.element ?? 'card' });
        setProblems(false);
        setSheet(false);
    };
    const thumbnailList = (inPanel = false) => <div className={`thumbnail-list ${inPanel ? 'thumbnail-list--panel' : ''}`} ref={inPanel ? panelThumbsRef : thumbsRef}>{project.cards.map((item, index) => <button type="button" key={item.id} data-card-index={index} className={`thumbnail ${index === cardIndex ? 'is-selected' : ''}`} aria-label={t("editor.tags.cardPosition", { number: item.number, count: project.cardCount })} aria-pressed={index === cardIndex} onClick={() => selectCard(index)}><span className="thumbnail__art"><CardSvg card={item} idPrefix={`thumb-${inPanel ? 'panel' : 'strip'}-${item.id}`}/></span><span className="thumbnail__indicators">{issues.some(issue => issue.cardId === item.id && issue.severity === 'error') && <span className="error" title={t("editor.tags.cardError")}/>}{issues.some(issue => issue.cardId === item.id && issue.severity !== 'error') && <span className="warning" title={t("editor.tags.cardWarning")}/>}</span><span className="thumbnail__number">{item.number}</span></button>)}</div>;
    const panelContent = activeTab === 'cards' ? <><div className="panel-heading"><h2>{t("editor.tags.cardsLabel")}</h2></div>{thumbnailList(true)}</> : <Inspector project={project} card={card} tab={activeTab} selection={selection} onSelect={setSelection} onCommand={onCommand} recentColors={recentColors} onRecentColor={onRecentColor}/>;
    const openReset = () => { setSettings(false); setMenu(false); setReset(true); };
    return <EditorFrame compact={compact} showStrip={showStrip}>
    <header className="studio-header">
      <a className="studio-home" href="#home" onClick={onHome} aria-label={t("editor.tags.homeLink")}><BrandMark /></a>
      <IconButton label={t("editor.tags.openMenu")} className="mobile-menu-button" onClick={() => setMenu(true)}><Menu size={22}/></IconButton>
      <div className="studio-header__project"><div className="project-title-row"><span className="studio-wordmark" title={project.name}><span>{project.name}</span></span>{showStrip && <IconButton label={t("editor.tags.resetAction")} className="project-reset" onClick={openReset}><RotateCcw size={17}/></IconButton>}</div></div>
      <EditorStatus errors={errorCount} warnings={warningCount} saveStatus={saveStatus} onIssues={() => setProblems(true)}/>
    </header>
    <EditorNavigation onTemplates={onTemplates} onSettings={() => setSettings(true)} onHelp={() => setHelp(true)}/>
    <section className="workspace" inert={compact && sheet} aria-label={t("editor.tags.canvasLabel", { number: card.number })}><HistoryControls canUndo={canUndo} canRedo={canRedo} onUndo={onUndo} onRedo={onRedo}/><div className={canvas ? 'workspace__canvas workspace__canvas--interactive' : 'workspace__canvas'}>{canvas ? canvas(card, selection, selectElement) : <div className="workspace__tag" style={{ aspectRatio: `${card.width} / ${card.height}` }}><CardSvg card={card} idPrefix="main-canvas"/></div>}</div><div className="workspace-card-info">{rich("editor.tags.cardSummary", { number: card.number, total: project.cardCount, width: Number((card.width / 10).toFixed(2)), height: Number((card.height / 10).toFixed(2)) }, { span: <span />, strong: <strong />, span2: <span /> })}</div></section>
    <aside className="inspector" aria-label={t("editor.tags.inspectorTitle")}><div className={`inspector-tabs ${visibleTabs.length > 4 ? 'inspector-tabs--expanded' : ''}`} role="tablist" aria-label={t("editor.tags.tools")} style={{ gridTemplateColumns: `repeat(${visibleTabs.length > 4 ? 3 : visibleTabs.length},minmax(0,1fr))` }}>{visibleTabs.map(({ id, label, icon: Icon }) => <button key={id} data-tab={id} role="tab" aria-selected={activeTab === id} className={activeTab === id ? 'is-active' : ''} onClick={() => selectTab(id)}><Icon size={20} strokeWidth={1.7}/><span>{label}</span></button>)}</div><div className="inspector-content">{!compact && panelContent}</div>{showExportButton && <footer className="inspector-footer"><Button className="export-button" onClick={onExport} disabled={!onExport}><Download size={18}/>{t("editor.tags.previewAction")}</Button>{rich("editor.tags.printSize", {}, { span: <span /> })}</footer>}</aside>
    {showStrip && <section className="thumbnail-strip" aria-label={t("editor.tags.cardsLabel")}><IconButton label={t("editor.tags.scrollLeft")} className="strip-arrow" onClick={() => thumbsRef.current?.scrollBy({ left: -280, behavior: 'smooth' })}><ChevronLeft size={18}/></IconButton>{thumbnailList()}<IconButton label={t("editor.tags.scrollRight")} className="strip-arrow" onClick={() => thumbsRef.current?.scrollBy({ left: 280, behavior: 'smooth' })}><ChevronRight size={18}/></IconButton>{rich("editor.tags.dayCount", { count: project.cardCount }, { span: <span className="thumbnail-strip__count"/>, lineBreak: <br />, small: <small /> })}</section>}
    <nav className="mobile-dock" aria-label={t("editor.tags.toolsLabel")}>{tabs.map(({ id, label, icon: Icon }) => <button key={id} data-tab={id} className={sheet && activeTab === id ? 'is-active' : ''} aria-label={label} aria-pressed={sheet && activeTab === id} onClick={() => selectTab(id)}><Icon size={23} strokeWidth={1.7}/><span>{label}</span></button>)}</nav>
    {compact && sheet && <div className="sheet-backdrop" onClick={event => { if (event.target === event.currentTarget)
        setSheet(false); }}><section ref={sheetRef} className={`bottom-sheet ${activeTab === 'cards' ? 'bottom-sheet--cards' : ''}`} role="dialog" aria-modal="true" aria-label={tabs.find(item => item.id === activeTab)?.label}><span className="sheet-handle"/><header><h2>{tabs.find(item => item.id === activeTab)?.label}</h2><IconButton label={t("common.closePanel")} onClick={() => setSheet(false)}><X size={20}/></IconButton></header><div className="bottom-sheet__content">{panelContent}</div></section></div>}
    {menu && <div className="mobile-navigation"><header><a className="brand" href="#home" onClick={onHome}><BrandMark /><BrandName /></a><IconButton label={t("common.closeMenu")} onClick={() => setMenu(false)}><X size={22}/></IconButton></header><div className="mobile-navigation__actions"><Button variant="secondary" onClick={() => { setMenu(false); onTemplates(); }}><LayoutTemplate size={20}/>{t("editor.tags.templatesAction")}</Button><Button variant="secondary" onClick={() => { setMenu(false); setSettings(true); }}><Settings2 size={20}/>{t("editor.tags.settingsAction")}</Button><button className="text-link" onClick={() => { setMenu(false); setHelp(true); }}>{t("editor.tags.helpAction")}<ArrowRight size={16}/></button></div></div>}
    {problems && <Modal title={t("editor.tags.validationTitle")} onClose={() => setProblems(false)} footer={<Button onClick={() => setProblems(false)}>{t("common.done")}</Button>}><div className="validation-summary">{issues.length ? issues.map((issue, index) => <div className={`validation-item validation-item--${issue.severity}`} key={`${issue.code}-${issue.cardId}-${index}`}>{issue.severity === 'error' ? <AlertCircle size={18}/> : <AlertTriangle size={18}/>}<div><strong>{issue.cardId ? t("editor.tags.issueCard", { cardNumber: project.cards.find(item => item.id === issue.cardId)?.number ?? '' }) : t("editor.tags.printLayout")}</strong><p>{issue.message}</p></div><button type="button" onClick={() => selectIssue(issue)}>{t("common.fix")}</button></div>) : <div className="validation-success"><Check size={28}/>{rich("editor.tags.noErrors", {}, { strong: <strong /> })}<p>{t("editor.tags.validated")}</p></div>}</div></Modal>}
    {settings && <ProjectSettings project={project} card={card} onCommand={onCommand} onClose={() => setSettings(false)} onReset={openReset}/>}
    {reset && <Modal title={t("editor.tags.resetTitle")} onClose={() => setReset(false)} footer={<><Button variant="secondary" onClick={() => setReset(false)}>{t("common.cancel")}</Button><Button onClick={() => { const result = onCommand({ type: 'reset-project' }); if (!result.error) {
        setReset(false);
        setSelection({ kind: 'card' });
        setCardIndex(0);
    } }}>{t("editor.tags.resetConfirm")}</Button></>}><p className="muted">{t("editor.tags.resetDescription")}</p></Modal>}
    {help && <HelpDialog saveStatus={saveStatus} issues={issues} onClose={() => setHelp(false)} onStartTour={onStartTour}/>}
  </EditorFrame>;
}
