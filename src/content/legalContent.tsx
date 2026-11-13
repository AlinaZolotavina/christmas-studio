import { getLocale, localized, t } from '../i18n';
import { rich } from '../i18n/rich';
import { siteContacts } from './siteContacts';
import { legalMetadata } from './legalMetadata';
const githubPrivacy = 'https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement';
const posthogPrivacy = 'https://posthog.com/privacy';
const posthogPrivacyDocs = 'https://posthog.com/docs/privacy';
function Email() { return <a href={`mailto:${siteContacts.authorEmail}`}>{siteContacts.authorEmail}</a>; }
export function PrivacyContent() {
    return <>
    <p>{t("legal.privacy.intro")}</p>
    <section><h2>{t("legal.privacy.controller.title")}</h2><p>{rich("legal.privacy.controller.description", { ownerName: localized(legalMetadata.ownerName) }, { emailLink: <Email /> })}</p></section>
    <section><h2>{t("legal.privacy.localData.title")}</h2><p>{t("legal.privacy.localData.intro")}</p>
      <ul>
        <li>{t("legal.privacy.localData.projects")}</li>
        <li>{t("legal.privacy.localData.recovery")}</li>
        <li>{t("legal.privacy.localData.preferences")}</li>
      </ul>
      <p>{t("legal.privacy.localData.retention")}</p>
      <p>{t("legal.privacy.localData.noTracking")}</p>
    </section>
    <section><h2>{t("legal.privacy.analytics.title")}</h2>
      <p>{t("legal.privacy.analytics.purpose")}</p>
      <p>{t("legal.privacy.analytics.data")}</p>
      <p>{t("legal.privacy.analytics.excluded")}</p>
      <p>{rich("legal.privacy.analytics.provider", { analyticsRetentionMonths: legalMetadata.analyticsRetentionMonths }, { privacyLink: <a href={posthogPrivacy} target="_blank" rel="noopener noreferrer"/>, docsLink: <a href={posthogPrivacyDocs} target="_blank" rel="noopener noreferrer"/> })}</p>
    </section>
    <section><h2>{t("legal.privacy.hosting.title")}</h2>
      <p>{rich("legal.privacy.hosting.github", {}, { link: <a href="https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages#data-collection" target="_blank" rel="noopener noreferrer"/> })}</p>
      <p>{rich("legal.privacy.hosting.githubPolicy", {}, { link: <a href={githubPrivacy} target="_blank" rel="noopener noreferrer"/> })}</p>
      <p>{t("legal.privacy.hosting.localAssets")}</p>
    </section>
    <section><h2>{t("legal.privacy.contact.title")}</h2>
      <p>{rich("legal.privacy.contact.email", {}, { link: <a href={`https://policies.google.com/privacy?hl=${getLocale()}`} target="_blank" rel="noopener noreferrer"/> })}</p>
      <p>{rich("legal.privacy.contact.feedback", {}, { link: <a href={`https://policies.google.com/privacy?hl=${getLocale()}`} target="_blank" rel="noopener noreferrer"/> })}</p>
      <p>{t("legal.privacy.contact.retention", { correspondenceRetentionMonths: legalMetadata.correspondenceRetentionMonths })}</p>
      <p>{t("legal.privacy.contact.report")}</p>
      <p>{t("legal.privacy.contact.issues")}</p>
    </section>
    <section><h2>{t("legal.privacy.processing.title")}</h2>
      <p>{t("legal.privacy.processing.basis")}</p>
      <p>{t("legal.privacy.processing.optionalData")}</p>
    </section>
    <section><h2>{t("legal.privacy.rights.title")}</h2>
      <p>{rich("legal.privacy.rights.requests", {}, { emailLink: <Email /> })}</p>
      <p>{t("legal.privacy.rights.complaints")}</p>
    </section>
  </>;
}
export function TermsContent() {
    return <>
    <p>{t("legal.terms.intro")}</p>
    <section><h2>{t("legal.terms.general.title")}</h2><p>{t("legal.terms.general.access")}</p><p>{t("legal.terms.general.changes")}</p></section>
    <section><h2>{t("legal.terms.storage.title")}</h2><p>{t("legal.terms.storage.privacy")}</p><p>{t("legal.terms.storage.loss")}</p><p>{rich("legal.terms.storage.hosting", {}, { link: <a href="#privacy"/> })}</p></section>
    <section><h2>{t("legal.terms.materials.title")}</h2><p>{t("legal.terms.materials.intro")}</p><p>{t("legal.terms.materials.allowed")}</p><ul><li>{t("legal.terms.materials.personalDesigns")}</li><li>{t("legal.terms.materials.print")}</li><li>{t("legal.terms.materials.decoration")}</li><li>{t("legal.terms.materials.gifts")}</li></ul><p>{t("legal.terms.materials.prohibited")}</p><ul><li>{t("legal.terms.materials.commercialUse")}</li><li>{t("legal.terms.materials.resale")}</li><li>{t("legal.terms.materials.redistribution")}</li><li>{t("legal.terms.materials.collections")}</li><li>{t("legal.terms.materials.authorship")}</li></ul><p>{t("legal.terms.materials.scope")}</p></section>
    <section><h2>{t("legal.terms.ai.title")}</h2><p>{t("legal.terms.ai.creation")}</p><p>{t("legal.terms.ai.thirdPartyRights")}</p></section>
    <section><h2>{t("legal.terms.liability.title")}</h2><p>{t("legal.terms.liability.availability")}</p><p>{t("legal.terms.liability.userResponsibilities")}</p></section>
    <section><h2>{t("legal.terms.changes.title")}</h2><p>{t("legal.terms.changes.description")}</p></section>
    <section><h2>{t("legal.terms.contact.title")}</h2><p>{rich("legal.terms.contact.description", { ownerName: localized(legalMetadata.ownerName) }, { emailLink: <Email /> })}</p></section>
  </>;
}
