import { assets } from './assets';
import { localized } from '../i18n';
import { lettering } from '../data/lettering';
import { backgrounds } from '../data/backgrounds';
import { decorations } from '../data/decorations';
import type { ImageMetadata } from '../data/images';
import { resolveImageId } from '../data/images';
import letteringDimensions from './lettering-dimensions.json';
import backgroundDimensions from './background-dimensions.json';
import decorationDimensions from './decoration-dimensions.json';

export type PostcardResourceKind = 'image' | 'lettering' | 'decoration' | 'background';
export interface PostcardResource {
  id: string;
  name: string;
  category: string;
  width: number;
  height: number;
  preview: string;
  print: string;
  // Export bytes are normalized to PNG by the resource loader, including WebP sources.
  format: 'png' | 'svg';
}
type Dimensions = Record<string, { width: number; height: number }>;
const resource = (entry: Pick<ImageMetadata, 'id' | 'name' | 'category' | 'src'>, dimensions: Dimensions, folder: string): PostcardResource => ({
  id: entry.id, name: localized(entry.name), category: entry.category,
  ...dimensions[entry.id], preview: `${folder}/${entry.id}-preview.webp`, print: entry.src,
  format: entry.src.endsWith('.svg') ? 'svg' : 'png',
});
export const postcardIllustrations: PostcardResource[] = assets.map(asset => ({ ...asset, format: 'png' }));
export const postcardLettering: PostcardResource[] = lettering.map(entry => resource(entry, letteringDimensions, 'lettering'));
export const postcardBackgrounds: PostcardResource[] = backgrounds.map(entry => resource(entry, backgroundDimensions, 'backgrounds'));
// Decorative artwork uses the same original, preview and measured-dimensions contract.
export const postcardDecorations: PostcardResource[] = decorations.map(entry => resource(entry, decorationDimensions, 'decorations'));
const collections: Record<PostcardResourceKind, PostcardResource[]> = { image: postcardIllustrations, lettering: postcardLettering, background: postcardBackgrounds, decoration: postcardDecorations };
export const getPostcardResource = (kind: PostcardResourceKind, id: string): PostcardResource | undefined => collections[kind].find(entry => entry.id === (kind === 'image' ? resolveImageId(id) : id));
