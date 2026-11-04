import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './Controls';

const modalStack: symbol[] = [];
let originalOverflow = '';

export function Modal({ title, children, onClose, footer, wide = false, headerless = false, className = '', overlayClassName = '' }: { title: string; children: ReactNode; onClose: () => void; footer?: ReactNode; wide?: boolean; headerless?: boolean; className?: string; overlayClassName?: string }) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const identity = Symbol('modal');
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (modalStack.length === 0) originalOverflow = document.body.style.overflow;
    modalStack.push(identity);
    document.body.style.overflow = 'hidden';
    panel.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (modalStack.at(-1) !== identity) return;
      if (event.key === 'Escape') { event.stopPropagation(); close.current(); }
      if (event.key !== 'Tab') return;
      const items = panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]');
      if (!items?.length) { event.preventDefault(); return; }
      const first = items[0], last = items[items.length - 1];
      if (!panel.current?.contains(document.activeElement)) { event.preventDefault(); first.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel.current)) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      const index = modalStack.indexOf(identity);
      if (index >= 0) modalStack.splice(index, 1);
      if (modalStack.length === 0) document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKey);
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return <div className={`modal-overlay ${overlayClassName}`} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div ref={panel} className={`modal ${wide ? 'modal--wide' : ''} ${headerless ? 'modal--headerless' : ''} ${className}`} role="dialog" aria-modal="true" aria-labelledby={headerless ? undefined : titleId} aria-label={headerless ? title : undefined} tabIndex={-1}>{headerless ? <div className="modal__close"><IconButton label="Закрыть окно" onClick={onClose}><X size={20} /></IconButton></div> : <header className="modal__header"><h2 id={titleId}>{title}</h2><IconButton label="Закрыть окно" onClick={onClose}><X size={20} /></IconButton></header>}<div className="modal__body">{children}</div>{footer && <footer className="modal__footer">{footer}</footer>}</div></div>;
}
