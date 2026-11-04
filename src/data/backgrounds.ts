import type { ImageCategory, ImageMetadata, ImageMotif } from './images';

/** Full-page artwork is opaque and remains separate from transparent illustrations. */
export interface BackgroundMetadata extends Omit<ImageMetadata, 'background'> {
  background: 'opaque';
  /** Describes the layout; a pattern is not assumed to tile seamlessly. */
  composition: 'pattern' | 'frame' | 'texture';
}

export const backgroundCategories: ImageCategory[] = [
  { id: 'background-patterns', name: { ru: 'Узоры', en: 'Patterns' } },
  { id: 'background-frames', name: { ru: 'Декоративные рамки', en: 'Decorative frames' } },
  { id: 'background-textures', name: { ru: 'Акварельные фоны', en: 'Watercolor backgrounds' } },
];

export const backgroundMotifs: ImageMotif[] = [
  { id: 'frames-hanging-ornaments', category: 'background-frames', name: { ru: 'Подвесные украшения', en: 'Hanging ornaments' } },
  { id: 'patterns-botanical', category: 'background-patterns', name: { ru: 'Падуб и банты', en: 'Holly and bows' } },
  { id: 'patterns-winter-symbols', category: 'background-patterns', name: { ru: 'Зимние символы', en: 'Winter symbols' } },
  { id: 'patterns-gingerbread', category: 'background-patterns', name: { ru: 'Имбирное печенье', en: 'Gingerbread cookies' } },
  { id: 'patterns-tartan', category: 'background-patterns', name: { ru: 'Клетка и тартан', en: 'Plaid and tartan' } },
  { id: 'frames-ornamental', category: 'background-frames', name: { ru: 'Золотые завитки', en: 'Golden flourishes' } },
  { id: 'frames-botanical', category: 'background-frames', name: { ru: 'Зимние растения', en: 'Winter botanicals' } },
  { id: 'textures-snowflakes', category: 'background-textures', name: { ru: 'Снег и снежинки', en: 'Snow and snowflakes' } },
  { id: 'textures-golden-botanical', category: 'background-textures', name: { ru: 'Золотые веточки', en: 'Golden sprigs' } },
  { id: 'textures-stars', category: 'background-textures', name: { ru: 'Звёзды и искры', en: 'Stars and sparkles' } },
];

