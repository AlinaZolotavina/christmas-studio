import type { TemplateDefinition } from '../domain/types';
import { imageMatchesCategory, images, searchImages } from '../data/images';

// The user's 24-card selection from tests/tags.json is the complete short set.
const warmGiftAssetIds = [
  'christmas-gift-with-evergreen-sprigs-and-bow', 'winter-coat-rack-mittens',
  'christmas-gifts-russian-sleigh', 'wool-scarf-with-winter-decor',
  'christmas-gift-stack-red-ribbons', 'gift-stack-wooden-sleigh',
  'ivory-gift-golden-bow', 'knitted-red-mittens', 'watercolor-christmas-gift-arrangement',
  'twin-ivory-christmas-candles', 'christmas-tree-green-gifts', 'festive-tartan-scarf-with-decor',
  'burgundy-gift-golden-bow-holly', 'green-knitted-mittens', 'cranberry-knitted-scarf-fir-sprig',
  'vintage-ice-skates-on-red-scarf', 'christmas-heart-with-bow-and-berries', 'beeswax-winter-candle',
  'evergreen-gifts-red-bows', 'ivory-mittens-evergreen-pattern', 'bear-with-christmas-gift',
  'burgundy-knitted-christmas-bow', 'knitted-scarf-with-winter-decor', 'kraft-christmas-gifts-evergreen',
];
const warmGiftExtras = images.filter(image => ['seasonal-objects-candles', 'seasonal-objects-skates'].includes(image.subcategory) && !warmGiftAssetIds.includes(image.id)).map(image => image.id);
const birdIds = new Set(searchImages('', { subcategory: 'animals-birds' }).map(image => image.id));
const botanicalAssetIds = images.filter(image => image.category === 'botanical').map(image => image.id);
const animalAssetIds = images.filter(image => image.category === 'animals').map(image => image.id);
const winterAssetIds = images.filter(image => !imageMatchesCategory(image, 'russian-traditions') && (
  image.category === 'landscapes' && !image.tagsEn.includes('gingerbread-house') ||
  image.category === 'animals' && !birdIds.has(image.id)
)).map(image => image.id);
const festiveTableAssetIds = images.filter(image => image.category === 'treats' || image.subcategory === 'seasonal-objects-drinks').map(image => image.id);

export const templates: TemplateDefinition[] = [
  {
    id: 'woodland', name: 'Зимний сад', description: 'Хвойные ветви, праздничные цветы, ягоды и венки.', eyebrow: 'ЗИМНЯЯ БОТАНИКА', color: '#315c4c', background: '#fcf2e2', shape: 'tag', fontId: 'serif',
    assetIds: botanicalAssetIds,
  },
  {
    id: 'winter', name: 'Зимняя сказка', description: 'Заснеженные дома, тихие пейзажи и лесные звери.', eyebrow: 'НЕМНОГО ВОЛШЕБСТВА', color: '#436779', background: '#edf3f5', shape: 'tag', fontId: 'serif',
    assetIds: winterAssetIds,
  },
  {
    // Retain the internal ID so existing saved projects remain readable.
    id: 'vintage', name: 'Вкусное Рождество', description: 'Пряничные домики, рождественская выпечка, сладости и шампанское.', eyebrow: 'ПРАЗДНИЧНЫЙ СТОЛ', color: '#963e3e', background: '#fbf0e8', shape: 'tag', fontId: 'script',
    assetIds: festiveTableAssetIds,
  },
  {
    id: 'forest-friends', name: 'Лесные друзья', description: 'Лисички, оленята и другие обитатели снежного леса.', eyebrow: 'ДРУЗЬЯ РЯДОМ', color: '#3e6750', background: '#f1f1e5', shape: 'tag', fontId: 'sans',
    assetIds: animalAssetIds,
  },
  {
    id: 'warm-gifts', name: 'Тёплые подарки', description: 'Подарки, уютные шарфы, варежки, свечи и коньки.', eyebrow: 'СОГРЕВАТЬ И ДАРИТЬ', color: '#8a5143', background: '#fff3e5', shape: 'tag', fontId: 'serif',
    assetIds: [...warmGiftAssetIds, ...warmGiftExtras],
    requiredAssetIds: warmGiftAssetIds,
    alternateSubcategories: true,
  },
  {
    id: 'classic-christmas', name: 'Классическое Рождество', description: 'Рождественские венки, пуансеттии и красно-золотые детали.', eyebrow: 'РОЖДЕСТВЕНСКАЯ КЛАССИКА', color: '#8d3f43', background: '#fbf4e9', shape: 'tag', fontId: 'serif',
    assetIds: [
      'velvet-bow-wreath', 'potted-red-poinsettias', 'golden-holly-bells',
      'ivory-poinsettia-arrangement', 'red-poinsettia-flowers', 'mistletoe-wreath',
      'orange-cinnamon-wreath', 'wooden-ornament-wreath', 'holly-golden-berry-wreath',
      'mistletoe-ivory-berry-wreath', 'christmas-wreath-scarlet-bow', 'holly-red-ribbon',
      'holly-berry-branch', 'snowy-holly-branch', 'evergreen-holly-bouquet',
      'winter-berry-cone-bouquet', 'winter-red-bow-bouquet', 'mistletoe-burgundy-bow',
      'mistletoe-white-berries-red-ribbon', 'mistletoe-golden-bell-pendant', 'mistletoe-sprigs-velvet-bow',
      'woodland-christmas-tree', 'christmas-tree-golden-star', 'christmas-tree-red-baubles',
      'christmas-tree-natural-decorations', 'christmas-tree-red-bows', 'decorated-tree-snowy-forest',
      'snowy-spruce-red-berries', 'evergreen-jingle-bells', 'embossed-gold-bells-burgundy-bow',
      'ornate-gold-star-burgundy-bow', 'four-advent-candles', 'red-bauble-gold-pattern',
    ],
  },
];

export const getTemplate = (id: string): TemplateDefinition => templates.find(template => template.id === id) ?? templates[0];
