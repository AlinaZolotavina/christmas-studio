import { useEffect, useRef, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Download, LoaderCircle, Minus, Plus, RotateCcw, Scan } from 'lucide-react';
import type { PostcardProject } from '../../domain/postcards/types';
import { getPostcardSize } from '../../domain/postcards/types';
import type { PostcardExportScope, PostcardPrintPage } from '../../application/export/postcardLayout';
import type { PreparedPostcardExport } from '../../infrastructure/pdf/postcards';
import { SceneSvg } from '../../rendering/SceneSvg';
import { Modal } from '../../shared/ui/Modal';
import { Button, Field, IconButton } from '../../shared/ui/Controls';
import { clampPrintZoom, fitPageZoom, MAX_PRINT_ZOOM, MIN_PRINT_ZOOM, pageSizeAtZoom } from './zoom';
import './print-preview.css';
import './postcard-print-preview.css';

export interface PostcardPrintPreviewProps { project: PostcardProject; revision: number; onClose: () => void; onFix: (postcardId: string, elementId?: string) => void }
type ExportFormat = 'pdf' | 'png' | 'jpg';
interface PreviewPage { width: number; height: number; page: PostcardPrintPage }

function PageSvg({ prepared, item, prefix }: { prepared: PreparedPostcardExport; item: PreviewPage; prefix: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${item.width} ${item.height}`} width="100%" height="100%" role="img" aria-label={`Печатная страница ${item.width} × ${item.height} мм`}>
    <rect width={item.width} height={item.height} fill="white" />
    {item.page.placements.map(placement => {
      const scene = prepared.scenes.get(placement.postcardId);
      if (!scene) return null;
      const transform = placement.rotation === 90 ? `translate(${placement.x + scene.height} ${placement.y}) rotate(90)` : `translate(${placement.x} ${placement.y})`;
      return <g key={scene.id} transform={transform}><svg width={scene.width} height={scene.height} overflow="visible"><SceneSvg scene={scene} print textPaths={prepared.textPaths.get(scene.id)} idPrefix={`${prefix}-${scene.id}`} /></svg></g>;
    })}
  </svg>;
}

export function PostcardPrintPreview({ project, revision, onClose, onFix }: PostcardPrintPreviewProps) {
  const [scope, setScope] = useState<PostcardExportScope>('current');
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [prepared, setPrepared] = useState<PreparedPostcardExport | null>(null);
  const [loading, setLoading] = useState(true), [error, setError] = useState(''), [retry, setRetry] = useState(0);
  const [exporting, setExporting] = useState(false), [progress, setProgress] = useState(''), [accepted, setAccepted] = useState(false);
  const [pageIndex, setPageIndex] = useState(0), [zoom, setZoom] = useState(100);
  const stage = useRef<HTMLDivElement>(null), generation = useRef(0), fitMode = useRef(true);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => {
    let active = true;
    const token = ++generation.current;
    controller.current?.abort(); setPrepared(null); setLoading(true); setError(''); setExporting(false); setAccepted(false); setProgress('');
    void import('../../infrastructure/pdf/postcards').then(module => module.preparePostcardExport(project, scope)).then(value => {
      if (!active || token !== generation.current) return;
      setPrepared(value); setLoading(false); setPageIndex(0);
    }).catch(reason => {
      if (!active || token !== generation.current) return;
      setError(reason instanceof Error ? reason.message : 'Не удалось подготовить открытки.'); setLoading(false);
    });
    return () => { active = false; generation.current++; controller.current?.abort(); };
  }, [project, revision, scope, retry]);
  useEffect(() => { setAccepted(false); setPageIndex(0); }, [format]);
  const pages: PreviewPage[] = !prepared ? [] : format === 'pdf'
    ? prepared.layout.pages.map(page => ({ width: prepared.layout.width, height: prepared.layout.height, page }))
    : prepared.postcards.map(card => ({ ...getPostcardSize(card), page: { placements: [{ postcardId: card.id, x: 0, y: 0, ...getPostcardSize(card), rotation: 0 }] } }));
  const item = pages[Math.min(pageIndex, Math.max(0, pages.length - 1))];
  const width = item?.width ?? 105, height = item?.height ?? 148;
  useEffect(() => {
    if (!stage.current) return;
    const fit = () => { if (fitMode.current && stage.current) setZoom(fitPageZoom(stage.current.clientWidth, stage.current.clientHeight, 24, { width, height })); };
    const observer = new ResizeObserver(fit); observer.observe(stage.current); fit();
    return () => observer.disconnect();
  }, [prepared, width, height]);
  const issues = prepared?.issues ?? [], errors = issues.filter(issue => issue.severity === 'error'), warnings = issues.filter(issue => issue.severity === 'warning');
  const close = () => { controller.current?.abort(); onClose(); };
  const fit = () => {
    fitMode.current = true;
    if (stage.current) { setZoom(fitPageZoom(stage.current.clientWidth, stage.current.clientHeight, 24, { width, height })); stage.current.scrollTo({ left: 0, top: 0 }); }
  };
  const exportFile = async () => {
    if (!prepared || loading || exporting || errors.length || warnings.length && !accepted) return;
    const token = generation.current;
    controller.current = new AbortController(); setExporting(true); setError(''); setProgress('Готовим файл…');
    try {
      const module = await import('../../infrastructure/pdf/postcards');
      const options = { signal: controller.current.signal, onProgress: (completed: number, total: number) => { if (token === generation.current) setProgress(`Готово ${completed} из ${total}`); } };
      const result = format === 'pdf' ? { blob: await module.generatePostcardPdf(prepared, options), filename: scope === 'all' ? 'Postcards-A4.pdf' : 'Postcard.pdf' } : await module.generatePostcardImages(prepared, format, options);
      if (token === generation.current && !controller.current.signal.aborted) module.downloadPostcardFile(result);
    } catch (reason) {
      if (token === generation.current && !(reason instanceof DOMException && reason.name === 'AbortError')) setError(reason instanceof Error ? reason.message : 'Не удалось создать файл. Повторите попытку.');
    } finally { if (token === generation.current) { setExporting(false); setProgress(''); } }
  };
  const name = format === 'pdf' ? 'PDF' : scope === 'all' && (prepared?.postcards.length ?? 0) > 1 ? `ZIP (${format.toUpperCase()})` : format.toUpperCase();
  return <Modal title="Предпросмотр открыток" wide className="print-preview-modal postcard-print-preview" onClose={close} footer={<>
    <p className="print-preview-footer-note">{format === 'pdf' ? scope === 'all' ? 'A4 · исходный размер открыток' : `${width} × ${height} мм` : '300 DPI · непрозрачный фон'}{exporting ? ` · ${progress}` : ''}</p>
    <Button variant="secondary" onClick={close}>К редактору</Button>
    <Button onClick={() => void exportFile()} disabled={loading || exporting || !prepared || errors.length > 0 || warnings.length > 0 && !accepted}>{exporting ? <LoaderCircle size={17} className="print-spinner" /> : <Download size={17} />}{exporting ? 'Создаём файл…' : `Скачать ${name}`}</Button>
  </>}>
    <div className="postcard-export-options">
      <Field label="Экспортировать"><select aria-label="Область экспорта открыток" value={scope} disabled={exporting} onChange={event => setScope(event.target.value as PostcardExportScope)}><option value="current">Текущую открытку</option><option value="all">Весь проект</option></select></Field>
      <Field label="Формат файла"><select aria-label="Формат экспорта открыток" value={format} disabled={exporting} onChange={event => setFormat(event.target.value as ExportFormat)}><option value="pdf">PDF</option><option value="png">PNG · 300 DPI</option><option value="jpg">JPG · 300 DPI</option></select></Field>
    </div>
    <p className="print-instruction">Печатайте в масштабе <strong>100%</strong> и отключите «Подогнать под страницу». {format !== 'pdf' && scope === 'all' ? 'Каждая открытка сохраняется отдельным изображением; несколько файлов упаковываются в ZIP.' : null}</p>
    {loading && <div className="print-loading" role="status"><LoaderCircle size={28} className="print-spinner" /><strong>Проверяем открытки…</strong><p>Загружаем исходники, готовим контуры текста и раскладку</p></div>}
    {error && <div className="print-error" role="alert"><AlertCircle size={20} /><p>{error}</p><Button variant="secondary" disabled={loading || exporting} onClick={() => setRetry(value => value + 1)}><RotateCcw size={15} />Повторить</Button></div>}
    {!loading && prepared && <>
      <div className={`print-status ${errors.length ? 'print-status--error' : warnings.length ? 'print-status--warning' : ''}`} role="status">{errors.length ? <AlertCircle size={18} /> : warnings.length ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}<span>{errors.length ? `Ошибок: ${errors.length}. Исправьте их перед экспортом.` : warnings.length ? `Предупреждений: ${warnings.length}. Проверьте их перед продолжением.` : 'Ошибок нет. Можно сохранять!'}</span></div>
      <div className="print-preview-layout">
        <aside className="print-page-list" aria-label="Страницы открыток">{pages.map((value, index) => <button type="button" key={index} className={`print-page-thumb ${index === pageIndex ? 'is-selected' : ''}`} aria-label={`Страница ${index + 1}`} aria-pressed={index === pageIndex} onClick={() => setPageIndex(index)}><span className="print-page-thumb__paper" style={{ aspectRatio: `${value.width} / ${value.height}` }}><PageSvg prepared={prepared} item={value} prefix={`postcard-thumb-${index}`} /></span><span>{index + 1}</span></button>)}</aside>
        <section className="print-document">
          <div className="print-document-toolbar"><div className="print-page-nav"><IconButton label="Предыдущая страница" disabled={pageIndex === 0} onClick={() => setPageIndex(value => value - 1)}><ChevronLeft size={18} /></IconButton><span>Страница {pageIndex + 1} из {pages.length}</span><IconButton label="Следующая страница" disabled={pageIndex >= pages.length - 1} onClick={() => setPageIndex(value => value + 1)}><ChevronRight size={18} /></IconButton></div><div className="print-zoom-controls"><IconButton label="Уменьшить страницу" disabled={zoom <= MIN_PRINT_ZOOM} onClick={() => { fitMode.current = false; setZoom(value => clampPrintZoom(value - 10)); }}><Minus size={16} /></IconButton><button type="button" className="print-zoom-value" aria-label="Масштаб 100%" onClick={() => { fitMode.current = false; setZoom(100); }}>{zoom}%</button><IconButton label="Увеличить страницу" disabled={zoom >= MAX_PRINT_ZOOM} onClick={() => { fitMode.current = false; setZoom(value => clampPrintZoom(value + 10)); }}><Plus size={16} /></IconButton><IconButton label="Вписать страницу" onClick={fit}><Scan size={16} /></IconButton></div></div>
          <div className="print-document-stage" ref={stage}><div className="print-scroll-content">{item && <div className="print-page-paper" style={pageSizeAtZoom(zoom, item)}><PageSvg prepared={prepared} item={item} prefix={`postcard-page-${pageIndex}`} /></div>}</div></div>
        </section>
      </div>
      {issues.length > 0 && <details className="print-issues" open><summary>Проверка макета · {errors.length} ошибок, {warnings.length} предупреждений</summary><div>{issues.map((issue, index) => <div className={`print-issue print-issue--${issue.severity}`} key={`${issue.code}-${issue.postcardId}-${issue.elementId}-${index}`}>{issue.severity === 'error' ? <AlertCircle size={17} /> : <AlertTriangle size={17} />}<p>{issue.message}</p>{issue.postcardId && <button type="button" onClick={() => { close(); onFix(issue.postcardId!, issue.elementId); }}>Исправить</button>}</div>)}</div></details>}
      {warnings.length > 0 && errors.length === 0 && <label className="postcard-export-accept"><input type="checkbox" checked={accepted} disabled={exporting} onChange={event => setAccepted(event.target.checked)} />Я проверил(а) предупреждения и хочу продолжить экспорт</label>}
      {exporting && <p className="postcard-export-progress" role="status">{progress}</p>}
    </>}
  </Modal>;
}

export default PostcardPrintPreview;
