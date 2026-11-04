import { ArrowLeft, ArrowRight, LayoutTemplate, Printer, SlidersHorizontal, Sparkles } from 'lucide-react';
import { assetUrl, assets } from '../../content/assets';
import { AboutContent } from './AboutContent';
import { ArtworkPlaceholder } from '../../shared/ui/ArtworkPlaceholder';
import { SiteLayout } from '../../shared/layout/SiteLayout';
import { CreateProjectLink } from '../../shared/ui/CreateProjectLink';
import { homeHeroArtwork } from '../../data/site-art';
import './workshop.css';

const wreath = 'velvet-bow-wreath';
const house = 'snowy-fairytale-cottage';

function Illustration({ id, className = '' }: { id: string; className?: string }) {
  const resource = assets.find(asset => asset.id === id);
  return resource ? <img className={className} src={assetUrl(resource.preview)} alt="" draggable={false} /> : null;
}

export function HomePage({ hasProject }: { hasProject: boolean }) {
  const illustrationThreshold = Math.max(0, Math.floor((assets.length - 1) / 10) * 10);
  return <SiteLayout current="home" hasProject={hasProject}><main>
    <section className="home-intro"><div className="home-hero"><div className="home-hero__copy"><h1>Создавайте<br />адвент-теги<br className="hero-optional-break" /> и открытки</h1><p>Удобная онлайн-мастерская для<br className="hero-desktop-break" /> вашего праздничного оформления</p><CreateProjectLink /></div><div className="home-hero__art"><img src={assetUrl(homeHeroArtwork.src)} width={homeHeroArtwork.width} height={homeHeroArtwork.height} alt="" draggable={false} fetchPriority="high" /></div></div>
      <div className="home-benefits"><div><SlidersHorizontal size={31} strokeWidth={1.6} /><h3>Гибкая настройка</h3><p>Текст, изображения,<br />фон и детали</p></div><div><LayoutTemplate size={31} strokeWidth={1.6} /><h3>Готовые материалы</h3><p>Более {illustrationThreshold} иллюстраций.<br />Надписи и фоны для открыток.</p></div><div><Printer size={31} strokeWidth={1.6} /><h3>Печать дома</h3><p>Скачайте PDF, PNG или JPG<br />и распечатайте дома</p></div></div>
    </section>
    <section className="home-products" aria-labelledby="products-heading"><h2 id="products-heading">Выберите, что создать</h2><div className="home-product-grid"><a href="#tags" className="home-product" data-product="tags"><div className="home-product__visual home-product__visual--tags"><ArtworkPlaceholder kind="tag" slot="product-tags-cover" /></div><div className="home-product__caption"><h3>Адвент-теги</h3><ArrowRight size={21} /></div></a><a href="#postcards" className="home-product" data-product="postcards"><div className="home-product__visual home-product__visual--postcards"><ArtworkPlaceholder kind="postcard" slot="product-postcards-cover" /></div><div className="home-product__caption"><h3>Открытки</h3><ArrowRight size={21} /></div></a><a href="#stickers" className="home-product" data-product="stickers"><div className="home-product__visual home-product__visual--stickers"><ArtworkPlaceholder kind="sticker" slot="product-stickers-cover" /></div><div className="home-product__caption"><div><h3>Стикеры</h3><span>В разработке</span></div><ArrowRight size={21} /></div></a></div></section>
  </main></SiteLayout>;
}

export function AboutPage({ hasProject }: { hasProject: boolean }) {
  return <SiteLayout current="about" hasProject={hasProject}><main className="about-content"><AboutContent /></main></SiteLayout>;
}

export function ComingSoonPage({ page, hasProject }: { page: 'postcards' | 'stickers' | 'ideas'; hasProject: boolean }) {
  const title = { postcards: 'Открытки', stickers: 'Стикеры', ideas: 'Идеи' }[page];
  return <SiteLayout current={page} hasProject={hasProject}><main className="public-content-page"><a className="public-back-link" href="#home"><ArrowLeft size={17} /> На главную</a><section className="coming-soon"><div className="coming-soon__art"><Illustration id={page === 'postcards' ? house : page === 'stickers' ? 'woodland-fox-in-red-scarf' : wreath} /><span><Sparkles size={23} strokeWidth={1.3} /></span></div><span className="coming-soon__section">{title} · В разработке</span><h1>Готовим для вас<br />что-то особенное</h1><p>Мы работаем над этим разделом<br />и скоро порадуем вас новыми возможностями.</p><p className="coming-soon__note">А пока можно создать свой набор адвент-тегов.</p><a className="public-button public-button--pill" href="#tags">Перейти к адвент-тегам <ArrowRight size={18} /></a></section></main></SiteLayout>;
}
