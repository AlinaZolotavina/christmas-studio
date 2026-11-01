import { useEffect, useId, useLayoutEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './tooltip.css';

export function IconButton({ label, children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const button = useRef<HTMLButtonElement>(null);
  const tooltip = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = useId();
  const clear = () => { if (timer.current !== null) clearTimeout(timer.current); };
  const show = () => { clear(); timer.current = setTimeout(() => setVisible(true), 500); };
  const hide = () => { clear(); timer.current = setTimeout(() => setVisible(false), 200); };
  useEffect(() => () => { if (timer.current !== null) clearTimeout(timer.current); }, []);
  useLayoutEffect(() => {
    if (!visible || !button.current || !tooltip.current) return;
    const rect = button.current.getBoundingClientRect(), hint = tooltip.current.getBoundingClientRect();
    setPosition({ left: Math.max(8, Math.min(innerWidth - hint.width - 8, rect.left + rect.width / 2 - hint.width / 2)), top: rect.bottom + hint.height + 16 > innerHeight ? rect.top - hint.height - 8 : rect.bottom + 8 });
    const dismiss = (event: Event) => { if (!button.current?.contains(event.target as Node) && !tooltip.current?.contains(event.target as Node)) setVisible(false); };
    const viewport = () => setVisible(false);
    document.addEventListener('pointerdown', dismiss);
    window.addEventListener('resize', viewport);
    window.addEventListener('scroll', viewport, true);
    return () => { document.removeEventListener('pointerdown', dismiss); window.removeEventListener('resize', viewport); window.removeEventListener('scroll', viewport, true); };
  }, [visible, label]);
  return <><button ref={button} type="button" className={`icon-button ${className}`} aria-label={label} {...props} aria-describedby={visible ? [props['aria-describedby'], tooltipId].filter(Boolean).join(' ') : props['aria-describedby']} onPointerEnter={event => { if (event.pointerType !== 'touch') show(); props.onPointerEnter?.(event); }} onPointerLeave={event => { hide(); props.onPointerLeave?.(event); }} onFocus={event => { show(); props.onFocus?.(event); }} onBlur={event => { clear(); setVisible(false); props.onBlur?.(event); }} onPointerDown={event => { if (event.pointerType === 'touch') { clear(); setVisible(value => !value); } props.onPointerDown?.(event); }}>{children}</button>{visible && createPortal(<div ref={tooltip} id={tooltipId} className="studio-tooltip" role="tooltip" style={position} onPointerEnter={clear} onPointerLeave={hide}>{label}</div>, document.body)}</>;
}

export function Button({ children, className = '', variant = 'primary', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'quiet'; children: ReactNode }) {
  return <button type="button" className={`button button--${variant} ${className}`} {...props}>{children}</button>;
}

export function Field({ label, children, hint, className = '' }: { label: string; children: ReactNode; hint?: string; className?: string }) {
  return <label className={`field ${className}`}><span className="field__label">{label}</span>{children}{hint && <span className="field__hint">{hint}</span>}</label>;
}

export function ColorPalette({ value, onChange, colors = ['#315C4C', '#923C42', '#C99C56', '#E8D8BE', '#D9E7EC', '#FFFFFF', '#262B28'] }: { value: string; onChange: (color: string) => void; colors?: string[] }) {
  return <div className="color-palette">{colors.map((color) => <button key={color} type="button" className={`color-swatch ${value.toLowerCase() === color.toLowerCase() ? 'is-selected' : ''}`} style={{ backgroundColor: color }} aria-label={`Цвет ${color}`} aria-pressed={value.toLowerCase() === color.toLowerCase()} onClick={() => onChange(color)} />)}<label className="color-custom" title="Выбрать свой цвет"><span>+</span><input aria-label="Произвольный цвет" type="color" value={value} onChange={(event) => onChange(event.target.value)} /></label></div>;
}
