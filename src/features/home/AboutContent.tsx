import { t } from '../../i18n';
import { rich } from '../../i18n/rich';
import { ArrowRight } from "lucide-react";
import { FeedbackBanner } from './FeedbackBanner';
import { ArtworkPlaceholder } from "../../shared/ui/ArtworkPlaceholder";
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
      <FeedbackBanner />
    </article>);
}
