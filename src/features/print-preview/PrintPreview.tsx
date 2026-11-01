import { useEffect, useRef, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Download, LoaderCircle, Minus, Plus, RotateCcw, Scan } from 'lucide-react';
import type { ElementKind, ProjectDocument, ValidationIssue } from '../../domain/types';
import type { PrintPage } from '../../application/export/layout';
import type { PreparedPrint } from '../../infrastructure/pdf/generatePdf';
import CardSvg from '../../rendering/CardSvg';
import { Modal } from '../../shared/ui/Modal';
import { Button, IconButton } from '../../shared/ui/Controls';
import { clampPrintZoom, fitPageZoom, MAX_PRINT_ZOOM, MIN_PRINT_ZOOM, pageSizeAtZoom } from './zoom';
import './print-preview.css';

export interface PrintPreviewProps { project: ProjectDocument; revision: number; onClose: () => void; onFix: (cardId: string, element?: ElementKind) => void }

function PageSvg({ page, project, prefix }: { page: PrintPage; project: ProjectDocument; prefix: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 297" width="100%" height="100%" role="img" aria-label="Печатная страница A4">
    <rect width="210" height="297" fill="white" />
    {page.placements.map(placement => {
      const card = project.cards.find(card => card.id === placement.cardId);
      return card ? <svg key={card.id} x={placement.x} y={placement.y} width={card.width} height={card.height} overflow="visible"><CardSvg card={card} print quality="preview" idPrefix={`${prefix}-${card.id}`} /></svg> : null;
    })}
  </svg>;
}

function Issue({ issue, onFix, onPage }: { issue: ValidationIssue; onFix: PrintPreviewProps['onFix']; onPage: (index: number) => void }) {
  return <div className={`print-issue print-issue--${issue.severity}`}>
    {issue.severity === 'error' ? <AlertCircle size={17} /> : <AlertTriangle size={17} />}
    <p>{issue.message}</p>
    {issue.cardId ? <button type="button" onClick={() => onFix(issue.cardId!, issue.element)}>Исправить</button> : issue.pageIndex !== undefined ? <button type="button" onClick={() => onPage(issue.pageIndex!)}>К странице</button> : null}
  </div>;
}

export function PrintPreview({ project, revision, onClose, onFix }: PrintPreviewProps) {
  const [prepared, setPrepared] = useState<PreparedPrint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [retry, setRetry] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [zoom, setZoom] = useState(100);
  const fitMode = useRef(true);
  const stage = useRef<HTMLDivElement>(null);
  const generation = useRef(0);
  useEffect(() => {
    const token = ++generation.current;
    let active = true;
    setLoading(true); setPrepared(null); setError(''); setExporting(false);
    const snapshot = structuredClone(project);
    void import('../../infrastructure/pdf/generatePdf').then(module => module.preparePrint(snapshot)).then(result => {
      if (!active || token !== generation.current) return;
      setPrepared(result); setPageIndex(current => Math.min(current, Math.max(0, result.layout.pages.length - 1))); setLoading(false);
    }).catch(reason => {
      if (!active || token !== generation.current) return;
      setError(reason instanceof Error ? reason.message : 'Не удалось обновить предпросмотр. Повторите попытку.'); setLoading(false);
    });
    return () => { active = false; generation.current++; };
  }, [project, revision, retry]);
  useEffect(() => {
    if (!stage.current) return;
    const observer = new ResizeObserver(() => {
      if (fitMode.current && stage.current) setZoom(fitPageZoom(stage.current.clientWidth, stage.current.clientHeight));
    });
    observer.observe(stage.current);
    return () => observer.disconnect();
  }, [prepared]);
  const issues = prepared?.issues || [];
  const errors = issues.filter(issue => issue.severity === 'error');
  const warnings = issues.filter(issue => issue.severity !== 'error');
  const pages = prepared?.layout.pages || [];
  const page = pages[pageIndex];
  const paperSize = pageSizeAtZoom(zoom);
  const changeZoom = (change: number) => { fitMode.current = false; setZoom(value => clampPrintZoom(value + change)); };
  const fitPage = () => {
    if (!stage.current) return;
    fitMode.current = true;
    setZoom(fitPageZoom(stage.current.clientWidth, stage.current.clientHeight));
    stage.current.scrollTo({ left: 0, top: 0 });
  };
  const exportPdf = async () => {
    if (!prepared || loading || exporting || errors.length) return;
    const token = generation.current;
    setExporting(true); setError('');
    try {
      const module = await import('../../infrastructure/pdf/generatePdf');
      const blob = await module.generatePdf(prepared.project, prepared);
      if (token !== generation.current) return;
      const url = URL.createObjectURL(blob); const link = document.createElement('a');
      link.href = url; link.download = 'Advent-Tags.pdf'; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (reason) { if (token === generation.current) setError(reason instanceof Error ? reason.message : 'Не удалось создать PDF. Повторите попытку.'); }
    finally { if (token === generation.current) setExporting(false); }
  };
  const fix = (cardId: string, element?: ElementKind) => { onClose(); onFix(cardId, element); };
  return <Modal title="Предпросмотр печати" onClose={onClose} wide className="print-preview-modal" footer={<>
    <p className="print-preview-footer-note">A4 · исходный размер карточек · {pages.length || '—'} стр.</p>
    <Button variant="secondary" onClick={onClose}>К редактору</Button>
    <Button onClick={() => void exportPdf()} disabled={loading || exporting || !prepared || errors.length > 0}>{exporting ? <LoaderCircle className="print-spinner" size={17} /> : <Download size={17} />}{exporting ? 'Создаём PDF…' : 'Скачать PDF'}</Button>
  </>}>
    <p className="print-instruction">Для сохранения размеров карточек печатайте в масштабе <strong>100%</strong> и отключите «Подогнать под страницу».</p>
    {loading ? <div className="print-loading" role="status"><LoaderCircle className="print-spinner" size={28} /><strong>Обновляем предпросмотр…</strong><p>Проверяем раскладку, размеры и шрифты</p></div> : null}
    {error && <div className="print-error" role="alert"><AlertCircle size={20} /><p>{error}</p><Button variant="secondary" onClick={() => setRetry(value => value + 1)} disabled={loading || exporting}><RotateCcw size={15} />Повторить</Button></div>}
    {!loading && prepared && <>
      <div className={`print-status ${errors.length ? 'print-status--error' : warnings.length ? 'print-status--warning' : ''}`} role="status">
        {errors.length ? <AlertCircle size={18} /> : warnings.length ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
        <span>{errors.length ? `Ошибок: ${errors.length}. Исправьте их перед экспортом.` : warnings.length ? `Предупреждений: ${warnings.length}. PDF можно скачать.` : 'Ошибок нет. Можно печатать!'}</span>
      </div>
      <div className="print-preview-layout">
        <aside className="print-page-list" aria-label="Страницы документа">{pages.map((item, index) => {
          const pageCardIds = new Set(item.placements.map(placement => placement.cardId));
          const pageIssues = issues.filter(issue => issue.pageIndex === index || issue.cardId && pageCardIds.has(issue.cardId));
          const severity = pageIssues.some(issue => issue.severity === 'error') ? 'error' : pageIssues.length ? 'warning' : '';
          return <button type="button" key={index} className={`print-page-thumb ${index === pageIndex ? 'is-selected' : ''} ${severity ? `has-${severity}` : ''}`} aria-label={`Страница ${index + 1}${severity === 'error' ? ', есть ошибки' : severity ? ', есть предупреждения' : ''}`} aria-pressed={index === pageIndex} onClick={() => setPageIndex(index)}><span className="print-page-thumb__paper"><PageSvg page={item} project={prepared.project} prefix={`print-thumb-${index}`} /></span><span>{index + 1}</span></button>;
        })}</aside>
        <section className="print-document">
          <div className="print-document-toolbar"><div className="print-page-nav"><IconButton label="Предыдущая страница" disabled={pageIndex === 0} onClick={() => setPageIndex(index => index - 1)}><ChevronLeft size={18} /></IconButton><span>Страница {pageIndex + 1} из {pages.length}</span><IconButton label="Следующая страница" disabled={pageIndex >= pages.length - 1} onClick={() => setPageIndex(index => index + 1)}><ChevronRight size={18} /></IconButton></div><div className="print-zoom-controls"><IconButton label="Уменьшить страницу" disabled={zoom <= MIN_PRINT_ZOOM} onClick={() => changeZoom(-10)}><Minus size={16} /></IconButton><button type="button" className="print-zoom-value" aria-label="Масштаб 100%" title="Показать в масштабе 100%" onClick={() => { fitMode.current = false; setZoom(100); }}>{zoom}%</button><IconButton label="Увеличить страницу" disabled={zoom >= MAX_PRINT_ZOOM} onClick={() => changeZoom(10)}><Plus size={16} /></IconButton><IconButton label="Вписать страницу" onClick={fitPage}><Scan size={16} /></IconButton></div></div>
          <div className="print-document-stage" ref={stage}><div className="print-scroll-content">{page && <div className="print-page-paper" style={paperSize}><PageSvg page={page} project={prepared.project} prefix={`print-page-${pageIndex}`} /></div>}</div></div>
        </section>
      </div>
      {issues.length > 0 && <details className="print-issues" open={errors.length > 0}><summary>Проверка макета · {errors.length} ошибок, {warnings.length} предупреждений</summary><div>{issues.map((issue, index) => <Issue key={`${issue.code}-${issue.cardId || issue.pageIndex}-${index}`} issue={issue} onFix={fix} onPage={setPageIndex} />)}</div></details>}
    </>}
  </Modal>;
}

export default PrintPreview;
