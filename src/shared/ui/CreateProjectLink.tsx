import { ArrowRight } from 'lucide-react';

export function CreateProjectLink({ className = '' }: { className?: string }) {
  return <a href="#tags" className={`public-button public-button--pill ${className}`}>Создать проект <ArrowRight size={19} aria-hidden="true" /></a>;
}
