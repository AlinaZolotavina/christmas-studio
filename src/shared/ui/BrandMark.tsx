import { assetUrl } from '../../content/assets';
import { brandArtwork } from '../../data/site-art';
import './brand-mark.css';

export function BrandMark() {
  return <img className="brand-mark" src={assetUrl(brandArtwork.src)} width={brandArtwork.width} height={brandArtwork.height} alt="" aria-hidden="true" draggable={false} />;
}
