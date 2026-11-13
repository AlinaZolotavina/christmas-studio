import { useEffect, useRef, useState } from 'react';
import { t } from '../../i18n';

export function SheetHandle({ onClose }: { onClose: () => void }) {
    const start = useRef<{ y: number; height: number; base: number; max: number; sheet: HTMLElement } | null>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [expanded, setExpanded] = useState(false);
    useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);
    const settle = (height: number) => {
        const drag = start.current;
        if (!drag) return;
        start.current = null;
        drag.sheet.classList.remove('bottom-sheet--dragging');
        const target = [0, drag.base, drag.max].reduce((nearest, candidate) => Math.abs(candidate - height) < Math.abs(nearest - height) ? candidate : nearest, drag.base);
        setExpanded(target === drag.max);
        drag.sheet.classList.toggle('bottom-sheet--expanded', target === drag.max);
        drag.sheet.style.height = `${target}px`;
        if (target === 0) closeTimer.current = setTimeout(onClose, 220);
        else drag.sheet.style.removeProperty('height');
    };
    return <button type="button" className="sheet-resize-handle" aria-label={t('common.resizePanel')} aria-expanded={expanded}
        onClick={event => { if (event.detail === 0) { const next = !expanded; setExpanded(next); event.currentTarget.closest('.bottom-sheet')?.classList.toggle('bottom-sheet--expanded', next); } }}
        onPointerDown={event => {
            const sheet = event.currentTarget.closest<HTMLElement>('.bottom-sheet');
            if (!sheet || closeTimer.current) return;
            const height = sheet.getBoundingClientRect().height;
            const max = sheet.parentElement?.clientHeight ?? height;
            const base = max * (sheet.closest('.postcard-studio') ? 0.8 : 0.75);
            start.current = { y: event.clientY, height, base, max, sheet };
            sheet.style.height = `${height}px`;
            sheet.classList.add('bottom-sheet--dragging');
            event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={event => {
            const drag = start.current;
            if (drag) drag.sheet.style.height = `${Math.min(drag.max, Math.max(0, drag.height + drag.y - event.clientY))}px`;
        }}
        onPointerUp={event => {
            const drag = start.current;
            if (drag) settle(Math.min(drag.max, Math.max(0, drag.height + drag.y - event.clientY)));
        }} onPointerCancel={() => { if (start.current) settle(start.current.height); }}><span /></button>;
}
