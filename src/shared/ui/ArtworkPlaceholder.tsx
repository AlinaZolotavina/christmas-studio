import { assetUrl } from '../../content/assets';
import { pageArtwork } from '../../data/site-art';
import './artwork-placeholder.css';

type ArtworkKind = 'branch' | 'winter-scene' | 'sprig' | 'tag-pair' | 'gift' | 'tag' | 'postcard' | 'sticker' | 'envelope';

/** Use supplied artwork when a slot is registered; retain geometry for pending assets. */
export function ArtworkPlaceholder({ kind, slot, className = '' }: { kind: ArtworkKind; slot: string; className?: string }) {
  const artwork = pageArtwork.find(item => item.id === slot);
  if (artwork) return <img className={`artwork-placeholder artwork-placeholder--image ${className}`} src={assetUrl(artwork.src)} width={artwork.width} height={artwork.height} data-art-slot={slot} alt="" aria-hidden="true" loading="lazy" decoding="async" draggable={false} />;
  return <div className={`artwork-placeholder artwork-placeholder--${kind} ${className}`} data-art-slot={slot} aria-hidden="true">
    <span className="artwork-placeholder__shape artwork-placeholder__shape--one" />
    <span className="artwork-placeholder__shape artwork-placeholder__shape--two" />
    <span className="artwork-placeholder__shape artwork-placeholder__shape--three" />
    <span className="artwork-placeholder__shape artwork-placeholder__shape--four" />
  </div>;
}
