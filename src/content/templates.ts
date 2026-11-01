import type { TemplateDefinition } from '../domain/types';

export const templates: TemplateDefinition[] = [
  { id: 'woodland', name: 'Хвойная сказка', description: 'Еловые ветви, тёплая бумага и маленькие чудеса.', eyebrow: 'ТЕПЛО ЛЕСА', color: '#315c4c', background: '#fcf2e2', shape: 'tag', fontId: 'serif', assetIds: ['woodland-christmas-tree', 'rustic-wooden-star', 'robin-bird-feeder'] },
  { id: 'winter', name: 'Зимние истории', description: 'Снежные домики и герои любимых зимних сказок.', eyebrow: 'НЕМНОГО ВОЛШЕБСТВА', color: '#436779', background: '#edf3f5', shape: 'tag', fontId: 'serif', assetIds: ['snowy-fairytale-cottage', 'snow-maiden-crystal-snowflake', 'russian-troika-snow'] },
  { id: 'vintage', name: 'Винтажный праздник', description: 'Знакомые с детства игрушки, красные ленты и золото.', eyebrow: 'ДОБРЫЕ ТРАДИЦИИ', color: '#963e3e', background: '#fbf0e8', shape: 'tag', fontId: 'script', assetIds: ['vintage-three-baubles', 'mantel-clock-wreath', 'red-glass-star'] },
];

export const getTemplate = (id: string): TemplateDefinition => templates.find(template => template.id === id) ?? templates[0];
