import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ChevronDown, Heart, Trash2, X } from 'lucide-react';
import { SiteLayout } from '../../shared/layout/SiteLayout';
import { BowDivider } from '../../shared/ui/BowDivider';
import { Button } from '../../shared/ui/Controls';
import { Modal } from '../../shared/ui/Modal';
import { t } from '../../i18n';
import { assetUrl, getAsset } from '../../content/assets';
import { categoryIds, filterGiftIdeas, giftCatalog, giftDisplayName, giftNameKey, recipientIds, type GiftCategoryId, type GiftIdea, type RecipientId } from './giftIdeas';
import { useGiftList } from './useGiftList';
import './ideas-page.css';
import './gift-ideas.css';

const heroArtwork = getAsset('christmas-tree-red-gifts');

export function GiftIdeasPage({ hasProject }: { hasProject: boolean }) {
  const [recipient, setRecipient] = useState<RecipientId>('all');
  const [selectedTypes, setSelectedTypes] = useState<GiftCategoryId[]>([]);
  const [visibleCount, setVisibleCount] = useState(20);
  const { items: savedItems, setItems: setSavedItems, storageError } = useGiftList();
  const [customIdea, setCustomIdea] = useState('');
  const [customError, setCustomError] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [compact, setCompact] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 1050px)').matches);
  const [pdfError, setPdfError] = useState('');
  const [exporting, setExporting] = useState(false);
  const catalog = useRef<HTMLElement>(null);
  const listTrigger = useRef<HTMLButtonElement>(null);
  const exportingRef = useRef(false);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 1050px)');
    const update = () => { setCompact(media.matches); if (!media.matches) setListOpen(false); };
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const matches = useMemo(() => filterGiftIdeas(giftCatalog, recipient, selectedTypes), [recipient, selectedTypes]);
  const selectedNames = useMemo(() => new Set(savedItems.map(item => giftNameKey(item.name))), [savedItems]);
  const activeFilters = recipient !== 'all' || selectedTypes.length > 0;
  const resetCatalog = () => {
    setVisibleCount(20);
    if (catalog.current && catalog.current.getBoundingClientRect().top < 0) catalog.current.scrollIntoView({ block: 'start' });
  };
  const resetFilters = () => { setRecipient('all'); setSelectedTypes([]); resetCatalog(); };
  const toggleGift = (gift: GiftIdea) => {
    setSavedItems(previous => previous.some(item => giftNameKey(item.name) === giftNameKey(gift.name))
      ? previous.filter(item => giftNameKey(item.name) !== giftNameKey(gift.name))
      : [...previous, { id: gift.id, name: gift.name, kind: 'catalog', addedAt: Date.now() }]);
  };
  const addCustomIdea = (event: FormEvent) => {
    event.preventDefault();
    const name = customIdea.trim();
    if (!name) { setCustomError(t('pages.giftIdeas.custom.empty')); return; }
    if (selectedNames.has(giftNameKey(name))) { setCustomError(t('pages.giftIdeas.custom.duplicate')); return; }
    setSavedItems(previous => [...previous, { id: `custom-${crypto.randomUUID()}`, name, kind: 'custom', addedAt: Date.now() }]);
    setCustomIdea(''); setCustomError('');
  };
  const downloadPdf = async () => {
    if (!savedItems.length || exportingRef.current) return;
    exportingRef.current = true; setExporting(true); setPdfError('');
    try { const { downloadGiftPdf } = await import('./giftPdf'); await downloadGiftPdf(savedItems); }
    catch { setPdfError(t('pages.giftIdeas.pdf.error')); }
    finally { exportingRef.current = false; setExporting(false); }
  };
  const listContent = <>
    <p className="gift-ideas-list-count" role="status">{t('pages.giftIdeas.list.count', { count: savedItems.length })}</p>
    {storageError && <p className="gift-ideas-error" role="alert">{storageError}</p>}
    {!savedItems.length ? <p className="gift-ideas-empty">{t('pages.giftIdeas.list.empty')}</p> :
      <ul className="gift-ideas-saved-list">{savedItems.map(item => <li key={item.id}>
        <span>{giftDisplayName(item)}</span><button type="button" className="gift-ideas-icon" aria-label={t('pages.giftIdeas.list.remove', { giftName: giftDisplayName(item) })}
          onClick={() => setSavedItems(previous => previous.filter(entry => entry.id !== item.id))}><Trash2 size={17} aria-hidden="true" /></button>
      </li>)}</ul>}
    <form className="gift-ideas-custom" onSubmit={addCustomIdea}>
      <label htmlFor="custom-gift">{t('pages.giftIdeas.custom.label')}</label>
      <input id="custom-gift" value={customIdea} maxLength={200} onChange={event => { setCustomIdea(event.target.value); setCustomError(''); }}
        placeholder={t('pages.giftIdeas.custom.placeholder')} aria-invalid={Boolean(customError)} aria-describedby={customError ? 'gift-custom-error' : undefined} />
      <button className="button button--secondary" type="submit">{t('pages.giftIdeas.custom.add')}</button>
      {customError && <p id="gift-custom-error" className="gift-ideas-error" role="alert">{customError}</p>}
    </form>
  </>;
  const download = <div className="gift-ideas-download">
    <Button onClick={() => void downloadPdf()} disabled={!savedItems.length || exporting}>
      {exporting ? t('pages.giftIdeas.pdf.preparing') : t('pages.giftIdeas.pdf.download')}
    </Button>
    {pdfError && <p className="gift-ideas-error" role="alert">{pdfError}</p>}
  </div>;

  return <SiteLayout current="ideas" hasProject={hasProject}><main className="ideas-page gift-ideas-page">
    <a className="ideas-back-link" href="#ideas"><ArrowLeft size={17} aria-hidden="true" />{t('pages.giftIdeas.back')}</a>
    <section className="ideas-hero" aria-labelledby="gift-ideas-title">
      <div className="ideas-hero__copy"><h1 id="gift-ideas-title" className="ideas-hero__title">{t('pages.giftIdeas.heroTitle')}</h1>
        <p className="ideas-hero__description">{t('pages.giftIdeas.description')}</p></div>
      <div className="ideas-hero__art">
        <img src={assetUrl(heroArtwork.print)} width={heroArtwork.width} height={heroArtwork.height} alt="" draggable={false} fetchPriority="high" />
      </div>
    </section>
    <BowDivider className="ideas-divider" />
    <div className="gift-ideas-shell">
      <aside className="gift-ideas-sidebar" aria-labelledby="gift-filters-title">
        <h2 id="gift-filters-title"><span className="gift-ideas-desktop-label">{t('pages.giftIdeas.filters.title')}</span>
          <button type="button" className="gift-ideas-filter-trigger" aria-expanded={filtersOpen} aria-controls="gift-filter-content" onClick={() => setFiltersOpen(open => !open)}>
            {t('pages.giftIdeas.filters.title')}<ChevronDown size={18} aria-hidden="true" /></button></h2>
        <div id="gift-filter-content" className={`gift-ideas-filter-content ${filtersOpen ? 'is-open' : ''}`}>
          <fieldset><legend>{t('pages.giftIdeas.filters.recipient')}</legend>
            {recipientIds.map(id => <label key={id} className="gift-ideas-option">
              <input type="radio" name="gift-recipient" checked={recipient === id} onChange={() => { setRecipient(id); resetCatalog(); }} />
              <span>{t(`pages.giftIdeas.recipients.${id}`)}</span></label>)}
          </fieldset>
          <fieldset><legend>{t('pages.giftIdeas.filters.type')}</legend>
            <label className="gift-ideas-option"><input type="checkbox" checked={!selectedTypes.length} onChange={() => { setSelectedTypes([]); resetCatalog(); }} /><span>{t('pages.giftIdeas.categories.all')}</span></label>
            {categoryIds.map(id => <label key={id} className="gift-ideas-option"><input type="checkbox" checked={selectedTypes.includes(id)} onChange={() => {
              setSelectedTypes(previous => previous.includes(id) ? previous.filter(value => value !== id) : [...previous, id]); resetCatalog();
            }} /><span>{t(`pages.giftIdeas.categories.${id}`)}</span></label>)}
          </fieldset>
          {activeFilters && <Button className="gift-ideas-reset" variant="secondary" onClick={resetFilters}>{t('pages.giftIdeas.filters.reset')}</Button>}
        </div>
      </aside>
      <section ref={catalog} className="gift-ideas-catalog" aria-labelledby="gift-catalog-title">
        <div className="gift-ideas-catalog__header"><h2 id="gift-catalog-title">{t('pages.giftIdeas.catalog.title')}</h2>
          <span role="status">{t('pages.giftIdeas.catalog.results', { count: Math.min(visibleCount, matches.length), total: matches.length })}</span></div>
        <div className="gift-ideas-list-grid" role="list">{matches.slice(0, visibleCount).map(gift => {
          const isSaved = selectedNames.has(giftNameKey(gift.name));
          return <div key={gift.id} className="gift-ideas-item" role="listitem"><span className="gift-ideas-item__name">{giftDisplayName(gift)}</span>
            <button type="button" className={`gift-ideas-item__toggle ${isSaved ? 'is-saved' : ''}`} aria-pressed={isSaved}
              aria-label={t(isSaved ? 'pages.giftIdeas.list.remove' : 'pages.giftIdeas.list.add', { giftName: giftDisplayName(gift) })} onClick={() => toggleGift(gift)}>
              <Heart size={20} fill={isSaved ? 'currentColor' : 'none'} aria-hidden="true" /></button></div>;
        })}</div>
        {!matches.length && <p className="gift-ideas-empty">{t('pages.giftIdeas.catalog.empty')}</p>}
        {visibleCount < matches.length && <div className="gift-ideas-more"><Button onClick={() => setVisibleCount(count => count + 20)}>
          {t('pages.giftIdeas.catalog.more', { count: Math.min(20, matches.length - visibleCount) })}</Button></div>}
      </section>
      {!compact && <aside className="gift-ideas-list-panel" aria-labelledby="gift-list-title">
        <h2 id="gift-list-title">{t('pages.giftIdeas.list.title')}</h2><div className="gift-ideas-list-scroll">{listContent}</div>{download}
      </aside>}
    </div>
    {compact && <button ref={listTrigger} className="button button--primary gift-ideas-list-trigger" type="button" aria-haspopup="dialog" aria-expanded={listOpen} onClick={() => setListOpen(open => !open)}>
      {listOpen ? <X size={18} aria-hidden="true" /> : <Heart size={18} aria-hidden="true" />}{t('pages.giftIdeas.list.open', { count: savedItems.length })}
    </button>}
    {compact && listOpen && <Modal title={t('pages.giftIdeas.list.title')} className="gift-list-dialog" overlayClassName="gift-list-overlay" footer={download}
      onClose={() => setListOpen(false)}>{listContent}</Modal>}
  </main></SiteLayout>;
}
