import { t } from '../../i18n';
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode, type PointerEvent as ReactPointerEvent } from 'react';
import { Expand, Minus, Plus, Trash2 } from 'lucide-react';
import type { Box } from '../../domain/types';
import { MAX_TEXT_LENGTH, ptToMm } from '../../domain/types';
import { FONT_FAMILIES, type LayoutTextElement } from '../text';
import { hitCanvasElements, resizeCanvasBox, type CanvasElement } from './scene-interaction';
import './canvas.css';
export type CanvasTransform = Partial<Box> & {
    rotation?: number;
};
export interface CanvasIssue {
    key: string;
    kind: string;
    box: Box;
    severity: 'error' | 'warning';
    message: string;
}
export interface CanvasAdapter<D, S> {
    id(document: D): string;
    size(document: D): {
        width: number;
        height: number;
    };
    elements(document: D): (CanvasElement<S> & {
        text?: LayoutTextElement;
    })[];
    key(selection: S): string;
    backgroundSelection: S;
    cycleOnClick: boolean;
    transform(document: D, selection: S, patch: CanvasTransform): D;
    commit(document: D, selection: S): void;
    updateText(selection: S, content: string): void;
    remove(selection: S): void;
    render(document: D): ReactNode;
    issues?(document: D): CanvasIssue[];
    label: string;
    deleteLabel?: string;
}
interface Props<D, S> {
    document: D;
    selection: S;
    onSelectionChange(selection: S): void;
    adapter: CanvasAdapter<D, S>;
    fitKey?: string | number;
}
interface Drag<D, S> {
    mode: 'move' | 'resize' | 'rotate';
    selection: S;
    handle?: string;
    startX: number;
    startY: number;
    original: D;
    moved: boolean;
    cycleOnClick: boolean;
}
const CSS_PIXELS_PER_MM = 96 / 25.4;
const clampScale = (value: number) => Math.max(0.5, Math.min(24, value));
const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
/** Both editors use one pointer/pinch/keyboard/inline-text interaction engine. */
export function SceneCanvas<D, S>({ document: source, selection, onSelectionChange, adapter, fitKey }: Props<D, S>) {
    const surface = useRef<HTMLDivElement>(null), artboard = useRef<HTMLDivElement>(null);
    const drag = useRef<Drag<D, S> | null>(null), draftRef = useRef<D | null>(null);
    const pointers = useRef(new Map<number, {
        x: number;
        y: number;
    }>());
    const pinch = useRef<{
        distance: number;
        scale: number;
    } | null>(null);
    const [draft, setDraft] = useState<D | null>(null), [scale, setScale] = useState(5);
    const [guides, setGuides] = useState<{
        x?: number;
        y?: number;
    }>({});
    const [editing, setEditing] = useState(false), [textValue, setTextValue] = useState('');
    const editedSelection = useRef<S>(selection), textarea = useRef<HTMLTextAreaElement>(null);
    const id = adapter.id(source), { width, height } = adapter.size(source);
    const displayed = draft && adapter.id(draft) === id ? draft : source;
    const elements = adapter.elements(displayed);
    const selected = elements.find(element => element.key === adapter.key(selection));
    const edited = editing ? elements.find(element => element.key === adapter.key(editedSelection.current)) : undefined;
    const box = selected?.box;
    const fit = useCallback(() => {
        const rect = surface.current?.getBoundingClientRect();
        if (rect)
            setScale(clampScale(Math.min((rect.width - 110) / width, (rect.height - 94) / height)));
    }, [width, height]);
    useEffect(() => { fit(); setDraft(null); draftRef.current = null; setEditing(false); }, [id, fitKey, fit]);
    useEffect(() => {
        const observer = new ResizeObserver(() => { if (!drag.current && !pointers.current.size)
            fit(); });
        if (surface.current)
            observer.observe(surface.current);
        return () => observer.disconnect();
    }, [fit]);
    useEffect(() => { if (editing) {
        textarea.current?.focus();
        textarea.current?.select();
    } }, [editing]);
    const localPoint = (clientX: number, clientY: number) => {
        const rect = artboard.current!.getBoundingClientRect();
        return { x: (clientX - rect.left) / scale, y: (clientY - rect.top) / scale };
    };
    const updateDraft = (value: D | null) => { draftRef.current = value; setDraft(value); };
    const finishEditing = () => { if (editing) {
        setEditing(false);
        if (textValue !== edited?.text?.content)
            adapter.updateText(editedSelection.current, textValue);
    } };
    const hits = (document: D, x: number, y: number) => hitCanvasElements(adapter.elements(document), x, y);
    const start = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (event.button !== 0 || (event.target as HTMLElement).closest('button,textarea,input'))
            return;
        if (editing) {
            finishEditing();
            return;
        }
        surface.current?.focus({ preventScroll: true });
        pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
        event.currentTarget.setPointerCapture(event.pointerId);
        if (pointers.current.size === 2) {
            const [a, b] = [...pointers.current.values()];
            pinch.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), scale };
            drag.current = null;
            updateDraft(null);
            return;
        }
        const handle = (event.target as HTMLElement).closest('[data-handle]')?.getAttribute('data-handle') ?? undefined;
        const point = localPoint(event.clientX, event.clientY);
        let chosen = selection, cycleOnClick = false;
        if (!handle) {
            const candidates = hits(source, point.x, point.y);
            const index = candidates.findIndex(element => element.key === adapter.key(selection));
            cycleOnClick = adapter.cycleOnClick && index >= 0;
            chosen = candidates[0]?.selection ?? adapter.backgroundSelection;
            if (adapter.cycleOnClick && index >= 0)
                chosen = selection;
            onSelectionChange(chosen);
        }
        const target = adapter.elements(source).find(element => element.key === adapter.key(chosen));
        if (!target || target.locked) {
            drag.current = null;
            return;
        }
        drag.current = { mode: handle === 'rotate' ? 'rotate' : handle ? 'resize' : 'move', selection: chosen, handle, startX: event.clientX, startY: event.clientY, original: source, moved: false, cycleOnClick };
    };
    const move = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (pointers.current.has(event.pointerId))
            pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (pinch.current && pointers.current.size >= 2) {
            const [a, b] = [...pointers.current.values()], initial = pinch.current;
            setScale(clampScale(initial.scale * Math.hypot(a.x - b.x, a.y - b.y) / Math.max(1, initial.distance)));
            return;
        }
        const operation = drag.current;
        if (!operation)
            return;
        const deltaX = event.clientX - operation.startX, deltaY = event.clientY - operation.startY;
        if (Math.hypot(deltaX, deltaY) < 3 && !operation.moved)
            return;
        operation.moved = true;
        const originalElements = adapter.elements(operation.original);
        const target = originalElements.find(element => element.key === adapter.key(operation.selection));
        if (!target || target.locked)
            return;
        const origin = target.box, dx = deltaX / scale, dy = deltaY / scale;
        const nextGuides: {
            x?: number;
            y?: number;
        } = {};
        let patch: CanvasTransform;
        if (operation.mode === 'rotate') {
            const point = localPoint(event.clientX, event.clientY);
            const degrees = Math.atan2(point.y - (origin.y + origin.height / 2), point.x - (origin.x + origin.width / 2)) * 180 / Math.PI + 90;
            const step = target.rotationStep || (event.shiftKey ? target.shiftRotationStep : undefined);
            patch = { rotation: step ? Math.round(degrees / step) * step : degrees };
        }
        else if (operation.mode === 'move') {
            patch = { x: origin.x + dx, y: origin.y + dy };
            if (target.resize !== 'none' && !event.altKey) {
                const others = originalElements.filter(element => element.key !== target.key && element.snapReference !== false);
                const refsX = [0, width / 2, width, ...others.flatMap(element => [element.box.x, element.box.x + element.box.width / 2, element.box.x + element.box.width])];
                const refsY = [0, height / 2, height, ...others.flatMap(element => [element.box.y, element.box.y + element.box.height / 2, element.box.y + element.box.height])];
                for (const axis of ['x', 'y'] as const) {
                    const size = axis === 'x' ? origin.width : origin.height, refs = axis === 'x' ? refsX : refsY;
                    let closest = 5 / scale;
                    for (const edge of [0, size / 2, size])
                        for (const ref of refs) {
                            const difference = ref - (patch[axis]! + edge);
                            if (Math.abs(difference) < closest) {
                                closest = Math.abs(difference);
                                nextGuides[axis] = ref;
                            }
                        }
                    if (nextGuides[axis] !== undefined) {
                        const ref = nextGuides[axis]!;
                        const edge = [0, size / 2, size].sort((a, b) => Math.abs(ref - patch[axis]! - a) - Math.abs(ref - patch[axis]! - b))[0];
                        patch[axis] = ref - edge;
                    }
                }
            }
        }
        else
            patch = resizeCanvasBox(target, operation.handle!, dx, dy, event.shiftKey);
        const next = adapter.transform(operation.original, operation.selection, patch);
        if (next === operation.original)
            return;
        setGuides(nextGuides);
        updateDraft(next);
    };
    const end = (event: ReactPointerEvent<HTMLDivElement>, cancelled = false) => {
        pointers.current.delete(event.pointerId);
        if (pinch.current) {
            if (pointers.current.size < 2)
                pinch.current = null;
            drag.current = null;
            return;
        }
        const operation = drag.current;
        drag.current = null;
        if (operation?.moved && draftRef.current && !cancelled)
            adapter.commit(draftRef.current, operation.selection);
        else if (operation?.cycleOnClick && !operation.moved && !operation.handle && !cancelled) {
            const point = localPoint(event.clientX, event.clientY), candidates = hits(source, point.x, point.y);
            const index = candidates.findIndex(element => element.key === adapter.key(selection));
            if (candidates.length > 1 && index >= 0)
                onSelectionChange(candidates[(index + 1) % candidates.length].selection);
        }
        updateDraft(null);
        setGuides({});
    };
    const remove = () => { if (selected && !selected.locked)
        adapter.remove(selection); };
    const renderHandle = (handle: string) => {
        const x = handle.includes('w') ? box!.x : handle.includes('e') ? box!.x + box!.width : box!.x + box!.width / 2;
        const y = handle.includes('n') ? box!.y : handle.includes('s') ? box!.y + box!.height : box!.y + box!.height / 2;
        return <g key={handle}><circle data-handle={handle} className="touch-handle-target" cx={x} cy={y} r={22 / scale} fill="transparent"/><circle data-handle={handle} className={`resize-handle resize-handle--${handle}`} cx={x} cy={y} r={3.5 / scale} strokeWidth={1.3 / scale}/></g>;
    };
    return <div ref={surface} className="editor-canvas" tabIndex={0} aria-label={adapter.label} onPointerDown={start} onPointerMove={move} onPointerUp={event => end(event)} onPointerCancel={event => end(event, true)} onDoubleClick={event => {
            const point = localPoint(event.clientX, event.clientY), candidates = hits(source, point.x, point.y);
            const candidate = adapter.cycleOnClick ? candidates.find(element => 'text' in element && element.text) : candidates[0];
            const text = candidate && adapter.elements(source).find(element => element.key === candidate.key)?.text;
            if (candidate && text && !candidate.locked) {
                onSelectionChange(candidate.selection);
                editedSelection.current = candidate.selection;
                setTextValue(text.content);
                setEditing(true);
            }
        }} onContextMenu={event => event.preventDefault()} onKeyDown={event => {
            if ((event.target as HTMLElement).matches('textarea,input'))
                return;
            if (event.key === 'Escape') {
                drag.current = null;
                pointers.current.clear();
                pinch.current = null;
                updateDraft(null);
                setGuides({});
            }
            if (event.key === 'Delete' || event.key === 'Backspace') {
                event.preventDefault();
                remove();
            }
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key) && selected && !selected.locked) {
                event.preventDefault();
                const step = event.shiftKey ? 2 : 0.5;
                const next = adapter.transform(source, selection, { x: selected.box.x + (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0), y: selected.box.y + (event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0) });
                if (next !== source)
                    adapter.commit(next, selection);
            }
        }}>
    <div className="canvas-zoom" onPointerDown={event => event.stopPropagation()}>
      <div className="canvas-zoom__readout"><output aria-label={t("editor.common.zoom.current")}>{Math.round(scale / CSS_PIXELS_PER_MM * 100)}%</output></div>
      <div className="canvas-zoom__actions" role="group" aria-label={t("editor.common.zoom.label")}>
        <button type="button" aria-label={t("editor.common.zoom.in")} onClick={() => setScale(value => clampScale(value * 1.15))}><Plus size={19}/></button>
        <button type="button" aria-label={t("editor.common.zoom.out")} onClick={() => setScale(value => clampScale(value / 1.15))}><Minus size={19}/></button>
        <button type="button" className="canvas-zoom__actual-size" aria-label={t("editor.common.zoom.actual")} title={t("editor.common.zoom.actualLabel")} aria-pressed={Math.abs(scale - CSS_PIXELS_PER_MM) < 0.000001} onClick={() => setScale(CSS_PIXELS_PER_MM)}>100%</button>
        <button type="button" aria-label={t("editor.common.zoom.fit")} onClick={fit}><Expand size={17}/></button>
      </div>
    </div>
    <div ref={artboard} className="canvas-artboard" style={{ width: width * scale, height: height * scale, transform: 'translate(-50%, -50%)' }}>
      {adapter.render(displayed)}
      <svg className="selection-overlay" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        {guides.x !== undefined && <line x1={guides.x} x2={guides.x} y1={-4} y2={height + 4} className="snap-guide" strokeWidth={1 / scale}/>}
        {guides.y !== undefined && <line y1={guides.y} y2={guides.y} x1={-4} x2={width + 4} className="snap-guide" strokeWidth={1 / scale}/>}
        {box && !editing && <g transform={selected?.rotation ? `rotate(${selected.rotation} ${box.x + box.width / 2} ${box.y + box.height / 2})` : undefined}>
          <rect x={box.x} y={box.y} width={box.width} height={box.height} fill="none" stroke="#fff" strokeWidth={3.5 / scale} strokeDasharray={selected?.locked ? `${3 / scale} ${2 / scale}` : undefined}/>
          <rect className="selection-frame" x={box.x} y={box.y} width={box.width} height={box.height} fill="none" stroke="#315c4c" strokeWidth={1.5 / scale} strokeDasharray={selected?.locked ? `${3 / scale} ${2 / scale}` : undefined}/>
          {!selected?.locked && selected?.resize !== 'none' && handles.map(renderHandle)}
          {!selected?.locked && selected?.rotationStep !== undefined && <><line x1={box.x + box.width / 2} x2={box.x + box.width / 2} y1={box.y} y2={box.y - 22 / scale} stroke="#315c4c" strokeWidth={1 / scale}/><circle data-handle="rotate" className="rotation-handle" cx={box.x + box.width / 2} cy={box.y - 22 / scale} r={4 / scale} strokeWidth={1.2 / scale}/></>}
        </g>}
        {adapter.issues?.(displayed).map(issue => <g key={issue.key} data-element-issue={issue.kind} data-severity={issue.severity} transform={`translate(${issue.box.x} ${issue.box.y - 3})`}><title>{issue.message}</title><circle r={7 / scale} fill={issue.severity === 'error' ? '#c64343' : '#c59b43'}/><text textAnchor="middle" dy={3.5 / scale} fill="white" fontSize={11 / scale}>!</text></g>)}
      </svg>
      {box && !editing && selected?.deleteAction && !selected.locked && <div className="element-actions" style={{ left: (box.x + box.width) * scale + 24, top: (box.y + box.height) * scale + 24 }} onPointerDown={event => event.stopPropagation()}><button type="button" aria-label={adapter.deleteLabel ?? t("editor.common.deleteDecoration")} onClick={remove}><Trash2 size={14}/></button></div>}
      {editing && edited?.text && <textarea ref={textarea} className="inline-text-editor" aria-label={t("editor.common.canvasText")} value={textValue} maxLength={MAX_TEXT_LENGTH} style={{ left: edited.box.x * scale, top: edited.box.y * scale, width: edited.box.width * scale, height: Math.max(edited.box.height * scale, 44), fontFamily: FONT_FAMILIES[edited.text.fontId], fontSize: ptToMm(edited.text.fontSize) * scale, fontWeight: edited.text.weight, fontStyle: edited.text.italic ? 'italic' : 'normal', textAlign: edited.text.align, color: edited.text.color, lineHeight: edited.text.lineHeight ?? 1.22, letterSpacing: ptToMm(edited.text.letterSpacing ?? 0) * scale, transform: edited.rotation ? `rotate(${edited.rotation}deg)` : undefined, transformOrigin: `${edited.box.width * scale / 2}px ${edited.box.height * scale / 2}px` } as CSSProperties} onChange={event => { setTextValue(event.target.value); adapter.updateText(editedSelection.current, event.target.value); }} onBlur={finishEditing} onKeyDown={event => {
                event.stopPropagation();
                if (event.key === 'Escape' || event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                    event.preventDefault();
                    finishEditing();
                }
            }} onPaste={event => {
                event.preventDefault();
                const input = event.currentTarget, value = event.clipboardData.getData('text/plain').replace(/\r\n?/g, '\n');
                const start = input.selectionStart, end = input.selectionEnd, limit = MAX_TEXT_LENGTH - (textValue.length - (end - start)), inserted = value.slice(0, Math.max(0, limit));
                const content = textValue.slice(0, start) + inserted + textValue.slice(end);
                setTextValue(content);
                adapter.updateText(editedSelection.current, content);
                requestAnimationFrame(() => input.setSelectionRange(start + inserted.length, start + inserted.length));
            }}/>}
    </div>
  </div>;
}
