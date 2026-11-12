import { t } from '../../i18n';
import { rich } from '../../i18n/rich';
import { ArrowLeft, ArrowRight, LayoutTemplate, Printer, SlidersHorizontal, Sparkles } from 'lucide-react';
import { assetUrl, assets } from '../../content/assets';
import { AboutContent } from './AboutContent';
import { FeedbackBanner } from './FeedbackBanner';
import { ArtworkPlaceholder } from '../../shared/ui/ArtworkPlaceholder';
import { SiteLayout } from '../../shared/layout/SiteLayout';
import { CreateProjectLink } from '../../shared/ui/CreateProjectLink';
import { homeHeroArtwork } from '../../data/site-art';
import './workshop.css';
const wreath = 'velvet-bow-wreath';
const house = 'snowy-fairytale-cottage';
function Illustration({ id, className = '' }: {
    id: string;
    className?: string;
}) {
    const resource = assets.find(asset => asset.id === id);
    return resource ? <img className={className} src={assetUrl(resource.preview)} alt="" draggable={false}/> : null;
}
export function HomePage({ hasProject }: {
    hasProject: boolean;
}) {
    const illustrationThreshold = Math.max(0, Math.floor((assets.length - 1) / 10) * 10);
    return <SiteLayout current="home" hasProject={hasProject}><main>
    <section className="home-intro"><div className="home-hero"><div className="home-hero__copy"><h1>{rich("pages.home.title", {}, { lineBreak: <br />, lineBreak2: <br className="hero-optional-break"/> })}</h1><p>{rich("pages.home.description", {}, { lineBreak: <br className="hero-desktop-break"/> })}</p><CreateProjectLink /></div><div className="home-hero__art"><img src={assetUrl(homeHeroArtwork.src)} width={homeHeroArtwork.width} height={homeHeroArtwork.height} alt="" draggable={false} fetchPriority="high"/></div></div>
      <div className="home-benefits"><div><SlidersHorizontal size={31} strokeWidth={1.6}/><h3>{t("pages.home.benefits.customization.title")}</h3><p>{rich("pages.home.benefits.customization.description", {}, { lineBreak: <br /> })}</p></div><div><LayoutTemplate size={31} strokeWidth={1.6}/><h3>{t("pages.home.benefits.materials.title")}</h3><p>{rich("pages.home.benefits.materials.description", { illustrationThreshold: illustrationThreshold }, { lineBreak: <br /> })}</p></div><div><Printer size={31} strokeWidth={1.6}/><h3>{t("pages.home.benefits.print.title")}</h3><p>{rich("pages.home.benefits.print.description", {}, { lineBreak: <br /> })}</p></div></div>
    </section>
    <section className="home-products" aria-labelledby="products-heading"><h2 id="products-heading">{t("pages.home.productsTitle")}</h2><div className="home-product-grid"><a href="#tags" className="home-product" data-product="tags"><div className="home-product__visual home-product__visual--tags"><ArtworkPlaceholder kind="tag" slot="product-tags-cover"/></div><div className="home-product__caption"><h3>{t("pages.home.products.tags")}</h3><ArrowRight size={21}/></div></a><a href="#postcards" className="home-product" data-product="postcards"><div className="home-product__visual home-product__visual--postcards"><ArtworkPlaceholder kind="postcard" slot="product-postcards-cover"/></div><div className="home-product__caption"><h3>{t("pages.home.products.postcards")}</h3><ArrowRight size={21}/></div></a><a href="#stickers" className="home-product" data-product="stickers"><div className="home-product__visual home-product__visual--stickers"><ArtworkPlaceholder kind="sticker" slot="product-stickers-cover"/></div><div className="home-product__caption"><div><h3>{t("pages.home.products.stickers")}</h3>{rich("pages.home.comingSoon", {}, { span: <span /> })}</div><ArrowRight size={21}/></div></a></div></section>
    <div className="home-feedback"><FeedbackBanner /></div>
  </main></SiteLayout>;
}
export function AboutPage({ hasProject }: {
    hasProject: boolean;
}) {
    return <SiteLayout current="about" hasProject={hasProject}><main className="about-content"><AboutContent /></main></SiteLayout>;
}
export function ComingSoonPage({ page, hasProject }: {
    page: 'postcards' | 'stickers' | 'ideas';
    hasProject: boolean;
}) {
    const title = { postcards: t("pages.home.products.postcards"), stickers: t("pages.home.products.stickers"), ideas: t("pages.home.ideas") }[page];
    return <SiteLayout current={page} hasProject={hasProject}><main className="public-content-page"><a className="public-back-link" href="#home"><ArrowLeft size={17}/>{t("pages.comingSoon.homeLink")}</a><section className="coming-soon"><div className="coming-soon__art"><Illustration id={page === 'postcards' ? house : page === 'stickers' ? 'woodland-fox-in-red-scarf' : wreath}/><span><Sparkles size={23} strokeWidth={1.3}/></span></div>{rich("pages.comingSoon.badge", { title: title }, { span: <span className="coming-soon__section"/> })}<h1>{rich("pages.comingSoon.title", {}, { lineBreak: <br /> })}</h1><p>{rich("pages.comingSoon.description", {}, { lineBreak: <br /> })}</p><p className="coming-soon__note">{t("pages.comingSoon.hint")}</p><a className="public-button public-button--pill" href="#tags">{t("pages.comingSoon.tagsLink")}<ArrowRight size={18}/></a></section></main></SiteLayout>;
}
