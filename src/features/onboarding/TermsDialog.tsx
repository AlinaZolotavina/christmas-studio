import { t } from '../../i18n';
import { rich } from '../../i18n/rich';
import { useState } from 'react';
import { Button } from '../../shared/ui/Controls';
import { Modal } from '../../shared/ui/Modal';
import './terms-dialog.css';
export function TermsDialog({ onAccept, onCancel }: {
    onAccept: () => void;
    onCancel: () => void;
}) {
    const [checked, setChecked] = useState(false);
    return <div className="public-site public-site--dialog"><Modal title={t("legal.acceptance.title")} className="terms-dialog" onClose={onCancel} footer={<><Button variant="secondary" onClick={onCancel}>{t("common.cancel")}</Button><Button disabled={!checked} onClick={() => { if (checked)
        onAccept(); }}>{t("legal.acceptance.acceptAndCreate")}</Button></>}>
    <p>{t("legal.acceptance.intro")}</p>
    <p>{t("legal.acceptance.personalUse")}</p>
    <label className="terms-dialog__accept"><input type="checkbox" checked={checked} onChange={event => setChecked(event.target.checked)}/>{rich("legal.acceptance.agreement", {}, { span: <span />, link: <a href="#terms" target="_blank" rel="noopener noreferrer"/> })}</label>
    <p className="terms-dialog__privacy">{rich("legal.acceptance.privacy", {}, { link: <a href="#privacy" target="_blank" rel="noopener noreferrer"/> })}</p>
  </Modal></div>;
}