/** Explicit metadata reviewed against the supplied artwork, independent of filenames. */
export const backgrounds: BackgroundMetadata[] = [
  {
    "id": "dreamy-golden-winter-snowfall",
    "source": "assets/backgrounds/dreamy-golden-winter-snowfall.png",
    "src": "backgrounds/dreamy-golden-winter-snowfall.png",
    "name": {
      "ru": "Голубой снегопад с тёплым золотым боке",
      "en": "Blue snowfall with warm golden bokeh"
    },
    "category": "background-textures",
    "subcategory": "textures-snowflakes",
    "tags": [
      "снегопад",
      "голубой",
      "золото",
      "боке",
      "снежинки",
      "сияние"
    ],
    "tagsEn": [
      "snowfall",
      "blue",
      "gold",
      "bokeh",
      "snowflakes",
      "glow"
    ],
    "aliases": [
      "зимнее золотистое сияние",
      "dreamy golden snowfall"
    ],
    "style": "watercolor-paper",
    "background": "opaque",
    "composition": "texture"
  },
  {
    "id": "dreamy-pastel-winter-sparkle",
    "source": "assets/backgrounds/dreamy-pastel-winter-sparkle.png",
    "src": "backgrounds/dreamy-pastel-winter-sparkle.png",
    "name": {
      "ru": "Пастельный зимний фон с мерцающими огнями",
      "en": "Pastel winter background with sparkling lights"
    },
    "category": "background-textures",
    "subcategory": "textures-stars",
    "tags": [
      "пастельный",
      "голубой",
      "розовый",
      "кремовый",
      "боке",
      "искры",
      "снежинки",
      "зима"
    ],
    "tagsEn": [
      "pastel",
      "blue",
      "pink",
      "cream",
      "bokeh",
      "sparkles",
      "snowflakes",
      "winter"
    ],
    "aliases": [
      "нежное зимнее мерцание",
      "pastel winter lights"
    ],
    "style": "watercolor-paper",
    "background": "opaque",
    "composition": "texture"
  },
  {
    "id": "dreamy-winter-snowflake-bokeh",
    "source": "assets/backgrounds/dreamy-winter-snowflake-bokeh.png",
    "src": "backgrounds/dreamy-winter-snowflake-bokeh.png",
    "name": {
      "ru": "Морозный голубой фон со снежинками и боке",
      "en": "Frosty blue snowflake and bokeh background"
    },
    "category": "background-textures",
    "subcategory": "textures-snowflakes",
    "tags": [
      "голубой",
      "синий",
      "снежинки",
      "снег",
      "боке",
      "мороз",
      "свет"
    ],
    "tagsEn": [
      "blue",
      "snowflakes",
      "snow",
      "bokeh",
      "frost",
      "light"
    ],
    "aliases": [
      "холодное зимнее сияние",
      "icy blue snowflake glow"
    ],
    "style": "watercolor-paper",
    "background": "opaque",
    "composition": "texture"
  },
  {
    "id": "elegant-gold-winter-watercolour-background",
    "source": "assets/backgrounds/elegant-gold-winter-watercolour-background.png",
    "src": "backgrounds/elegant-gold-winter-watercolour-background.png",
    "name": {
      "ru": "Пастельная акварельная бумага с золотыми звёздами",
      "en": "Pastel watercolor paper with golden stars"
    },
    "category": "background-textures",
    "subcategory": "textures-stars",
    "tags": [
      "акварель",
      "пастельный",
      "розовый",
      "голубой",
      "кремовый",
      "золото",
      "звёзды",
      "завитки"
    ],
    "tagsEn": [
      "watercolor",
      "pastel",
      "pink",
      "blue",
      "cream",
      "gold",
      "stars",
      "flourishes"
    ],
    "aliases": [
      "нежная золотая зимняя бумага",
      "elegant golden winter wash"
    ],
    "style": "watercolor-paper",
    "background": "opaque",
    "composition": "texture"
  },
  {
    "id": "vintage-botanical-christmas-snowflakes",
    "source": "assets/backgrounds/vintage-botanical-christmas-snowflakes.png",
    "src": "backgrounds/vintage-botanical-christmas-snowflakes.png",
    "name": {
      "ru": "Винтажная кремовая рамка с хвойными веточками и снежинками",
      "en": "Vintage cream border with evergreen sprigs and snowflakes"
    },
    "category": "background-frames",
    "subcategory": "frames-botanical",
    "tags": [
      "винтаж",
      "кремовый",
      "бумага",
      "хвоя",
      "шишки",
      "снежинки",
      "рамка",
      "сепия"
    ],
    "tagsEn": [
      "vintage",
      "cream",
      "paper",
      "evergreen",
      "pine cones",
      "snowflakes",
      "frame",
      "sepia"
    ],
    "aliases": [
      "старинная рождественская бумага с хвоей",
      "antique botanical Christmas border"
    ],
    "style": "watercolor-paper",
    "background": "opaque",
    "composition": "frame"
  },
  {
    "id": "vintage-icy-blue-snowflake-paper-texture",
    "source": "assets/backgrounds/vintage-icy-blue-snowflake-paper-texture.png",
    "src": "backgrounds/vintage-icy-blue-snowflake-paper-texture.png",
    "name": {
      "ru": "Состаренная голубая бумага со снежинками",
      "en": "Vintage icy blue paper with snowflakes"
    },
    "category": "background-textures",
    "subcategory": "textures-snowflakes",
    "tags": [
      "винтаж",
      "голубой",
      "бумага",
      "текстура",
      "снежинки",
      "снег",
      "акварель"
    ],
    "tagsEn": [
      "vintage",
      "icy blue",
      "paper",
      "texture",
      "snowflakes",
      "snow",
      "watercolor"
    ],
    "aliases": [
      "морозная винтажная бумага",
      "antique snowy blue stationery"
    ],
    "style": "watercolor-paper",
    "background": "opaque",
    "composition": "texture"
  },
  {
    "id": "vintage-sepia-christmas-stationery",
    "source": "assets/backgrounds/vintage-sepia-christmas-stationery.png",
    "src": "backgrounds/vintage-sepia-christmas-stationery.png",
    "name": {
      "ru": "Винтажная бумага с подвесными игрушками и бантиками",
      "en": "Vintage stationery with hanging ornaments and bows"
    },
    "category": "background-frames",
    "subcategory": "frames-hanging-ornaments",
    "tags": [
      "винтаж",
      "сепия",
      "кремовый",
      "бумага",
      "ёлочные шары",
      "подвески",
      "бантики",
      "звёзды",
      "рамка"
    ],
    "tagsEn": [
      "vintage",
      "sepia",
      "cream",
      "paper",
      "baubles",
      "hanging ornaments",
      "bows",
      "stars",
      "frame"
    ],
    "aliases": [
      "старинная рождественская канцелярская бумага",
      "antique Christmas stationery"
    ],
    "style": "watercolor-paper",
    "background": "opaque",
    "composition": "frame"
  },
  {
    "id": "vintage-winter-botanical-watercolour-background",
    "source": "assets/backgrounds/vintage-winter-botanical-watercolour-background.png",
    "src": "backgrounds/vintage-winter-botanical-watercolour-background.png",
    "name": {
      "ru": "Розовая винтажная бумага с зимними веточками",
      "en": "Rose vintage paper with winter botanical sprigs"
    },
    "category": "background-frames",
    "subcategory": "frames-botanical",
    "tags": [
      "винтаж",
      "розовый",
      "бумага",
      "веточки",
      "хвоя",
      "ягоды",
      "снежинки",
      "завитки",
      "рамка"
    ],
    "tagsEn": [
      "vintage",
      "rose",
      "paper",
      "sprigs",
      "evergreen",
      "berries",
      "snowflakes",
      "flourishes",
      "frame"
    ],
    "aliases": [
      "нежная розовая зимняя рамка",
      "blush botanical winter paper"
    ],
    "style": "watercolor-paper",
    "background": "opaque",
    "composition": "frame"
  },
  {
    id: 'watercolor-winter-sky-snowflakes',
    source: 'assets/backgrounds/watercolor-winter-sky-snowflakes.png', src: 'backgrounds/watercolor-winter-sky-snowflakes.png',
    name: { ru: 'Голубое и сиреневое зимнее небо со снежинками', en: 'Blue and lilac winter sky with snowflakes' },
    category: 'background-textures', subcategory: 'textures-snowflakes', composition: 'texture', background: 'opaque',
    tags: ['акварель', 'зима', 'небо', 'снежинки', 'снег', 'голубой', 'сиреневый', 'градиент'],
    tagsEn: ['watercolor', 'winter', 'sky', 'snowflakes', 'snow', 'blue', 'lilac', 'gradient'],
    aliases: ['нежное морозное небо', 'голубая зимняя бумага', 'pastel winter sky', 'lavender snowfall'], style: 'watercolor-paper',
  },
  {
    id: 'elegant-golden-christmas-background',
    source: 'assets/backgrounds/elegant-golden-christmas-background.png', src: 'backgrounds/elegant-golden-christmas-background.png',
    name: { ru: 'Кремовый рождественский фон с золотыми веточками', en: 'Cream Christmas background with golden sprigs' },
    category: 'background-textures', subcategory: 'textures-golden-botanical', composition: 'texture', background: 'opaque',
    tags: ['акварель', 'рождество', 'кремовый', 'золото', 'хвоя', 'веточки', 'звёзды', 'бумага'],
    tagsEn: ['watercolor', 'christmas', 'cream', 'gold', 'evergreen', 'sprigs', 'stars', 'paper'],
    aliases: ['золотистая рождественская бумага', 'светлый праздничный фон', 'elegant gold foliage', 'ivory Christmas paper'], style: 'watercolor-paper',
  },
  {
    id: 'festive-watercolor-holly-bows-gold-pattern',
    source: 'assets/backgrounds/festive-watercolor-holly-bows-gold-pattern.png', src: 'backgrounds/festive-watercolor-holly-bows-gold-pattern.png',
    name: { ru: 'Узор с падубом, красными бантами и золотыми деталями', en: 'Holly, red bows and gold detail pattern' },
    category: 'background-patterns', subcategory: 'patterns-botanical', composition: 'pattern', background: 'opaque',
    tags: ['акварель', 'узор', 'падуб', 'ягоды', 'красные банты', 'золото', 'веточки', 'кремовый'],
    tagsEn: ['watercolor', 'pattern', 'holly', 'berries', 'red bows', 'gold', 'sprigs', 'cream'],
    aliases: ['рождественский узор с бантиками', 'растительная праздничная бумага', 'holly wrapping paper', 'festive ribbon pattern'], style: 'watercolor-pattern',
  },
  {
    id: 'festive-rose-winter-pattern',
    source: 'assets/backgrounds/festive-rose-winter-pattern.png', src: 'backgrounds/festive-rose-winter-pattern.png',
    name: { ru: 'Розовый зимний фон со снежинками и ягодами', en: 'Rose winter background with snowflakes and berries' },
    category: 'background-textures', subcategory: 'textures-snowflakes', composition: 'texture', background: 'opaque',
    tags: ['акварель', 'зима', 'розовый', 'кремовый', 'градиент', 'снежинки', 'ягоды', 'золотые звёзды'],
    tagsEn: ['watercolor', 'winter', 'rose', 'cream', 'gradient', 'snowflakes', 'berries', 'golden stars'],
    aliases: ['пудровая зимняя бумага', 'нежный розовый фон', 'blush Christmas background', 'pink snowfall paper'], style: 'watercolor-paper',
  },
  {
    id: 'minimalist-christmas-fir-trees-snowflakes-pattern',
    source: 'assets/backgrounds/minimalist-christmas-fir-trees-snowflakes-pattern.png', src: 'backgrounds/minimalist-christmas-fir-trees-snowflakes-pattern.png',
    name: { ru: 'Лаконичный узор с ёлочками и снежинками', en: 'Minimal fir tree and snowflake pattern' },
    category: 'background-patterns', subcategory: 'patterns-winter-symbols', composition: 'pattern', background: 'opaque',
    tags: ['узор', 'минимализм', 'ёлочки', 'снежинки', 'кремовый', 'красный', 'зелёный', 'зима'],
    tagsEn: ['pattern', 'minimal', 'fir trees', 'snowflakes', 'cream', 'red', 'green', 'winter'],
    aliases: ['маленькие ёлки на бумаге', 'новогодний узор', 'tiny Christmas trees', 'simple winter pattern'], style: 'watercolor-pattern',
  },
  {
    id: 'vintage-star-parchment-ornaments',
    source: 'assets/backgrounds/vintage-star-parchment-ornaments.png', src: 'backgrounds/vintage-star-parchment-ornaments.png',
    name: { ru: 'Винтажный пергамент с золотыми звёздами и завитками', en: 'Vintage parchment with golden stars and flourishes' },
    category: 'background-frames', subcategory: 'frames-ornamental', composition: 'frame', background: 'opaque',
    tags: ['пергамент', 'винтаж', 'бумага', 'золото', 'звёзды', 'завитки', 'рамка', 'бежевый'],
    tagsEn: ['parchment', 'vintage', 'paper', 'gold', 'stars', 'flourishes', 'frame', 'beige'],
    aliases: ['состаренная бумага со звёздами', 'золотая орнаментальная рамка', 'antique star paper', 'ornate parchment'], style: 'vintage-watercolor',
  },
  {
    id: 'watercolor-christmas-gingerbread-pattern',
    source: 'assets/backgrounds/watercolor-christmas-gingerbread-pattern.png', src: 'backgrounds/watercolor-christmas-gingerbread-pattern.png',
    name: { ru: 'Акварельный узор с имбирным печеньем и леденцами', en: 'Watercolor gingerbread cookie and candy cane pattern' },
    category: 'background-patterns', subcategory: 'patterns-gingerbread', composition: 'pattern', background: 'opaque',
    tags: ['акварель', 'узор', 'имбирное печенье', 'пряники', 'леденцы', 'звёзды', 'сердечки', 'кремовый'],
    tagsEn: ['watercolor', 'pattern', 'gingerbread cookies', 'gingerbread', 'candy canes', 'stars', 'hearts', 'cream'],
    aliases: ['рождественская бумага со сладостями', 'пряничные человечки', 'Christmas cookie paper', 'gingerbread men pattern'], style: 'watercolor-pattern',
  },
  {
    id: 'delicate-winter-botanicals-sage-green',
    source: 'assets/backgrounds/delicate-winter-botanicals-sage-green.png', src: 'backgrounds/delicate-winter-botanicals-sage-green.png',
    name: { ru: 'Шалфейный фон с зимними веточками и снежинками', en: 'Sage background with winter sprigs and snowflakes' },
    category: 'background-frames', subcategory: 'frames-botanical', composition: 'frame', background: 'opaque',
    tags: ['акварель', 'шалфейный', 'зелёный', 'веточки', 'ягоды', 'снежинки', 'зима', 'рамка'],
    tagsEn: ['watercolor', 'sage', 'green', 'sprigs', 'berries', 'snowflakes', 'winter', 'frame'],
    aliases: ['нежный зелёный зимний фон', 'шалфейная зимняя бумага', 'soft green winter foliage', 'sage botanical border'], style: 'watercolor-paper',
  },
  {
    id: 'delicate-winter-snowflake-background',
    source: 'assets/backgrounds/delicate-winter-snowflake-background.png', src: 'backgrounds/delicate-winter-snowflake-background.png',
    name: { ru: 'Нежный голубой фон с белыми снежинками', en: 'Soft blue background with white snowflakes' },
    category: 'background-textures', subcategory: 'textures-snowflakes', composition: 'texture', background: 'opaque',
    tags: ['акварель', 'голубой', 'белый', 'снежинки', 'снег', 'зима', 'градиент', 'бумага'],
    tagsEn: ['watercolor', 'blue', 'white', 'snowflakes', 'snow', 'winter', 'gradient', 'paper'],
    aliases: ['морозная голубая бумага', 'светлый снежный фон', 'icy blue snowfall', 'delicate winter paper'], style: 'watercolor-paper',
  },
  {
    id: 'delicate-golden-star-sparkle',
    source: 'assets/backgrounds/delicate-golden-star-sparkle.png', src: 'backgrounds/delicate-golden-star-sparkle.png',
    name: { ru: 'Кремовая бумага с россыпью золотых звёзд', en: 'Cream paper scattered with golden stars' },
    category: 'background-textures', subcategory: 'textures-stars', composition: 'texture', background: 'opaque',
    tags: ['бумага', 'кремовый', 'золото', 'звёзды', 'искры', 'сияние', 'нежный', 'рождество'],
    tagsEn: ['paper', 'cream', 'gold', 'stars', 'sparkles', 'glow', 'delicate', 'christmas'],
    aliases: ['нежное золотое мерцание', 'звёздная праздничная бумага', 'subtle golden stardust', 'gold sparkle paper'], style: 'watercolor-paper',
  },
  {
    id: 'faded-vintage-tartan-paper',
    source: 'assets/backgrounds/faded-vintage-tartan-paper.png', src: 'backgrounds/faded-vintage-tartan-paper.png',
    name: { ru: 'Выцветший винтажный тартан на кремовой бумаге', en: 'Faded vintage tartan on cream paper' },
    category: 'background-patterns', subcategory: 'patterns-tartan', composition: 'pattern', background: 'opaque',
    tags: ['тартан', 'клетка', 'винтаж', 'бумага', 'бежевый', 'красный', 'зелёный', 'выцветший'],
    tagsEn: ['tartan', 'plaid', 'vintage', 'paper', 'beige', 'red', 'green', 'faded'],
    aliases: ['состаренная шотландская клетка', 'клетчатая рождественская бумага', 'antique plaid paper', 'muted Christmas tartan'], style: 'vintage-paper',
  },
  {
    id: 'winter-watercolor-spruce-branch-frame',
    source: 'assets/backgrounds/winter-watercolor-spruce-branch-frame.png', src: 'backgrounds/winter-watercolor-spruce-branch-frame.png',
    name: { ru: 'Голубая зимняя рамка с заснеженными еловыми ветвями', en: 'Blue winter frame with snowy spruce branches' },
    category: 'background-frames', subcategory: 'frames-botanical', composition: 'frame', background: 'opaque',
    tags: ['акварель', 'рамка', 'ель', 'ветви', 'хвоя', 'снег', 'снежинки', 'голубой'],
    tagsEn: ['watercolor', 'frame', 'spruce', 'branches', 'evergreen', 'snow', 'snowflakes', 'blue'],
    aliases: ['хвойная зимняя рамка', 'морозные ветки по углам', 'snowy fir border', 'icy evergreen frame'], style: 'watercolor-paper',
  },
  {
    id: 'shimmering-golden-stars-background',
    source: 'assets/backgrounds/shimmering-golden-stars-background.png', src: 'backgrounds/shimmering-golden-stars-background.png',
    name: { ru: 'Розовый акварельный фон с мерцающими золотыми звёздами', en: 'Rose watercolor background with shimmering golden stars' },
    category: 'background-textures', subcategory: 'textures-stars', composition: 'texture', background: 'opaque',
    tags: ['акварель', 'розовый', 'золото', 'звёзды', 'искры', 'мерцание', 'градиент', 'кремовый'],
    tagsEn: ['watercolor', 'rose', 'gold', 'stars', 'sparkles', 'shimmer', 'gradient', 'cream'],
    aliases: ['розовое звёздное сияние', 'праздничный фон с искрами', 'blush golden starlight', 'pink starry paper'], style: 'watercolor-paper',
  },
  {
    id: 'christmas-watercolor-poinsettia-berry-frame',
    source: 'assets/backgrounds/christmas-watercolor-poinsettia-berry-frame.png', src: 'backgrounds/christmas-watercolor-poinsettia-berry-frame.png',
    name: { ru: 'Рождественская рамка с пуансеттиями, хвоей и ягодами', en: 'Christmas frame with poinsettias, evergreen and berries' },
    category: 'background-frames', subcategory: 'frames-botanical', composition: 'frame', background: 'opaque',
    tags: ['акварель', 'рамка', 'рождество', 'пуансеттия', 'красные цветы', 'ягоды', 'хвоя', 'кремовый'],
    tagsEn: ['watercolor', 'frame', 'christmas', 'poinsettia', 'red flowers', 'berries', 'evergreen', 'cream'],
    aliases: ['цветочная рождественская бумага', 'рамка с рождественскими звёздами', 'poinsettia border', 'Christmas floral stationery'], style: 'watercolor-paper',
  },
  {
    id: 'scandinavian-winter-pattern-cream-paper',
    source: 'assets/backgrounds/scandinavian-winter-pattern-cream-paper.png', src: 'backgrounds/scandinavian-winter-pattern-cream-paper.png',
    name: { ru: 'Скандинавский узор со снежинками, ёлками и оленями', en: 'Scandinavian snowflake, fir tree and reindeer pattern' },
    category: 'background-patterns', subcategory: 'patterns-winter-symbols', composition: 'pattern', background: 'opaque',
    tags: ['узор', 'скандинавский', 'снежинки', 'ёлочки', 'олени', 'ромбы', 'кремовый', 'зима'],
    tagsEn: ['pattern', 'scandinavian', 'snowflakes', 'fir trees', 'reindeer', 'diamonds', 'cream', 'winter'],
    aliases: ['скандинавская рождественская бумага', 'северный зимний орнамент', 'Nordic Christmas paper', 'folk winter pattern'], style: 'watercolor-pattern',
  },
];
