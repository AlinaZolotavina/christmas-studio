import { lazy, Suspense, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
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
import { AboutPage, ComingSoonPage, HomePage } from '../features/home/WorkshopPages';
import type { WorkshopRoute } from '../shared/navigation/routes';
import { SiteLayout } from '../shared/layout/SiteLayout';
import { TermsDialog } from '../features/onboarding/TermsDialog';
import { termsAcceptance } from '../features/onboarding/termsAcceptance';
import { usePostcardStore } from '../application/usePostcardStore';
import type { PostcardCommand } from '../domain/postcards/commands';
import type { CreatePostcardProjectOptions, PostcardFormat, PostcardTemplate } from '../domain/postcards/types';
import { POSTCARD_TOUR_KEY, postcardTourSteps } from '../features/postcards/tour';

const PrintPreview = lazy(() => import('../features/print-preview/PrintPreview'));
const LegalPage = lazy(() => import('../features/legal/LegalPage').then(module => ({ default: module.LegalPage })));
const PostcardGallery = lazy(() => import('../features/postcards/PostcardGallery').then(module => ({ default: module.PostcardGallery })));
const PostcardShell = lazy(() => import('../features/postcards/PostcardShell').then(module => ({ default: module.PostcardShell })));
const PostcardPrintPreview = lazy(() => import('../features/print-preview/PostcardPrintPreview'));

function routeFromHash(hasProject: boolean, hasPostcards = false): WorkshopRoute {
  const route = window.location.hash.replace(/^#\/?/, '');
  if (route === 'templates') return 'tags';
  if (route === 'editor' || route === 'editor/tags') return hasProject ? 'editor' : 'tags';
  if (route === 'editor/postcards') return hasPostcards ? 'editor/postcards' : 'postcards';
  if (route === 'create') return 'create';
  return ['tags', 'postcards', 'stickers', 'ideas', 'about', 'privacy', 'terms'].includes(route) ? route as WorkshopRoute : 'home';
}

export default function App() {
  const store = useProjectStore();
  const postcardStore = usePostcardStore();
  const [view, setView] = useState<WorkshopRoute>(() => routeFromHash(Boolean(store.project), Boolean(postcardStore.project)));
  const hasProject = Boolean(store.project);
  const hasPostcards = Boolean(postcardStore.project);
  const skipPostcardResume = useRef(false);
  const [postcardEntry, setPostcardEntry] = useState(() => Boolean(postcardStore.project) && window.location.hash === '#editor/postcards');
  const navigate = (next: WorkshopRoute, skipResume = false) => { store.flush(); postcardStore.flush(); skipPostcardResume.current = skipResume; setView(next); window.location.hash = next === 'editor' ? 'editor/tags' : next; window.scrollTo({ top: 0 }); };
  useEffect(() => {
    const update = () => { store.flush(); postcardStore.flush(); const next = routeFromHash(hasProject, hasPostcards); if (next === 'editor/postcards' && !skipPostcardResume.current) setPostcardEntry(true); skipPostcardResume.current = false; setView(next); window.scrollTo({ top: 0 }); };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, [hasProject, hasPostcards, store.flush, postcardStore.flush]);
  const [preview, setPreview] = useState(false);
  const [tourOffer, setTourOffer] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [pendingCreate, setPendingCreate] = useState<{ templateId: string; count: 24 | 31 } | null>(null);
  const [pendingTerms, setPendingTerms] = useState<{ templateId: string; count: 24 | 31 } | null>(null);
  const [pendingPostcardCreate, setPendingPostcardCreate] = useState<CreatePostcardProjectOptions | null>(null);
  const [pendingPostcardTerms, setPendingPostcardTerms] = useState<CreatePostcardProjectOptions | null>(null);
  const [postcardPreview, setPostcardPreview] = useState(false), [postcardTourOffer, setPostcardTourOffer] = useState(false), [postcardTourActive, setPostcardTourActive] = useState(false);
  const [postcardFocus, setPostcardFocus] = useState<{ postcardId: string; elementId?: string; requestId: number } | null>(null);
  const [postcardRecoveryOpen, setPostcardRecoveryOpen] = useState(true), [discardPostcardRecovery, setDiscardPostcardRecovery] = useState(false);
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
      if (event.key.toLowerCase() === 's') { event.preventDefault(); if (view === 'editor/postcards') postcardStore.flush(); else store.flush(); return; }
      if (view === 'editor/postcards') return;
      if (event.key.toLowerCase() === 'z') { event.preventDefault(); if (event.shiftKey) store.redo(); else store.undo(); }
      if (event.key.toLowerCase() === 's') { event.preventDefault(); store.flush(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [store.undo, store.redo, store.flush, postcardStore.flush, view]);
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
  const requestCreate = (templateId: string, count: 24 | 31) => {
    if (!termsAcceptance.hasAccepted()) { setPendingTerms({ templateId, count }); return; }
    if (store.project) setPendingCreate({ templateId, count });
    else create(templateId, count);
  };
  const downloadRaw = () => {
    if (!store.recovery) return;
    const url = URL.createObjectURL(new Blob([store.recovery.raw], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'Advent-Tags-recovery.json'; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const executePostcard = useCallback((command: PostcardCommand) => {
    const result = postcardStore.dispatch(command);
    if (result.error) setToast(result.error); else if (result.warnings.length) setToast(result.warnings.join(' '));
    return result;
  }, [postcardStore.dispatch]);
  const createPostcards = (options: CreatePostcardProjectOptions, replace = false) => {
    const result = postcardStore.create(options, { replace });
    if (result.error) { setToast(result.error); return; }
    setPendingPostcardCreate(null); setPostcardEntry(false); navigate('editor/postcards', true);
    if (!wasTourOffered(POSTCARD_TOUR_KEY)) setPostcardTourOffer(true);
  };
  const requestPostcardCreate = (options: CreatePostcardProjectOptions) => {
    if (!termsAcceptance.hasAccepted()) { setPendingPostcardTerms(options); return; }
    if (postcardStore.project) setPendingPostcardCreate(options); else createPostcards(options);
  };
  const applyPostcardTemplate = (template: PostcardTemplate, format: PostcardFormat, adding: boolean) => {
    const project = postcardStore.project; if (!project) return;
    const result = executePostcard(adding ? { type: 'add-postcard', template, format } : { type: 'apply-template', postcardId: project.activePostcardId, template, format });
    if (!result.error) navigate('editor/postcards', true);
  };
  const postcardContext = view === 'postcards' || view === 'editor/postcards';
  const noticeStore = postcardContext ? postcardStore : store;
  const displayedNotice = toast ?? noticeStore.notice;
  const restoredNotice = !toast && Boolean(noticeStore.notice?.startsWith('Проект восстановлен'));
  return <>
    {postcardContext && postcardStore.recovery && postcardRecoveryOpen && <Modal title="Не удалось восстановить открытки" onClose={() => setPostcardRecoveryOpen(false)} footer={<><Button variant="secondary" onClick={() => { postcardStore.retryRecovery(); setPostcardRecoveryOpen(true); }}>Повторить</Button><Button variant="quiet" onClick={() => { setPostcardRecoveryOpen(false); setDiscardPostcardRecovery(true); }}>Начать заново</Button></>}><p>{postcardStore.recovery.error}</p><p className="muted">Исходные данные сохранены в этом браузере. Новый проект не заменит их без отдельного подтверждения.</p></Modal>}
    {postcardContext && postcardStore.recovery && !postcardRecoveryOpen && <div className="recovery-banner" role="status"><AlertCircle size={17} /><span>Проект открыток требует восстановления.</span><button onClick={() => setPostcardRecoveryOpen(true)}>Открыть восстановление</button></div>}
    {discardPostcardRecovery && <Modal title="Удалить повреждённый проект открыток?" onClose={() => setDiscardPostcardRecovery(false)} footer={<><Button variant="secondary" onClick={() => setDiscardPostcardRecovery(false)}>Отмена</Button><Button onClick={() => { postcardStore.discardRecovery(); setDiscardPostcardRecovery(false); setPostcardRecoveryOpen(true); navigate('postcards'); }}>Удалить и начать заново</Button></>}><p className="muted">Повреждённый текущий документ будет удалён. Подтверждайте удаление, только если хотите начать новый проект.</p></Modal>}
    {postcardContext && postcardStore.saveStatus === 'error' && postcardStore.project && !postcardStore.recovery && <div className="storage-error" role="alert"><AlertCircle size={17} /><span>Не удалось сохранить открытки. Сохраните готовый результат перед закрытием страницы.</span><Button variant="quiet" onClick={() => setPostcardPreview(true)}>Экспорт</Button></div>}
    {view === 'editor' && store.project && <StudioShell key={store.project.id} project={store.project} onCommand={execute} onHome={() => navigate('home')} onTemplates={() => navigate('tags')} saveStatus={store.saveStatus} canUndo={store.canUndo} canRedo={store.canRedo} onUndo={store.undo} onRedo={store.redo} onExport={() => setPreview(true)} onStartTour={() => { setTourOffer(false); setTourActive(true); }} focusTarget={focusTarget} recentColors={store.recentColors} onRecentColor={store.addRecentColor} issues={issues} canvas={(card, selection, onSelectionChange) => <EditorCanvas card={card} selection={selection} onSelectionChange={onSelectionChange} onCommit={execute} fitKey={card.id} />} />}
    {(view === 'home' || view === 'create') && <HomePage hasProject={hasProject} />}
    {view === 'tags' && <TemplateGallery hasProject={hasProject} onCreate={requestCreate} />}
    {view === 'about' && <AboutPage hasProject={hasProject} />}
    {view === 'postcards' && <Suspense fallback={<p className="public-loading" role="status">Загружаем открытки…</p>}><PostcardGallery hasProject={hasProject} project={postcardStore.project} onContinue={() => { setPostcardEntry(false); navigate('editor/postcards', true); }} onCreate={requestPostcardCreate} onApply={(template, format) => applyPostcardTemplate(template, format, false)} onAdd={(template, format) => applyPostcardTemplate(template, format, true)} /></Suspense>}
    {view === 'editor/postcards' && postcardStore.project && <Suspense fallback={<p className="public-loading" role="status">Загружаем редактор открыток…</p>}><PostcardShell key={postcardStore.project.id} project={postcardStore.project} saveStatus={postcardStore.saveStatus} canUndo={postcardStore.canUndo} canRedo={postcardStore.canRedo} onUndo={postcardStore.undo} onRedo={postcardStore.redo} onCommand={executePostcard} onSelectPostcard={postcardStore.selectPostcard} onHome={() => navigate('home')} onTemplates={() => navigate('postcards')} onExport={() => setPostcardPreview(true)} onStartTour={() => setPostcardTourActive(true)} focusTarget={postcardFocus} /></Suspense>}
    {(view === 'stickers' || view === 'ideas') && <ComingSoonPage page={view} hasProject={hasProject} />}
    {(view === 'privacy' || view === 'terms') && <Suspense fallback={<SiteLayout current={view} hasProject={hasProject}><main className="public-content-page" aria-busy="true"><p>Загружаем документ…</p></main></SiteLayout>}><LegalPage document={view} hasProject={hasProject} /></Suspense>}
    {(pendingTerms || pendingPostcardTerms) && <TermsDialog onCancel={() => { setPendingTerms(null); setPendingPostcardTerms(null); }} onAccept={() => { termsAcceptance.accept(); if (pendingPostcardTerms) { const options = pendingPostcardTerms; setPendingPostcardTerms(null); requestPostcardCreate(options); } else if (pendingTerms) { const selection = pendingTerms; setPendingTerms(null); requestCreate(selection.templateId, selection.count); } }} />}
    {view === 'create' && <Modal title="Что будем создавать?" onClose={() => navigate('home')}><div className="project-direction-options"><Button onClick={() => navigate('tags')}>Адвент-теги</Button><Button onClick={() => navigate('postcards')}>Открытки</Button></div></Modal>}
    {postcardEntry && view === 'editor/postcards' && <Modal title="Продолжить работу над открытками?" onClose={() => navigate('postcards')} footer={<><Button variant="secondary" onClick={() => { setPostcardEntry(false); navigate('postcards'); }}>Начать новый</Button><Button onClick={() => setPostcardEntry(false)}>Продолжить</Button></>}><p className="muted">В браузере сохранён проект «{postcardStore.project?.name}». Выбор нового шаблона не заменит его без подтверждения.</p></Modal>}
    {pendingPostcardCreate && <Modal title="Создать новый проект открыток?" onClose={() => setPendingPostcardCreate(null)} footer={<><Button variant="secondary" onClick={() => setPendingPostcardCreate(null)}>Оставить текущий</Button><Button onClick={() => createPostcards(pendingPostcardCreate, true)}>Создать новый проект</Button></>}><p className="muted">Новый проект «{pendingPostcardCreate.name ?? 'Мои открытки'}» из {pendingPostcardCreate.count} открыток заменит текущий проект открыток. Перед заменой можно сохранить готовый результат через экспорт.</p></Modal>}
    {postcardTourOffer && view === 'editor/postcards' && <TourOffer product="postcards" offerKey={POSTCARD_TOUR_KEY} onStart={() => { setPostcardTourOffer(false); setPostcardTourActive(true); }} onSkip={() => setPostcardTourOffer(false)} />}
    {postcardTourActive && view === 'editor/postcards' && <TourDialog steps={postcardTourSteps} onClose={() => setPostcardTourActive(false)} />}
    {postcardPreview && postcardStore.project && <Suspense fallback={<Modal title="Готовим предпросмотр открыток" onClose={() => setPostcardPreview(false)}><p>Загрузка…</p></Modal>}><PostcardPrintPreview project={postcardStore.project} revision={postcardStore.revision} onClose={() => setPostcardPreview(false)} onFix={(postcardId, elementId) => { postcardStore.selectPostcard(postcardId); setPostcardFocus({ postcardId, elementId, requestId: Date.now() }); setPostcardPreview(false); }} /></Suspense>}
    {tourOffer && store.project && <TourOffer onStart={() => { setTourOffer(false); setTourActive(true); }} onSkip={() => setTourOffer(false)} />}
    {tourActive && store.project && <TourDialog onClose={() => setTourActive(false)} />}
    {preview && store.project && <Suspense fallback={<Modal title="Готовим предпросмотр" onClose={() => setPreview(false)}><p className="muted">Обновляем предпросмотр…</p></Modal>}><PrintPreview project={store.project} revision={store.revision} onClose={() => setPreview(false)} onFix={(cardId: string, element?: ElementKind) => { setFocusTarget({ cardId, element, requestId: Date.now() }); setPreview(false); navigate('editor'); }} /></Suspense>}
    {pendingCreate && <Modal title="Начнём новую историю?" onClose={() => setPendingCreate(null)} footer={<><Button variant="secondary" onClick={() => setPendingCreate(null)}>Оставить текущий</Button><Button onClick={() => create(pendingCreate.templateId, pendingCreate.count)}>Создать новый</Button></>}><p className="muted">В браузере хранится один проект. Новый набор заменит текущий. Если хотите сохранить готовые адвент-теги, сначала скачайте PDF.</p></Modal>}

    {!postcardContext && store.recovery && !recoveryHidden && <Modal title="Не удалось восстановить проект" onClose={() => setRecoveryHidden(true)} footer={<><Button variant="secondary" onClick={downloadRaw}><Download size={16} /> Скачать данные</Button><Button onClick={store.retryRecovery}>Повторить</Button></>}><div className="inline-note inline-note--error"><AlertCircle size={20} /><span>{store.recovery.error}</span></div><p className="muted recovery-explanation">Исходные данные сохранены. Вы можете скачать их, повторить восстановление или начать заново.</p><button className="text-link danger-link" onClick={() => { setRecoveryHidden(true); setResetRecovery(true); }}>Удалить повреждённый проект и начать заново</button></Modal>}
    {!postcardContext && store.recovery && recoveryHidden && !resetRecovery && <div className="recovery-banner" role="status"><AlertCircle size={17} /><span>Сохранённый проект требует восстановления.</span><button type="button" onClick={() => setRecoveryHidden(false)}>Открыть восстановление</button></div>}
    {resetRecovery && <Modal title="Удалить повреждённый проект?" onClose={() => setResetRecovery(false)} footer={<><Button variant="secondary" onClick={() => setResetRecovery(false)}>Отмена</Button><Button onClick={() => { store.discardRecovery(); setResetRecovery(false); navigate('home'); }}>Удалить и начать заново</Button></>}><p className="muted">После удаления восстановить эти данные в мастерской не получится. Перед этим можно скачать исходный файл.</p><Button variant="quiet" onClick={downloadRaw}><Download size={16} /> Скачать исходные данные</Button></Modal>}
    {!postcardContext && store.saveStatus === 'error' && store.project && !store.recovery && <div className="storage-error" role="alert"><AlertCircle size={17} /><span>Не удалось сохранить изменения. Скачайте PDF, чтобы не потерять результат.</span><Button variant="quiet" onClick={() => setPreview(true)}>Скачать PDF</Button></div>}
    {displayedNotice && <div className={`toast ${restoredNotice ? 'toast--restored' : ''}`} role="status">{!restoredNotice && <Check size={17} />}<span>{displayedNotice}</span><IconButton label="Скрыть уведомление" onClick={() => { setToast(null); noticeStore.clearNotice(); }}><X size={17} /></IconButton></div>}
  </>;
}
