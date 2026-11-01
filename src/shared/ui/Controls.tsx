import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function IconButton({ label, children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode }) {
  return <button type="button" className={`icon-button ${className}`} aria-label={label} title={label} {...props}>{children}</button>;
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
