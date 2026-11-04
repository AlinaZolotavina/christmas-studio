import type { PostcardTemplate } from '../domain/postcards/types';

/** Real blank starting formats, separate from future editable artistic compositions. */
export const blankPostcardTemplates: PostcardTemplate[] = [
  { id: 'blank-a6-portrait', name: { ru: 'Чистая A6 · вертикальная', en: 'Blank A6 · portrait' }, description: { ru: '105 × 148 мм. Начните с чистого листа.', en: '105 × 148 mm. Start with a blank card.' }, format: 'a6-portrait', background: { kind: 'solid', colors: ['#FFFFFF'], angle: 90, centerX: 0.5, centerY: 0.5 }, elements: [] },
  { id: 'blank-a6-landscape', name: { ru: 'Чистая A6 · горизонтальная', en: 'Blank A6 · landscape' }, description: { ru: '148 × 105 мм. Место для ваших идей.', en: '148 × 105 mm. Room for your ideas.' }, format: 'a6-landscape', background: { kind: 'solid', colors: ['#FFFFFF'], angle: 90, centerX: 0.5, centerY: 0.5 }, elements: [] },
  { id: 'blank-square', name: { ru: 'Чистая квадратная', en: 'Blank square' }, description: { ru: '105 × 105 мм. Небольшая история в квадрате.', en: '105 × 105 mm. A small story in a square.' }, format: 'square', background: { kind: 'solid', colors: ['#FFFFFF'], angle: 90, centerX: 0.5, centerY: 0.5 }, elements: [] },
];
export const artisticPostcardTemplates: PostcardTemplate[] = [];
export const postcardTemplates = [...blankPostcardTemplates, ...artisticPostcardTemplates];
