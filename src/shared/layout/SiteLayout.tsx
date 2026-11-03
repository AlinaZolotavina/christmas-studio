import { useEffect, useState, type ReactNode } from 'react';
import { Menu, X } from 'lucide-react';
import { assetUrl } from '../../content/assets';
import { languageArtwork } from '../../data/site-art';
import type { PublicRoute } from '../navigation/routes';
import { BrandMark } from '../ui/BrandMark';
import { BrandName } from '../ui/BrandName';
import { CreateProjectLink } from '../ui/CreateProjectLink';
import './site-layout.css';

function Brand() {
  return <span className="public-brand"><BrandMark /><BrandName /></span>;
}

export function SiteHeader({ current = 'home', hasProject = false }: { current?: PublicRoute; hasProject?: boolean }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [current]);
  return <header className="public-header"><div className="public-header__inner">
    <a className="public-brand-link" href="#home" aria-label="Новогодняя мастерская — главная"><Brand /></a>
    <nav className={`public-navigation ${open ? 'is-open' : ''}`} aria-label="Навигация мастерской" onClick={() => setOpen(false)}>
      <a href={hasProject ? '#editor' : '#tags'}>Редактор</a>
      <a href="#tags" aria-current={current === 'tags' ? 'page' : undefined}>Шаблоны</a>
      <a href="#ideas" aria-current={current === 'ideas' ? 'page' : undefined}>Идеи</a>
      <a href="#about" aria-current={current === 'about' ? 'page' : undefined}>О проекте</a>
    </nav>
    <div className="public-header__actions"><span className="public-locale" title="Язык интерфейса — русский"><img className="public-locale__icon" src={assetUrl(languageArtwork.src)} width={18} height={18} alt="" aria-hidden="true" draggable={false} /> RU</span><CreateProjectLink className="public-header__create" /><button className="public-menu-button" aria-label={open ? 'Закрыть навигацию' : 'Открыть навигацию'} aria-expanded={open} onClick={() => setOpen(value => !value)}>{open ? <X size={23} /> : <Menu size={23} />}</button></div>
  </div></header>;
}

export function SiteFooter() {
  return <footer className="public-footer"><div className="public-footer__inner">
    <a href="#home" className="public-brand-link" aria-label="Новогодняя мастерская — главная"><Brand /></a>
    <nav aria-label="Направления мастерской"><a href="#tags">Адвент-теги</a><a href="#postcards">Открытки</a><a href="#stickers">Стикеры</a><a href="#ideas">Идеи</a></nav>
    <nav aria-label="О проекте и документы"><a href="#about">О проекте</a><a href="#terms">Условия использования</a><a href="#privacy">Политика конфиденциальности</a></nav>
  </div></footer>;
}

export function SiteLayout({ current, hasProject, children }: { current: PublicRoute; hasProject: boolean; children: ReactNode }) {
  return <div className="public-site"><SiteHeader current={current} hasProject={hasProject} />{children}<SiteFooter /></div>;
}
