import { t } from '../../i18n';
import { rich } from '../../i18n/rich';
import { useState } from "react";
import { ArrowRight, Mail, MessageCircle } from "lucide-react";
import { siteContacts } from "../../content/siteContacts";
import { ArtworkPlaceholder } from "../../shared/ui/ArtworkPlaceholder";
import { Button } from "../../shared/ui/Controls";
import { Modal } from "../../shared/ui/Modal";
import { BowDivider } from "../../shared/ui/BowDivider";
import "./about-content.css";
const products = [
    {
        id: "tags",
        name: t("pages.about.products.tags"),
        kind: "tag",
        slot: "product-tags-cover",
        soon: false,
    },
    {
        id: "postcards",
        name: t("pages.about.products.postcards"),
        kind: "postcard",
        slot: "product-postcards-cover",
        soon: false,
    },
    {
        id: "stickers",
        name: t("pages.about.products.stickers"),
        kind: "sticker",
        slot: "product-stickers-cover",
        soon: true,
    },
] as const;
export function AboutContent() {
    const [feedbackNotice, setFeedbackNotice] = useState(false);
    const email = `mailto:${siteContacts.authorEmail}`;
    return (<article className="about-project about-overview">
      <section className="about-hero" aria-labelledby="about-title">
        <div className="about-heading">
          <div className="about-heading__copy">
            <h1 id="about-title">{t("pages.about.title")}</h1>
          </div>
          <ArtworkPlaceholder kind="branch" slot="about-hero-branch" className="about-heading__art"/>
        </div>
        <ArtworkPlaceholder kind="gift" slot="about-gift" className="about-story__art"/>
        <div className="about-story__copy">
          <p>{t("pages.about.intro")}</p>
          <p>{rich("pages.about.free", {}, { strong: <strong /> })}</p>
          <p>{t("pages.about.privacy")}</p>
          <p>{t("pages.about.invitation")}</p>
        </div>
      </section>
      <BowDivider className="about-divider"/>
      <section className="about-products" aria-labelledby="about-products-title">
        <h2 id="about-products-title">{t("pages.about.productsTitle")}</h2>
        <div className="about-product-grid">
          {products.map((product) => (<a key={product.id} href={`#${product.id}`} className={`about-product about-product--${product.id}`} data-product={product.id}>
              <div className="about-product__art">
                <ArtworkPlaceholder kind={product.kind} slot={product.slot}/>
              </div>
              <div className="about-product__caption">
                <div>
                  <h3>{product.name}</h3>
                  {product.soon && <span>{t("pages.about.comingSoon")}</span>}
                </div>
                <ArrowRight size={19} aria-hidden="true"/>
              </div>
            </a>))}
        </div>
      </section>
      <section className="about-feedback" aria-labelledby="about-feedback-title">
        <ArtworkPlaceholder kind="envelope" slot="about-feedback-envelope" className="about-feedback__art"/>
        <div className="about-feedback__copy">
          <h2 id="about-feedback-title">{t("pages.about.feedback.title")}</h2>
          <p>{t("pages.about.feedback.description")}</p>
          <div className="about-feedback__actions">
            {siteContacts.feedbackUrl ? (<a className="public-button" href={siteContacts.feedbackUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={19}/>{t("pages.about.feedback.action")}</a>) : (<button type="button" className="public-button" onClick={() => setFeedbackNotice(true)}>
                <MessageCircle size={19}/>{t("pages.about.feedback.action")}</button>)}
            <a className="public-button about-feedback__email" href={email}>
              <Mail size={19}/>{t("pages.about.feedback.email")}</a>
          </div>
        </div>
      </section>
      {feedbackNotice && (<Modal title={t("pages.about.feedback.dialogTitle")} onClose={() => setFeedbackNotice(false)} footer={<Button onClick={() => setFeedbackNotice(false)}>{t("pages.about.feedback.dismiss")}</Button>}>
          <div className="about-feedback-notice">
            <p>{t("pages.about.feedback.unconfigured")}</p>
            <a href={email}>
              <Mail size={18}/> {siteContacts.authorEmail}
            </a>
          </div>
        </Modal>)}
    </article>);
}
