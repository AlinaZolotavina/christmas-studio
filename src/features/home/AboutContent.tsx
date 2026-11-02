import { useState } from 'react';
import { ArrowRight, Mail, MessageCircle, TreePine } from 'lucide-react';
import { siteContacts } from '../../content/siteContacts';
import { ArtworkPlaceholder } from '../../shared/ui/ArtworkPlaceholder';
import { Button } from '../../shared/ui/Controls';
import { Modal } from '../../shared/ui/Modal';
import './about-content.css';

const products = [
  { id: 'tags', name: 'Теги и ярлыки', kind: 'tag', slot: 'product-tags-cover', soon: false },
  { id: 'postcards', name: 'Открытки', kind: 'postcard', slot: 'product-postcards-cover', soon: true },
  { id: 'stickers', name: 'Стикеры', kind: 'sticker', slot: 'product-stickers-cover', soon: true },
] as const;

function BowDivider() {
  return <div className="about-divider" aria-hidden="true"><span /><svg width="42" height="28" viewBox="0 0 42 28" fill="none"><path d="M21 13C7-3 1 5 7 12c4 4 10 1 14 1Zm0 0C35-3 41 5 35 12c-4 4-10 1-14 1Zm0 0-8 12m8-12 8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg><span /></div>;
}

export function AboutContent() {
  const [feedbackNotice, setFeedbackNotice] = useState(false);
  const email = `mailto:${siteContacts.authorEmail}`;
  return <article className="about-project about-overview">
    <section className="about-heading" aria-labelledby="about-title"><div className="about-heading__copy"><TreePine size={37} strokeWidth={1.4} aria-hidden="true" /><h1 id="about-title">О проекте</h1><p className="about-heading__lead"><strong>Новогодняя мастерская для больших праздничных идей.</strong></p></div><ArtworkPlaceholder kind="branch" slot="about-hero-branch" className="about-heading__art" /></section>
    <section className="about-story" aria-label="О новогодней мастерской"><ArtworkPlaceholder kind="gift" slot="about-gift" className="about-story__art" /><div className="about-story__copy"><p>Мы создали это пространство, чтобы подготовка к праздникам стала проще и приятнее. Здесь можно создавать адвент-бирки, открытки и наклейки, выбирать иллюстрации, сочетать цвета и добавлять собственные надписи.</p><p>Всё необходимое для праздничного оформления собрано в одном месте: удобный редактор, готовые шаблоны и коллекция иллюстраций в уютном рождественском стиле.</p><p>Создавайте что-то своё, распечатывайте и добавляйте немного праздничного волшебства в обычные вещи.</p></div></section>
    <BowDivider />
    <section className="about-products" aria-labelledby="about-products-title"><h2 id="about-products-title">Что можно создать</h2><div className="about-product-grid">{products.map(product => <a key={product.id} href={`#${product.id}`} className={`about-product about-product--${product.id}`} data-product={product.id}><div className="about-product__art"><ArtworkPlaceholder kind={product.kind} slot={product.slot} /></div><div className="about-product__caption"><div><h3>{product.name}</h3>{product.soon && <span>В разработке</span>}</div><ArrowRight size={19} aria-hidden="true" /></div></a>)}</div></section>
    <section className="about-feedback" aria-labelledby="about-feedback-title"><ArtworkPlaceholder kind="envelope" slot="about-feedback-envelope" className="about-feedback__art" /><div className="about-feedback__copy"><h2 id="about-feedback-title">Буду рада вашим идеям и отзывам!</h2><p>Нашли ошибку, хотите предложить улучшение или просто поделиться впечатлением? Напишите мне.</p><div className="about-feedback__actions">{siteContacts.feedbackUrl ? <a className="public-button" href={siteContacts.feedbackUrl} target="_blank" rel="noopener noreferrer"><MessageCircle size={19} /> Оставить отзыв</a> : <button type="button" className="public-button" onClick={() => setFeedbackNotice(true)}><MessageCircle size={19} /> Оставить отзыв</button>}<a className="public-button about-feedback__email" href={email}><Mail size={19} /> Написать автору</a></div></div></section>
    {feedbackNotice && <Modal title="Отзывы о мастерской" onClose={() => setFeedbackNotice(false)} footer={<Button onClick={() => setFeedbackNotice(false)}>Понятно</Button>}><div className="about-feedback-notice"><p>Ссылка для отзывов появится чуть позже. А пока можно поделиться идеей или впечатлением по почте.</p><a href={email}><Mail size={18} /> {siteContacts.authorEmail}</a></div></Modal>}
  </article>;
}
