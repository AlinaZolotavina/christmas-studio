import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './Controls';

export function Modal({ title, children, onClose, footer, wide = false, className = '' }: { title: string; children: ReactNode; onClose: () => void; footer?: ReactNode; wide?: boolean; className?: string }) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.stopPropagation(); close.current(); }
      if (event.key !== 'Tab') return;
      const items = panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]');
      if (!items?.length) { event.preventDefault(); return; }
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel.current)) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => { document.body.style.overflow = oldOverflow; document.removeEventListener('keydown', handleKey); previous?.focus(); };
  }, []);
  return <div className="modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div ref={panel} className={`modal ${wide ? 'modal--wide' : ''} ${className}`} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}><header className="modal__header"><h2 id={titleId}>{title}</h2><IconButton label="Закрыть окно" onClick={onClose}><X size={20} /></IconButton></header><div className="modal__body">{children}</div>{footer && <footer className="modal__footer">{footer}</footer>}</div></div>;
}
