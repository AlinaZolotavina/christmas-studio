import { t } from '../../i18n';
import { Modal } from '../../shared/ui/Modal';
import { Button } from '../../shared/ui/Controls';
export function ResumeProjectDialog({ product, name, onContinue, onNew }: {
    product: 'tags' | 'postcards';
    name: string;
    onContinue: () => void;
    onNew: () => void;
}) {
    return <Modal title={product === 'postcards' ? t("projects.resume.postcardsTitle") : t("projects.resume.tagsTitle")} onClose={onNew} footer={<><Button variant="secondary" onClick={onNew}>{t("common.startNew")}</Button><Button onClick={onContinue}>{t("common.continue")}</Button></>}>
    <p className="muted">{t("projects.resume.description", { projectName: name })}</p>
  </Modal>;
}
