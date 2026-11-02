import { useState } from 'react';
import { ArrowLeft, ArrowRight, Globe2, LayoutTemplate, Menu, Printer, SlidersHorizontal, Sparkles, TreePine, X } from 'lucide-react';
import { assetUrl, assets } from '../../content/assets';
import { getTemplate } from '../../content/templates';
import { previewCard } from '../gallery/previewCard';
import { CardSvg } from '../../rendering/CardSvg';
import { AboutContent } from './AboutContent';
import './workshop.css';

export type WorkshopRoute = 'home' | 'tags' | 'postcards' | 'stickers' | 'ideas' | 'about' | 'editor';

function Brand() {
  return <span className="public-brand"><span className="public-brand__trees" aria-hidden="true"><TreePine /><TreePine /></span><span>Новогодняя мастерская</span></span>;
}

export function SiteHeader({ current = 'home', hasProject = false }: { current?: WorkshopRoute; hasProject?: boolean }) {
  const [open, setOpen] = useState(false);
  return <header className="public-header"><div className="public-header__inner">
    <a className="public-brand-link" href="#home" aria-label="Новогодняя мастерская — главная"><Brand /></a>
    <nav className={`public-navigation ${open ? 'is-open' : ''}`} aria-label="Навигация мастерской" onClick={() => setOpen(false)}>
      <a href={hasProject ? '#editor' : '#tags'} aria-current={current === 'editor' ? 'page' : undefined}>Редактор</a>
      <a href="#tags" aria-current={current === 'tags' ? 'page' : undefined}>Шаблоны</a>
      <a href="#ideas" aria-current={current === 'ideas' ? 'page' : undefined}>Идеи</a>
      <a href="#about" aria-current={current === 'about' ? 'page' : undefined}>О проекте</a>
    </nav>
    <div className="public-header__actions"><span className="public-locale" title="Язык интерфейса — русский"><Globe2 size={16} /> RU</span><a href="#tags" className="public-button public-header__create">Создать проект</a><button className="public-menu-button" aria-label={open ? 'Закрыть навигацию' : 'Открыть навигацию'} aria-expanded={open} onClick={() => setOpen(value => !value)}>{open ? <X size={23} /> : <Menu size={23} />}</button></div>
  </div></header>;
}

export function SiteFooter({ hasProject = false }: { hasProject?: boolean }) {
  return <footer className="public-footer"><div className="public-footer__inner"><a href="#home" className="public-brand-link"><Brand /></a><nav aria-label="Мастерская"><a href={hasProject ? '#editor' : '#tags'}>Редактор</a><a href="#tags">Шаблоны</a><a href="#ideas">Идеи</a></nav><nav aria-label="О мастерской"><a href="#about">О проекте</a><a href="#tags">Адвент-бирки</a><a href="#home">Главная</a></nav><p>Для больших праздничных идей.<br /><span>Создавайте, распечатывайте, дарите.</span></p></div></footer>;
}

const tree = 'woodland-christmas-tree';
const wreath = 'velvet-bow-wreath';
const house = 'snowy-fairytale-cottage';

function Illustration({ id, className = '' }: { id: string; className?: string }) {
  const resource = assets.find(asset => asset.id === id);
  return resource ? <img className={className} src={assetUrl(resource.preview)} alt="" draggable={false} /> : null;
}

function TagArtwork({ numbered = false }: { numbered?: boolean }) {
  const card = previewCard(getTemplate('woodland'), 24, tree);
  card.illustration = { ...card.illustration, x: 4, y: 12, width: 42, height: numbered ? 43 : 59 };
  card.text = { ...card.text, content: numbered ? '24' : '', fontSize: 30, y: 57, height: 17, color: '#963e3e' };
  return <div className="showcase-tag"><span className="showcase-twine" /><CardSvg card={card} idPrefix={numbered ? 'home-category-tag' : 'home-hero-tag'} /></div>;
}

