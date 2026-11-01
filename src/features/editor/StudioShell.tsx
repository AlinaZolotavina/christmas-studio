import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertCircle, AlertTriangle, ArrowRight, Check, ChevronLeft, ChevronRight, CircleHelp, CloudCheck, Download, Expand, FileDown, Flower2, Home, Image as ImageIcon, Layers2, Leaf, Menu, Minus, Palette, Plus, Redo2, Settings2, Sparkles, Type, Undo2, X } from 'lucide-react';
import type { Card, ElementKind, ProjectDocument, Selection, ValidationIssue } from '../../domain/types';
import type { Command, OperationResult } from '../../domain/commands';
import { CardSvg } from '../../rendering/CardSvg';
import { Button, IconButton } from '../../shared/ui/Controls';
import { Modal } from '../../shared/ui/Modal';
import { Inspector } from './Inspector';
import { ProjectSettings } from './ProjectSettings';

export type InspectorTab = 'text' | 'illustration' | 'background' | 'cards' | 'export';
const tabDefinitions: { id: InspectorTab; label: string; icon: typeof Type }[] = [
  { id: 'text', label: 'Текст', icon: Type }, { id: 'illustration', label: 'Изображение', icon: ImageIcon },
  { id: 'background', label: 'Фон', icon: Palette }, { id: 'cards', label: 'Карточки', icon: Layers2 }, { id: 'export', label: 'Экспорт', icon: FileDown },
];

export interface StudioShellProps {
  project: ProjectDocument;
  onHome: () => void;
  onCommand: (command: Command) => OperationResult;
  focusTarget?: { cardId: string; element?: ElementKind; requestId: number } | null;
  saveStatus?: 'loading' | 'saving' | 'saved' | 'error';
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onExport?: () => void;
  canvas?: (card: Card, selection: Selection, onSelectionChange: (selection: Selection) => void) => ReactNode;
  recentColors?: string[];
  onRecentColor?: (color: string) => void;
  issues?: ValidationIssue[];
}

