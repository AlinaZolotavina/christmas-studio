import { t } from '../../i18n';
import './brand-name.css';
export function BrandName() {
    return <span className="brand-name">{t("common.brand")}</span>;
}
