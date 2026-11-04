import { FilePlus2, FolderOpen } from 'lucide-react';
import { Button } from '../../shared/ui/Controls';
import './saved-project-notice.css';

export function SavedProjectNotice({ name, status, description, label, className = '', onContinue, onNew }: {
  name: string; status: string; description: string; label: string; className?: string; onContinue: () => void; onNew: () => void;
}) {
  return <section className={`saved-project ${className}`} aria-label={label}>
    <div><span className="saved-project__status">{status}</span><h2>{name}</h2><p>{description}</p></div>
    <div className="saved-project__actions"><Button onClick={onContinue}><FolderOpen size={17} />Продолжить</Button><Button variant="secondary" onClick={onNew}><FilePlus2 size={17} />Начать новый</Button></div>
  </section>;
}
