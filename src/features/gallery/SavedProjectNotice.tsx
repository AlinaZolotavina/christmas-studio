import { t } from '../../i18n';
import { FilePlus2, FolderOpen } from 'lucide-react';
import { Button } from '../../shared/ui/Controls';
import './saved-project-notice.css';
export function SavedProjectNotice({ name, status, description, label, className = '', compact = false, onContinue, onNew }: {
    name: string;
    status: string;
    description: string;
    label: string;
    className?: string;
    compact?: boolean;
    onContinue: () => void;
    onNew: () => void;
}) {
    return <section className={`saved-project ${compact ? 'saved-project--compact' : ''} ${className}`} aria-label={label}>
    <div><span className="saved-project__status">{status}</span><h2 className="saved-project__name" title={compact ? name : undefined}>{name}</h2><p className="saved-project__description">{description}</p></div>
    <div className="saved-project__actions"><Button onClick={onContinue}><FolderOpen size={17}/>{t("common.continue")}</Button><Button variant="secondary" onClick={onNew}><FilePlus2 size={17}/>{t("common.startNew")}</Button></div>
  </section>;
}