export function HomePage({ hasProject }: { hasProject: boolean }) {
  const fox = assets.some(asset => asset.id === 'woodland-fox-in-red-scarf') ? 'woodland-fox-in-red-scarf' : 'robin-bird-feeder';
  return <div className="public-site"><SiteHeader hasProject={hasProject} /><main>
    <section className="home-intro"><div className="home-hero"><div className="home-hero__copy"><h1>Создавайте<br />адвент-бирки,<br className="hero-optional-break" /> открытки<br className="hero-desktop-break" /> и стикеры</h1><p>Удобная онлайн-мастерская для<br className="hero-desktop-break" /> вашего праздничного оформления</p><a className="public-button public-button--pill" href="#tags">Создать проект <ArrowRight size={19} /></a></div><div className="home-hero__art" aria-label="Праздничная бирка с ёлкой, открытка с венком и акварельная наклейка"><div className="home-hero__tag"><TagArtwork /></div><div className="home-hero__postcard"><Illustration id={wreath} /></div><div className="home-hero__sticker"><Illustration id={fox} /></div></div></div>
      <div className="home-benefits"><div><SlidersHorizontal size={31} strokeWidth={1.6} /><h2>Гибкая настройка</h2><p>Текст, изображения,<br />фон и детали</p></div><div><LayoutTemplate size={31} strokeWidth={1.6} /><h2>Готовые шаблоны</h2><p>Более 50 иллюстраций<br />в праздничном стиле</p></div><div><Printer size={31} strokeWidth={1.6} /><h2>Печать дома</h2><p>Скачайте PDF и распечатайте<br />в удобном формате</p></div></div>
    </section>
    <section className="home-products" aria-labelledby="products-heading"><h2 id="products-heading">Выберите, что создать</h2><div className="home-product-grid"><a href="#tags" className="home-product" data-product="tags"><div className="home-product__visual home-product__visual--tags"><TagArtwork numbered /></div><div className="home-product__caption"><h3>Бирки и ярлыки</h3><ArrowRight size={21} /></div></a><a href="#postcards" className="home-product" data-product="postcards"><div className="home-product__visual home-product__visual--postcards"><div className="category-postcard"><Illustration id={house} /></div></div><div className="home-product__caption"><div><h3>Открытки</h3><span>В разработке</span></div><ArrowRight size={21} /></div></a><a href="#stickers" className="home-product" data-product="stickers"><div className="home-product__visual home-product__visual--stickers"><Illustration id={fox} className="category-sticker" /></div><div className="home-product__caption"><div><h3>Стикеры</h3><span>В разработке</span></div><ArrowRight size={21} /></div></a></div></section>
  </main><SiteFooter hasProject={hasProject} /></div>;
}

export function AboutPage({ hasProject }: { hasProject: boolean }) {
  return <div className="public-site"><SiteHeader current="about" hasProject={hasProject} /><main className="about-content"><AboutContent /></main><SiteFooter hasProject={hasProject} /></div>;
}

export function ComingSoonPage({ page, hasProject }: { page: 'postcards' | 'stickers' | 'ideas'; hasProject: boolean }) {
  const title = { postcards: 'Открытки', stickers: 'Стикеры', ideas: 'Идеи' }[page];
  return <div className="public-site"><SiteHeader current={page} hasProject={hasProject} /><main className="public-content-page"><a className="public-back-link" href="#home"><ArrowLeft size={17} /> На главную</a><section className="coming-soon"><div className="coming-soon__art"><Illustration id={page === 'postcards' ? house : page === 'stickers' ? 'woodland-fox-in-red-scarf' : wreath} /><span><Sparkles size={23} strokeWidth={1.3} /></span></div><span className="coming-soon__section">{title} · В разработке</span><h1>Готовим для вас<br />что-то особенное</h1><p>Мы работаем над этим разделом<br />и скоро порадуем вас новыми возможностями.</p><p className="coming-soon__note">А пока можно создать свой набор адвент-бирок.</p><a className="public-button public-button--pill" href="#tags">Перейти к биркам <ArrowRight size={18} /></a></section></main><SiteFooter hasProject={hasProject} /></div>;
}
