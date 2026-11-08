import { ArrowRight } from 'lucide-react';
import type { MouseEventHandler } from 'react';

export function CreateProjectLink({ className = '', direction, onClick }: { className?: string; direction?: 'tags' | 'postcards'; onClick?: MouseEventHandler<HTMLAnchorElement> }) {
  return <a href={direction ? `#${direction}` : '#create'} className={`public-button public-button--pill ${className}`} onClick={onClick}>Создать проект <ArrowRight size={19} aria-hidden="true" /></a>;
}
