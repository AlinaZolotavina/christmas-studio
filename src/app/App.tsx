import { t } from '../i18n';
import { rich } from '../i18n/rich';
import { lazy, Suspense, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { AlertCircle, Check, Download, X } from 'lucide-react';
import type { ElementKind } from '../domain/types';
import type { Command } from '../domain/commands';
import { validateProject } from '../application/export/validation';
import { useProjectStore } from '../application/useProjectStore';
import { TemplateGallery } from '../features/gallery/TemplateGallery';
import { ResumeProjectDialog } from '../features/gallery/ResumeProjectDialog';
import { TourDialog, TourOffer } from '../features/onboarding/TourDialog';
import { wasTourOffered } from '../features/onboarding/preferences';
import { StudioShell } from '../features/editor/StudioShell';
import { EditorCanvas } from '../rendering/interaction/EditorCanvas';
import { Button, IconButton } from '../shared/ui/Controls';
import { Modal } from '../shared/ui/Modal';
import { AboutPage, ComingSoonPage, HomePage } from '../features/home/WorkshopPages';
import { IdeasPage } from '../features/ideas/IdeasPage';
import { PostcardIdeasPage } from '../features/ideas/PostcardIdeasPage';
import { TagIdeasPage } from '../features/ideas/TagIdeasPage';
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
    if (route === 'templates')
        return 'tags';
    if (route === 'editor' || route === 'editor/tags')
        return hasProject ? 'editor' : 'tags';
    if (route === 'editor/postcards')
        return hasPostcards ? 'editor/postcards' : 'postcards';
    if (route === 'create')
        return 'create';
    return ['tags', 'postcards', 'stickers', 'ideas', 'ideas/postcards', 'ideas/tags', 'about', 'privacy', 'terms'].includes(route) ? route as WorkshopRoute : 'home';
}
export default function App() {
    const store = useProjectStore();
    const postcardStore = usePostcardStore();
    const [view, setView] = useState<WorkshopRoute>(() => routeFromHash(Boolean(store.project), Boolean(postcardStore.project)));
    const hasProject = Boolean(store.project);
    const hasPostcards = Boolean(postcardStore.project);
    const skipEditorResume = useRef(false);
    const catalogTarget = useRef<'tags' | 'postcards' | null>(null);
    const [scrollToTemplates, setScrollToTemplates] = useState<'tags' | 'postcards' | null>(null);
    const [postcardEntry, setPostcardEntry] = useState(() => Boolean(postcardStore.project) && routeFromHash(hasProject, hasPostcards) === 'editor/postcards');
    const [tagEntry, setTagEntry] = useState(() => Boolean(store.project) && routeFromHash(hasProject, hasPostcards) === 'editor');
    const navigate = (next: WorkshopRoute, skipResume = false, toTemplates = false) => { store.flush(); postcardStore.flush(); skipEditorResume.current = skipResume; if (skipResume) {
        setTagEntry(false);
        setPostcardEntry(false);
    } catalogTarget.current = toTemplates && (next === 'tags' || next === 'postcards') ? next : null; setScrollToTemplates(catalogTarget.current); setView(next); window.location.hash = next === 'editor' ? 'editor/tags' : next; if (!catalogTarget.current)
        window.scrollTo({ top: 0 }); };
    useEffect(() => {
        const update = () => { store.flush(); postcardStore.flush(); const next = routeFromHash(hasProject, hasPostcards); if (next === 'editor/postcards' && !skipEditorResume.current)
            setPostcardEntry(true); if (next === 'editor' && !skipEditorResume.current)
            setTagEntry(true); skipEditorResume.current = false; setView(next); if (catalogTarget.current !== next) {
            catalogTarget.current = null;
            setScrollToTemplates(null);
            window.scrollTo({ top: 0 });
        } };
        window.addEventListener('hashchange', update);
        return () => window.removeEventListener('hashchange', update);
    }, [hasProject, hasPostcards, store.flush, postcardStore.flush]);
    const [preview, setPreview] = useState(false);
    const [tourOffer, setTourOffer] = useState(false);
    const [tourActive, setTourActive] = useState(false);
    const [pendingCreate, setPendingCreate] = useState<{
        templateId: string;
        count: 24 | 31;
    } | null>(null);
    const [pendingTerms, setPendingTerms] = useState<{
        templateId: string;
        count: 24 | 31;
    } | null>(null);
    const [pendingPostcardCreate, setPendingPostcardCreate] = useState<CreatePostcardProjectOptions | null>(null);
    const [pendingPostcardTerms, setPendingPostcardTerms] = useState<CreatePostcardProjectOptions | null>(null);
    const [postcardPreview, setPostcardPreview] = useState(false), [postcardTourOffer, setPostcardTourOffer] = useState(false), [postcardTourActive, setPostcardTourActive] = useState(false);
    const [postcardFocus, setPostcardFocus] = useState<{
        postcardId: string;
        elementId?: string;
        requestId: number;
    } | null>(null);
    const [postcardRecoveryOpen, setPostcardRecoveryOpen] = useState(true), [discardPostcardRecovery, setDiscardPostcardRecovery] = useState(false);
    const [recoveryHidden, setRecoveryHidden] = useState(false);
    const [fontVersion, updateFonts] = useReducer((value) => value + 1, 0);
    useEffect(() => {
        let active = true;
        const refresh = () => { if (active)
            updateFonts(); };
        void document.fonts.ready.then(refresh);
        document.fonts.addEventListener('loadingdone', refresh);
        return () => { active = false; document.fonts.removeEventListener('loadingdone', refresh); };
    }, []);
    useEffect(() => setRecoveryHidden(false), [store.recovery?.raw]);
    const issues = useMemo(() => store.project ? validateProject(store.project) : [], [store.project, fontVersion]);
    const [resetRecovery, setResetRecovery] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const [focusTarget, setFocusTarget] = useState<{
        cardId: string;
        element?: ElementKind;
        requestId: number;
    } | null>(null);
    const execute = useCallback((command: Command) => {
        const result = store.dispatch(command);
        if (result.error)
            setToast(result.error);
        else if (result.warnings.length)
            setToast(result.warnings.join(' '));
        return result;
    }, [store.dispatch]);
    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (!(event.ctrlKey || event.metaKey) || event.altKey)
                return;
            const target = event.target as HTMLElement;
            if (target.closest('input,textarea,[contenteditable="true"]'))
                return;
            if (event.key.toLowerCase() === 's') {
                event.preventDefault();
                if (view === 'editor/postcards')
                    postcardStore.flush();
                else
                    store.flush();
                return;
            }
            if (view === 'editor/postcards')
                return;
            if (event.key.toLowerCase() === 'z') {
                event.preventDefault();
                if (event.shiftKey)
                    store.redo();
                else
                    store.undo();
            }
            if (event.key.toLowerCase() === 's') {
                event.preventDefault();
                store.flush();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [store.undo, store.redo, store.flush, postcardStore.flush, view]);
    useEffect(() => {
        if (!toast)
            return;
        const timeout = window.setTimeout(() => setToast(null), 6500);
        return () => window.clearTimeout(timeout);
    }, [toast]);
    const create = (templateId: string, count: 24 | 31) => {
        const result = store.create(templateId, count);
        if (result.error) {
            setToast(result.error);
            return;
        }
        setPendingCreate(null);
        navigate('editor', true);
        if (!wasTourOffered())
            setTourOffer(true);
    };
    const requestCreate = (templateId: string, count: 24 | 31) => {
        if (!termsAcceptance.hasAccepted()) {
            setPendingTerms({ templateId, count });
            return;
        }
        if (store.project)
            setPendingCreate({ templateId, count });
        else
            create(templateId, count);
    };
    const downloadRaw = () => {
        if (!store.recovery)
            return;
        const url = URL.createObjectURL(new Blob([store.recovery.raw], { type: 'application/json' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Advent-Tags-recovery.json';
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
    const executePostcard = useCallback((command: PostcardCommand) => {
        const result = postcardStore.dispatch(command);
        if (result.error)
            setToast(result.error);
        else if (result.warnings.length)
            setToast(result.warnings.join(' '));
        return result;
    }, [postcardStore.dispatch]);
    const createPostcards = (options: CreatePostcardProjectOptions, replace = false) => {
        const result = postcardStore.create(options, { replace });
        if (result.error) {
            setToast(result.error);
            return;
        }
        setPendingPostcardCreate(null);
        setPostcardEntry(false);
        navigate('editor/postcards', true);
        if (!wasTourOffered(POSTCARD_TOUR_KEY))
            setPostcardTourOffer(true);
    };
    const requestPostcardCreate = (options: CreatePostcardProjectOptions) => {
        if (!termsAcceptance.hasAccepted()) {
            setPendingPostcardTerms(options);
            return;
        }
        if (postcardStore.project)
            setPendingPostcardCreate(options);
        else
            createPostcards(options);
    };
    const openPostcardEditor = () => {
        if (postcardStore.project)
            navigate('editor/postcards', true);
        else
            requestPostcardCreate({ count: 1, format: 'a6-portrait' });
    };
    const applyPostcardTemplate = (template: PostcardTemplate, format: PostcardFormat, cornerRadius: number, adding: boolean) => {
        const project = postcardStore.project;
        if (!project)
            return;
        const result = executePostcard(adding ? { type: 'add-postcard', template, format, cornerRadius } : { type: 'apply-template', postcardId: project.activePostcardId, template, format, cornerRadius });
        if (!result.error)
            navigate('editor/postcards', true);
    };
    const postcardContext = view === 'postcards' || view === 'editor/postcards' || view === 'ideas/postcards';
    const noticeStore = postcardContext ? postcardStore : store;
    const displayedNotice = toast ?? noticeStore.notice;
    const restoredNotice = !toast && noticeStore.notices.length === 1 && noticeStore.notices[0].type === 'restored';
    return <>
    {postcardContext && postcardStore.recovery && postcardRecoveryOpen && <Modal title={t("projects.recovery.postcardsTitle")} onClose={() => setPostcardRecoveryOpen(false)} footer={<><Button variant="secondary" onClick={() => { postcardStore.retryRecovery(); setPostcardRecoveryOpen(true); }}>{t("common.retry")}</Button><Button variant="quiet" onClick={() => { setPostcardRecoveryOpen(false); setDiscardPostcardRecovery(true); }}>{t("common.startOver")}</Button></>}><p>{postcardStore.recovery.error}</p><p className="muted">{t("projects.recovery.originalPreserved")}</p></Modal>}
    {postcardContext && postcardStore.recovery && !postcardRecoveryOpen && <div className="recovery-banner" role="status"><AlertCircle size={17}/>{rich("projects.recovery.postcardsBanner", {}, { span: <span /> })}<button onClick={() => setPostcardRecoveryOpen(true)}>{t("projects.recovery.open")}</button></div>}
    {discardPostcardRecovery && <Modal title={t("projects.recovery.discardPostcardsTitle")} onClose={() => setDiscardPostcardRecovery(false)} footer={<><Button variant="secondary" onClick={() => setDiscardPostcardRecovery(false)}>{t("common.cancel")}</Button><Button onClick={() => { postcardStore.discardRecovery(); setDiscardPostcardRecovery(false); setPostcardRecoveryOpen(true); navigate('postcards'); }}>{t("projects.recovery.discardAndStart")}</Button></>}><p className="muted">{t("projects.recovery.discardExplanation")}</p></Modal>}
    {postcardContext && postcardStore.saveStatus === 'error' && postcardStore.project && !postcardStore.recovery && <div className="storage-error" role="alert"><AlertCircle size={17}/>{rich("projects.notifications.postcardSaveFailed", {}, { span: <span /> })}<Button variant="quiet" onClick={() => setPostcardPreview(true)}>{t("export.open")}</Button></div>}
    {view === 'editor' && store.project && <StudioShell key={store.project.id} project={store.project} onCommand={execute} onHome={() => navigate('home')} onTemplates={() => navigate('tags', false, true)} saveStatus={store.saveStatus} canUndo={store.canUndo} canRedo={store.canRedo} onUndo={store.undo} onRedo={store.redo} onExport={() => setPreview(true)} onStartTour={() => { setTourOffer(false); setTourActive(true); }} focusTarget={focusTarget} recentColors={store.recentColors} onRecentColor={store.addRecentColor} issues={issues} canvas={(card, selection, onSelectionChange) => <EditorCanvas card={card} selection={selection} onSelectionChange={onSelectionChange} onCommit={execute} fitKey={card.id}/>}/>}
    {(view === 'home' || view === 'create') && <HomePage hasProject={hasProject}/>}
    {view === 'tags' && <TemplateGallery hasProject={hasProject} project={store.project} onContinue={() => navigate('editor', true)} scrollToTemplates={scrollToTemplates === 'tags'} onCreate={requestCreate}/>}
    {view === 'about' && <AboutPage hasProject={hasProject}/>}
    {view === 'postcards' && <Suspense fallback={<p className="public-loading" role="status">{t("export.loadingPostcards")}</p>}><PostcardGallery hasProject={hasProject} project={postcardStore.project} scrollToTemplates={scrollToTemplates === 'postcards'} onContinue={() => { setPostcardEntry(false); navigate('editor/postcards', true); }} onCreate={requestPostcardCreate} onApply={(template, format, cornerRadius) => applyPostcardTemplate(template, format, cornerRadius, false)} onAdd={(template, format, cornerRadius) => applyPostcardTemplate(template, format, cornerRadius, true)}/></Suspense>}
    {view === 'editor/postcards' && postcardStore.project && <Suspense fallback={<p className="public-loading" role="status">{t("export.loadingPostcardEditor")}</p>}><PostcardShell key={postcardStore.project.id} project={postcardStore.project} saveStatus={postcardStore.saveStatus} canUndo={postcardStore.canUndo} canRedo={postcardStore.canRedo} onUndo={postcardStore.undo} onRedo={postcardStore.redo} onCommand={executePostcard} onSelectPostcard={postcardStore.selectPostcard} onHome={() => navigate('home')} onTemplates={() => navigate('postcards', false, true)} onExport={() => setPostcardPreview(true)} onStartTour={() => setPostcardTourActive(true)} focusTarget={postcardFocus}/></Suspense>}
    {view === 'ideas' && <IdeasPage hasProject={hasProject}/>}
    {view === 'ideas/tags' && <TagIdeasPage project={store.project} onOpenEditor={() => { if (store.project)
        navigate('editor', true);
    else
        navigate('tags', false, true); }} onNew={() => navigate('tags', false, true)}/>}
    {view === 'ideas/postcards' && <PostcardIdeasPage hasProject={hasProject} project={postcardStore.project} onOpenEditor={openPostcardEditor} onNew={() => requestPostcardCreate({ count: 1, format: 'a6-portrait' })}/>}
    {view === 'stickers' && <ComingSoonPage page={view} hasProject={hasProject}/>}
    {(view === 'privacy' || view === 'terms') && <Suspense fallback={<SiteLayout current={view} hasProject={hasProject}><main className="public-content-page" aria-busy="true"><p>{t("legal.loading")}</p></main></SiteLayout>}><LegalPage document={view} hasProject={hasProject}/></Suspense>}
    {(pendingTerms || pendingPostcardTerms) && <TermsDialog onCancel={() => { setPendingTerms(null); setPendingPostcardTerms(null); }} onAccept={() => { termsAcceptance.accept(); if (pendingPostcardTerms) {
        const options = pendingPostcardTerms;
        setPendingPostcardTerms(null);
        requestPostcardCreate(options);
    }
    else if (pendingTerms) {
        const selection = pendingTerms;
        setPendingTerms(null);
        requestCreate(selection.templateId, selection.count);
    } }}/>}
    {view === 'create' && <Modal title={t("projects.create.chooseProduct")} onClose={() => navigate('home')}><div className="project-direction-options"><Button onClick={() => navigate('tags')}>{t("navigation.tags")}</Button><Button onClick={() => navigate('postcards')}>{t("navigation.postcards")}</Button></div></Modal>}
    {tagEntry && view === 'editor' && store.project && <ResumeProjectDialog product="tags" name={store.project.name} onContinue={() => setTagEntry(false)} onNew={() => { setTagEntry(false); navigate('tags', false, true); }}/>}
    {postcardEntry && view === 'editor/postcards' && postcardStore.project && <ResumeProjectDialog product="postcards" name={postcardStore.project.name} onContinue={() => setPostcardEntry(false)} onNew={() => { setPostcardEntry(false); navigate('postcards', false, true); }}/>}
    {pendingPostcardCreate && <Modal title={t("projects.replace.postcardsTitle")} onClose={() => setPendingPostcardCreate(null)} footer={<><Button variant="secondary" onClick={() => setPendingPostcardCreate(null)}>{t("projects.replace.keepCurrent")}</Button><Button onClick={() => createPostcards(pendingPostcardCreate, true)}>{t("projects.create.newAction")}</Button></>}><p className="muted">{t("projects.replace.postcardsDescription", { projectName: pendingPostcardCreate.name ?? t("projects.create.postcardsDefaultName"), count: pendingPostcardCreate.count })}</p></Modal>}
    {postcardTourOffer && view === 'editor/postcards' && <TourOffer product="postcards" offerKey={POSTCARD_TOUR_KEY} onStart={() => { setPostcardTourOffer(false); setPostcardTourActive(true); }} onSkip={() => setPostcardTourOffer(false)}/>}
    {postcardTourActive && view === 'editor/postcards' && <TourDialog steps={postcardTourSteps} onClose={() => setPostcardTourActive(false)}/>}
    {postcardPreview && postcardStore.project && <Suspense fallback={<Modal title={t("export.postcardPreviewTitle")} onClose={() => setPostcardPreview(false)}><p>{t("common.loading")}</p></Modal>}><PostcardPrintPreview project={postcardStore.project} revision={postcardStore.revision} onClose={() => setPostcardPreview(false)} onFix={(postcardId, elementId) => { postcardStore.selectPostcard(postcardId); setPostcardFocus({ postcardId, elementId, requestId: Date.now() }); setPostcardPreview(false); }}/></Suspense>}
    {tourOffer && store.project && <TourOffer onStart={() => { setTourOffer(false); setTourActive(true); }} onSkip={() => setTourOffer(false)}/>}
    {tourActive && store.project && <TourDialog onClose={() => setTourActive(false)}/>}
    {preview && store.project && <Suspense fallback={<Modal title={t("export.previewTitle")} onClose={() => setPreview(false)}><p className="muted">{t("export.refreshingPreview")}</p></Modal>}><PrintPreview project={store.project} revision={store.revision} onClose={() => setPreview(false)} onFix={(cardId: string, element?: ElementKind) => { setFocusTarget({ cardId, element, requestId: Date.now() }); setPreview(false); navigate('editor'); }}/></Suspense>}
    {pendingCreate && <Modal title={t("projects.replace.tagsTitle")} onClose={() => setPendingCreate(null)} footer={<><Button variant="secondary" onClick={() => setPendingCreate(null)}>{t("projects.replace.keepCurrent")}</Button><Button onClick={() => create(pendingCreate.templateId, pendingCreate.count)}>{t("common.createNew")}</Button></>}><p className="muted">{t("projects.replace.tagsDescription")}</p></Modal>}

    {!postcardContext && store.recovery && !recoveryHidden && <Modal title={t("projects.recovery.tagsTitle")} onClose={() => setRecoveryHidden(true)} footer={<><Button variant="secondary" onClick={downloadRaw}><Download size={16}/>{t("projects.recovery.downloadData")}</Button><Button onClick={store.retryRecovery}>{t("common.retry")}</Button></>}><div className="inline-note inline-note--error"><AlertCircle size={20}/><span>{store.recovery.error}</span></div><p className="muted recovery-explanation">{t("projects.recovery.downloadExplanation")}</p><button className="text-link danger-link" onClick={() => { setRecoveryHidden(true); setResetRecovery(true); }}>{t("projects.recovery.discardAction")}</button></Modal>}
    {!postcardContext && store.recovery && recoveryHidden && !resetRecovery && <div className="recovery-banner" role="status"><AlertCircle size={17}/>{rich("projects.recovery.tagsBanner", {}, { span: <span /> })}<button type="button" onClick={() => setRecoveryHidden(false)}>{t("projects.recovery.open")}</button></div>}
    {resetRecovery && <Modal title={t("projects.recovery.discardTitle")} onClose={() => setResetRecovery(false)} footer={<><Button variant="secondary" onClick={() => setResetRecovery(false)}>{t("common.cancel")}</Button><Button onClick={() => { store.discardRecovery(); setResetRecovery(false); navigate('home'); }}>{t("projects.recovery.discardAndStart")}</Button></>}><p className="muted">{t("projects.recovery.discardWarning")}</p><Button variant="quiet" onClick={downloadRaw}><Download size={16}/>{t("projects.recovery.downloadOriginal")}</Button></Modal>}
    {!postcardContext && store.saveStatus === 'error' && store.project && !store.recovery && <div className="storage-error" role="alert"><AlertCircle size={17}/>{rich("projects.notifications.tagSaveFailed", {}, { span: <span /> })}<Button variant="quiet" onClick={() => setPreview(true)}>{t("export.downloadPdf")}</Button></div>}
    {displayedNotice && <div className={`toast ${restoredNotice ? 'toast--restored' : ''}`} role="status">{!restoredNotice && <Check size={17}/>}<span>{displayedNotice}</span><IconButton label={t("common.dismissNotification")} onClick={() => { setToast(null); noticeStore.clearNotice(); }}><X size={17}/></IconButton></div>}
  </>;
}
