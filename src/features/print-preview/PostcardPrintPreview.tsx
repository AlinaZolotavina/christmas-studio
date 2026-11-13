import { t } from '../../i18n';
import { trackPdfDownload } from '../../analytics';
import { rich } from '../../i18n/rich';
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
export interface PostcardPrintPreviewProps {
    project: PostcardProject;
    revision: number;
    onClose: () => void;
    onFix: (postcardId: string, elementId?: string) => void;
}
type ExportFormat = 'pdf' | 'png' | 'jpg';
interface PreviewPage {
    width: number;
    height: number;
    page: PostcardPrintPage;
}
function PageSvg({ prepared, item, prefix }: {
    prepared: PreparedPostcardExport;
    item: PreviewPage;
    prefix: string;
}) {
    return <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${item.width} ${item.height}`} width="100%" height="100%" role="img" aria-label={t("export.postcards.pageSize", { width: item.width, height: item.height })}>
    <rect width={item.width} height={item.height} fill="white"/>
    {item.page.placements.map(placement => {
            const scene = prepared.scenes.get(placement.postcardId);
            if (!scene)
                return null;
            const transform = placement.rotation === 90 ? `translate(${placement.x + scene.height} ${placement.y}) rotate(90)` : `translate(${placement.x} ${placement.y})`;
            return <g key={scene.id} transform={transform}><svg width={scene.width} height={scene.height} overflow="visible"><SceneSvg scene={scene} print textPaths={prepared.textPaths.get(scene.id)} idPrefix={`${prefix}-${scene.id}`}/></svg></g>;
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
        controller.current?.abort();
        setPrepared(null);
        setLoading(true);
        setError('');
        setExporting(false);
        setAccepted(false);
        setProgress('');
        void import('../../infrastructure/pdf/postcards').then(module => module.preparePostcardExport(project, scope)).then(value => {
            if (!active || token !== generation.current)
                return;
            setPrepared(value);
            setLoading(false);
            setPageIndex(0);
        }).catch(reason => {
            if (!active || token !== generation.current)
                return;
            setError(reason instanceof Error ? reason.message : t("export.postcards.preparationFailed"));
            setLoading(false);
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
        if (!stage.current)
            return;
        const fit = () => { if (fitMode.current && stage.current)
            setZoom(fitPageZoom(stage.current.clientWidth, stage.current.clientHeight, 24, { width, height })); };
        const observer = new ResizeObserver(fit);
        observer.observe(stage.current);
        fit();
        return () => observer.disconnect();
    }, [prepared, width, height]);
    const issues = prepared?.issues ?? [], errors = issues.filter(issue => issue.severity === 'error'), warnings = issues.filter(issue => issue.severity === 'warning');
    const close = () => { controller.current?.abort(); onClose(); };
    const fit = () => {
        fitMode.current = true;
        if (stage.current) {
            setZoom(fitPageZoom(stage.current.clientWidth, stage.current.clientHeight, 24, { width, height }));
            stage.current.scrollTo({ left: 0, top: 0 });
        }
    };
    const exportFile = async () => {
        if (!prepared || loading || exporting || errors.length || warnings.length && !accepted)
            return;
        const token = generation.current;
        controller.current = new AbortController();
        setExporting(true);
        setError('');
        setProgress(t("export.postcards.preparing"));
        try {
            const module = await import('../../infrastructure/pdf/postcards');
            const options = { signal: controller.current.signal, onProgress: (completed: number, total: number) => { if (token === generation.current)
                    setProgress(t("export.postcards.progress", { completed: completed, total: total })); } };
            const result = format === 'pdf' ? { blob: await module.generatePostcardPdf(prepared, options), filename: scope === 'all' ? 'Postcards-A4.pdf' : 'Postcard.pdf' } : await module.generatePostcardImages(prepared, format, options);
            if (token === generation.current && !controller.current.signal.aborted) {
                if (format === 'pdf') await trackPdfDownload('card_pdf_export', () => module.downloadPostcardFile(result));
                else module.downloadPostcardFile(result);
            }
        }
        catch (reason) {
            if (token === generation.current && !(reason instanceof DOMException && reason.name === 'AbortError'))
                setError(reason instanceof Error ? reason.message : t("export.postcards.fileFailed"));
        }
        finally {
            if (token === generation.current) {
                setExporting(false);
                setProgress('');
            }
        }
    };
    const name = format === 'pdf' ? 'PDF' : scope === 'all' && (prepared?.postcards.length ?? 0) > 1 ? `ZIP (${format.toUpperCase()})` : format.toUpperCase();
    return <Modal title={t("export.postcards.title")} wide className="print-preview-modal postcard-print-preview" onClose={close} footer={<>
    <p className="print-preview-footer-note">{format === 'pdf' ? scope === 'all' ? t("export.postcards.projectSize") : t("export.postcards.dimensions", { width: width, height: height }) : t("export.postcards.rasterHint")}{exporting ? ` · ${progress}` : ''}</p>
    <Button variant="secondary" onClick={close}>{t("export.postcards.backToEditor")}</Button>
    <Button onClick={() => void exportFile()} disabled={loading || exporting || !prepared || errors.length > 0 || warnings.length > 0 && !accepted}>{exporting ? <LoaderCircle size={17} className="print-spinner"/> : <Download size={17}/>}{exporting ? t("export.postcards.creating") : t("export.postcards.download", { format: name })}</Button>
  </>}>
    <div className="postcard-export-options">
      <Field label={t("export.postcards.scope.title")}><select aria-label={t("export.postcards.scope.label")} value={scope} disabled={exporting} onChange={event => setScope(event.target.value as PostcardExportScope)}><option value="current">{t("export.postcards.scope.current")}</option><option value="all">{t("export.postcards.scope.project")}</option></select></Field>
      <Field label={t("export.postcards.formatTitle")}><select aria-label={t("export.postcards.formatLabel")} value={format} disabled={exporting} onChange={event => setFormat(event.target.value as ExportFormat)}><option value="pdf">PDF</option><option value="png">PNG · 300 DPI</option><option value="jpg">JPG · 300 DPI</option></select></Field>
    </div>
    <p className="print-instruction">{rich("export.postcards.printInstructions", { formatHint: format !== 'pdf' && scope === 'all' ? t("export.postcards.zipHint") : null }, { strong: <strong /> })}</p>
    {loading && <div className="print-loading" role="status"><LoaderCircle size={28} className="print-spinner"/>{rich("export.postcards.checking", {}, { strong: <strong /> })}<p>{t("export.postcards.loadingResources")}</p></div>}
    {error && <div className="print-error" role="alert"><AlertCircle size={20}/><p>{error}</p><Button variant="secondary" disabled={loading || exporting} onClick={() => setRetry(value => value + 1)}><RotateCcw size={15}/>{t("common.retry")}</Button></div>}
    {!loading && prepared && <>
      <div className={`print-status ${errors.length ? 'print-status--error' : warnings.length ? 'print-status--warning' : ''}`} role="status">{errors.length ? <AlertCircle size={18}/> : warnings.length ? <AlertTriangle size={18}/> : <CheckCircle2 size={18}/>}<span>{errors.length ? t("export.postcards.errors", { count: errors.length }) : warnings.length ? t("export.postcards.warnings", { count: warnings.length }) : t("export.postcards.ready")}</span></div>
      <div className="print-preview-layout">
        <aside className="print-page-list" aria-label={t("export.postcards.pagesLabel")}>{pages.map((value, index) => <button type="button" key={index} className={`print-page-thumb ${index === pageIndex ? 'is-selected' : ''}`} aria-label={t("export.postcards.pageLabel", { position: index + 1 })} aria-pressed={index === pageIndex} onClick={() => setPageIndex(index)}><span className="print-page-thumb__paper" style={{ aspectRatio: `${value.width} / ${value.height}` }}><PageSvg prepared={prepared} item={value} prefix={`postcard-thumb-${index}`}/></span><span>{index + 1}</span></button>)}</aside>
        <section className="print-document">
          <div className="print-document-toolbar"><div className="print-page-nav"><IconButton label={t("export.postcards.previousPage")} disabled={pageIndex === 0} onClick={() => setPageIndex(value => value - 1)}><ChevronLeft size={18}/></IconButton>{rich("export.postcards.pagePosition", { page: pageIndex + 1, total: pages.length }, { span: <span /> })}<IconButton label={t("export.postcards.nextPage")} disabled={pageIndex >= pages.length - 1} onClick={() => setPageIndex(value => value + 1)}><ChevronRight size={18}/></IconButton></div><div className="print-zoom-controls"><IconButton label={t("export.postcards.zoomOut")} disabled={zoom <= MIN_PRINT_ZOOM} onClick={() => { fitMode.current = false; setZoom(value => clampPrintZoom(value - 10)); }}><Minus size={16}/></IconButton><button type="button" className="print-zoom-value" aria-label={t("export.postcards.actualSize")} onClick={() => { fitMode.current = false; setZoom(100); }}>{zoom}%</button><IconButton label={t("export.postcards.zoomIn")} disabled={zoom >= MAX_PRINT_ZOOM} onClick={() => { fitMode.current = false; setZoom(value => clampPrintZoom(value + 10)); }}><Plus size={16}/></IconButton><IconButton label={t("export.postcards.fitPage")} onClick={fit}><Scan size={16}/></IconButton></div></div>
          <div className="print-document-stage" ref={stage}><div className="print-scroll-content">{item && <div className="print-page-paper" style={pageSizeAtZoom(zoom, item)}><PageSvg prepared={prepared} item={item} prefix={`postcard-page-${pageIndex}`}/></div>}</div></div>
        </section>
      </div>
      {issues.length > 0 && <details className="print-issues" open><summary>{t("export.postcards.validationSummary", { errorCount: errors.length, warningCount: warnings.length })}</summary><div>{issues.map((issue, index) => <div className={`print-issue print-issue--${issue.severity}`} key={`${issue.code}-${issue.postcardId}-${issue.elementId}-${index}`}>{issue.severity === 'error' ? <AlertCircle size={17}/> : <AlertTriangle size={17}/>}<p>{issue.message}</p>{issue.postcardId && <button type="button" onClick={() => { close(); onFix(issue.postcardId!, issue.elementId); }}>{t("common.fix")}</button>}</div>)}</div></details>}
      {warnings.length > 0 && errors.length === 0 && <label className="postcard-export-accept"><input type="checkbox" checked={accepted} disabled={exporting} onChange={event => setAccepted(event.target.checked)}/>{t("export.postcards.confirmWarnings")}</label>}
      {exporting && <p className="postcard-export-progress" role="status">{progress}</p>}
    </>}
  </Modal>;
}
export default PostcardPrintPreview;
