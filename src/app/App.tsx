import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { AlertCircle, Check, Download, X } from 'lucide-react';
import type { ElementKind } from '../domain/types';
import type { Command } from '../domain/commands';
import { useProjectStore } from '../application/useProjectStore';
import { TemplateGallery } from '../features/gallery/TemplateGallery';
import { StudioShell } from '../features/editor/StudioShell';
import { EditorCanvas } from '../rendering/interaction/EditorCanvas';
import { Button, IconButton } from '../shared/ui/Controls';
import { Modal } from '../shared/ui/Modal';

const PrintPreview = lazy(() => import('../features/print-preview/PrintPreview'));

export default function App() {
  const store = useProjectStore();
  const [view, setView] = useState<'gallery' | 'editor'>(() => store.project ? 'editor' : 'gallery');
  const [preview, setPreview] = useState(false);
  const [pendingCreate, setPendingCreate] = useState<{ templateId: string; count: 24 | 31 } | null>(null);
  const [storageWarning, setStorageWarning] = useState(false);
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
    setPendingCreate(null); setView('editor');
    try {
      if (localStorage.getItem('advent-studio.storage-warning') !== 'shown') { setStorageWarning(true); localStorage.setItem('advent-studio.storage-warning', 'shown'); }
    } catch { setStorageWarning(true); }
  };
  const downloadRaw = () => {
    if (!store.recovery) return;
    const url = URL.createObjectURL(new Blob([store.recovery.raw], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'Advent-Tags-recovery.json'; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const displayedNotice = toast ?? store.notice;
  return <>
    {view === 'editor' && store.project ? <StudioShell key={store.project.id} project={store.project} onCommand={execute} onHome={() => { store.flush(); setView('gallery'); }} saveStatus={store.saveStatus} canUndo={store.canUndo} canRedo={store.canRedo} onUndo={store.undo} onRedo={store.redo} onExport={() => setPreview(true)} focusTarget={focusTarget} canvas={(card, selection, onSelectionChange) => <EditorCanvas card={card} selection={selection} onSelectionChange={onSelectionChange} onCommit={execute} fitKey={card.id} />} /> : <TemplateGallery onCreate={(templateId, count) => { if (store.project) setPendingCreate({ templateId, count }); else create(templateId, count); }} onContinue={store.project ? () => setView('editor') : undefined} />}
    {preview && store.project && <Suspense fallback={<Modal title="Готовим предпросмотр" onClose={() => setPreview(false)}><p className="muted">Обновляем предпросмотр…</p></Modal>}><PrintPreview project={store.project} revision={store.revision} onClose={() => setPreview(false)} onFix={(cardId: string, element?: ElementKind) => { setFocusTarget({ cardId, element, requestId: Date.now() }); setPreview(false); setView('editor'); }} /></Suspense>}
    {pendingCreate && <Modal title="Начнём новую историю?" onClose={() => setPendingCreate(null)} footer={<><Button variant="secondary" onClick={() => setPendingCreate(null)}>Оставить текущий</Button><Button onClick={() => create(pendingCreate.templateId, pendingCreate.count)}>Создать новый</Button></>}><p className="muted">В браузере хранится один проект. Новый набор заменит текущий. Если хотите сохранить готовые бирки, сначала скачайте PDF.</p></Modal>}
    {storageWarning && <Modal title="Ваша мастерская — в этом браузере" onClose={() => setStorageWarning(false)} footer={<Button onClick={() => setStorageWarning(false)}>Понятно <Check size={16} /></Button>}><p className="muted">Изменения сохраняются автоматически только в этом браузере и на этом устройстве. Очистка данных браузера удалит проект. Готовый результат можно скачать как PDF для печати.</p></Modal>}
    {store.recovery && <Modal title="Не удалось восстановить проект" onClose={() => setToast('Сначала восстановите проект или сохраните повреждённые данные.')} footer={<><Button variant="secondary" onClick={downloadRaw}><Download size={16} /> Скачать данные</Button><Button onClick={store.retryRecovery}>Повторить</Button></>}><div className="inline-note inline-note--error"><AlertCircle size={20} /><span>{store.recovery.error}</span></div><p className="muted recovery-explanation">Исходные данные сохранены. Вы можете скачать их, повторить восстановление или начать заново.</p><button className="text-link danger-link" onClick={() => setResetRecovery(true)}>Удалить повреждённый проект и начать заново</button></Modal>}
    {resetRecovery && <Modal title="Удалить повреждённый проект?" onClose={() => setResetRecovery(false)} footer={<><Button variant="secondary" onClick={() => setResetRecovery(false)}>Отмена</Button><Button onClick={() => { store.discardRecovery(); setResetRecovery(false); setView('gallery'); }}>Удалить и начать заново</Button></>}><p className="muted">После удаления восстановить эти данные в мастерской не получится. Перед этим можно скачать исходный файл.</p><Button variant="quiet" onClick={downloadRaw}><Download size={16} /> Скачать исходные данные</Button></Modal>}
    {store.saveStatus === 'error' && store.project && !store.recovery && <div className="storage-error" role="alert"><AlertCircle size={17} /><span>Не удалось сохранить изменения. Скачайте PDF, чтобы не потерять результат.</span><Button variant="quiet" onClick={() => setPreview(true)}>Скачать PDF</Button></div>}
    {displayedNotice && <div className="toast" role="status"><Check size={17} /><span>{displayedNotice}</span><IconButton label="Скрыть уведомление" onClick={() => { setToast(null); store.clearNotice(); }}><X size={17} /></IconButton></div>}
  </>;
}
