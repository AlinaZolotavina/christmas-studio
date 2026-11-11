import { availableLocales, getLocale, setLocale, t } from '../../i18n';
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { assetUrl } from '../../content/assets';
import { languageArtwork } from '../../data/site-art';
import type { PublicRoute } from '../navigation/routes';
import { BrandMark } from '../ui/BrandMark';
import { BrandName } from '../ui/BrandName';
import './site-layout.css';
function Brand() {
    return <span className="public-brand"><BrandMark /><BrandName /></span>;
}
export function SiteHeader({ current = 'home', hasProject = false }: {
    current?: PublicRoute;
    hasProject?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [submenu, setSubmenu] = useState<'editor' | 'templates' | null>(null);
    const header = useRef<HTMLElement>(null);
    const triggers = useRef<Partial<Record<'editor' | 'templates', HTMLButtonElement | null>>>({});
    useEffect(() => { setOpen(false); setSubmenu(null); }, [current]);
    useEffect(() => {
        const outside = (event: PointerEvent) => { if (!header.current?.contains(event.target as Node)) {
            setOpen(false);
            setSubmenu(null);
        } };
        const escape = (event: globalThis.KeyboardEvent) => { if (event.key !== 'Escape')
            return; if (submenu) {
            triggers.current[submenu]?.focus();
            setSubmenu(null);
        }
        else
            setOpen(false); };
        document.addEventListener('pointerdown', outside);
        document.addEventListener('keydown', escape);
        return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
    }, [submenu]);
    const menuKeys = (event: KeyboardEvent<HTMLDivElement>) => {
        const items = [...event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]')];
        const index = items.indexOf(document.activeElement as HTMLElement);
        if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
            event.preventDefault();
            const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
            items[next]?.focus();
        }
    };
    const directionMenu = (kind: 'editor' | 'templates', label: string) => <div className="public-nav-group">
    <button ref={node => { triggers.current[kind] = node; }} type="button" className="public-nav-trigger" aria-haspopup="menu" aria-expanded={submenu === kind} aria-controls={`directions-${kind}`} onClick={() => setSubmenu(value => value === kind ? null : kind)} onKeyDown={event => { if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSubmenu(kind);
        requestAnimationFrame(() => header.current?.querySelector<HTMLElement>(`#directions-${kind} [role="menuitem"]`)?.focus());
    } }}>{label}<ChevronDown size={14} aria-hidden="true"/></button>
    {submenu === kind && <div id={`directions-${kind}`} role="menu" aria-label={t("navigation.directionLabel", { label })} className="public-direction-menu" onKeyDown={menuKeys}>
      <a role="menuitem" href={kind === 'editor' && hasProject ? '#editor/tags' : '#tags'} onClick={() => { setSubmenu(null); setOpen(false); }}>{t('navigation.tags')}</a>
      <a role="menuitem" href={kind === 'editor' ? '#editor/postcards' : '#postcards'} onClick={() => { setSubmenu(null); setOpen(false); }}>{t('navigation.postcards')}</a>
      <a role="menuitem" href="#stickers" onClick={() => { setSubmenu(null); setOpen(false); }}>{t('navigation.stickers')} <small>{t('common.comingSoon')}</small></a>
    </div>}
  </div>;
    return <header ref={header} className="public-header"><div className="public-header__inner">
    <a className="public-brand-link" href="#home" aria-label={t("navigation.homeLabel")}><Brand /></a>
    <nav className={`public-navigation ${open ? 'is-open' : ''}`} aria-label={t("navigation.mainLabel")}>
      {directionMenu('editor', t('navigation.editor'))}{directionMenu('templates', t('navigation.templates'))}
      <a href="#ideas" aria-current={current === 'ideas' ? 'page' : undefined} onClick={() => setOpen(false)}>{t('navigation.ideas')}</a>
      <a href="#about" aria-current={current === 'about' ? 'page' : undefined} onClick={() => setOpen(false)}>{t('navigation.about')}</a>
    </nav>
    <div className="public-header__actions"><span className="public-locale" title={t('navigation.languageLabel')}><img className="public-locale__icon" src={assetUrl(languageArtwork.src)} width={18} height={18} alt="" aria-hidden="true" draggable={false}/>
      {availableLocales.length > 1 ? <select aria-label={t('navigation.languageLabel')} value={getLocale()} onChange={event => setLocale(event.target.value)}>{availableLocales.map(language => <option key={language} value={language}>{language.toUpperCase()}</option>)}</select> : getLocale().toUpperCase()}
    </span><button className="public-menu-button" aria-label={open ? t("navigation.closeMenu") : t("navigation.openMenu")} aria-expanded={open} onClick={() => setOpen(value => !value)}>{open ? <X size={23}/> : <Menu size={23}/>}</button></div>
  </div></header>;
}
export function SiteFooter() {
    return <footer className="public-footer"><div className="public-footer__inner">
    <a href="#home" className="public-brand-link" aria-label={t("navigation.homeLabel")}><Brand /></a>
    <nav aria-label={t("navigation.footerProductsLabel")}><a href="#tags">{t('navigation.tags')}</a><a href="#postcards">{t('navigation.postcards')}</a><a href="#stickers">{t('navigation.stickers')}</a><a href="#ideas">{t('navigation.ideas')}</a></nav>
    <nav aria-label={t("navigation.footerDocumentsLabel")}><a href="#about">{t('navigation.about')}</a><a href="#terms">{t('navigation.terms')}</a><a href="#privacy">{t('navigation.privacy')}</a></nav>
  </div></footer>;
}
export function SiteLayout({ current, hasProject, children }: {
    current: PublicRoute;
    hasProject: boolean;
    children: ReactNode;
}) {
    return <div className="public-site"><SiteHeader current={current} hasProject={hasProject}/>{children}<SiteFooter /></div>;
}
