import type { ImageCategory, ImageMetadata, ImageMotif } from './images';

/** Artistic decorations are registered here when supplied; simple shapes use commands. */
export const decorationCategories: ImageCategory[] = [
  { id: 'snowflakes', name: { ru: 'Снежинки', en: 'Snowflakes' } },
  { id: 'stars', name: { ru: 'Звёзды', en: 'Stars' } },
  { id: 'evergreen', name: { ru: 'Хвойные веточки', en: 'Evergreen sprigs' } },
  { id: 'berries', name: { ru: 'Омела и ягоды', en: 'Mistletoe and berries' } },
  { id: 'ribbons', name: { ru: 'Бантики и ленты', en: 'Bows and ribbons' } },
  { id: 'frames', name: { ru: 'Углы и рамки', en: 'Corners and frames' } },
  { id: 'lines', name: { ru: 'Линии и точки', en: 'Lines and dots' } },
  { id: 'garlands', name: { ru: 'Гирлянды', en: 'Garlands' } },
];
export const decorationMotifs: ImageMotif[] = [];
export const decorations: ImageMetadata[] = [];
