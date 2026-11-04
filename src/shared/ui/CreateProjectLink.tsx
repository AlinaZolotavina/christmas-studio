import { ArrowRight } from 'lucide-react';

export function CreateProjectLink({ className = '', direction }: { className?: string; direction?: 'tags' | 'postcards' }) {
  return <a href={direction ? `#${direction}` : '#create'} className={`public-button public-button--pill ${className}`}>Создать проект <ArrowRight size={19} aria-hidden="true" /></a>;
}
