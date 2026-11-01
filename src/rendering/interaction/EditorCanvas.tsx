import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { Expand, Minus, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import type { Command } from '../../domain/commands';
import type { Box, Card, Selection } from '../../domain/types';
import { MAX_TEXT_LENGTH, ptToMm } from '../../domain/types';
import { holeDiameter, isHoleInside, rotatePoint } from '../../domain/geometry';
import { validateCard } from '../../domain/validation';
import { FONT_FAMILIES, layoutText } from '../text';
import { CardSvg } from '../CardSvg';
import './canvas.css';

interface Props {
  card: Card;
  selection: Selection;
  onSelectionChange: (selection: Selection) => void;
  onCommit: (command: Command) => unknown;
  fitKey?: string | number;
}
interface Drag {
  mode: 'move' | 'resize' | 'rotate';
  selection: Selection;
  handle?: string;
  startX: number;
  startY: number;
  original: Card;
  moved: boolean;
  cycleOnClick: boolean;
}
const same = (a: Selection, b: Selection) => a.kind === b.kind && a.decorationId === b.decorationId;
const clampScale = (value: number) => Math.max(0.5, Math.min(24, value));
const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

function selectedBox(card: Card, selection: Selection): Box | null {
  if (selection.kind === 'text') return card.text;
  if (selection.kind === 'illustration') return card.illustration;
  if (selection.kind === 'decoration') return card.decorations.find(item => item.id === selection.decorationId) ?? null;
  if (selection.kind === 'hole' && card.hole) {
    const d = holeDiameter(card);
    return { x: card.hole.x - d / 2, y: card.hole.y - d / 2, width: d, height: d };
  }
  return null;
}
function hitSelections(card: Card, x: number, y: number): Selection[] {
  const inside = (box: Box, rotation = 0) => {
    const [px, py] = rotatePoint(x, y, box.x + box.width / 2, box.y + box.height / 2, -rotation);
    return px >= box.x && py >= box.y && px <= box.x + box.width && py <= box.y + box.height;
  };
  const result: Selection[] = [];
  if (card.hole && Math.hypot(x - card.hole.x, y - card.hole.y) <= holeDiameter(card) / 2 + 0.8) result.push({ kind: 'hole' });
  if (inside(card.text)) result.push({ kind: 'text' });
  if (inside(card.illustration, card.illustration.rotation)) result.push({ kind: 'illustration' });
  card.decorations.slice().reverse().forEach(item => { if (inside(item)) result.push({ kind: 'decoration', decorationId: item.id }); });
  return result;
}

export function EditorCanvas({ card, selection, onSelectionChange, onCommit, fitKey }: Props) {
  const surface = useRef<HTMLDivElement>(null);
  const artboard = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ distance: number; scale: number } | null>(null);
  const draftRef = useRef<Card | null>(null);
  const [draft, setDraft] = useState<Card | null>(null);
  const [scale, setScale] = useState(5);
  const [guides, setGuides] = useState<{ x?: number; y?: number }>({});
  const [editing, setEditing] = useState(false);
  const [textValue, setTextValue] = useState('');
  const [context, setContext] = useState<{ x: number; y: number } | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const displayed = draft?.id === card.id ? draft : card;
  const liveIssues = validateCard(displayed, { textOverflow: layoutText(displayed.text).overflow });
  const issueElements = (['text', 'illustration', 'decoration'] as const).flatMap(kind => {
    const issues = liveIssues.filter(issue => issue.element === kind);
    if (!issues.length) return [];
    const issueBox = kind === 'text' ? displayed.text : kind === 'illustration' ? displayed.illustration : displayed.decorations.find(item => item.id === selection.decorationId) ?? displayed.decorations[0];
    return issueBox ? [{ kind, box: issueBox, severity: issues.some(issue => issue.severity === 'error') ? 'error' : 'warning', message: issues.map(issue => issue.message).join(' ') }] : [];
  });
  const box = selectedBox(displayed, selection);
  const rotation = selection.kind === 'illustration' ? displayed.illustration.rotation : 0;
  const fit = useCallback(() => {
    const rect = surface.current?.getBoundingClientRect();
    if (rect) setScale(clampScale(Math.min((rect.width - 110) / card.width, (rect.height - 94) / card.height)));
  }, [card.width, card.height]);

  useEffect(() => { fit(); setDraft(null); draftRef.current = null; setEditing(false); setContext(null); }, [card.id, fitKey, fit]);
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      // Initial mount can happen before the grid has its final size.
      if (!drag.current && !pointers.current.size) fit();
    });
    if (surface.current) observer.observe(surface.current);
    return () => observer.disconnect();
  }, [fit]);
  useEffect(() => {
    if (editing) { textarea.current?.focus(); textarea.current?.select(); }
  }, [editing]);

  const localPoint = (clientX: number, clientY: number) => {
    const rect = artboard.current!.getBoundingClientRect();
    return { x: (clientX - rect.left) / scale, y: (clientY - rect.top) / scale };
  };
  const updateDraft = (value: Card | null) => { draftRef.current = value; setDraft(value); };
  const commitTransform = (value: Card, chosen: Selection) => {
    if (chosen.kind === 'text') onCommit({ type: 'update-text', cardId: card.id, patch: { x: value.text.x, y: value.text.y, width: value.text.width, height: value.text.height } });
    if (chosen.kind === 'illustration') onCommit({ type: 'update-illustration', cardId: card.id, patch: value.illustration });
    if (chosen.kind === 'decoration') {
      const item = value.decorations.find(item => item.id === chosen.decorationId);
      if (item) onCommit({ type: 'update-decoration', cardId: card.id, decorationId: item.id, patch: item });
    }
    if (chosen.kind === 'hole' && value.hole) onCommit({ type: 'move-hole', cardId: card.id, patch: value.hole });
  };
  const finishEditing = () => {
    if (!editing) return;
    setEditing(false);
    if (textValue !== card.text.content) onCommit({ type: 'update-text', cardId: card.id, patch: { content: textValue } });
  };

  const start = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || (event.target as HTMLElement).closest('button,textarea,input,[role="menu"]')) return;
    if (editing) { finishEditing(); return; }
    setContext(null);
    surface.current?.focus({ preventScroll: true });
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    event.currentTarget.setPointerCapture(event.pointerId);
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), scale };
      drag.current = null; updateDraft(null); return;
    }
    const handle = (event.target as HTMLElement).closest('[data-handle]')?.getAttribute('data-handle') ?? undefined;
    const point = localPoint(event.clientX, event.clientY);
    let chosen = selection;
    let cycleOnClick = false;
    if (!handle) {
      const hits = hitSelections(card, point.x, point.y);
      const index = hits.findIndex(item => same(item, selection));
      cycleOnClick = index >= 0;
      chosen = hits.length ? hits[(index + 1) % hits.length] : { kind: 'card' };
      // Begin dragging an already selected element; repeated unmoved clicks can cycle it.
      if (index >= 0) chosen = selection;
      onSelectionChange(chosen);
    }
    if (chosen.kind === 'card') { drag.current = null; return; }
    drag.current = { mode: handle === 'rotate' ? 'rotate' : handle ? 'resize' : 'move', selection: chosen, handle, startX: event.clientX, startY: event.clientY, original: structuredClone(card), moved: false, cycleOnClick };
  };

  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointers.current.has(event.pointerId)) pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pinch.current && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const initial = pinch.current;
      setScale(clampScale(initial.scale * Math.hypot(a.x - b.x, a.y - b.y) / Math.max(1, initial.distance)));
      return;
    }
    const operation = drag.current;
    if (!operation) return;
    const deltaX = event.clientX - operation.startX;
    const deltaY = event.clientY - operation.startY;
    if (Math.hypot(deltaX, deltaY) < 3 && !operation.moved) return;
    operation.moved = true;
    const next = structuredClone(operation.original);
    const target = selectedBox(next, operation.selection);
    const origin = selectedBox(operation.original, operation.selection);
    if (!target || !origin) return;
    const dx = deltaX / scale, dy = deltaY / scale;
    const nextGuides: { x?: number; y?: number } = {};
    if (operation.mode === 'rotate') {
      const point = localPoint(event.clientX, event.clientY);
      const degrees = Math.atan2(point.y - (origin.y + origin.height / 2), point.x - (origin.x + origin.width / 2)) * 180 / Math.PI + 90;
      next.illustration.rotation = event.shiftKey ? Math.round(degrees / 15) * 15 : degrees;
    } else if (operation.mode === 'move') {
      target.x += dx; target.y += dy;
      if (operation.selection.kind !== 'hole' && !event.altKey) {
        const others = [next.text, next.illustration, ...next.decorations].filter(item => item !== target);
        const refsX = [0, next.width / 2, next.width, ...others.flatMap(item => [item.x, item.x + item.width / 2, item.x + item.width])];
        const refsY = [0, next.height / 2, next.height, ...others.flatMap(item => [item.y, item.y + item.height / 2, item.y + item.height])];
        for (const axis of ['x', 'y'] as const) {
          const size = axis === 'x' ? target.width : target.height;
          const refs = axis === 'x' ? refsX : refsY;
          let closest = 5 / scale;
          for (const edge of [0, size / 2, size]) for (const ref of refs) {
            const difference = ref - (target[axis] + edge);
            if (Math.abs(difference) < closest) { closest = Math.abs(difference); nextGuides[axis] = ref; }
          }
          if (nextGuides[axis] !== undefined) {
            const ref = nextGuides[axis]!;
            const edge = [0, size / 2, size].sort((a, b) => Math.abs(ref - target[axis] - a) - Math.abs(ref - target[axis] - b))[0];
            target[axis] = ref - edge;
          }
        }
      }
    } else {
      const handle = operation.handle!;
      const angle = operation.selection.kind === 'illustration' ? operation.original.illustration.rotation : 0;
      const [localDx, localDy] = rotatePoint(dx, dy, 0, 0, -angle);
      const signX = handle.includes('w') ? -1 : handle.includes('e') ? 1 : 0;
      const signY = handle.includes('n') ? -1 : handle.includes('s') ? 1 : 0;
      let width = Math.max(1, origin.width + localDx * signX);
      let height = Math.max(1, origin.height + localDy * signY);
      const decoration = operation.selection.kind === 'decoration';
      if (operation.selection.kind === 'illustration' || (decoration && event.shiftKey)) {
        const ratio = origin.width / origin.height;
        if (signX) height = width / ratio; else width = height * ratio;
        if (decoration) {
          const sizeScale = Math.min(1, 20 / width, 20 / height);
          width *= sizeScale; height *= sizeScale;
        }
      } else if (decoration) {
        width = Math.min(20, width); height = Math.min(20, height);
      }
      const centerDx = signX * (width - origin.width) / 2;
      const centerDy = signY * (height - origin.height) / 2;
      const [shiftX, shiftY] = rotatePoint(centerDx, centerDy, 0, 0, angle);
      Object.assign(target, { x: origin.x + origin.width / 2 + shiftX - width / 2, y: origin.y + origin.height / 2 + shiftY - height / 2, width, height });
    }
    if (operation.selection.kind === 'hole' && next.hole) {
      const candidate = { x: operation.original.hole!.x + dx, y: operation.original.hole!.y + dy };
      if (!isHoleInside(next, candidate)) return;
      next.hole = candidate;
    }
    setGuides(nextGuides); updateDraft(next);
  };

  const end = (event: ReactPointerEvent<HTMLDivElement>, cancelled = false) => {
    pointers.current.delete(event.pointerId);
    if (pinch.current) { if (pointers.current.size < 2) pinch.current = null; drag.current = null; return; }
    const operation = drag.current;
    drag.current = null;
    if (operation?.moved && draftRef.current && !cancelled) commitTransform(draftRef.current, operation.selection);
    else if (operation && operation.cycleOnClick && !operation.moved && !operation.handle && !cancelled) {
      const point = localPoint(event.clientX, event.clientY);
      const hits = hitSelections(card, point.x, point.y);
      const index = hits.findIndex(item => same(item, selection));
      if (hits.length > 1 && index >= 0) onSelectionChange(hits[(index + 1) % hits.length]);
    }
    updateDraft(null); setGuides({});
  };
  const remove = () => {
    if (selection.kind === 'decoration' && selection.decorationId) { onCommit({ type: 'remove-decoration', cardId: card.id, decorationId: selection.decorationId }); onSelectionChange({ kind: 'card' }); }
    setContext(null);
  };
  const zoom = (factor: number) => { setScale(value => clampScale(value * factor)); setContext(null); };
  const renderHandle = (handle: string) => {
    const x = handle.includes('w') ? box!.x : handle.includes('e') ? box!.x + box!.width : box!.x + box!.width / 2;
    const y = handle.includes('n') ? box!.y : handle.includes('s') ? box!.y + box!.height : box!.y + box!.height / 2;
    return <g key={handle}><circle data-handle={handle} className="touch-handle-target" cx={x} cy={y} r={22 / scale} fill="transparent" /><circle data-handle={handle} className={`resize-handle resize-handle--${handle}`} cx={x} cy={y} r={3.5 / scale} strokeWidth={1.3 / scale} /></g>;
  };

  return <div ref={surface} className="editor-canvas" tabIndex={0} aria-label="Редактор карточки. Выберите элемент для перемещения и изменения размера" onPointerDown={start} onPointerMove={move} onPointerUp={event => end(event)} onPointerCancel={event => end(event, true)} onDoubleClick={event => {
    const point = localPoint(event.clientX, event.clientY);
    if (hitSelections(card, point.x, point.y).some(item => item.kind === 'text')) { onSelectionChange({ kind: 'text' }); setTextValue(card.text.content); setEditing(true); }
  }} onContextMenu={event => {
    event.preventDefault();
    const point = localPoint(event.clientX, event.clientY);
    const hits = hitSelections(card, point.x, point.y);
    if (hits.length && !hits.some(item => same(item, selection))) onSelectionChange(hits[0]);
    const rect = surface.current!.getBoundingClientRect();
    setContext({ x: Math.max(8, Math.min(rect.width - 230, event.clientX - rect.left)), y: Math.max(8, Math.min(rect.height - 150, event.clientY - rect.top)) });
  }} onKeyDown={event => {
    if ((event.target as HTMLElement).matches('textarea,input')) return;
    if (event.key === 'Escape') { drag.current = null; pointers.current.clear(); pinch.current = null; updateDraft(null); setGuides({}); setContext(null); }
    if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); remove(); }
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key) && selection.kind !== 'card') {
      event.preventDefault();
      const next = structuredClone(card), target = selectedBox(next, selection), step = event.shiftKey ? 2 : 0.5;
      if (target) { target.x += event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0; target.y += event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0; if (selection.kind === 'hole' && next.hole) next.hole = { x: target.x + target.width / 2, y: target.y + target.height / 2 }; commitTransform(next, selection); }
    }
  }}>
    <div className="canvas-zoom" onPointerDown={event => event.stopPropagation()}><span>{Math.round(scale / (96 / 25.4) * 100)}%</span><button type="button" aria-label="Приблизить" onClick={() => zoom(1.15)}><Plus size={19} /></button><button type="button" aria-label="Отдалить" onClick={() => zoom(1 / 1.15)}><Minus size={19} /></button><button type="button" aria-label="Вписать карточку" onClick={fit}><Expand size={17} /></button></div>
    <div ref={artboard} className="canvas-artboard" style={{ width: card.width * scale, height: card.height * scale, transform: 'translate(-50%, -50%)' }}>
      <CardSvg card={displayed} idPrefix="editable" />
      <svg className="selection-overlay" viewBox={`0 0 ${card.width} ${card.height}`} aria-hidden="true">
        {guides.x !== undefined && <line x1={guides.x} x2={guides.x} y1={-4} y2={card.height + 4} className="snap-guide" strokeWidth={1 / scale} />}
        {guides.y !== undefined && <line y1={guides.y} y2={guides.y} x1={-4} x2={card.width + 4} className="snap-guide" strokeWidth={1 / scale} />}
        {box && !editing && <g transform={rotation ? `rotate(${rotation} ${box.x + box.width / 2} ${box.y + box.height / 2})` : undefined}>
          <rect x={box.x} y={box.y} width={box.width} height={box.height} fill="none" stroke="#315c4c" strokeWidth={1.2 / scale} />
          {selection.kind !== 'hole' && handles.map(renderHandle)}
          {selection.kind === 'illustration' && <><line x1={box.x + box.width / 2} x2={box.x + box.width / 2} y1={box.y} y2={box.y - 22 / scale} stroke="#315c4c" strokeWidth={1 / scale} /><circle data-handle="rotate" className="rotation-handle" cx={box.x + box.width / 2} cy={box.y - 22 / scale} r={4 / scale} strokeWidth={1.2 / scale} /></>}
        </g>}
        {issueElements.map(issue => <g key={issue.kind} data-element-issue={issue.kind} data-severity={issue.severity} transform={`translate(${issue.box.x} ${issue.box.y - 3})`}><title>{issue.message}</title><circle r={7 / scale} fill={issue.severity === 'error' ? '#c64343' : '#c59b43'} /><text textAnchor="middle" dy={3.5 / scale} fill="white" fontSize={11 / scale}>!</text></g>)}
      </svg>
      {box && !editing && <div className="element-actions" style={{ left: (box.x + box.width) * scale + 8, top: box.y * scale - 8 }} onPointerDown={event => event.stopPropagation()}>
        {selection.kind === 'decoration' && <button aria-label="Удалить декорацию" onClick={remove}><Trash2 size={15} /></button>}
        <button aria-label="Действия с элементом" onClick={() => { const rect = surface.current!.getBoundingClientRect(); setContext({ x: Math.min(rect.width - 230, Math.max(8, rect.width / 2)), y: Math.min(rect.height - 150, Math.max(8, rect.height / 2)) }); }}><MoreHorizontal size={16} /></button>
      </div>}
      {editing && <textarea ref={textarea} className="inline-text-editor" aria-label="Текст на холсте" value={textValue} maxLength={MAX_TEXT_LENGTH} style={{ left: card.text.x * scale, top: card.text.y * scale, width: card.text.width * scale, height: Math.max(card.text.height * scale, 44), fontFamily: FONT_FAMILIES[card.text.fontId], fontSize: ptToMm(card.text.fontSize) * scale, fontWeight: card.text.weight, fontStyle: card.text.italic ? 'italic' : 'normal', textAlign: card.text.align, color: card.text.color, lineHeight: 1.22 } as CSSProperties} onChange={event => { setTextValue(event.target.value); onCommit({ type: 'update-text', cardId: card.id, patch: { content: event.target.value } }); }} onBlur={finishEditing} onKeyDown={event => {
        event.stopPropagation();
        if (event.key === 'Escape' || (event.key === 'Enter' && (event.ctrlKey || event.metaKey))) { event.preventDefault(); finishEditing(); }
      }} onPaste={event => { event.preventDefault(); const input = event.currentTarget; const value = event.clipboardData.getData('text/plain').replace(/\r\n?/g, '\n'); const start = input.selectionStart, end = input.selectionEnd; const limit = MAX_TEXT_LENGTH - (textValue.length - (end - start)); const inserted = value.slice(0, Math.max(0, limit)); const content = textValue.slice(0, start) + inserted + textValue.slice(end); setTextValue(content); onCommit({ type: 'update-text', cardId: card.id, patch: { content } }); requestAnimationFrame(() => input.setSelectionRange(start + inserted.length, start + inserted.length)); }} />}
    </div>
    {context && <><button className="canvas-menu-dismiss" aria-label="Закрыть контекстное меню" onClick={() => setContext(null)} /><div className="canvas-context-menu" role="menu" style={{ left: context.x, top: context.y }} onPointerDown={event => event.stopPropagation()}>
      <strong>{({ text: 'Текст', illustration: 'Иллюстрация', decoration: 'Декорация', hole: 'Отверстие', card: 'Карточка' })[selection.kind]}</strong>
      {selection.kind === 'text' && <button role="menuitem" onClick={() => { setContext(null); setTextValue(card.text.content); setEditing(true); }}>Редактировать текст</button>}
      <button role="menuitem" onClick={() => { setContext(null); fit(); }}>Вписать карточку</button>
      {selection.kind === 'decoration' && <button role="menuitem" className="danger-text" onClick={remove}>Удалить декорацию</button>}
      <button role="menuitem" onClick={() => { onSelectionChange({ kind: 'card' }); setContext(null); }}>Снять выделение</button>
    </div></>}
  </div>;
}

export default EditorCanvas;
