import type { PostcardTemplate } from '../domain/postcards/types';
import { getPostcardResource } from '../content/postcard-assets';

function graphic(kind: 'image' | 'lettering', id: string, assetId: string, x: number, y: number, width: number) {
  const resource = getPostcardResource(kind, assetId);
  if (!resource) throw new Error(`Missing postcard template resource: ${assetId}`);
  return { id, assetId, x, y, width, height: width * resource.height / resource.width, rotation: 0, locked: false, opacity: 1 };
}

/** Blank starting formats remain separate from editable artistic compositions. */
export const blankPostcardTemplates: PostcardTemplate[] = [
  { id: 'blank-a6-portrait', name: { ru: 'Чистая A6 · вертикальная', en: 'Blank A6 · portrait' }, description: { ru: '105 × 148 мм. Начните с чистого листа.', en: '105 × 148 mm. Start with a blank card.' }, format: 'a6-portrait', background: { kind: 'solid', colors: ['#FFFFFF'], angle: 90, centerX: 0.5, centerY: 0.5 }, elements: [] },
  { id: 'blank-a6-landscape', name: { ru: 'Чистая A6 · горизонтальная', en: 'Blank A6 · landscape' }, description: { ru: '148 × 105 мм. Место для ваших идей.', en: '148 × 105 mm. Room for your ideas.' }, format: 'a6-landscape', background: { kind: 'solid', colors: ['#FFFFFF'], angle: 90, centerX: 0.5, centerY: 0.5 }, elements: [] },
  { id: 'blank-square', name: { ru: 'Чистая квадратная', en: 'Blank square' }, description: { ru: '105 × 105 мм. Небольшая история в квадрате.', en: '105 × 105 mm. A small story in a square.' }, format: 'square', background: { kind: 'solid', colors: ['#FFFFFF'], angle: 90, centerX: 0.5, centerY: 0.5 }, elements: [] },
];
/** Editable compositions. Greeting artwork is kept separate for later replacement. */
export const artisticPostcardTemplates: PostcardTemplate[] = [
  {
    id: 'santa-christmas-a6-portrait',
    name: { ru: 'Санта с подарками', en: 'Santa with presents' },
    description: { ru: 'Санта с мешком подарков, красная надпись и зимний узор на тёплой бумаге.', en: 'Santa with a gift sack, a red greeting and a winter pattern on warm paper.' },
    format: 'a6-portrait',
    background: { kind: 'image', assetId: 'minimalist-christmas-fir-trees-snowflakes-pattern', color: '#FAEBD8' },
    elements: [
      { type: 'image', ...graphic('image', 'santa-christmas-illustration', 'santa-gift-sack', 10, 41, 85) },
      { type: 'lettering', ...graphic('lettering', 'santa-christmas-greeting', 'vintage-watercolour-ho-ho-ho', 9, 8, 87) },
    ],
  },
  {
    id: 'elf-workshop-a6-landscape',
    name: { ru: 'Мастерская эльфа', en: 'The elf workshop' },
    description: { ru: 'Эльф расписывает игрушки среди подарков, золотых звёзд и праздничных пожеланий.', en: 'An elf paints ornaments among presents, golden stars and a festive greeting.' },
    format: 'a6-landscape',
    background: { kind: 'image', assetId: 'delicate-golden-star-sparkle', color: '#FAEBD8' },
    elements: [
      { type: 'image', ...graphic('image', 'elf-workshop-illustration', 'elf-painting-ornaments', 25.25, 8, 97.5) },
      { type: 'lettering', ...graphic('lettering', 'elf-workshop-greeting', 'golden-glitter-merry-christmas', 21.5, 67, 105) },
    ],
  },
  {
    id: 'squirrel-christmas-square',
    name: { ru: 'Рождество у белочек', en: 'Woodland squirrel Christmas' },
    description: { ru: 'Две белочки с корзинкой орехов, голубые снежинки и красное поздравление.', en: 'Two squirrels with a basket of nuts, blue snowflakes and a red greeting.' },
    format: 'square',
    background: { kind: 'image', assetId: 'watercolor-winter-sky-snowflakes', color: '#DDECF6' },
    elements: [
      { type: 'image', ...graphic('image', 'squirrel-christmas-illustration', 'squirrel-pair-nut-basket', 18.5, 39, 68) },
      { type: 'lettering', ...graphic('lettering', 'squirrel-christmas-greeting', 'red-brush-calligraphy-merry-christmas', 20.5, 4, 64) },
    ],
  },
];
export const postcardTemplates = [...blankPostcardTemplates, ...artisticPostcardTemplates];
