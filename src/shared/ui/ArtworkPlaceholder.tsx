import './artwork-placeholder.css';

type ArtworkKind = 'branch' | 'winter-scene' | 'sprig' | 'tag-pair' | 'gift' | 'tag' | 'postcard' | 'sticker' | 'envelope';

/** Decorative geometry only. Slot IDs map to the image brief in docs/page-image-brief.md. */
export function ArtworkPlaceholder({ kind, slot, className = '' }: { kind: ArtworkKind; slot: string; className?: string }) {
  return <div className={`artwork-placeholder artwork-placeholder--${kind} ${className}`} data-art-slot={slot} aria-hidden="true">
    <span className="artwork-placeholder__shape artwork-placeholder__shape--one" />
    <span className="artwork-placeholder__shape artwork-placeholder__shape--two" />
    <span className="artwork-placeholder__shape artwork-placeholder__shape--three" />
    <span className="artwork-placeholder__shape artwork-placeholder__shape--four" />
  </div>;
}
