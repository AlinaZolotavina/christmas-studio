import './bow-divider.css';

export function BowDivider({ className = '' }: { className?: string }) {
  return <div className={`bow-divider ${className}`} aria-hidden="true"><span /><svg width="42" height="28" viewBox="0 0 42 28" fill="none"><path d="M21 13C7-3 1 5 7 12c4 4 10 1 14 1Zm0 0C35-3 41 5 35 12c-4 4-10 1-14 1Zm0 0-8 12m8-12 8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg><span /></div>;
}
