import { formatDate, t } from '../../i18n';
import { PrivacyContent, TermsContent } from '../../content/legalContent';
import { legalMetadata } from '../../content/legalMetadata';
import { SiteLayout } from '../../shared/layout/SiteLayout';
import './legal-page.css';
export function LegalPage({ document, hasProject }: {
    document: 'privacy' | 'terms';
    hasProject: boolean;
}) {
    const privacy = document === 'privacy';
    return <SiteLayout current={document} hasProject={hasProject}><main className="legal-page"><article aria-labelledby="legal-title">
    <h1 id="legal-title">{privacy ? t("legal.privacy.title") : t("legal.terms.title")}</h1>
    <div className="legal-page__updated">{t("legal.updated", { updated: formatDate(privacy ? legalMetadata.privacyUpdated : legalMetadata.termsUpdated) })}</div>
    {privacy ? <PrivacyContent /> : <TermsContent />}
  </article></main></SiteLayout>;
}
