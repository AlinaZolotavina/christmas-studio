import { lazy, Suspense, useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { AlertCircle, Check, Download, X } from 'lucide-react';
import type { ElementKind } from '../domain/types';
import type { Command } from '../domain/commands';
import { validateProject } from '../application/export/validation';
import { useProjectStore } from '../application/useProjectStore';
import { TemplateGallery } from '../features/gallery/TemplateGallery';
import { TourDialog, TourOffer } from '../features/onboarding/TourDialog';
import { wasTourOffered } from '../features/onboarding/preferences';
import { StudioShell } from '../features/editor/StudioShell';
import { EditorCanvas } from '../rendering/interaction/EditorCanvas';
import { Button, IconButton } from '../shared/ui/Controls';
import { Modal } from '../shared/ui/Modal';
import { AboutPage, ComingSoonPage, HomePage, type WorkshopRoute } from '../features/home/WorkshopPages';

const PrintPreview = lazy(() => import('../features/print-preview/PrintPreview'));

function routeFromHash(hasProject: boolean): WorkshopRoute {
  const route = window.location.hash.replace(/^#\/?/, '');
  if (route === 'templates') return 'tags';
  if (route === 'editor') return hasProject ? 'editor' : 'tags';
  return ['tags', 'postcards', 'stickers', 'ideas', 'about'].includes(route) ? route as WorkshopRoute : 'home';
}

export default function App() {
  const store = useProjectStore();
  const [view, setView] = useState<WorkshopRoute>(() => routeFromHash(Boolean(store.project)));
  const hasProject = Boolean(store.project);
  const navigate = (next: WorkshopRoute) => { store.flush(); setView(next); window.location.hash = next; window.scrollTo({ top: 0 }); };
  useEffect(() => {
    const update = () => { store.flush(); setView(routeFromHash(hasProject)); window.scrollTo({ top: 0 }); };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, [hasProject, store.flush]);
  const [preview, setPreview] = useState(false);
  const [tourOffer, setTourOffer] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [pendingCreate, setPendingCreate] = useState<{ templateId: string; count: 24 | 31 } | null>(null);
  const [recoveryHidden, setRecoveryHidden] = useState(false);
  const [fontVersion, updateFonts] = useReducer((value) => value + 1, 0);
  useEffect(() => {
    let active = true; const refresh = () => { if (active) updateFonts(); };
    void document.fonts.ready.then(refresh); document.fonts.addEventListener('loadingdone', refresh);
    return () => { active = false; document.fonts.removeEventListener('loadingdone', refresh); };
  }, []);
  useEffect(() => setRecoveryHidden(false), [store.recovery?.raw]);
  const issues = useMemo(() => store.project ? validateProject(store.project) : [], [store.project, fontVersion]);
  const [resetRecovery, setResetRecovery] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [focusTarget, setFocusTarget] = useState<{ cardId: string; element?: ElementKind; requestId: number } | null>(null);
  const execute = useCallback((command: Command) => {
    const result = store.dispatch(command);
    if (result.error) setToast(result.error);
    else if (result.warnings.length) setToast(result.warnings.join(' '));
    return result;
  }, [store.dispatch]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
      const target = event.target as HTMLElement;
      if (target.closest('input,textarea,[contenteditable="true"]')) return;
      if (event.key.toLowerCase() === 'z') { event.preventDefault(); if (event.shiftKey) store.redo(); else store.undo(); }
      if (event.key.toLowerCase() === 's') { event.preventDefault(); store.flush(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [store.undo, store.redo, store.flush]);
  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 6500);
    return () => window.clearTimeout(timeout);
  }, [toast]);
  const create = (templateId: string, count: 24 | 31) => {
    const result = store.create(templateId, count);
    if (result.error) { setToast(result.error); return; }
    setPendingCreate(null); navigate('editor');
    if (!wasTourOffered()) setTourOffer(true);

  };
  const downloadRaw = () => {
    if (!store.recovery) return;
    const url = URL.createObjectURL(new Blob([store.recovery.raw], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'Advent-Tags-recovery.json'; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const displayedNotice = toast ?? store.notice;
  const restoredNotice = !toast && Boolean(store.notice?.startsWith('Проект восстановлен'));
  return <>
    {view === 'editor' && store.project && <StudioShell key={store.project.id} project={store.project} onCommand={execute} onHome={() => navigate('home')} saveStatus={store.saveStatus} canUndo={store.canUndo} canRedo={store.canRedo} onUndo={store.undo} onRedo={store.redo} onExport={() => setPreview(true)} onStartTour={() => { setTourOffer(false); setTourActive(true); }} focusTarget={focusTarget} recentColors={store.recentColors} onRecentColor={store.addRecentColor} issues={issues} canvas={(card, selection, onSelectionChange) => <EditorCanvas card={card} selection={selection} onSelectionChange={onSelectionChange} onCommit={execute} fitKey={card.id} />} />}
    {view === 'home' && <HomePage hasProject={hasProject} />}
    {view === 'tags' && <TemplateGallery onHome={() => navigate('home')} onCreate={(templateId, count) => { if (store.project) setPendingCreate({ templateId, count }); else create(templateId, count); }} onContinue={store.project ? () => navigate('editor') : undefined} />}
    {view === 'about' && <AboutPage hasProject={hasProject} />}
    {(view === 'postcards' || view === 'stickers' || view === 'ideas') && <ComingSoonPage page={view} hasProject={hasProject} />}
    {tourOffer && store.project && <TourOffer onStart={() => { setTourOffer(false); setTourActive(true); }} onSkip={() => setTourOffer(false)} />}
    {tourActive && store.project && <TourDialog onClose={() => setTourActive(false)} />}
    {preview && store.project && <Suspense fallback={<Modal title="Готовим предпросмотр" onClose={() => setPreview(false)}><p className="muted">Обновляем предпросмотр…</p></Modal>}><PrintPreview project={store.project} revision={store.revision} onClose={() => setPreview(false)} onFix={(cardId: string, element?: ElementKind) => { setFocusTarget({ cardId, element, requestId: Date.now() }); setPreview(false); navigate('editor'); }} /></Suspense>}
    {pendingCreate && <Modal title="Начнём новую историю?" onClose={() => setPendingCreate(null)} footer={<><Button variant="secondary" onClick={() => setPendingCreate(null)}>Оставить текущий</Button><Button onClick={() => create(pendingCreate.templateId, pendingCreate.count)}>Создать новый</Button></>}><p className="muted">В браузере хранится один проект. Новый набор заменит текущий. Если хотите сохранить готовые бирки, сначала скачайте PDF.</p></Modal>}

    {store.recovery && !recoveryHidden && <Modal title="Не удалось восстановить проект" onClose={() => setRecoveryHidden(true)} footer={<><Button variant="secondary" onClick={downloadRaw}><Download size={16} /> Скачать данные</Button><Button onClick={store.retryRecovery}>Повторить</Button></>}><div className="inline-note inline-note--error"><AlertCircle size={20} /><span>{store.recovery.error}</span></div><p className="muted recovery-explanation">Исходные данные сохранены. Вы можете скачать их, повторить восстановление или начать заново.</p><button className="text-link danger-link" onClick={() => { setRecoveryHidden(true); setResetRecovery(true); }}>Удалить повреждённый проект и начать заново</button></Modal>}
    {store.recovery && recoveryHidden && !resetRecovery && <div className="recovery-banner" role="status"><AlertCircle size={17} /><span>Сохранённый проект требует восстановления.</span><button type="button" onClick={() => setRecoveryHidden(false)}>Открыть восстановление</button></div>}
    {resetRecovery && <Modal title="Удалить повреждённый проект?" onClose={() => setResetRecovery(false)} footer={<><Button variant="secondary" onClick={() => setResetRecovery(false)}>Отмена</Button><Button onClick={() => { store.discardRecovery(); setResetRecovery(false); navigate('home'); }}>Удалить и начать заново</Button></>}><p className="muted">После удаления восстановить эти данные в мастерской не получится. Перед этим можно скачать исходный файл.</p><Button variant="quiet" onClick={downloadRaw}><Download size={16} /> Скачать исходные данные</Button></Modal>}
    {store.saveStatus === 'error' && store.project && !store.recovery && <div className="storage-error" role="alert"><AlertCircle size={17} /><span>Не удалось сохранить изменения. Скачайте PDF, чтобы не потерять результат.</span><Button variant="quiet" onClick={() => setPreview(true)}>Скачать PDF</Button></div>}
    {displayedNotice && <div className={`toast ${restoredNotice ? 'toast--restored' : ''}`} role="status">{!restoredNotice && <Check size={17} />}<span>{displayedNotice}</span><IconButton label="Скрыть уведомление" onClick={() => { setToast(null); store.clearNotice(); }}><X size={17} /></IconButton></div>}
  </>;
}
