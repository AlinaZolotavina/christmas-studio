import { useId } from 'react';
import { Mail, MessageCircle } from 'lucide-react';
import { localized, t } from '../../i18n';
import { siteContacts } from '../../content/siteContacts';
import { ArtworkPlaceholder } from '../../shared/ui/ArtworkPlaceholder';
import './about-content.css';

export function FeedbackBanner() {
  const titleId = useId();
  const email = `mailto:${siteContacts.authorEmail}`;
  const feedbackUrl = localized(siteContacts.feedbackUrl);
  return <>
    <section className="about-feedback" aria-labelledby={titleId}>
      <ArtworkPlaceholder kind="envelope" slot="about-feedback-envelope" className="about-feedback__art" />
      <div className="about-feedback__copy">
        <h2 id={titleId}>{t('pages.about.feedback.title')}</h2>
        <p>{t('pages.about.feedback.description')}</p>
        <div className="about-feedback__actions">
          <a className="public-button" href={feedbackUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={19} />{t('pages.about.feedback.action')}
          </a>
          <a className="public-button about-feedback__email" href={email}><Mail size={19} />{t('pages.about.feedback.email')}</a>
        </div>
      </div>
    </section>
  </>;
}