export function StudioShell({ project, onHome, onCommand, focusTarget, saveStatus = 'saved', canUndo = false, canRedo = false, onUndo, onRedo, onExport, canvas, recentColors = [], onRecentColor = () => undefined, issues = [] }: StudioShellProps) {
  const [cardIndex, setCardIndex] = useState(0);
  const [tab, setTab] = useState<InspectorTab>('text');
  const [sheet, setSheet] = useState(false);
  const [menu, setMenu] = useState(false);
  const [settings, setSettings] = useState(false);
  const [help, setHelp] = useState(false);
  const [problems, setProblems] = useState(false);
  const [compact, setCompact] = useState(() => window.matchMedia('(max-width: 900px) and (orientation: portrait), (max-width: 650px)').matches);
  const [zoom, setZoom] = useState(100);
  const [selection, setSelection] = useState<Selection>({ kind: 'card' });
  const thumbsRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const errorCount = issues.filter((issue) => issue.severity === 'error').length;
  const warningCount = issues.length - errorCount;
  useEffect(() => {
    const media = window.matchMedia('(max-width: 900px) and (orientation: portrait), (max-width: 650px)');
    const update = () => setCompact(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!compact || !sheet) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    sheetRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const items = sheetRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),[tabindex="0"]');
      if (!items?.length) return;
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items[items.length - 1].focus(); }
      else if (!event.shiftKey && document.activeElement === items[items.length - 1]) { event.preventDefault(); items[0].focus(); }
    };
    document.addEventListener('keydown', trap);
    return () => { document.removeEventListener('keydown', trap); previous?.focus(); };
  }, [compact, sheet]);
  const card = project.cards[Math.min(cardIndex, project.cards.length - 1)];
  useEffect(() => {
    if (!focusTarget) return;
    const index = project.cards.findIndex((item) => item.id === focusTarget.cardId);
    if (index < 0) return;
    setCardIndex(index); setSelection({ kind: focusTarget.element ?? 'card' });
    setTab(focusTarget.element === 'text' ? 'text' : focusTarget.element === 'illustration' || focusTarget.element === 'decoration' ? 'illustration' : 'background');
    requestAnimationFrame(() => thumbsRef.current?.querySelector<HTMLElement>(`[data-card-index="${index}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center' }));
  }, [focusTarget, project.id]);
  const selectCard = (index: number) => { setCardIndex(index); setSelection({ kind: 'card' }); setZoom(100); requestAnimationFrame(() => thumbsRef.current?.querySelector<HTMLElement>(`[data-card-index="${index}"]`)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest', inline: 'center' })); };
  const selectTab = (next: InspectorTab) => { if (next === 'export' && onExport) { onExport(); return; } setTab(next); setSheet(true); };
  const statusText = { loading: 'Загрузка…', saving: 'Сохранение…', saved: 'Сохранено', error: 'Не сохранено' }[saveStatus];
  const thumbnailList = (compact = false) => <div className={`thumbnail-list ${compact ? 'thumbnail-list--panel' : ''}`} ref={compact ? undefined : thumbsRef}>{project.cards.map((item, index) => <button type="button" key={item.id} data-card-index={index} className={`thumbnail ${index === cardIndex ? 'is-selected' : ''}`} aria-label={`Карточка ${item.number} из ${project.cardCount}`} aria-pressed={index === cardIndex} onClick={() => selectCard(index)}><span className="thumbnail__art"><CardSvg card={item} idPrefix={`thumb-${compact ? 'panel' : 'strip'}-${item.id}`} /></span><span className="thumbnail__indicators">{issues.some((issue) => issue.cardId === item.id && issue.severity === 'error') && <span className="error" title="На карточке есть ошибки" />}{issues.some((issue) => issue.cardId === item.id && issue.severity !== 'error') && <span className="warning" title="На карточке есть предупреждения" />}</span><span className="thumbnail__number">{item.number}</span></button>)}</div>;
  const selectIssue = (issue: ValidationIssue) => {
    if (issue.cardId) { const index = project.cards.findIndex((item) => item.id === issue.cardId); if (index >= 0) selectCard(index); }
    setSelection({ kind: issue.element ?? 'card' });
    setTab(issue.element === 'text' ? 'text' : issue.element === 'illustration' || issue.element === 'decoration' ? 'illustration' : 'background');
    setProblems(false); setSheet(false);
  };
  const panelContent = tab === 'cards' ? <><div className="panel-heading"><span className="eyebrow">ВАША КОЛЛЕКЦИЯ</span><h2>День за днём</h2><p>Каждая бирка — часть одной истории.</p></div>{thumbnailList(true)}</> : tab === 'export' ? <div className="export-panel"><span className="export-panel__icon"><FileDown size={30} /></span><h2>Готово к печати</h2><p>Карточки разложатся на листах A4 в исходном размере.</p><Button onClick={onExport}><Download size={17} /> Открыть предпросмотр</Button></div> : <Inspector project={project} card={card} tab={tab} selection={selection} onSelect={setSelection} onCommand={onCommand} recentColors={recentColors} onRecentColor={onRecentColor} />;
  return <div className="studio">
    <header className="studio-header"><IconButton label="Открыть меню" className="mobile-menu-button" onClick={() => setMenu(true)}><Menu size={22} /></IconButton><button className="studio-wordmark" type="button" onClick={() => setSettings(true)} title="Настройки проекта"><span className="wordmark-symbol">✧</span><span>{project.name}</span></button><span className={`save-status ${saveStatus === 'error' ? 'save-status--error' : ''}`}><CloudCheck size={15} /><span>{statusText}</span></span><div className="studio-header__card"><span>Карточка <strong>{card.number}</strong> из {project.cardCount}</span><span className="header-divider" /><button type="button" className={`project-state ${errorCount ? 'has-errors' : warningCount ? 'has-warnings' : ''}`} onClick={() => setProblems(true)} aria-label="Проверка всего проекта">{errorCount ? <AlertCircle size={14} /> : warningCount ? <AlertTriangle size={14} /> : <Check size={13} />}<span>{errorCount ? `Ошибок: ${errorCount}` : 'Ошибок нет'}{warningCount ? ` · Предупреждений: ${warningCount}` : ''}</span></button></div></header>
    <aside className="studio-nav" aria-label="Навигация"><div><NavButton icon={Home} label="Главная" onClick={onHome} /><NavButton icon={Settings2} label="Настройки" onClick={() => setSettings(true)} /></div><div className="studio-nav__bottom"><span className="nav-sprig"><Leaf size={23} strokeWidth={1} /></span><NavButton icon={CircleHelp} label="Справка" onClick={() => setHelp(true)} /></div></aside>
    <section className="workspace" inert={compact && sheet} aria-label={`Рабочая область, карточка ${card.number}`}><div className="workspace__caption"><span className="workspace__caption-line" /> ВАША МАЛЕНЬКАЯ ИСТОРИЯ <span className="workspace__caption-line" /></div>{!canvas && <div className="zoom-controls"><span>{zoom}%</span><IconButton label="Приблизить" onClick={() => setZoom((value) => Math.min(200, value + 10))}><Plus size={19} /></IconButton><IconButton label="Отдалить" onClick={() => setZoom((value) => Math.max(40, value - 10))}><Minus size={19} /></IconButton><IconButton label="Вписать карточку" onClick={() => setZoom(100)}><Expand size={17} /></IconButton></div>}<div className="history-controls"><IconButton label="Отменить (Ctrl+Z)" disabled={!canUndo} onClick={onUndo}><Undo2 size={19} /></IconButton><IconButton label="Повторить (Ctrl+Shift+Z)" disabled={!canRedo} onClick={onRedo}><Redo2 size={19} /></IconButton></div><div className={"workspace__canvas" + (canvas ? " workspace__canvas--interactive" : "")}>{canvas ? canvas(card, selection, (next) => { setSelection(next); if (next.kind === 'text') setTab('text'); else if (next.kind === 'illustration' || next.kind === 'decoration') setTab('illustration'); else setTab('background'); }) : <div className="workspace__tag" style={{ aspectRatio: `${card.width} / ${card.height}`, transform: `scale(${zoom / 100})` }}><CardSvg card={card} idPrefix="main-canvas" /></div>}</div><div className="workspace__hint"><span className="hint-line" /><span>Добавьте немного себя в каждый день</span><span className="hint-line" /></div></section>
    <aside className="inspector" aria-label="Настройки карточки"><div className="inspector-tabs" role="tablist" aria-label="Инструменты">{tabDefinitions.map(({ id, label, icon: Icon }) => <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'is-active' : ''} onClick={() => selectTab(id)}><Icon size={20} strokeWidth={1.7} /><span>{label}</span></button>)}</div><div className="inspector-content">{panelContent}</div><footer className="inspector-footer"><Button className="export-button" onClick={onExport} disabled={!onExport}><Download size={18} /> Предпросмотр и PDF</Button><span><Check size={12} /> A4 · В натуральную величину</span></footer></aside>
    <section className="thumbnail-strip" aria-label="Карточки проекта"><IconButton label="Прокрутить карточки влево" className="strip-arrow" onClick={() => thumbsRef.current?.scrollBy({ left: -280, behavior: 'smooth' })}><ChevronLeft size={18} /></IconButton>{thumbnailList()}<IconButton label="Прокрутить карточки вправо" className="strip-arrow" onClick={() => thumbsRef.current?.scrollBy({ left: 280, behavior: 'smooth' })}><ChevronRight size={18} /></IconButton><span className="thumbnail-strip__count">{project.cardCount}<br /><small>дня</small></span></section>
    <nav className="mobile-dock" aria-label="Инструменты карточки">{tabDefinitions.map(({ id, label, icon: Icon }) => <button key={id} className={sheet && tab === id ? 'is-active' : ''} aria-label={label} aria-pressed={sheet && tab === id} onClick={() => selectTab(id)}><Icon size={23} strokeWidth={1.7} /><span>{label}</span></button>)}</nav>
    {sheet && <div className="sheet-backdrop" onClick={(event) => { if (event.target === event.currentTarget) setSheet(false); }}><section ref={sheetRef} className={`bottom-sheet ${tab === 'cards' ? 'bottom-sheet--cards' : ''}`} role="dialog" aria-modal="true" aria-label={tabDefinitions.find((item) => item.id === tab)?.label}><span className="sheet-handle" /><header><h2>{tabDefinitions.find((item) => item.id === tab)?.label}</h2><IconButton label="Закрыть панель" onClick={() => setSheet(false)}><X size={20} /></IconButton></header><div className="bottom-sheet__content">{panelContent}</div></section></div>}
    {menu && <div className="mobile-navigation"><header><span className="brand"><span className="brand__mark"><Flower2 size={24} /></span>Новогодняя мастерская</span><IconButton label="Закрыть меню" onClick={() => setMenu(false)}><X size={22} /></IconButton></header><div className="mobile-navigation__actions"><Button variant="secondary" onClick={() => { setMenu(false); onHome(); }}><Home size={20} /> Главная</Button><Button variant="secondary" onClick={() => { setMenu(false); setSettings(true); }}><Settings2 size={20} /> Настройки проекта</Button><button className="text-link" onClick={() => { setMenu(false); setHelp(true); }}>Справка и помощь <ArrowRight size={16} /></button></div><span className="mobile-navigation__foot">Маленькие детали большого праздника</span></div>}
    {problems && <Modal title="Проверка всего проекта" onClose={() => setProblems(false)} footer={<Button onClick={() => setProblems(false)}>Готово</Button>}><div className="validation-summary">{issues.length ? issues.map((issue, index) => <div className={`validation-item validation-item--${issue.severity}`} key={`${issue.code}-${issue.cardId}-${index}`}>{issue.severity === 'error' ? <AlertCircle size={18} /> : <AlertTriangle size={18} />}<div><strong>{issue.cardId ? `Карточка ${project.cards.find((item) => item.id === issue.cardId)?.number ?? ''}` : 'Печатный макет'}</strong><p>{issue.message}</p></div><button type="button" onClick={() => selectIssue(issue)}>Исправить</button></div>) : <div className="validation-success"><Check size={28} /><strong>Ошибок нет</strong><p>Весь набор проверен. Можно переходить к предпросмотру.</p></div>}</div></Modal>}
    {settings && <ProjectSettings project={project} card={card} onCommand={onCommand} onClose={() => setSettings(false)} />}
    {help && <Modal title="Добро пожаловать в мастерскую" onClose={() => setHelp(false)} footer={<Button onClick={() => setHelp(false)}>Будем творить <Sparkles size={16} /></Button>}><div className="help-intro"><span className="help-intro__icon"><ScissorsIcon /></span><p>Выберите карточку в нижней ленте, измените текст и иллюстрацию справа, добавьте любимые цвета.</p><p>Когда всё готово, откройте предпросмотр PDF. Печатайте на A4 в масштабе 100%, затем вырежьте бирки по пунктирной линии.</p><div className="inline-note"><CloudCheck size={18} /><span>Проект хранится только в этом браузере. Скачайте готовый PDF, чтобы сохранить результат.</span></div></div></Modal>}
  </div>;
}

function ScissorsIcon() { return <Flower2 size={28} strokeWidth={1.3} />; }
function NavButton({ icon: Icon, label, onClick }: { icon: typeof Home; label: string; onClick: () => void }) { return <button type="button" className="nav-button" onClick={onClick}><Icon size={23} strokeWidth={1.8} /><span>{label}</span></button>; }
