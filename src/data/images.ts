/**
 * Explicit, visually reviewed illustration metadata. No semantic data is inferred
 * from filenames. Each image has one primary category and one primary motif.
 * includeTags adds curated secondary collections without duplicating images.
 * src resolves against Vite BASE_URL; source is the original printable PNG.
 */
export interface LocalizedLabel { ru: string; en: string; [locale: string]: string }
export interface ImageCategory { id: string; name: LocalizedLabel; includeTags?: string[] }
export interface ImageMotif { id: string; category: string; name: LocalizedLabel; includeTags?: string[] }
export type ImageSubcategory = ImageMotif;
export interface ImageMetadata {
  id: string;
  src: string;
  source: string;
  name: LocalizedLabel;
  category: string;
  /** Primary motif ID. The field name stays compatible with the original catalog. */
  subcategory: string;
  tags: string[];
  tagsEn: string[];
  aliases: string[];
  style?: string;
  background: 'transparent' | 'ivory';
  tagsByLocale?: Record<string, string[]>;
}
export interface ImageFilters {
  category?: string;
  subcategory?: string;
  background?: ImageMetadata['background'];
  tags?: string[];
}

export const categories: ImageCategory[] = [
  { id: 'characters', name: { ru: 'Персонажи', en: 'Characters' }, includeTags: ['character'] },
  { id: 'animals', name: { ru: 'Животные и птицы', en: 'Animals and birds' }, includeTags: ['animal', 'bird'] },
  { id: 'botanical', name: { ru: 'Растения и цветы', en: 'Plants and flowers' }, includeTags: ['botanical'] },
  { id: 'ornaments', name: { ru: 'Ёлочные украшения', en: 'Christmas ornaments' }, includeTags: ['ornament'] },
  { id: 'seasonal-objects', name: { ru: 'Праздничные предметы', en: 'Festive objects' }, includeTags: ['festive-object'] },
  { id: 'landscapes', name: { ru: 'Домики и пейзажи', en: 'Houses and landscapes' }, includeTags: ['landscape', 'winter-tree'] },
  { id: 'treats', name: { ru: 'Угощения', en: 'Festive treats' }, includeTags: ['treat'] },
  { id: 'russian-traditions', name: { ru: 'Русские новогодние традиции', en: 'Russian New Year traditions' }, includeTags: ['russian-traditions'] },
];

/** Empty future motifs are registered now and become visible when art is added. */
export const motifs: ImageMotif[] = [
  { id: 'seasonal-objects-windows', category: 'seasonal-objects', name: { ru: 'Зимние окна', en: 'Winter windows' } },
  { id: 'characters-father-frost', category: 'characters', name: { ru: 'Дед Мороз', en: 'Father Frost' } },
  { id: 'characters-snow-maiden', category: 'characters', name: { ru: 'Снегурочка', en: 'Snow Maiden' } },
  { id: 'characters-santa', category: 'characters', name: { ru: 'Санта-Клаус', en: 'Santa Claus' } },
  { id: 'characters-elves', category: 'characters', name: { ru: 'Эльфы', en: 'Elves' } },
  { id: 'characters-nutcracker', category: 'characters', name: { ru: 'Щелкунчик', en: 'Nutcracker' } },
  { id: 'characters-snowmen', category: 'characters', name: { ru: 'Снеговики', en: 'Snowmen' } },
  { id: 'animals-deer', category: 'animals', name: { ru: 'Олени', en: 'Deer' }, includeTags: ['deer'] },
  { id: 'animals-foxes', category: 'animals', name: { ru: 'Лисы', en: 'Foxes' }, includeTags: ['fox'] },
  { id: 'animals-hares', category: 'animals', name: { ru: 'Зайцы', en: 'Hares' }, includeTags: ['hare'] },
  { id: 'animals-squirrels', category: 'animals', name: { ru: 'Белки', en: 'Squirrels' }, includeTags: ['squirrel'] },
  { id: 'animals-bears', category: 'animals', name: { ru: 'Медведи', en: 'Bears' }, includeTags: ['bear'] },
  { id: 'animals-birds', category: 'animals', name: { ru: 'Птицы', en: 'Birds' }, includeTags: ['bird'] },
  { id: 'botanical-trees', category: 'botanical', name: { ru: 'Ёлки', en: 'Christmas trees' }, includeTags: ['christmas-tree'] },
  { id: 'botanical-branches', category: 'botanical', name: { ru: 'Ветви и хвоя', en: 'Branches and evergreen' } },
  { id: 'botanical-wreaths', category: 'botanical', name: { ru: 'Рождественские венки и букеты', en: 'Christmas wreaths and bouquets' }, includeTags: ['wreath', 'bouquet'] },
  { id: 'botanical-mistletoe', category: 'botanical', name: { ru: 'Омела', en: 'Mistletoe' }, includeTags: ['mistletoe'] },
  { id: 'botanical-holly', category: 'botanical', name: { ru: 'Падуб', en: 'Holly' }, includeTags: ['holly'] },
  { id: 'botanical-poinsettia', category: 'botanical', name: { ru: 'Пуансеттия', en: 'Poinsettia' }, includeTags: ['poinsettia'] },
  { id: 'botanical-berries', category: 'botanical', name: { ru: 'Зимние ягоды', en: 'Winter berries' }, includeTags: ['winter-berries'] },
  { id: 'ornaments-baubles', category: 'ornaments', name: { ru: 'Шары', en: 'Baubles' } },
  { id: 'ornaments-soviet', category: 'ornaments', name: { ru: 'Советские ёлочные игрушки', en: 'Soviet Christmas ornaments' }, includeTags: ['soviet'] },
  { id: 'ornaments-bells', category: 'ornaments', name: { ru: 'Колокольчики', en: 'Bells' } },
  { id: 'ornaments-stars', category: 'ornaments', name: { ru: 'Звёзды', en: 'Stars' } },
  { id: 'seasonal-objects-gifts', category: 'seasonal-objects', name: { ru: 'Подарки', en: 'Gifts' }, includeTags: ['gift'] },
  { id: 'seasonal-objects-clocks', category: 'seasonal-objects', name: { ru: 'Часы и куранты', en: 'Clocks and chimes' }, includeTags: ['clock'] },
  { id: 'seasonal-objects-drinks', category: 'seasonal-objects', name: { ru: 'Бокалы и шампанское', en: 'Glasses and champagne' } },
  { id: 'seasonal-objects-fireworks', category: 'seasonal-objects', name: { ru: 'Бенгальские огни и фейерверки', en: 'Sparklers and fireworks' } },
  { id: 'seasonal-objects-sleighs', category: 'seasonal-objects', name: { ru: 'Санки', en: 'Sleds' }, includeTags: ['sleigh'] },
  { id: 'seasonal-objects-skates', category: 'seasonal-objects', name: { ru: 'Коньки', en: 'Ice skates' } },
  { id: 'seasonal-objects-mittens', category: 'seasonal-objects', name: { ru: 'Варежки', en: 'Mittens' } },
  { id: 'seasonal-objects-scarves', category: 'seasonal-objects', name: { ru: 'Шарфы', en: 'Scarves' } },
  { id: 'seasonal-objects-felt-boots', category: 'seasonal-objects', name: { ru: 'Валенки', en: 'Felt boots' } },
  { id: 'seasonal-objects-nesting-dolls', category: 'seasonal-objects', name: { ru: 'Матрёшки', en: 'Nesting dolls' } },
  { id: 'seasonal-objects-candles', category: 'seasonal-objects', name: { ru: 'Свечи', en: 'Candles' } },
  { id: 'seasonal-objects-snowflakes', category: 'seasonal-objects', name: { ru: 'Снежинки и морозные узоры', en: 'Snowflakes and frost patterns' } },
  { id: 'landscapes-cottages', category: 'landscapes', name: { ru: 'Уютные домики', en: 'Cozy cottages' }, includeTags: ['cottage'] },
  { id: 'landscapes-gingerbread-houses', category: 'landscapes', name: { ru: 'Пряничные домики', en: 'Gingerbread houses' }, includeTags: ['gingerbread-house'] },
  { id: 'landscapes-churches', category: 'landscapes', name: { ru: 'Церкви', en: 'Churches' } },
  { id: 'landscapes-villages', category: 'landscapes', name: { ru: 'Заснеженные деревни', en: 'Snowy villages' }, includeTags: ['snowy-village'] },
  { id: 'landscapes-cities', category: 'landscapes', name: { ru: 'Зимние города', en: 'Winter cities' }, includeTags: ['city-landscape'] },
  { id: 'landscapes-forests', category: 'landscapes', name: { ru: 'Лесные пейзажи', en: 'Forest landscapes' }, includeTags: ['forest-landscape'] },
  { id: 'landscapes-mountains', category: 'landscapes', name: { ru: 'Горы', en: 'Mountains' } },
  { id: 'landscapes-winter-trees', category: 'landscapes', name: { ru: 'Зимние деревья', en: 'Winter trees' }, includeTags: ['winter-tree'] },
  { id: 'treats-gingerbread-cookies', category: 'treats', name: { ru: 'Имбирное печенье', en: 'Gingerbread cookies' }, includeTags: ['gingerbread-cookie'] },
  { id: 'treats-gingerbread', category: 'treats', name: { ru: 'Пряники', en: 'Decorated gingerbread' }, includeTags: ['gingerbread'] },
  { id: 'treats-candy', category: 'treats', name: { ru: 'Конфеты и леденцы', en: 'Candy and candy canes' }, includeTags: ['candy'] },
  { id: 'treats-hot-chocolate', category: 'treats', name: { ru: 'Горячий шоколад', en: 'Hot chocolate' } },
  { id: 'treats-baking', category: 'treats', name: { ru: 'Рождественская выпечка', en: 'Christmas baking' }, includeTags: ['christmas-baking'] },
  { id: 'treats-citrus', category: 'treats', name: { ru: 'Мандарины и цитрусы', en: 'Tangerines and citrus' } },
  { id: 'russian-traditions-postcards', category: 'russian-traditions', name: { ru: 'Советские открытки', en: 'Soviet postcards' }, includeTags: ['soviet-postcard'] },
  { id: 'russian-traditions-fairytales', category: 'russian-traditions', name: { ru: 'Русские зимние сказки', en: 'Russian winter fairy tales' }, includeTags: ['russian-fairytale'] },
  { id: 'russian-traditions-folk', category: 'russian-traditions', name: { ru: 'Русские народные мотивы', en: 'Russian folk motifs' }, includeTags: ['russian-folk'] },
  { id: 'russian-traditions-symbols', category: 'russian-traditions', name: { ru: 'Русские новогодние символы', en: 'Russian New Year symbols' }, includeTags: ['russian-symbol'] },
  { id: 'russian-traditions-troikas', category: 'russian-traditions', name: { ru: 'Тройки и сани', en: 'Troikas and sleighs' }, includeTags: ['troika'] },
  { id: 'russian-traditions-houses', category: 'russian-traditions', name: { ru: 'Русские дома и деревни', en: 'Russian houses and villages' }, includeTags: ['russian-house'] },
];

/** Compatibility alias: a subcategory is now presented as a motif. */
export const subcategories = motifs;


/** Retain stored references when an identical source is consolidated. */
export const imageAliases: Record<string, string> = { 'watercolor-snowy-alpine-village-1': 'watercolor-snowy-alpine-village' };
export const resolveImageId = (id: string) => imageAliases[id] ?? id;

export const images: ImageMetadata[] = [
  {
    "id": "christmas-bauble-with-snowy-village",
    "source": "original-assets/christmas-bauble-with-snowy-village.png",
    "src": "art/christmas-bauble-with-snowy-village.webp",
    "name": {
      "ru": "Ёлочный шар с заснеженной деревней и красным бантом",
      "en": "Christmas bauble with a snowy village and red bow"
    },
    "category": "ornaments",
    "subcategory": "ornaments-baubles",
    "tags": [
      "шар",
      "деревня",
      "снег",
      "красный бант",
      "золото"
    ],
    "tagsEn": [
      "ornament",
      "bauble",
      "snowy village",
      "red bow",
      "gold"
    ],
    "aliases": [
      "игрушка с зимним пейзажем",
      "winter village bauble"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "christmas-clock-ornament-with-snowy-branches",
    "source": "original-assets/christmas-clock-ornament-with-snowy-branches.png",
    "src": "art/christmas-clock-ornament-with-snowy-branches.webp",
    "name": {
      "ru": "Ёлочные часы с заснеженными ветвями и бантом",
      "en": "Christmas clock ornament with snowy branches and bow"
    },
    "category": "seasonal-objects",
    "subcategory": "seasonal-objects-clocks",
    "tags": [
      "часы",
      "куранты",
      "хвоя",
      "красный бант",
      "золото"
    ],
    "tagsEn": [
      "festive-object",
      "clock",
      "ornament",
      "evergreen",
      "red bow",
      "gold"
    ],
    "aliases": [
      "новогодние часики",
      "christmas clock"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "christmas-gift-with-evergreen-sprigs-and-bow",
    "source": "original-assets/christmas-gift-with-evergreen-sprigs-and-bow.png",
    "src": "art/christmas-gift-with-evergreen-sprigs-and-bow.webp",
    "name": {
      "ru": "Красный подарок с золотым бантом и хвойными веточками",
      "en": "Red Christmas gift with a golden bow and evergreen sprigs"
    },
    "category": "seasonal-objects",
    "subcategory": "seasonal-objects-gifts",
    "tags": [
      "подарок",
      "красный",
      "золотая лента",
      "хвоя",
      "шишки"
    ],
    "tagsEn": [
      "festive-object",
      "gift",
      "red",
      "golden ribbon",
      "evergreen",
      "pine cones"
    ],
    "aliases": [
      "коробка с золотым бантом",
      "gold bow present"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "christmas-heart-with-bow-and-berries",
    "source": "original-assets/christmas-heart-with-bow-and-berries.png",
    "src": "art/christmas-heart-with-bow-and-berries.webp",
    "name": {
      "ru": "Пряничное сердце с красным бантом и ягодами",
      "en": "Gingerbread heart with a red bow and berries"
    },
    "category": "treats",
    "subcategory": "treats-gingerbread",
    "tags": [
      "пряник",
      "сердце",
      "глазурь",
      "красный бант",
      "ягоды"
    ],
    "tagsEn": [
      "treat",
      "gingerbread",
      "heart",
      "icing",
      "red bow",
      "berries"
    ],
    "aliases": [
      "пряничное сердечко",
      "iced gingerbread heart"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "christmas-keepsake-box-with-kremlin-tower",
    "source": "original-assets/christmas-keepsake-box-with-kremlin-tower.png",
    "src": "art/christmas-keepsake-box-with-kremlin-tower.webp",
    "name": {
      "ru": "Красная подарочная коробка с кремлёвской башней",
      "en": "Red Christmas keepsake box with a Kremlin tower"
    },
    "category": "seasonal-objects",
    "subcategory": "seasonal-objects-gifts",
    "tags": [
      "подарок",
      "коробка",
      "кремль",
      "башня",
      "звезда",
      "золотая лента"
    ],
    "tagsEn": [
      "festive-object",
      "gift",
      "keepsake box",
      "kremlin",
      "tower",
      "russian-symbol",
      "russian-traditions",
      "gold ribbon"
    ],
    "aliases": [
      "подарок с курантами",
      "kremlin gift box"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "christmas-star-cookie-with-evergreen",
    "source": "original-assets/christmas-star-cookie-with-evergreen.png",
    "src": "art/christmas-star-cookie-with-evergreen.webp",
    "name": {
      "ru": "Пряничная звезда с глазурью, бантом и хвоей",
      "en": "Iced gingerbread star with a bow and evergreen"
    },
    "category": "treats",
    "subcategory": "treats-gingerbread-cookies",
    "tags": [
      "печенье",
      "пряник",
      "звезда",
      "глазурь",
      "хвоя",
      "бант"
    ],
    "tagsEn": [
      "treat",
      "gingerbread-cookie",
      "star",
      "icing",
      "evergreen",
      "bow"
    ],
    "aliases": [
      "звёздочка из печенья",
      "christmas star cookie"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "christmas-stollen-with-red-ribbon",
    "source": "original-assets/christmas-stollen-with-red-ribbon.png",
    "src": "art/christmas-stollen-with-red-ribbon.webp",
    "name": {
      "ru": "Рождественский штоллен с красной лентой и дольками апельсина",
      "en": "Christmas stollen with a red ribbon and orange slices"
    },
    "category": "treats",
    "subcategory": "treats-baking",
    "tags": [
      "штоллен",
      "выпечка",
      "сухофрукты",
      "апельсин",
      "красная лента"
    ],
    "tagsEn": [
      "treat",
      "christmas-baking",
      "stollen",
      "dried fruit",
      "orange",
      "red ribbon"
    ],
    "aliases": [
      "рождественский кекс с сухофруктами",
      "fruit stollen"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "christmas-troika-in-snowy-forest",
    "source": "original-assets/christmas-troika-in-snowy-forest.png",
    "src": "art/christmas-troika-in-snowy-forest.webp",
    "name": {
      "ru": "Дед Мороз на белой тройке в заснеженном лесу",
      "en": "Father Frost riding a white troika in a snowy forest"
    },
    "category": "seasonal-objects",
    "subcategory": "seasonal-objects-sleighs",
    "tags": [
      "тройка",
      "лошади",
      "сани",
      "дед мороз",
      "лес",
      "снег"
    ],
    "tagsEn": [
      "festive-object",
      "sleigh",
      "troika",
      "horses",
      "father frost",
      "russian-traditions",
      "forest",
      "snow"
    ],
    "aliases": [
      "тройка с Дедом Морозом",
      "father frost horse sleigh"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "festive-champagne-and-greenery-arrangement",
    "source": "original-assets/festive-champagne-and-greenery-arrangement.png",
    "src": "art/festive-champagne-and-greenery-arrangement.webp",
    "name": {
      "ru": "Два широких бокала шампанского с хвоей и бантом",
      "en": "Two champagne coupe glasses with evergreen and bow"
    },
    "category": "seasonal-objects",
    "subcategory": "seasonal-objects-drinks",
    "tags": [
      "шампанское",
      "бокалы",
      "купе",
      "хвоя",
      "ягоды",
      "бант"
    ],
    "tagsEn": [
      "festive-object",
      "champagne",
      "coupe glasses",
      "evergreen",
      "berries",
      "bow"
    ],
    "aliases": [
      "праздничные бокалы купе",
      "sparkling wine coupes"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "festive-fruitcake-with-icing",
    "source": "original-assets/festive-fruitcake-with-icing.png",
    "src": "art/festive-fruitcake-with-icing.webp",
    "name": {
      "ru": "Рождественский кекс с глазурью, падубом и апельсином",
      "en": "Christmas fruitcake with icing, holly and orange"
    },
    "category": "treats",
    "subcategory": "treats-baking",
    "tags": [
      "кекс",
      "выпечка",
      "сухофрукты",
      "глазурь",
      "падуб",
      "апельсин"
    ],
    "tagsEn": [
      "treat",
      "christmas-baking",
      "fruitcake",
      "icing",
      "holly",
      "orange"
    ],
    "aliases": [
      "фруктовый рождественский кекс",
      "iced festive cake"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "festive-glasses-with-evergreen-decor",
    "source": "original-assets/festive-glasses-with-evergreen-decor.png",
    "src": "art/festive-glasses-with-evergreen-decor.webp",
    "name": {
      "ru": "Два высоких бокала с шампанским и золотыми звёздами",
      "en": "Two champagne flutes with evergreen and golden stars"
    },
    "category": "seasonal-objects",
    "subcategory": "seasonal-objects-drinks",
    "tags": [
      "бокалы",
      "шампанское",
      "звёзды",
      "золото",
      "хвоя",
      "ленты"
    ],
    "tagsEn": [
      "festive-object",
      "champagne",
      "flutes",
      "golden stars",
      "evergreen",
      "ribbons"
    ],
    "aliases": [
      "высокие новогодние фужеры",
      "festive champagne flutes"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "festive-panettone-with-evergreen-decor",
    "source": "original-assets/festive-panettone-with-evergreen-decor.png",
    "src": "art/festive-panettone-with-evergreen-decor.webp",
    "name": {
      "ru": "Панеттоне с красной лентой, апельсином и хвоей",
      "en": "Panettone with a red ribbon, orange and evergreen"
    },
    "category": "treats",
    "subcategory": "treats-baking",
    "tags": [
      "панеттоне",
      "выпечка",
      "кекс",
      "апельсин",
      "красная лента"
    ],
    "tagsEn": [
      "treat",
      "christmas-baking",
      "panettone",
      "orange",
      "red ribbon"
    ],
    "aliases": [
      "итальянский рождественский кекс",
      "italian christmas cake"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "festive-sparkling-wine-bottle-with-bow",
    "source": "original-assets/festive-sparkling-wine-bottle-with-bow.png",
    "src": "art/festive-sparkling-wine-bottle-with-bow.webp",
    "name": {
      "ru": "Бутылка игристого вина с красным бантом и хвойным декором",
      "en": "Sparkling wine bottle with a red bow and evergreen decor"
    },
    "category": "seasonal-objects",
    "subcategory": "seasonal-objects-drinks",
    "tags": [
      "шампанское",
      "игристое вино",
      "бутылка",
      "красный бант",
      "хвоя"
    ],
    "tagsEn": [
      "festive-object",
      "champagne",
      "sparkling wine",
      "bottle",
      "red bow",
      "evergreen"
    ],
    "aliases": [
      "новогодняя бутылка шампанского",
      "festive wine bottle"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "gingerbread-angel-with-evergreen-sprigs",
    "source": "original-assets/gingerbread-angel-with-evergreen-sprigs.png",
    "src": "art/gingerbread-angel-with-evergreen-sprigs.webp",
    "name": {
      "ru": "Пряничный ангел с глазурью, бантом и хвоей",
      "en": "Gingerbread angel with icing, a bow and evergreen sprigs"
    },
    "category": "treats",
    "subcategory": "treats-gingerbread",
    "tags": [
      "пряник",
      "ангел",
      "глазурь",
      "хвоя",
      "красный бант"
    ],
    "tagsEn": [
      "treat",
      "gingerbread",
      "angel",
      "icing",
      "evergreen",
      "red bow"
    ],
    "aliases": [
      "рождественский пряничный ангелочек",
      "christmas cookie angel"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "gingerbread-arrangement-with-evergreen-and-ribbon",
    "source": "original-assets/gingerbread-arrangement-with-evergreen-and-ribbon.png",
    "src": "art/gingerbread-arrangement-with-evergreen-and-ribbon.webp",
    "name": {
      "ru": "Пряничные домик, сердце и ангел с лентой и хвоей",
      "en": "Gingerbread house, heart and angel with ribbon and evergreen"
    },
    "category": "treats",
    "subcategory": "treats-gingerbread",
    "tags": [
      "пряники",
      "домик",
      "сердце",
      "ангел",
      "глазурь",
      "хвоя"
    ],
    "tagsEn": [
      "treat",
      "gingerbread",
      "house",
      "heart",
      "angel",
      "icing",
      "evergreen"
    ],
    "aliases": [
      "композиция из рождественских пряников",
      "christmas gingerbread arrangement"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "gingerbread-house-in-snow",
    "source": "original-assets/gingerbread-house-in-snow.png",
    "src": "art/gingerbread-house-in-snow.webp",
    "name": {
      "ru": "Пряничный домик в снегу с леденцом и ёлочками",
      "en": "Snowy gingerbread house with a candy cane and little trees"
    },
    "category": "landscapes",
    "subcategory": "landscapes-gingerbread-houses",
    "tags": [
      "пряничный домик",
      "снег",
      "глазурь",
      "леденец",
      "ёлочки"
    ],
    "tagsEn": [
      "gingerbread-house",
      "treat",
      "snow",
      "icing",
      "candy cane",
      "christmas trees"
    ],
    "aliases": [
      "сказочный домик из пряника",
      "snowy candy house"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "gingerbread-house-under-snow",
    "source": "original-assets/gingerbread-house-under-snow.png",
    "src": "art/gingerbread-house-under-snow.webp",
    "name": {
      "ru": "Заснеженный пряничный домик с корицей и дольками апельсина",
      "en": "Snow-covered gingerbread house with cinnamon and orange slices"
    },
    "category": "landscapes",
    "subcategory": "landscapes-gingerbread-houses",
    "tags": [
      "пряничный домик",
      "снег",
      "корица",
      "апельсин",
      "глазурь"
    ],
    "tagsEn": [
      "gingerbread-house",
      "treat",
      "snow",
      "cinnamon",
      "orange",
      "icing"
    ],
    "aliases": [
      "пряничный дом со специями",
      "spiced gingerbread cottage"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "gingerbread-house-with-christmas-decor",
    "source": "original-assets/gingerbread-house-with-christmas-decor.png",
    "src": "art/gingerbread-house-with-christmas-decor.webp",
    "name": {
      "ru": "Пряничный домик с красной дверью, колокольчиками и бантом",
      "en": "Gingerbread house with a red door, bells and a bow"
    },
    "category": "landscapes",
    "subcategory": "landscapes-gingerbread-houses",
    "tags": [
      "пряничный домик",
      "красная дверь",
      "колокольчики",
      "бант",
      "глазурь"
    ],
    "tagsEn": [
      "gingerbread-house",
      "treat",
      "red door",
      "bells",
      "bow",
      "icing"
    ],
    "aliases": [
      "пряничный дом с колокольчиками",
      "bell decorated gingerbread house"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "gingerbread-house-with-icing-and-winter-decor",
    "source": "original-assets/gingerbread-house-with-icing-and-winter-decor.png",
    "src": "art/gingerbread-house-with-icing-and-winter-decor.webp",
    "name": {
      "ru": "Пряничный домик с сердцем над дверью и новогодними подарками",
      "en": "Iced gingerbread house with a heart above the door and Christmas gifts"
    },
    "category": "landscapes",
    "subcategory": "landscapes-gingerbread-houses",
    "tags": [
      "пряничный домик",
      "сердце",
      "подарки",
      "глазурь",
      "звёздочки"
    ],
    "tagsEn": [
      "gingerbread-house",
      "treat",
      "heart",
      "gifts",
      "icing",
      "stars"
    ],
    "aliases": [
      "домик из пряника с подарками",
      "gingerbread gift cottage"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "new-year-champagne-and-evergreen-arrangement",
    "source": "original-assets/new-year-champagne-and-evergreen-arrangement.png",
    "src": "art/new-year-champagne-and-evergreen-arrangement.webp",
    "name": {
      "ru": "Шампанское с двумя бокалами, золотой лентой и хвоей",
      "en": "Champagne bottle and two glasses with a golden ribbon and evergreen"
    },
    "category": "seasonal-objects",
    "subcategory": "seasonal-objects-drinks",
    "tags": [
      "шампанское",
      "бутылка",
      "бокалы",
      "золотая лента",
      "хвоя"
    ],
    "tagsEn": [
      "festive-object",
      "champagne",
      "bottle",
      "glasses",
      "golden ribbon",
      "evergreen"
    ],
    "aliases": [
      "новогодний набор шампанского с бокалами",
      "new year champagne arrangement"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "snowy-alpine-chalet",
    "source": "original-assets/snowy-alpine-chalet.png",
    "src": "art/snowy-alpine-chalet.webp",
    "name": {
      "ru": "Заснеженное альпийское шале у подножия гор",
      "en": "Snowy alpine chalet beneath the mountains"
    },
    "category": "landscapes",
    "subcategory": "landscapes-cottages",
    "tags": [
      "шале",
      "домик",
      "альпы",
      "горы",
      "снег",
      "ели"
    ],
    "tagsEn": [
      "landscape",
      "cottage",
      "chalet",
      "alps",
      "mountains",
      "snow",
      "fir trees"
    ],
    "aliases": [
      "зимний домик в горах",
      "winter mountain chalet"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "snowy-alpine-valley-with-stream",
    "source": "original-assets/snowy-alpine-valley-with-stream.png",
    "src": "art/snowy-alpine-valley-with-stream.webp",
    "name": {
      "ru": "Заснеженная альпийская долина с ручьём и елями",
      "en": "Snowy alpine valley with a stream and fir trees"
    },
    "category": "landscapes",
    "subcategory": "landscapes-mountains",
    "tags": [
      "долина",
      "горы",
      "альпы",
      "ручей",
      "снег",
      "ели"
    ],
    "tagsEn": [
      "landscape",
      "valley",
      "mountains",
      "alps",
      "stream",
      "snow",
      "fir trees"
    ],
    "aliases": [
      "зимний горный ручей",
      "winter alpine stream"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "snowy-window-with-christmas-decor",
    "source": "original-assets/snowy-window-with-christmas-decor.png",
    "src": "art/snowy-window-with-christmas-decor.webp",
    "name": {
      "ru": "Арочное морозное окно с хвоей, ягодами и бантом",
      "en": "Arched frosty window with evergreen, berries and a bow"
    },
    "category": "seasonal-objects",
    "subcategory": "seasonal-objects-windows",
    "tags": [
      "окно",
      "арка",
      "морозный узор",
      "хвоя",
      "ягоды",
      "бант"
    ],
    "tagsEn": [
      "festive-object",
      "window",
      "arch",
      "frost",
      "evergreen",
      "berries",
      "bow"
    ],
    "aliases": [
      "зимнее арочное окошко",
      "arched winter window"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "watercolor-champagne-glasses-with-winter-decor",
    "source": "original-assets/watercolor-champagne-glasses-with-winter-decor.png",
    "src": "art/watercolor-champagne-glasses-with-winter-decor.webp",
    "name": {
      "ru": "Два бокала шампанского с зимним декором и красной лентой",
      "en": "Two champagne glasses with winter decor and a red ribbon"
    },
    "category": "seasonal-objects",
    "subcategory": "seasonal-objects-drinks",
    "tags": [
      "шампанское",
      "бокалы",
      "хвоя",
      "ягоды",
      "красная лента"
    ],
    "tagsEn": [
      "festive-object",
      "champagne",
      "glasses",
      "evergreen",
      "berries",
      "red ribbon"
    ],
    "aliases": [
      "зимние бокалы с шампанским",
      "winter champagne glasses"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "watercolor-christmas-gift-arrangement",
    "source": "original-assets/watercolor-christmas-gift-arrangement.png",
    "src": "art/watercolor-christmas-gift-arrangement.webp",
    "name": {
      "ru": "Три новогодних подарка с красными и золотыми лентами",
      "en": "Three Christmas gifts with red and golden ribbons"
    },
    "category": "seasonal-objects",
    "subcategory": "seasonal-objects-gifts",
    "tags": [
      "подарки",
      "коробки",
      "красная лента",
      "золотая лента",
      "хвоя"
    ],
    "tagsEn": [
      "festive-object",
      "gift",
      "boxes",
      "red ribbon",
      "golden ribbon",
      "evergreen"
    ],
    "aliases": [
      "композиция из трёх подарков",
      "three festive presents"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "watercolor-gingerbread-house-in-snow",
    "source": "original-assets/watercolor-gingerbread-house-in-snow.png",
    "src": "art/watercolor-gingerbread-house-in-snow.webp",
    "name": {
      "ru": "Пряничный домик с тёплыми окнами и двумя пряничными ёлками",
      "en": "Gingerbread house with warm windows and two gingerbread trees"
    },
    "category": "landscapes",
    "subcategory": "landscapes-gingerbread-houses",
    "tags": [
      "пряничный домик",
      "тёплые окна",
      "ёлочки",
      "снег",
      "леденец"
    ],
    "tagsEn": [
      "gingerbread-house",
      "treat",
      "warm windows",
      "gingerbread trees",
      "snow",
      "candy cane"
    ],
    "aliases": [
      "сказочный домик с пряничными ёлочками",
      "gingerbread tree cottage"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "watercolor-winter-alpine-village",
    "source": "original-assets/watercolor-winter-alpine-village.png",
    "src": "art/watercolor-winter-alpine-village.webp",
    "name": {
      "ru": "Зимняя альпийская деревня с церковью и заснеженными вершинами",
      "en": "Winter alpine village with a church and snowy peaks"
    },
    "category": "landscapes",
    "subcategory": "landscapes-villages",
    "tags": [
      "деревня",
      "альпы",
      "горы",
      "церковь",
      "снег",
      "домики"
    ],
    "tagsEn": [
      "landscape",
      "snowy-village",
      "alps",
      "mountains",
      "church",
      "snow",
      "cottages"
    ],
    "aliases": [
      "альпийская деревушка зимой",
      "snowy alpine village with church"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "winter-alpine-cottage-in-snow",
    "source": "original-assets/winter-alpine-cottage-in-snow.png",
    "src": "art/winter-alpine-cottage-in-snow.webp",
    "name": {
      "ru": "Зимний альпийский домик у ели на фоне гор",
      "en": "Winter alpine cottage beside a fir tree and mountains"
    },
    "category": "landscapes",
    "subcategory": "landscapes-cottages",
    "tags": [
      "домик",
      "шале",
      "альпы",
      "горы",
      "ель",
      "снег"
    ],
    "tagsEn": [
      "landscape",
      "cottage",
      "chalet",
      "alps",
      "mountains",
      "fir tree",
      "snow"
    ],
    "aliases": [
      "заснеженный домик возле ели",
      "snowy cottage beside fir"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "winter-horse-troika",
    "source": "original-assets/winter-horse-troika.png",
    "src": "art/winter-horse-troika.webp",
    "name": {
      "ru": "Зимняя тройка лошадей с красными узорчатыми санями",
      "en": "Winter horse troika with red patterned sleigh"
    },
    "category": "seasonal-objects",
    "subcategory": "seasonal-objects-sleighs",
    "tags": [
      "тройка",
      "лошади",
      "сани",
      "красный",
      "снег",
      "узор"
    ],
    "tagsEn": [
      "festive-object",
      "troika",
      "horses",
      "sleigh",
      "red",
      "snow",
      "russian-traditions"
    ],
    "aliases": [
      "русская зимняя тройка",
      "russian winter horse troika"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "burgundy-knitted-christmas-bow",
    "source": "original-assets/burgundy-knitted-christmas-bow.png",
    "src": "art/burgundy-knitted-christmas-bow.webp",
    "name": {
      "ru": "Бордовый вязаный шарф, завязанный бантом",
      "en": "Burgundy knitted scarf tied in a bow"
    },
    "category": "seasonal-objects",
    "subcategory": "seasonal-objects-scarves",
    "tags": [
      "шарф",
      "вязание",
      "бордовый",
      "бант",
      "хвоя",
      "ягоды",
      "шишка"
    ],
    "tagsEn": [
      "festive-object",
      "scarf",
      "knitted",
      "burgundy",
      "bow",
      "evergreen",
      "berries",
      "pine cone"
    ],
    "aliases": [
      "вязаный рождественский бант",
      "knitted scarf bow"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "christmas-gingerbread-and-spice-arrangement",
    "source": "original-assets/christmas-gingerbread-and-spice-arrangement.png",
    "src": "art/christmas-gingerbread-and-spice-arrangement.webp",
    "name": {
      "ru": "Имбирное печенье с пряностями и апельсином",
      "en": "Gingerbread cookies with spices and orange"
    },
    "category": "treats",
    "subcategory": "treats-gingerbread-cookies",
    "tags": [
      "имбирное печенье",
      "пряники",
      "корица",
      "бадьян",
      "апельсин",
      "хвоя",
      "звёзды"
    ],
    "tagsEn": [
      "treat",
      "gingerbread-cookie",
      "gingerbread",
      "cookies",
      "cinnamon",
      "star anise",
      "orange",
      "evergreen",
      "stars"
    ],
    "aliases": [
      "пряная рождественская композиция",
      "spiced Christmas cookies"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "christmas-gingerbread-reindeer-with-bow",
    "source": "original-assets/christmas-gingerbread-reindeer-with-bow.png",
    "src": "art/christmas-gingerbread-reindeer-with-bow.webp",
    "name": {
      "ru": "Имбирный пряник-олень с бантом и колокольчиком",
      "en": "Gingerbread reindeer cookie with a bow and bell"
    },
    "category": "treats",
    "subcategory": "treats-gingerbread",
    "tags": [
      "пряник",
      "печенье",
      "олень из печенья",
      "белая глазурь",
      "красный бант",
      "колокольчик"
    ],
    "tagsEn": [
      "treat",
      "gingerbread",
      "reindeer cookie",
      "white icing",
      "red bow",
      "bell"
    ],
    "aliases": [
      "рождественский пряничный олень",
      "iced reindeer biscuit"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "festive-tartan-scarf-with-decor",
    "source": "original-assets/festive-tartan-scarf-with-decor.png",
    "src": "art/festive-tartan-scarf-with-decor.webp",
    "name": {
      "ru": "Зелёный клетчатый шарф с рождественским декором",
      "en": "Green tartan scarf with Christmas decorations"
    },
    "category": "seasonal-objects",
    "subcategory": "seasonal-objects-scarves",
    "tags": [
      "шарф",
      "тартан",
      "клетка",
      "зелёный",
      "красный бант",
      "хвоя",
      "ягоды",
      "бахрома"
    ],
    "tagsEn": [
      "festive-object",
      "scarf",
      "tartan",
      "plaid",
      "green",
      "red bow",
      "evergreen",
      "berries",
      "fringe"
    ],
    "aliases": [
      "шотландский зимний шарф",
      "Christmas plaid scarf"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "frost-patterned-snowy-window",
    "source": "original-assets/frost-patterned-snowy-window.png",
    "src": "art/frost-patterned-snowy-window.webp",
    "name": {
      "ru": "Заснеженное окно с морозными узорами",
      "en": "Snowy window with frost patterns"
    },
    "category": "seasonal-objects",
    "subcategory": "seasonal-objects-windows",
    "tags": [
      "окно",
      "морозные узоры",
      "стекло",
      "снег",
      "деревянная рама",
      "падуб",
      "бант"
    ],
    "tagsEn": [
      "festive-object",
      "window",
      "frost patterns",
      "glass",
      "snow",
      "wooden frame",
      "holly",
      "bow"
    ],
    "aliases": [
      "узоры на зимнем окне",
      "frosted Christmas window"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "gingerbread-heart-with-red-bow",
    "source": "original-assets/gingerbread-heart-with-red-bow.png",
    "src": "art/gingerbread-heart-with-red-bow.webp",
    "name": {
      "ru": "Пряничное сердечко с красным бантом",
      "en": "Gingerbread heart with a red bow"
    },
    "category": "treats",
    "subcategory": "treats-gingerbread",
    "tags": [
      "пряник",
      "сердце",
      "печенье",
      "белая глазурь",
      "красный бант",
      "хвоя",
      "ягоды"
    ],
    "tagsEn": [
      "treat",
      "gingerbread",
      "heart cookie",
      "white icing",
      "red bow",
      "evergreen",
      "berries"
    ],
    "aliases": [
      "рождественский пряник в форме сердца",
      "iced heart biscuit"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "knitted-scarf-with-winter-decor",
    "source": "original-assets/knitted-scarf-with-winter-decor.png",
    "src": "art/knitted-scarf-with-winter-decor.webp",
    "name": {
      "ru": "Кремовый вязаный шарф с красным узором",
      "en": "Ivory knitted scarf with a red winter pattern"
    },
    "category": "seasonal-objects",
    "subcategory": "seasonal-objects-scarves",
    "tags": [
      "шарф",
      "кремовый",
      "вязание",
      "красный узор",
      "снежинки",
      "бант",
      "хвоя",
      "бахрома"
    ],
    "tagsEn": [
      "festive-object",
      "scarf",
      "ivory",
      "knitted",
      "red pattern",
      "snowflakes",
      "bow",
      "evergreen",
      "fringe"
    ],
    "aliases": [
      "светлый зимний шарф с узором",
      "patterned Christmas scarf"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "snow-covered-cabin-and-animal-tracks",
    "source": "original-assets/snow-covered-cabin-and-animal-tracks.png",
    "src": "art/snow-covered-cabin-and-animal-tracks.webp",
    "name": {
      "ru": "Заснеженная избушка и следы на лесной тропе",
      "en": "Snow-covered cabin and animal tracks on a forest path"
    },
    "category": "landscapes",
    "subcategory": "landscapes-cottages",
    "tags": [
      "домик",
      "избушка",
      "снег",
      "следы",
      "тропинка",
      "деревья",
      "красные ягоды",
      "тёплое окно"
    ],
    "tagsEn": [
      "landscape",
      "cottage",
      "cabin",
      "snow",
      "animal tracks",
      "path",
      "trees",
      "red berries",
      "glowing window"
    ],
    "aliases": [
      "лесной дом со следами на снегу",
      "woodland cabin tracks"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "snow-covered-oak-with-red-berries",
    "source": "original-assets/snow-covered-oak-with-red-berries.png",
    "src": "art/snow-covered-oak-with-red-berries.webp",
    "name": {
      "ru": "Заснеженный дуб с красными ягодами у подножия",
      "en": "Snow-covered oak with red berries at its base"
    },
    "category": "landscapes",
    "subcategory": "landscapes-winter-trees",
    "tags": [
      "дуб",
      "зимнее дерево",
      "снег",
      "голые ветви",
      "красные ягоды",
      "сугробы"
    ],
    "tagsEn": [
      "winter-tree",
      "oak",
      "snow",
      "bare branches",
      "red berries",
      "snowdrifts"
    ],
    "aliases": [
      "раскидистое дерево в снегу",
      "snowy oak tree"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "snowy-alpine-cottage-with-sleigh",
    "source": "original-assets/snowy-alpine-cottage-with-sleigh.png",
    "src": "art/snowy-alpine-cottage-with-sleigh.webp",
    "name": {
      "ru": "Заснеженный альпийский домик с санками",
      "en": "Snowy Alpine cottage with a sleigh"
    },
    "category": "landscapes",
    "subcategory": "landscapes-cottages",
    "tags": [
      "домик",
      "шале",
      "снег",
      "санки",
      "ель",
      "подарки",
      "красная дверь",
      "тёплые окна"
    ],
    "tagsEn": [
      "landscape",
      "cottage",
      "chalet",
      "snow",
      "sleigh",
      "spruce",
      "gifts",
      "red door",
      "glowing windows"
    ],
    "aliases": [
      "зимний домик с санями",
      "cozy Alpine cabin"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "snowy-christmas-cottage",
    "source": "original-assets/snowy-christmas-cottage.png",
    "src": "art/snowy-christmas-cottage.webp",
    "name": {
      "ru": "Рождественский домик с красной дверью и венком",
      "en": "Snowy Christmas cottage with a red door and wreath"
    },
    "category": "landscapes",
    "subcategory": "landscapes-cottages",
    "tags": [
      "домик",
      "деревянный дом",
      "снег",
      "красная дверь",
      "венок",
      "тёплые окна",
      "подарки",
      "ель"
    ],
    "tagsEn": [
      "landscape",
      "cottage",
      "wooden house",
      "snow",
      "red door",
      "wreath",
      "glowing windows",
      "gifts",
      "spruce"
    ],
    "aliases": [
      "уютная рождественская избушка",
      "festive winter cabin"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "snowy-evergreen-forest-at-dawn",
    "source": "original-assets/snowy-evergreen-forest-at-dawn.png",
    "src": "art/snowy-evergreen-forest-at-dawn.webp",
    "name": {
      "ru": "Заснеженный хвойный лес на рассвете",
      "en": "Snowy evergreen forest at dawn"
    },
    "category": "landscapes",
    "subcategory": "landscapes-forests",
    "tags": [
      "зимний лес",
      "ель",
      "рассвет",
      "снег",
      "солнечный свет",
      "красные ягоды",
      "тропинка"
    ],
    "tagsEn": [
      "landscape",
      "forest-landscape",
      "spruce",
      "dawn",
      "snow",
      "sunlight",
      "red berries",
      "path"
    ],
    "aliases": [
      "утро в зимнем лесу",
      "snowy fir forest sunrise"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "snowy-trail-in-winter-forest",
    "source": "original-assets/snowy-trail-in-winter-forest.png",
    "src": "art/snowy-trail-in-winter-forest.webp",
    "name": {
      "ru": "Заснеженная тропа среди хвойных деревьев",
      "en": "Snowy trail among winter evergreen trees"
    },
    "category": "landscapes",
    "subcategory": "landscapes-forests",
    "tags": [
      "лес",
      "тропа",
      "снег",
      "сосны",
      "ели",
      "солнечный свет",
      "сугробы"
    ],
    "tagsEn": [
      "landscape",
      "forest-landscape",
      "trail",
      "snow",
      "pine trees",
      "spruce",
      "sunlight",
      "snowdrifts"
    ],
    "aliases": [
      "зимняя лесная дорожка",
      "sunlit snowy woodland path"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "vintage-ice-skates-on-red-scarf",
    "source": "original-assets/vintage-ice-skates-on-red-scarf.png",
    "src": "art/vintage-ice-skates-on-red-scarf.webp",
    "name": {
      "ru": "Винтажные коньки на красном вязаном шарфе",
      "en": "Vintage ice skates on a red knitted scarf"
    },
    "category": "seasonal-objects",
    "subcategory": "seasonal-objects-skates",
    "tags": [
      "коньки",
      "кремовый",
      "красный шарф",
      "ленты",
      "хвоя",
      "ягоды",
      "шишки"
    ],
    "tagsEn": [
      "festive-object",
      "ice skates",
      "ivory",
      "red scarf",
      "ribbons",
      "evergreen",
      "berries",
      "pine cones"
    ],
    "aliases": [
      "старинные коньки с зимним декором",
      "cozy vintage skates"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "watercolor-snowflake-composition",
    "source": "original-assets/watercolor-snowflake-composition.png",
    "src": "art/watercolor-snowflake-composition.webp",
    "name": {
      "ru": "Акварельная композиция из голубых и кремовых снежинок",
      "en": "Watercolor composition of blue and ivory snowflakes"
    },
    "category": "seasonal-objects",
    "subcategory": "seasonal-objects-snowflakes",
    "tags": [
      "снежинки",
      "композиция",
      "голубой",
      "кремовый",
      "золото",
      "акварель",
      "зима"
    ],
    "tagsEn": [
      "festive-object",
      "snowflakes",
      "composition",
      "blue",
      "ivory",
      "gold",
      "watercolor",
      "winter"
    ],
    "aliases": [
      "россыпь ажурных снежинок",
      "winter snowflake cluster"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "watercolor-snowflake-with-gold-accents",
    "source": "original-assets/watercolor-snowflake-with-gold-accents.png",
    "src": "art/watercolor-snowflake-with-gold-accents.webp",
    "name": {
      "ru": "Голубая акварельная снежинка с золотыми деталями",
      "en": "Blue watercolor snowflake with golden accents"
    },
    "category": "seasonal-objects",
    "subcategory": "seasonal-objects-snowflakes",
    "tags": [
      "снежинка",
      "голубой",
      "кремовый",
      "золотые детали",
      "кристалл",
      "зима"
    ],
    "tagsEn": [
      "festive-object",
      "snowflake",
      "blue",
      "ivory",
      "golden accents",
      "crystal",
      "winter"
    ],
    "aliases": [
      "снежная звёздочка с золотом",
      "gilded winter snowflake"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "watercolor-winter-forest-clearing",
    "source": "original-assets/watercolor-winter-forest-clearing.png",
    "src": "art/watercolor-winter-forest-clearing.webp",
    "name": {
      "ru": "Заснеженная лесная поляна в утреннем свете",
      "en": "Snowy forest clearing in morning light"
    },
    "category": "landscapes",
    "subcategory": "landscapes-forests",
    "tags": [
      "лесная поляна",
      "ели",
      "снег",
      "утренний свет",
      "красные ягоды",
      "тропинка"
    ],
    "tagsEn": [
      "landscape",
      "forest-landscape",
      "clearing",
      "spruce",
      "snow",
      "morning light",
      "red berries",
      "path"
    ],
    "aliases": [
      "солнечная зимняя поляна",
      "sunlit winter clearing"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "watercolor-winter-grove-with-berries",
    "source": "original-assets/watercolor-winter-grove-with-berries.png",
    "src": "art/watercolor-winter-grove-with-berries.webp",
    "name": {
      "ru": "Зимняя роща с голыми ветвями и красными ягодами",
      "en": "Winter grove with bare branches and red berries"
    },
    "category": "landscapes",
    "subcategory": "landscapes-forests",
    "tags": [
      "роща",
      "деревья",
      "голые ветви",
      "снег",
      "красные ягоды",
      "сугробы",
      "зима"
    ],
    "tagsEn": [
      "landscape",
      "forest-landscape",
      "grove",
      "trees",
      "bare branches",
      "snow",
      "red berries",
      "winter"
    ],
    "aliases": [
      "лиственная роща зимой",
      "snowy woodland grove"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "winter-bench-in-snowy-forest",
    "source": "original-assets/winter-bench-in-snowy-forest.png",
    "src": "art/winter-bench-in-snowy-forest.webp",
    "name": {
      "ru": "Деревянная скамейка с фонарём в заснеженном лесу",
      "en": "Wooden bench and lantern in a snowy forest"
    },
    "category": "landscapes",
    "subcategory": "landscapes-forests",
    "tags": [
      "скамейка",
      "фонарь",
      "лес",
      "снег",
      "деревья",
      "красные ягоды",
      "солнечный свет"
    ],
    "tagsEn": [
      "landscape",
      "forest-landscape",
      "bench",
      "lantern",
      "snow",
      "trees",
      "red berries",
      "sunlight"
    ],
    "aliases": [
      "уютная зимняя скамья",
      "snowy woodland bench"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "winter-birch-grove-with-red-berries",
    "source": "original-assets/winter-birch-grove-with-red-berries.png",
    "src": "art/winter-birch-grove-with-red-berries.webp",
    "name": {
      "ru": "Зимняя берёзовая роща с красными ягодами",
      "en": "Winter birch grove with red berries"
    },
    "category": "landscapes",
    "subcategory": "landscapes-forests",
    "tags": [
      "берёзы",
      "роща",
      "снег",
      "белые стволы",
      "голые ветви",
      "красные ягоды",
      "зима"
    ],
    "tagsEn": [
      "landscape",
      "forest-landscape",
      "birch",
      "grove",
      "snow",
      "white trunks",
      "bare branches",
      "red berries",
      "winter"
    ],
    "aliases": [
      "берёзки в снегу",
      "snowy birch woodland"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "winter-garden-with-bird-feeder-and-snow",
    "source": "original-assets/winter-garden-with-bird-feeder-and-snow.png",
    "src": "art/winter-garden-with-bird-feeder-and-snow.webp",
    "name": {
      "ru": "Зимний сад со скамейкой и кормушкой для птиц",
      "en": "Snowy winter garden with a bench and bird feeder"
    },
    "category": "landscapes",
    "subcategory": "landscapes-forests",
    "tags": [
      "зимний сад",
      "скамейка",
      "кормушка",
      "дерево",
      "красные ягоды",
      "забор",
      "снег",
      "фонарь"
    ],
    "tagsEn": [
      "landscape",
      "forest-landscape",
      "winter garden",
      "bench",
      "bird feeder",
      "tree",
      "red berries",
      "fence",
      "snow",
      "lantern"
    ],
    "aliases": [
      "садовая скамья под снежным деревом",
      "cozy snowy garden"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "winter-watercolor-bridge-with-red-berries",
    "source": "original-assets/winter-watercolor-bridge-with-red-berries.png",
    "src": "art/winter-watercolor-bridge-with-red-berries.webp",
    "name": {
      "ru": "Заснеженный деревянный мостик с красными ягодами",
      "en": "Snowy wooden footbridge with red berries"
    },
    "category": "landscapes",
    "subcategory": "landscapes-forests",
    "tags": [
      "мостик",
      "дерево",
      "лес",
      "снег",
      "ели",
      "красные ягоды",
      "тропинка"
    ],
    "tagsEn": [
      "landscape",
      "forest-landscape",
      "footbridge",
      "wooden bridge",
      "snow",
      "spruce",
      "red berries",
      "path"
    ],
    "aliases": [
      "лесной мост зимой",
      "snowy woodland bridge"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "wool-scarf-with-winter-decor",
    "source": "original-assets/wool-scarf-with-winter-decor.png",
    "src": "art/wool-scarf-with-winter-decor.webp",
    "name": {
      "ru": "Кремовый шерстяной шарф с хвойным декором",
      "en": "Ivory wool scarf with evergreen decorations"
    },
    "category": "seasonal-objects",
    "subcategory": "seasonal-objects-scarves",
    "tags": [
      "шарф",
      "шерсть",
      "кремовый",
      "вязание",
      "красный бант",
      "хвоя",
      "ягоды",
      "шишки",
      "бахрома"
    ],
    "tagsEn": [
      "festive-object",
      "scarf",
      "wool",
      "ivory",
      "knitted",
      "red bow",
      "evergreen",
      "berries",
      "pine cones",
      "fringe"
    ],
    "aliases": [
      "тёплый шарф с рождественскими веточками",
      "cozy wool winter scarf"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    id: 'santa-gift-stack', source: 'original-assets/santa-gift-stack.png', src: 'art/santa-gift-stack.webp',
    name: { ru: 'Санта со стопкой рождественских подарков', en: 'Santa with a stack of Christmas gifts' }, category: 'characters', subcategory: 'characters-santa',
    tags: ['санта', 'санта-клаус', 'красный костюм', 'борода', 'подарки', 'мешок', 'рождество'], tagsEn: ['character', 'santa', 'santa claus', 'red suit', 'beard', 'gifts', 'sack', 'christmas'], aliases: ['санта с подарками', 'santa gift pile'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'santa-gift-sack', source: 'original-assets/santa-gift-sack.png', src: 'art/santa-gift-sack.webp',
    name: { ru: 'Санта с большим мешком подарков', en: 'Santa carrying a large gift sack' }, category: 'characters', subcategory: 'characters-santa',
    tags: ['санта', 'санта-клаус', 'мешок', 'игрушки', 'подарки', 'красный костюм', 'борода'], tagsEn: ['character', 'santa', 'santa claus', 'sack', 'toys', 'gifts', 'red suit', 'beard'], aliases: ['санта с мешком', 'santa carrying presents'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'santa-cozy-armchair', source: 'original-assets/santa-cozy-armchair.png', src: 'art/santa-cozy-armchair.webp',
    name: { ru: 'Санта с чашкой в уютном рождественском кресле', en: 'Santa with a cup in a cozy Christmas armchair' }, category: 'characters', subcategory: 'characters-santa',
    tags: ['санта', 'санта-клаус', 'кресло', 'плед', 'чашка', 'фонарь', 'подарки', 'уют'], tagsEn: ['character', 'santa', 'santa claus', 'armchair', 'blanket', 'cup', 'lantern', 'gifts', 'cozy'], aliases: ['санта отдыхает', 'santa in chair'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'santa-bell-gift-sack', source: 'original-assets/santa-bell-gift-sack.png', src: 'art/santa-bell-gift-sack.webp',
    name: { ru: 'Санта с золотым колокольчиком и мешком', en: 'Santa with a golden bell and gift sack' }, category: 'characters', subcategory: 'characters-santa',
    tags: ['санта', 'санта-клаус', 'колокольчик', 'золото', 'мешок', 'красный костюм', 'подарки'], tagsEn: ['character', 'santa', 'santa claus', 'bell', 'gold', 'sack', 'red suit', 'gifts'], aliases: ['санта звонит в колокольчик', 'santa ringing bell'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'santa-evergreen-bouquet', source: 'original-assets/santa-evergreen-bouquet.png', src: 'art/santa-evergreen-bouquet.webp',
    name: { ru: 'Санта с рождественским хвойным букетом', en: 'Santa with a Christmas evergreen bouquet' }, category: 'characters', subcategory: 'characters-santa',
    tags: ['санта', 'санта-клаус', 'хвоя', 'букет', 'красные ягоды', 'шишки', 'борода'], tagsEn: ['character', 'santa', 'santa claus', 'evergreen', 'bouquet', 'red berries', 'pine cones', 'beard'], aliases: ['санта с зеленью', 'botanical santa'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'elf-painting-ornaments', source: 'original-assets/elf-painting-ornaments.png', src: 'art/elf-painting-ornaments.webp',
    name: { ru: 'Рождественский эльф расписывает игрушки', en: 'Christmas elf painting ornaments' }, category: 'characters', subcategory: 'characters-elves',
    tags: ['эльф', 'игрушки', 'ёлочные шары', 'кисть', 'краски', 'мастерская', 'подарки', 'зелёный колпак'], tagsEn: ['character', 'elf', 'elves', 'toys', 'ornaments', 'paintbrush', 'paint', 'workshop', 'gifts', 'green hat'], aliases: ['помощник санты', 'santa helper painting baubles'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'elf-ornament-basket', source: 'original-assets/elf-ornament-basket.png', src: 'art/elf-ornament-basket.webp',
    name: { ru: 'Эльф с корзиной рождественских украшений', en: 'Elf with a basket of Christmas ornaments' }, category: 'characters', subcategory: 'characters-elves',
    tags: ['эльф', 'корзина', 'ёлочные шары', 'хвоя', 'красный бант', 'зелёный колпак', 'полосатые чулки'], tagsEn: ['character', 'elf', 'elves', 'basket', 'ornaments', 'evergreen', 'red bow', 'green hat', 'striped stockings'], aliases: ['помощник санты', 'elf carrying decorations'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'elf-with-christmas-gift', source: 'original-assets/elf-with-christmas-gift.png', src: 'art/elf-with-christmas-gift.webp',
    name: { ru: 'Рождественский эльф с подарком', en: 'Christmas elf holding a gift' }, category: 'characters', subcategory: 'characters-elves',
    tags: ['эльф', 'подарок', 'красный бант', 'зелёный костюм', 'колпак', 'полосатые чулки'], tagsEn: ['character', 'elf', 'elves', 'gift', 'red bow', 'green suit', 'hat', 'striped stockings'], aliases: ['помощник санты с подарком', 'santa helper with present'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'elf-decorating-christmas-tree', source: 'original-assets/elf-decorating-christmas-tree.png', src: 'art/elf-decorating-christmas-tree.webp',
    name: { ru: 'Эльф украшает рождественскую ёлку', en: 'Elf decorating a Christmas tree' }, category: 'characters', subcategory: 'characters-elves',
    tags: ['эльф', 'ёлка', 'золотая звезда', 'шары', 'подарки', 'зелёный костюм'], tagsEn: ['character', 'elf', 'elves', 'christmas-tree', 'golden star', 'baubles', 'gifts', 'green suit'], aliases: ['помощник санты у ёлки', 'elf trimming the tree'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'elf-pair-decorating-christmas-gift', source: 'original-assets/elf-pair-decorating-christmas-gift.png', src: 'art/elf-pair-decorating-christmas-gift.webp',
    name: { ru: 'Два эльфа украшают рождественский подарок', en: 'Two elves decorating a Christmas gift' }, category: 'characters', subcategory: 'characters-elves',
    tags: ['эльфы', 'два эльфа', 'подарки', 'лента', 'бант', 'колокольчик', 'мастерская'], tagsEn: ['character', 'elf', 'elves', 'pair', 'gifts', 'ribbon', 'bow', 'bell', 'workshop'], aliases: ['помощники санты', 'santa helpers wrapping presents'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'snowman-robin-mitten', source: 'original-assets/snowman-robin-mitten.png', src: 'art/snowman-robin-mitten.webp',
    name: { ru: 'Снеговик с малиновкой на варежке', en: 'Snowman with a robin on its mitten' }, category: 'characters', subcategory: 'characters-snowmen',
    tags: ['снеговик', 'малиновка', 'зарянка', 'варежка', 'наушники', 'красный шарф', 'снег'], tagsEn: ['character', 'snowman', 'bird', 'robin', 'mitten', 'earmuffs', 'red scarf', 'snow'], aliases: ['снеговик с птичкой', 'snowman bird friend'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'cheerful-snowman-winter-scarf', source: 'original-assets/cheerful-snowman-winter-scarf.png', src: 'art/cheerful-snowman-winter-scarf.webp',
    name: { ru: 'Весёлый снеговик в цилиндре и красном шарфе', en: 'Cheerful snowman in a top hat and red scarf' }, category: 'characters', subcategory: 'characters-snowmen',
    tags: ['снеговик', 'улыбка', 'цилиндр', 'красный шарф', 'варежки', 'падуб', 'снег'], tagsEn: ['character', 'snowman', 'smile', 'top hat', 'red scarf', 'mittens', 'holly', 'snow'], aliases: ['счастливый снеговик', 'happy winter snowman'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'christmas-tree-gifts-berries', source: 'original-assets/christmas-tree-gifts-berries.png', src: 'art/christmas-tree-gifts-berries.webp',
    name: { ru: 'Рождественская ёлка с подарками и ягодами', en: 'Christmas tree with gifts and berries' }, category: 'botanical', subcategory: 'botanical-trees',
    tags: ['ёлка', 'подарки', 'ягоды', 'шары', 'золотая звезда', 'красный бант', 'снег'], tagsEn: ['christmas-tree', 'fir', 'gifts', 'berries', 'baubles', 'golden star', 'red bow', 'snow'], aliases: ['новогодняя ёлка с подарками', 'berry christmas fir'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'christmas-tree-green-gifts', source: 'original-assets/christmas-tree-green-gifts.png', src: 'art/christmas-tree-green-gifts.webp',
    name: { ru: 'Рождественская ёлка с зелёными подарками', en: 'Christmas tree with green gifts' }, category: 'botanical', subcategory: 'botanical-trees',
    tags: ['ёлка', 'зелёные подарки', 'шары', 'ленты', 'золотая звезда', 'снег'], tagsEn: ['christmas-tree', 'fir', 'green gifts', 'baubles', 'ribbons', 'golden star', 'snow'], aliases: ['новогодняя ёлка в акварели', 'green present christmas fir'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'christmas-tree-red-gifts', source: 'original-assets/christmas-tree-red-gifts.png', src: 'art/christmas-tree-red-gifts.webp',
    name: { ru: 'Рождественская ёлка с красными подарками', en: 'Christmas tree with red gifts' }, category: 'botanical', subcategory: 'botanical-trees',
    tags: ['ёлка', 'красные подарки', 'шары', 'ягоды', 'шишки', 'золотая звезда', 'снег'], tagsEn: ['christmas-tree', 'fir', 'red gifts', 'baubles', 'berries', 'pine cones', 'golden star', 'snow'], aliases: ['праздничная ёлка с коробками', 'red present christmas fir'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'snowy-fir-thicket-berries', source: 'original-assets/snowy-fir-thicket-berries.png', src: 'art/snowy-fir-thicket-berries.webp',
    name: { ru: 'Заснеженная хвойная чаща с ягодами', en: 'Snowy fir thicket with berries' }, category: 'landscapes', subcategory: 'landscapes-forests',
    tags: ['зимний лес', 'ель', 'снег', 'ягоды', 'шишки', 'сухие травы', 'хвоя'], tagsEn: ['landscape', 'forest-landscape', 'spruce', 'snow', 'berries', 'pine cones', 'dry grasses', 'evergreen'], aliases: ['рождественская снежная чаща', 'snowy evergreen woodland'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: "burgundy-poinsettia-gold-accents", src: "art/burgundy-poinsettia-gold-accents.webp", source: "original-assets/burgundy-poinsettia-gold-accents.png",
    name: { ru: "Бордовая пуансеттия с золотыми акцентами", en: "Burgundy poinsettia with golden accents" }, category: "botanical", subcategory: "botanical-poinsettia",
    tags: ["пуансеттия", "бордовый цветок", "золото", "падуб", "хвоя", "шишка", "красные ягоды"], tagsEn: ["botanical", "poinsettia", "burgundy flower", "gold", "holly", "evergreen", "pine cone", "red berries"], aliases: ["рождественская звезда цветок", "gold tipped christmas flower"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "cranberry-knitted-scarf-fir-sprig", src: "art/cranberry-knitted-scarf-fir-sprig.webp", source: "original-assets/cranberry-knitted-scarf-fir-sprig.png",
    name: { ru: "Красный вязаный шарф с еловой веточкой", en: "Cranberry knitted scarf with a fir sprig" }, category: "seasonal-objects", subcategory: "seasonal-objects-scarves",
    tags: ["шарф", "вязание", "красный", "зимний узор", "бахрома", "хвоя", "шишка", "ягоды"], tagsEn: ["festive-object", "scarf", "knitted", "cranberry red", "winter pattern", "fringe", "evergreen", "pine cone", "berries"], aliases: ["красный зимний шарфик", "fair isle winter scarf"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "gzhel-christmas-bauble-fir-branches", src: "art/gzhel-christmas-bauble-fir-branches.webp", source: "original-assets/gzhel-christmas-bauble-fir-branches.png",
    name: { ru: "Ёлочный шар с гжельской росписью и хвоей", en: "Gzhel Christmas bauble with fir branches" }, category: "ornaments", subcategory: "ornaments-baubles",
    tags: ["шар", "ёлочная игрушка", "гжель", "синий", "белый", "цветочная роспись", "бант", "хвоя", "ягоды"], tagsEn: ["ornament", "bauble", "gzhel", "blue and white", "floral painting", "bow", "evergreen", "berries", "russian-traditions", "russian-folk"], aliases: ["гжельский новогодний шарик", "russian blue floral christmas ball"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "sleeping-fox-snowy-fir-branches", src: "art/sleeping-fox-snowy-fir-branches.webp", source: "original-assets/sleeping-fox-snowy-fir-branches.png",
    name: { ru: "Спящая лиса под заснеженными еловыми ветками", en: "Sleeping fox beneath snowy fir branches" }, category: "animals", subcategory: "animals-foxes",
    tags: ["лиса", "лисичка", "спит", "рыжий мех", "пушистый хвост", "снег", "хвоя", "шишки", "ягоды"], tagsEn: ["animal", "fox", "sleeping", "orange fur", "fluffy tail", "snow", "fir branches", "pine cones", "berries"], aliases: ["спящая зимняя лисичка", "curled up woodland fox"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "watercolor-snowy-alpine-village", src: "art/watercolor-snowy-alpine-village.webp", source: "original-assets/watercolor-snowy-alpine-village.png",
    name: { ru: "Заснеженная альпийская деревня с шале", en: "Snowy Alpine village with wooden chalets" }, category: "landscapes", subcategory: "landscapes-villages",
    tags: ["деревня", "Альпы", "шале", "горы", "снег", "церковь", "деревянные дома", "тёплые окна", "венки"], tagsEn: ["landscape", "snowy-village", "alpine", "chalets", "mountains", "snow", "church", "wooden houses", "glowing windows", "wreaths"], aliases: ["альпийская зимняя улочка", "snowy mountain village"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "snowy-russian-wooden-house", src: "art/snowy-russian-wooden-house.webp", source: "original-assets/snowy-russian-wooden-house.png",
    name: { ru: "Заснеженная русская изба с дымящей трубой", en: "Snowy Russian wooden house with a smoking chimney" }, category: "landscapes", subcategory: "landscapes-cottages",
    tags: ["изба", "деревянный дом", "резьба", "снег", "дым", "тёплые окна", "ель", "рябина", "дрова"], tagsEn: ["landscape", "cottage", "log house", "carved wood", "snow", "chimney smoke", "glowing windows", "rowan", "firewood", "russian-traditions", "russian-house", "russian-folk"], aliases: ["русская бревенчатая избушка", "traditional russian log cabin"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "christmas-candle-fir-greenery", src: "art/christmas-candle-fir-greenery.webp", source: "original-assets/christmas-candle-fir-greenery.png",
    name: { ru: "Кремовая рождественская свеча с хвоей", en: "Ivory Christmas candle with fir greenery" }, category: "seasonal-objects", subcategory: "seasonal-objects-candles",
    tags: ["свеча", "кремовый", "пламя", "воск", "бечёвка", "хвоя", "шишки", "красные ягоды"], tagsEn: ["festive-object", "candle", "ivory", "flame", "wax", "twine", "evergreen", "pine cones", "red berries"], aliases: ["свечка с еловым декором", "rustic christmas pillar candle"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "watercolor-nutcracker-golden-scepter", src: "art/watercolor-nutcracker-golden-scepter.webp", source: "original-assets/watercolor-nutcracker-golden-scepter.png",
    name: { ru: "Щелкунчик с золотым жезлом и красным пером", en: "Nutcracker with a golden scepter and red feather" }, category: "characters", subcategory: "characters-nutcracker",
    tags: ["щелкунчик", "солдатик", "золотой жезл", "красный мундир", "перо", "хвоя", "шишки", "ягоды"], tagsEn: ["character", "nutcracker", "toy soldier", "golden scepter", "red uniform", "feather", "evergreen", "pine cones", "berries"], aliases: ["рождественский щелкунчик с жезлом", "christmas nutcracker soldier"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "watercolor-nutcracker-christmas-decor", src: "art/watercolor-nutcracker-christmas-decor.webp", source: "original-assets/watercolor-nutcracker-christmas-decor.png",
    name: { ru: "Щелкунчик в красном мундире с рождественским декором", en: "Red uniform nutcracker with Christmas decorations" }, category: "characters", subcategory: "characters-nutcracker",
    tags: ["щелкунчик", "солдатик", "красный мундир", "зелёные брюки", "золотые эполеты", "хвоя", "падуб", "шишки"], tagsEn: ["character", "nutcracker", "toy soldier", "red uniform", "green trousers", "gold epaulettes", "evergreen", "holly", "pine cones"], aliases: ["новогодний деревянный солдатик", "festive wooden nutcracker"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "watercolor-snowman-gifts", src: "art/watercolor-snowman-gifts.webp", source: "original-assets/watercolor-snowman-gifts.png",
    name: { ru: "Снеговик в красной шапке с подарками", en: "Snowman in a red hat holding gifts" }, category: "characters", subcategory: "characters-snowmen",
    tags: ["снеговик", "красная шапка", "шарф", "варежки", "морковный нос", "подарки", "хвоя", "снег"], tagsEn: ["character", "snowman", "red hat", "scarf", "mittens", "carrot nose", "gift", "evergreen", "snow"], aliases: ["снеговичок с новогодними подарками", "snowman carrying christmas presents"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "vintage-skates-snowy-branch", src: "art/vintage-skates-snowy-branch.webp", source: "original-assets/vintage-skates-snowy-branch.png",
    name: { ru: "Коричневые винтажные коньки на заснеженной ветке", en: "Brown vintage ice skates hanging from a snowy branch" }, category: "seasonal-objects", subcategory: "seasonal-objects-skates",
    tags: ["коньки", "коричневые ботинки", "мех", "шнурки", "подвеска", "снег", "хвоя", "шишки", "ягоды"], tagsEn: ["festive-object", "ice skates", "brown boots", "fur lining", "laces", "hanging", "snow", "evergreen", "pine cones", "berries"], aliases: ["ретро коньки на ветке", "hanging vintage skating boots"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "vintage-sleigh-snow-berries", src: "art/vintage-sleigh-snow-berries.webp", source: "original-assets/vintage-sleigh-snow-berries.png",
    name: { ru: "Красные винтажные сани в снегу с ягодами", en: "Red vintage sleigh in the snow with berries" }, category: "seasonal-objects", subcategory: "seasonal-objects-sleighs",
    tags: ["сани", "санки", "дерево", "красный", "снег", "хвоя", "шишки", "красные ягоды"], tagsEn: ["festive-object", "sleigh", "sled", "wooden", "red", "snow", "evergreen", "pine cones", "red berries"], aliases: ["деревянные зимние саночки", "vintage wooden winter sled"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "snowy-christmas-village", src: "art/snowy-christmas-village.webp", source: "original-assets/snowy-christmas-village.png",
    name: { ru: "Заснеженная рождественская улочка с фахверковыми домами", en: "Snowy Christmas street with timber framed houses" }, category: "landscapes", subcategory: "landscapes-villages",
    tags: ["деревня", "улочка", "фахверк", "церковь", "снег", "тёплые окна", "фонарь", "гирлянды", "ёлки"], tagsEn: ["landscape", "snowy-village", "street", "timber framed houses", "church", "snow", "glowing windows", "lantern", "garlands", "fir trees"], aliases: ["рождественская европейская деревня", "cozy old town christmas street"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "snowy-christmas-hamlet", src: "art/snowy-christmas-hamlet.webp", source: "original-assets/snowy-christmas-hamlet.png",
    name: { ru: "Рождественская деревушка с церковью и каменным мостом", en: "Christmas hamlet with a church and stone bridge" }, category: "landscapes", subcategory: "landscapes-villages",
    tags: ["деревушка", "церковь", "мост", "ручей", "снег", "тёплые окна", "фонарь", "ели", "рождество"], tagsEn: ["landscape", "snowy-village", "hamlet", "church", "stone bridge", "stream", "snow", "glowing windows", "lantern", "christmas"], aliases: ["зимняя деревенька у ручья", "snow covered village bridge"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "snowy-russian-cottage-carved-window-frames", src: "art/snowy-russian-cottage-carved-window-frames.webp", source: "original-assets/snowy-russian-cottage-carved-window-frames.png",
    name: { ru: "Заснеженная русская изба с резными наличниками", en: "Snowy Russian cottage with carved window frames" }, category: "landscapes", subcategory: "landscapes-cottages",
    tags: ["изба", "деревянный дом", "резные наличники", "крыльцо", "красная дверь", "снег", "ели", "рябина", "забор"], tagsEn: ["landscape", "cottage", "log house", "carved window frames", "porch", "red door", "snow", "fir trees", "rowan", "fence", "russian-traditions", "russian-house", "russian-folk"], aliases: ["русская избушка с резьбой", "ornate russian winter cabin"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "snowy-vintage-sleigh-under-spruce", src: "art/snowy-vintage-sleigh-under-spruce.webp", source: "original-assets/snowy-vintage-sleigh-under-spruce.png",
    name: { ru: "Винтажные санки с пледом под заснеженной елью", en: "Vintage sleds with a blanket beneath snowy spruce" }, category: "seasonal-objects", subcategory: "seasonal-objects-sleighs",
    tags: ["санки", "сани", "дерево", "пара", "красный плед", "снег", "еловая ветка", "шишки", "ягоды"], tagsEn: ["festive-object", "sleigh", "sleds", "wooden", "pair", "red blanket", "snow", "spruce branch", "pine cones", "berries"], aliases: ["деревянные саночки у ели", "snow covered vintage wooden sleds"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "snowy-cottage-warm-lights", src: "art/snowy-cottage-warm-lights.webp", source: "original-assets/snowy-cottage-warm-lights.png",
    name: { ru: "Заснеженный бревенчатый домик с тёплыми окнами", en: "Snowy log cottage with warm glowing windows" }, category: "landscapes", subcategory: "landscapes-cottages",
    tags: ["домик", "изба", "бревно", "тёплые окна", "дым", "снег", "рябина", "дрова", "забор"], tagsEn: ["landscape", "cottage", "log house", "glowing windows", "chimney smoke", "snow", "rowan", "firewood", "fence", "russian-traditions", "russian-house"], aliases: ["уютная зимняя избушка", "cozy glowing winter cabin"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "snowy-russian-wooden-manor-golden-rooster", src: "art/snowy-russian-wooden-manor-golden-rooster.webp", source: "original-assets/snowy-russian-wooden-manor-golden-rooster.png",
    name: { ru: "Заснеженный русский терем с золотым петушком", en: "Snowy Russian wooden manor with a golden rooster" }, category: "landscapes", subcategory: "landscapes-cottages",
    tags: ["терем", "русский дом", "резьба", "красная дверь", "золотой петушок", "сказка", "снег", "ели", "рябина"], tagsEn: ["landscape", "cottage", "wooden manor", "carved wood", "red door", "golden rooster", "fairy tale", "snow", "russian-traditions", "russian-house", "russian-fairytale", "russian-folk"], aliases: ["сказочный теремок с петушком", "russian fairytale wooden palace"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "embroidered-felt-boots-rowan", src: "art/embroidered-felt-boots-rowan.webp", source: "original-assets/embroidered-felt-boots-rowan.png",
    name: { ru: "Валенки с красной вышивкой и рябиной", en: "Felt boots with red embroidery and rowan berries" }, category: "seasonal-objects", subcategory: "seasonal-objects-felt-boots",
    tags: ["валенки", "войлок", "кремовый", "красная вышивка", "снежинки", "народный узор", "рябина", "хвоя", "снег"], tagsEn: ["festive-object", "felt boots", "valenki", "ivory", "red embroidery", "snowflakes", "folk pattern", "rowan", "evergreen", "snow", "russian-traditions", "russian-folk"], aliases: ["русские зимние валеночки", "traditional embroidered russian boots"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "winter-hare-spruce-branches-berries", src: "art/winter-hare-spruce-branches-berries.webp", source: "original-assets/winter-hare-spruce-branches-berries.png",
    name: { ru: "Белый заяц среди еловых веток и ягод", en: "White winter hare among spruce branches and berries" }, category: "animals", subcategory: "animals-hares",
    tags: ["заяц", "зайчик", "белый мех", "длинные уши", "зима", "снег", "хвоя", "красные ягоды", "шишки"], tagsEn: ["animal", "hare", "white fur", "long ears", "winter", "snow", "spruce branches", "red berries", "pine cones"], aliases: ["белый лесной зайчонок", "snow hare evergreen berries"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "winter-squirrel-nuts-pouch", src: "art/winter-squirrel-nuts-pouch.webp", source: "original-assets/winter-squirrel-nuts-pouch.png",
    name: { ru: "Зимняя белочка с орешком и мешочком орехов", en: "Winter squirrel with a nut and a pouch of nuts" }, category: "animals", subcategory: "animals-squirrels",
    tags: ["белка", "белочка", "орехи", "мешочек", "пушистый хвост", "снег", "хвоя", "шишки", "ягоды"], tagsEn: ["animal", "squirrel", "nuts", "pouch", "fluffy tail", "snow", "evergreen", "pine cones", "berries"], aliases: ["белочка с запасом орешков", "woodland squirrel nut sack"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "winter-coat-rack-mittens", src: "art/winter-coat-rack-mittens.webp", source: "original-assets/winter-coat-rack-mittens.png",
    name: { ru: "Вязаные варежки на деревянной вешалке", en: "Knitted mittens hanging from a wooden coat rack" }, category: "seasonal-objects", subcategory: "seasonal-objects-mittens",
    tags: ["варежки", "вешалка", "дерево", "вязание", "красные манжеты", "снежинки", "красный бант", "хвоя", "ягоды"], tagsEn: ["festive-object", "mittens", "coat rack", "wooden", "knitted", "red cuffs", "snowflake pattern", "red bow", "evergreen", "berries"], aliases: ["зимние рукавички на крючке", "hanging fair isle winter mittens"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "winter-village-sunset", src: "art/winter-village-sunset.webp", source: "original-assets/winter-village-sunset.png",
    name: { ru: "Зимняя русская деревня на закате", en: "Russian winter village at sunset" }, category: "landscapes", subcategory: "landscapes-villages",
    tags: ["деревня", "избы", "закат", "золотые купола", "церковь", "снег", "берёза", "рябина", "дорога"], tagsEn: ["landscape", "snowy-village", "cottages", "sunset", "golden domes", "church", "snow", "birch", "rowan", "road", "russian-traditions", "russian-house"], aliases: ["русская заснеженная деревенька", "russian snowy village evening"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "winter-village-golden-domes", src: "art/winter-village-golden-domes.webp", source: "original-assets/winter-village-golden-domes.png",
    name: { ru: "Зимняя деревня под золотыми куполами", en: "Winter village beneath golden church domes" }, category: "landscapes", subcategory: "landscapes-villages",
    tags: ["деревня", "русские дома", "золотые купола", "церковь", "закат", "снег", "резные окна", "берёза", "рябина"], tagsEn: ["landscape", "snowy-village", "russian houses", "golden domes", "church", "sunset", "snow", "carved windows", "birch", "rowan", "russian-traditions", "russian-house"], aliases: ["золотые маковки над деревней", "golden onion domes snowy village"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "watercolor-winter-christmas-village", src: "art/watercolor-winter-christmas-village.webp", source: "original-assets/watercolor-winter-christmas-village.png",
    name: { ru: "Акварельная рождественская улочка с фонарём и ёлкой", en: "Watercolor Christmas street with a lantern and tree" }, category: "landscapes", subcategory: "landscapes-villages",
    tags: ["деревня", "улочка", "фахверк", "фонарь", "ёлка", "церковь", "снег", "тёплые окна", "гирлянды"], tagsEn: ["landscape", "snowy-village", "street", "timber framed houses", "lantern", "christmas-tree", "church", "snow", "glowing windows", "garlands"], aliases: ["зимняя рождественская деревня в акварели", "watercolor festive village street"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "winter-russian-troika-gifts", src: "art/winter-russian-troika-gifts.webp", source: "original-assets/winter-russian-troika-gifts.png",
    name: { ru: "Русская тройка с подарками на фоне зимней деревни", en: "Russian troika with gifts before a winter village" }, category: "seasonal-objects", subcategory: "seasonal-objects-sleighs",
    tags: ["тройка", "лошади", "сани", "подарки", "русский узор", "снег", "деревня", "золотые купола", "закат"], tagsEn: ["festive-object", "troika", "horses", "sleigh", "gift", "folk pattern", "snow", "snowy-village", "golden domes", "sunset", "russian-traditions", "russian-folk"], aliases: ["зимняя русская тройка с подарками", "three horse russian christmas sleigh"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "fox-rabbit-snowy-branch", src: "art/fox-rabbit-snowy-branch.webp", source: "original-assets/fox-rabbit-snowy-branch.png",
    name: { ru: "Лиса и кролик в шарфиках под снежной веткой", en: "Fox and rabbit in scarves beneath a snowy branch" }, category: "animals", subcategory: "animals-foxes",
    tags: ["лиса", "кролик", "зайчик", "друзья", "красный платок", "зелёный шарф", "снег", "рябина", "берёза"], tagsEn: ["animal", "fox", "hare", "rabbit", "friends", "red shawl", "green scarf", "snow", "rowan", "birch"], aliases: ["лисичка и зайчик зимой", "woodland fox and bunny friends"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "polar-bear-cub-snowy-rock", src: "art/polar-bear-cub-snowy-rock.webp", source: "original-assets/polar-bear-cub-snowy-rock.png",
    name: { ru: "Белый медвежонок в красном шарфе на снежной скале", en: "Polar bear cub in a red scarf on a snowy rock" }, category: "animals", subcategory: "animals-bears",
    tags: ["белый медведь", "медвежонок", "красный шарф", "зимний узор", "снежная скала", "снег", "хвоя", "ягоды"], tagsEn: ["animal", "bear", "polar bear", "cub", "red scarf", "winter pattern", "snowy rock", "snow", "evergreen", "berries"], aliases: ["полярный медвежонок в шарфике", "little arctic bear winter scarf"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "festive-russian-troika-snow", src: "art/festive-russian-troika-snow.webp", source: "original-assets/festive-russian-troika-snow.png",
    name: { ru: "Праздничная русская тройка в снегу", en: "Festive Russian troika in the snow" }, category: "seasonal-objects", subcategory: "seasonal-objects-sleighs",
    tags: ["тройка", "три лошади", "сани", "красный", "золотой узор", "подарки", "фонарь", "хвоя", "снег"], tagsEn: ["festive-object", "troika", "three horses", "sleigh", "red", "golden pattern", "gift", "lantern", "evergreen", "snow", "russian-traditions", "russian-folk"], aliases: ["новогодняя тройка лошадей", "ornate russian three horse sleigh"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "painted-christmas-star-ribbon", src: "art/painted-christmas-star-ribbon.webp", source: "original-assets/painted-christmas-star-ribbon.png",
    name: { ru: "Расписная рождественская звезда с красным бантом", en: "Painted Christmas star with a red ribbon bow" }, category: "ornaments", subcategory: "ornaments-stars",
    tags: ["звезда", "ёлочная игрушка", "цветочная роспись", "народный узор", "красный бант", "подвеска", "хвоя", "шишки", "ягоды"], tagsEn: ["ornament", "star", "floral painting", "folk pattern", "red bow", "hanging", "evergreen", "pine cones", "berries", "russian-traditions", "russian-folk"], aliases: ["звёздочка с народной росписью", "russian folk painted star ornament"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "christmas-branch-bell", src: "art/christmas-branch-bell.webp", source: "original-assets/christmas-branch-bell.png",
    name: { ru: "Золотой колокольчик на заснеженной еловой ветке", en: "Golden bell hanging from a snowy fir branch" }, category: "ornaments", subcategory: "ornaments-bells",
    tags: ["колокольчик", "золото", "еловая ветка", "красный бант", "верёвка", "снег", "шишки", "красные ягоды"], tagsEn: ["ornament", "bell", "gold", "fir branch", "red bow", "rope", "snow", "pine cones", "red berries"], aliases: ["рождественская ветвь с колокольчиком", "snowy evergreen hanging christmas bell"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "snowy-christmas-village-square", src: "art/snowy-christmas-village-square.webp", source: "original-assets/snowy-christmas-village-square.png",
    name: { ru: "Заснеженная деревенская площадь с рождественской ёлкой", en: "Snowy village square with a Christmas tree" }, category: "landscapes", subcategory: "landscapes-villages",
    tags: ["деревня", "площадь", "ёлка", "подарки", "церковь", "фахверк", "скамейка", "фонарь", "снег"], tagsEn: ["landscape", "snowy-village", "square", "christmas-tree", "gift", "church", "timber framed houses", "bench", "lantern", "snow"], aliases: ["рождественская деревенская площадь в снегу", "festive old town christmas square"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "christmas-poinsettia-evergreen-branches", src: "art/christmas-poinsettia-evergreen-branches.webp", source: "original-assets/christmas-poinsettia-evergreen-branches.png",
    name: { ru: "Красная пуансеттия с хвоей и ягодами", en: "Red poinsettia with evergreen branches and berries" }, category: "botanical", subcategory: "botanical-poinsettia",
    tags: ["пуансеттия", "красный цветок", "хвоя", "падуб", "шишка", "красные ягоды", "рождество"], tagsEn: ["botanical", "poinsettia", "red flower", "evergreen", "holly", "pine cone", "red berries", "christmas"], aliases: ["рождественская пуансеттия с хвойными ветвями", "christmas star flower greenery"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "christmas-gifts-russian-sleigh", src: "art/christmas-gifts-russian-sleigh.webp", source: "original-assets/christmas-gifts-russian-sleigh.png",
    name: { ru: "Рождественские подарки в красных русских санях", en: "Christmas gifts in a red Russian sleigh" }, category: "seasonal-objects", subcategory: "seasonal-objects-sleighs",
    tags: ["сани", "подарки", "красный", "золотая роспись", "фонарь", "мех", "снег", "рябина", "ели"], tagsEn: ["festive-object", "sleigh", "gift", "red", "golden painting", "lantern", "fur trim", "snow", "rowan", "fir trees", "russian-traditions", "russian-folk"], aliases: ["рождественские подарки в русских санях", "ornate red christmas gift sleigh"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "christmas-sleigh-blanket-berries", src: "art/christmas-sleigh-blanket-berries.webp", source: "original-assets/christmas-sleigh-blanket-berries.png",
    name: { ru: "Деревянные санки с клетчатым пледом и ягодами", en: "Wooden sled with a plaid blanket and berries" }, category: "seasonal-objects", subcategory: "seasonal-objects-sleighs",
    tags: ["сани", "санки", "дерево", "клетчатый плед", "красный бант", "верёвка", "хвоя", "ягоды", "снег"], tagsEn: ["festive-object", "sleigh", "sled", "wooden", "plaid blanket", "red bow", "rope", "evergreen", "berries", "snow"], aliases: ["рождественские сани с пледом и ягодами", "cozy wooden winter sled blanket"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "christmas-nutcrackers-nuts-spruce", src: "art/christmas-nutcrackers-nuts-spruce.webp", source: "original-assets/christmas-nutcrackers-nuts-spruce.png",
    name: { ru: "Два щелкунчика с орехами и еловыми ветками", en: "Two nutcrackers with nuts and spruce branches" }, category: "characters", subcategory: "characters-nutcracker",
    tags: ["щелкунчики", "щелкунчик", "пара", "солдатики", "красный мундир", "синий мундир", "орехи", "хвоя", "шишки"], tagsEn: ["character", "nutcrackers", "nutcracker", "pair", "toy soldiers", "red uniform", "blue uniform", "nuts", "evergreen", "pine cones"], aliases: ["рождественские щелкунчики с орехами и елью", "pair of festive nutcracker soldiers"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "christmas-nutcracker-king-pedestal", src: "art/christmas-nutcracker-king-pedestal.webp", source: "original-assets/christmas-nutcracker-king-pedestal.png",
    name: { ru: "Щелкунчик-король в короне на пьедестале", en: "Crowned nutcracker king on a pedestal" }, category: "characters", subcategory: "characters-nutcracker",
    tags: ["щелкунчик", "король", "корона", "скипетр", "красная мантия", "пьедестал", "золото", "хвоя", "ягоды"], tagsEn: ["character", "nutcracker", "king", "crown", "scepter", "red cape", "pedestal", "gold", "evergreen", "berries"], aliases: ["рождественский щелкунчик-король на пьедестале", "royal christmas nutcracker"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "christmas-candy-bouquet", src: "art/christmas-candy-bouquet.webp", source: "original-assets/christmas-candy-bouquet.png",
    name: { ru: "Рождественские сладости с пряничным человечком", en: "Christmas sweets with a gingerbread man" }, category: "treats", subcategory: "treats-candy",
    tags: ["сладости", "леденец", "карамельная трость", "пряничный человечек", "печенье", "мармелад", "красный бант", "хвоя", "ягоды"], tagsEn: ["treat", "candy", "lollipop", "candy cane", "gingerbread-cookie", "gingerbread", "gingerbread man", "cookies", "jellies", "red bow", "evergreen", "berries"], aliases: ["рождественский букет сладостей", "festive candy and gingerbread assortment"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "christmas-candelabrum-wreath", src: "art/christmas-candelabrum-wreath.webp", source: "original-assets/christmas-candelabrum-wreath.png",
    name: { ru: "Золотой канделябр с тремя красными свечами", en: "Golden candelabrum with three red candles" }, category: "seasonal-objects", subcategory: "seasonal-objects-candles",
    tags: ["канделябр", "подсвечник", "три свечи", "красный", "пламя", "золото", "хвойный венок", "красный бант", "шишки"], tagsEn: ["festive-object", "candelabrum", "candlestick", "three candles", "red", "flame", "gold", "wreath", "evergreen", "red bow", "pine cones"], aliases: ["рождественский канделябр с венком", "festive three arm candle holder"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "christmas-bell-ribbon-snow", src: "art/christmas-bell-ribbon-snow.webp", source: "original-assets/christmas-bell-ribbon-snow.png",
    name: { ru: "Золотой рождественский колокольчик с красной лентой", en: "Golden Christmas bell with a red ribbon" }, category: "ornaments", subcategory: "ornaments-bells",
    tags: ["колокольчик", "золото", "красный бант", "лента", "верёвка", "снег", "хвоя", "шишки", "ягоды"], tagsEn: ["ornament", "bell", "gold", "red bow", "ribbon", "rope", "snow", "evergreen", "pine cones", "berries"], aliases: ["рождественский колокольчик с лентой и снегом", "hanging golden holiday bell"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "christmas-lollipop-evergreen-wreath", src: "art/christmas-lollipop-evergreen-wreath.webp", source: "original-assets/christmas-lollipop-evergreen-wreath.png",
    name: { ru: "Красно-белый леденец с хвойным венком", en: "Red and white lollipop with an evergreen wreath" }, category: "treats", subcategory: "treats-candy",
    tags: ["леденец", "карамель", "спираль", "красный", "белый", "хвойный венок", "падуб", "красный бант", "ягоды"], tagsEn: ["treat", "candy", "lollipop", "peppermint swirl", "red and white", "wreath", "evergreen", "holly", "red bow", "berries"], aliases: ["рождественский леденец с хвойным венком", "peppermint candy christmas greenery"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "christmas-nutcracker-wreath", src: "art/christmas-nutcracker-wreath.webp", source: "original-assets/christmas-nutcracker-wreath.png",
    name: { ru: "Щелкунчик с рождественским венком", en: "Nutcracker holding a Christmas wreath" }, category: "characters", subcategory: "characters-nutcracker",
    tags: ["щелкунчик", "солдатик", "красный мундир", "зелёные брюки", "венок", "красный бант", "шишки", "ягоды"], tagsEn: ["character", "nutcracker", "toy soldier", "red uniform", "green trousers", "wreath", "red bow", "pine cones", "berries"], aliases: ["рождественский щелкунчик с венком", "wooden nutcracker holiday wreath"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "snowy-nesting-doll-spruce-branches", src: "art/snowy-nesting-doll-spruce-branches.webp", source: "original-assets/snowy-nesting-doll-spruce-branches.png",
    name: { ru: "Матрёшка с рябиновой росписью среди еловых веток", en: "Rowan painted nesting doll among spruce branches" }, category: "seasonal-objects", subcategory: "seasonal-objects-nesting-dolls",
    tags: ["матрёшка", "деревянная кукла", "красный платок", "народная роспись", "рябина", "хвоя", "шишки", "снег"], tagsEn: ["festive-object", "nesting doll", "matryoshka", "wooden doll", "red headscarf", "folk painting", "rowan", "evergreen", "pine cones", "snow", "russian-traditions", "russian-folk"], aliases: ["снежная матрёшка среди еловых ветвей", "russian winter matryoshka doll"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "rustic-wooden-star", src: "art/rustic-wooden-star.webp", source: "original-assets/rustic-wooden-star.png",
    name: {"ru":"Деревянная звезда с хвоей","en":"Wooden star with evergreen"}, category: "ornaments", subcategory: "ornaments-stars",
    tags: ["звезда","дерево","подвеска","хвоя","шишка","красный бант","ягоды","рустик"], tagsEn: ["star","wooden","hanging ornament","fir","pine cone","red bow","berries","rustic","ornament"], aliases: ["рождественская звёздочка","christmas star","rustic star"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "snowy-spruce-branch", src: "art/snowy-spruce-branch.webp", source: "original-assets/snowy-spruce-branch.png",
    name: {"ru":"Заснеженная еловая ветка","en":"Snowy spruce branch"}, category: "botanical", subcategory: "botanical-branches",
    tags: ["ель","ветка","снег","хвоя","зима","зелёный","лес"], tagsEn: ["spruce","branch","snow","evergreen","winter","green","forest"], aliases: ["еловая лапа","fir bough","snow branch"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "straw-christmas-star", src: "art/straw-christmas-star.webp", source: "original-assets/straw-christmas-star.png",
    name: {"ru":"Соломенная звезда с лентой","en":"Straw star with ribbon"}, category: "ornaments", subcategory: "ornaments-stars",
    tags: ["звезда","солома","красный бант","ягоды","подвеска","натуральный","рождество"], tagsEn: ["star","straw","red bow","berries","hanging","natural","christmas","ornament"], aliases: ["соломенная игрушка","straw ornament","scandinavian star"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "golden-holly-bells", src: "art/golden-holly-bells.webp", source: "original-assets/golden-holly-bells.png",
    name: {"ru":"Золотые колокольчики с падубом","en":"Golden bells with holly"}, category: "ornaments", subcategory: "ornaments-bells",
    tags: ["колокольчики","золото","падуб","лента","красный бант","ягоды","праздник"], tagsEn: ["bells","gold","holly","ribbon","red bow","berries","festive","ornament"], aliases: ["бубенцы","christmas bells","jingle bells"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "ivory-poinsettia-arrangement", src: "art/ivory-poinsettia-arrangement.webp", source: "original-assets/ivory-poinsettia-arrangement.png",
    name: {"ru":"Кремовая пуансеттия с ягодами","en":"Ivory poinsettia with berries"}, category: "botanical", subcategory: "botanical-poinsettia",
    tags: ["пуансеттия","кремовый цветок","хвоя","красные ягоды","шишка","букет","рождество"], tagsEn: ["poinsettia","ivory flower","evergreen","red berries","pine cone","bouquet","christmas"], aliases: ["рождественская звезда цветок","christmas flower","white poinsettia"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "snowy-forest-bauble", src: "art/snowy-forest-bauble.webp", source: "original-assets/snowy-forest-bauble.png",
    name: {"ru":"Шар с зимним лесом","en":"Snowy forest bauble"}, category: "ornaments", subcategory: "ornaments-baubles",
    tags: ["шар","ёлочная игрушка","зимний лес","снег","кремовый","красный бант","ель"], tagsEn: ["bauble","ornament","winter forest","snow","ivory","red bow","spruce"], aliases: ["новогодний шарик","christmas ball","forest ornament"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "evergreen-holly-bouquet", src: "art/evergreen-holly-bouquet.webp", source: "original-assets/evergreen-holly-bouquet.png",
    name: {"ru":"Хвойный букет с падубом","en":"Evergreen and holly bouquet"}, category: "botanical", subcategory: "botanical-wreaths",
    tags: ["букет","хвоя","падуб","красные ягоды","шишки","зелёный","растения"], tagsEn: ["bouquet","evergreen","holly","red berries","pine cones","green","botanical"], aliases: ["зимняя композиция","winter foliage","christmas greenery"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "ornate-christmas-clock", src: "art/ornate-christmas-clock.webp", source: "original-assets/ornate-christmas-clock.png",
    name: {"ru":"Золотые часы с красным бантом","en":"Ornate golden Christmas clock"}, category: "seasonal-objects", subcategory: "seasonal-objects-clocks",
    tags: ["часы","золото","циферблат","полночь","хвоя","бант","колокольчики"], tagsEn: ["clock","gold","dial","midnight","evergreen","bow","bells"], aliases: ["новогодние часы","new year countdown","ornate clock"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "hanging-christmas-cottage", src: "art/hanging-christmas-cottage.webp", source: "original-assets/hanging-christmas-cottage.png",
    name: {"ru":"Ёлочный домик с тёплым окошком","en":"Hanging cottage with glowing window"}, category: "ornaments", subcategory: "ornaments-soviet",
    tags: ["домик","окно","снег","ёлочная игрушка","ветка","бант","уют"], tagsEn: ["cottage","window","snow","ornament","branch","bow","cozy","soviet","vintage","russian-traditions"], aliases: ["зимняя избушка","christmas cottage","tiny house"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "holly-red-ribbon", src: "art/holly-red-ribbon.webp", source: "original-assets/holly-red-ribbon.png",
    name: {"ru":"Падуб с алой лентой","en":"Holly with red ribbon"}, category: "botanical", subcategory: "botanical-holly",
    tags: ["падуб","остролист","красные ягоды","бант","зелёные листья","букет"], tagsEn: ["holly","red berries","bow","green leaves","bouquet","ribbon"], aliases: ["веточка падуба","holly sprig","christmas holly"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "woodland-christmas-tree", src: "art/woodland-christmas-tree.webp", source: "original-assets/woodland-christmas-tree.png",
    name: {"ru":"Ёлочка с деревянными игрушками","en":"Tree with wooden ornaments"}, category: "botanical", subcategory: "botanical-trees",
    tags: ["ёлка","ель","деревянные игрушки","олень","звезда","корзина","снег","шишки"], tagsEn: ["christmas tree","spruce","wooden ornaments","deer","star","basket","snow","pine cones","christmas-tree"], aliases: ["новогодняя ёлочка","woodland tree","christmas fir"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "mistletoe-wreath", src: "art/mistletoe-wreath.webp", source: "original-assets/mistletoe-wreath.png",
    name: {"ru":"Венок с омелой и красным бантом","en":"Mistletoe wreath with bow"}, category: "botanical", subcategory: "botanical-wreaths",
    tags: ["венок","омела","белые ягоды","красный бант","хвоя","круг","шишки"], tagsEn: ["wreath","mistletoe","white berries","red bow","evergreen","round","pine cones"], aliases: ["рождественский веночек","christmas wreath","door wreath"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "orange-cinnamon-wreath", src: "art/orange-cinnamon-wreath.webp", source: "original-assets/orange-cinnamon-wreath.png",
    name: {"ru":"Венок с апельсинами и корицей","en":"Orange and cinnamon wreath"}, category: "botanical", subcategory: "botanical-wreaths",
    tags: ["венок","апельсин","корица","колокольчики","ягоды","бант","пряности"], tagsEn: ["wreath","orange","cinnamon","bells","berries","bow","spices"], aliases: ["пряный венок","spiced wreath","citrus wreath"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "velvet-bow-wreath", src: "art/velvet-bow-wreath.webp", source: "original-assets/velvet-bow-wreath.png",
    name: {"ru":"Хвойный венок с бархатным бантом","en":"Evergreen velvet bow wreath"}, category: "botanical", subcategory: "botanical-wreaths",
    tags: ["венок","хвоя","бархат","бант","красные ягоды","шишки","падуб"], tagsEn: ["wreath","evergreen","velvet","bow","red berries","pine cones","holly"], aliases: ["еловый венок","festive wreath","red ribbon wreath"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "four-advent-candles", src: "art/four-advent-candles.webp", source: "original-assets/four-advent-candles.png",
    name: {"ru":"Четыре адвент-свечи","en":"Four Advent candles"}, category: "seasonal-objects", subcategory: "seasonal-objects-candles",
    tags: ["свечи","адвент","четыре","огонь","венок","уют","тепло","звезда"], tagsEn: ["candles","advent","four","flame","wreath","cozy","warm","star"], aliases: ["рождественские свечки","advent wreath","candle arrangement"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "snowy-fairytale-cottage", src: "art/snowy-fairytale-cottage.webp", source: "original-assets/snowy-fairytale-cottage.png",
    name: {"ru":"Сказочный теремок в снегу","en":"Snowy fairytale cottage"}, category: "landscapes", subcategory: "landscapes-cottages",
    tags: ["теремок","дом","сказка","снег","берёзы","ёлки","окна","уют"], tagsEn: ["cottage","house","fairytale","snow","birch","fir trees","windows","cozy","landscape","russian-house","russian-fairytale","russian-traditions"], aliases: ["зимний домик","russian terem","winter cabin"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "father-frost-christmas-tree", src: "art/father-frost-christmas-tree.webp", source: "original-assets/father-frost-christmas-tree.png",
    name: {"ru":"Дед Мороз с ёлкой и подарками","en":"Father Frost with tree and gifts"}, category: "characters", subcategory: "characters-father-frost",
    tags: ["дед мороз","ёлка","подарки","голубая шуба","посох","снежинка","сказка"], tagsEn: ["father frost","christmas tree","gifts","blue coat","staff","snowflake","fairytale","character","russian-traditions","russian-fairytale","winter","new-year","christmas-tree"], aliases: ["дедушка мороз","ded moroz","santa with presents"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "father-frost-red-coat", src: "art/father-frost-red-coat.webp", source: "original-assets/father-frost-red-coat.png",
    name: {"ru":"Дед Мороз в красной шубе","en":"Father Frost in red"}, category: "characters", subcategory: "characters-father-frost",
    tags: ["дед мороз","красная шуба","мешок","посох","борода","снежинка","подарки"], tagsEn: ["father frost","red coat","sack","staff","beard","snowflake","gifts","character","russian-traditions","russian-fairytale","winter","new-year"], aliases: ["санта","santa claus","ded moroz red"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "father-frost-blue-coat", src: "art/father-frost-blue-coat.webp", source: "original-assets/father-frost-blue-coat.png",
    name: {"ru":"Дед Мороз с ледяным посохом","en":"Blue Father Frost with icy staff"}, category: "characters", subcategory: "characters-father-frost",
    tags: ["дед мороз","синяя шуба","посох","мешок","узоры","борода","зима"], tagsEn: ["father frost","blue coat","staff","sack","ornament","beard","winter","character","russian-traditions","russian-fairytale","new-year"], aliases: ["зимний волшебник","ded moroz","winter wizard"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "father-frost-gift-sack", src: "art/father-frost-gift-sack.webp", source: "original-assets/father-frost-gift-sack.png",
    name: {"ru":"Дед Мороз с мешком подарков","en":"Father Frost with gift sack"}, category: "characters", subcategory: "characters-father-frost",
    tags: ["дед мороз","подарки","игрушки","мишка","мешок","голубой","посох"], tagsEn: ["father frost","gifts","toys","teddy bear","sack","blue","staff","character","russian-traditions","russian-fairytale","winter","new-year"], aliases: ["новогодний волшебник","gift bearer","ded moroz presents"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "father-frost-spruce-bouquet", src: "art/father-frost-spruce-bouquet.webp", source: "original-assets/father-frost-spruce-bouquet.png",
    name: {"ru":"Дед Мороз с еловым букетом","en":"Father Frost with spruce bouquet"}, category: "characters", subcategory: "characters-father-frost",
    tags: ["дед мороз","хвоя","букет","посох","голубая шуба","красные ягоды","бант"], tagsEn: ["father frost","evergreen","bouquet","staff","blue coat","red berries","bow","character","russian-traditions","russian-fairytale","winter","new-year"], aliases: ["морозко","ded moroz greenery","winter father"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "green-gold-bauble", src: "art/green-gold-bauble.webp", source: "original-assets/green-gold-bauble.png",
    name: {"ru":"Зелёный шар с золотым орнаментом","en":"Green bauble with golden foliage"}, category: "ornaments", subcategory: "ornaments-baubles",
    tags: ["шар","зелёный","золото","орнамент","ветка","бант","ёлочная игрушка"], tagsEn: ["bauble","green","gold","ornament","branch","bow","christmas toy"], aliases: ["стеклянный шарик","green christmas ball","gold leaf ornament"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "winter-berry-cone-bouquet", src: "art/winter-berry-cone-bouquet.webp", source: "original-assets/winter-berry-cone-bouquet.png",
    name: {"ru":"Зимние ветви с ягодами и шишками","en":"Winter branches with berries and cones"}, category: "botanical", subcategory: "botanical-wreaths",
    tags: ["ветви","хвоя","можжевельник","шишки","красные ягоды","зелень","букет"], tagsEn: ["branches","evergreen","juniper","pine cones","red berries","foliage","bouquet"], aliases: ["хвойная композиция","winter greenery","pine bouquet"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "holly-berry-branch", src: "art/holly-berry-branch.webp", source: "original-assets/holly-berry-branch.png",
    name: {"ru":"Ветка падуба с красными ягодами","en":"Holly branch with red berries"}, category: "botanical", subcategory: "botanical-holly",
    tags: ["падуб","остролист","ягоды","красный","зелёные листья","ветка","рождество"], tagsEn: ["holly","berries","red","green leaves","branch","christmas"], aliases: ["остролистник","holly leaves","berry sprig"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "snowy-holly-branch", src: "art/snowy-holly-branch.webp", source: "original-assets/snowy-holly-branch.png",
    name: {"ru":"Заснеженный падуб","en":"Snowy holly"}, category: "botanical", subcategory: "botanical-holly",
    tags: ["падуб","снег","красные ягоды","ветка","зима","листья"], tagsEn: ["holly","snow","red berries","branch","winter","leaves"], aliases: ["падуб в снегу","frosted holly","snow holly sprig"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "red-wooden-sleigh", src: "art/red-wooden-sleigh.webp", source: "original-assets/red-wooden-sleigh.png",
    name: {"ru":"Красные саночки с хвоей","en":"Red sleigh with evergreen"}, category: "seasonal-objects", subcategory: "seasonal-objects-sleighs",
    tags: ["санки","сани","красный","дерево","хвоя","шишки","бант","зимние забавы"], tagsEn: ["sleigh","sled","red","wooden","evergreen","pine cones","bow","winter fun"], aliases: ["саночки","christmas sled","wooden sledge"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "red-poinsettia-flowers", src: "art/red-poinsettia-flowers.webp", source: "original-assets/red-poinsettia-flowers.png",
    name: {"ru":"Красные пуансеттии","en":"Red poinsettia flowers"}, category: "botanical", subcategory: "botanical-poinsettia",
    tags: ["пуансеттия","цветы","красный","зелёные листья","рождество","букет"], tagsEn: ["poinsettia","flowers","red","green leaves","christmas","bouquet"], aliases: ["рождественская звезда цветок","christmas flowers","red bloom"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "russian-troika-snow", src: "art/russian-troika-snow.webp", source: "original-assets/russian-troika-snow.png",
    name: {"ru":"Русская тройка в зимнем лесу","en":"Russian troika in winter forest"}, category: "seasonal-objects", subcategory: "seasonal-objects-sleighs",
    tags: ["тройка","лошади","сани","дуга","снег","ель","русская зима"], tagsEn: ["troika","horses","sleigh","harness","snow","fir","russian winter","russian-traditions","festive-object","winter","new-year"], aliases: ["три коня","russian horses","winter carriage"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "ornate-troika-sleigh", src: "art/ornate-troika-sleigh.webp", source: "original-assets/ornate-troika-sleigh.png",
    name: {"ru":"Тройка с расписными санями","en":"Troika with ornate sleigh"}, category: "seasonal-objects", subcategory: "seasonal-objects-sleighs",
    tags: ["тройка","лошади","сани","роспись","снег","колокольчики","русская сказка"], tagsEn: ["troika","horses","sleigh","painted","snow","bells","russian fairytale","russian-traditions","festive-object","winter","new-year"], aliases: ["русская упряжка","ornate winter sleigh","three horses"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "wooden-ornament-wreath", src: "art/wooden-ornament-wreath.webp", source: "original-assets/wooden-ornament-wreath.png",
    name: {"ru":"Венок с деревянными подвесками","en":"Wreath with wooden ornaments"}, category: "botanical", subcategory: "botanical-wreaths",
    tags: ["венок","деревянные игрушки","звезда","лошадка","сердце","корица","бант","шишки"], tagsEn: ["wreath","wooden ornaments","star","rocking horse","heart","cinnamon","bow","pine cones"], aliases: ["рустикальный венок","rustic wreath","woodland wreath"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "spasskaya-tower-spruce", src: "art/spasskaya-tower-spruce.webp", source: "original-assets/spasskaya-tower-spruce.png",
    name: {"ru":"Спасская башня с еловыми ветвями","en":"Spasskaya tower with spruce"}, category: "seasonal-objects", subcategory: "seasonal-objects-clocks",
    tags: ["спасская башня","кремль","москва","куранты","снег","красная звезда","новый год"], tagsEn: ["spasskaya tower","kremlin","moscow","clock","snow","red star","new year","russian-traditions","russian-symbol"], aliases: ["кремлёвская башня","kremlin chimes","moscow landmark"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "snow-maiden-christmas-tree", src: "art/snow-maiden-christmas-tree.webp", source: "original-assets/snow-maiden-christmas-tree.png",
    name: {"ru":"Снегурочка украшает ёлку","en":"Snow Maiden decorating a tree"}, category: "characters", subcategory: "characters-snow-maiden",
    tags: ["снегурочка","ёлка","игрушки","кокошник","голубая шуба","звезда","сказка"], tagsEn: ["snow maiden","christmas tree","ornaments","kokoshnik","blue coat","star","fairytale","character","russian-traditions","russian-fairytale","winter","new-year","christmas-tree"], aliases: ["снегурка","snegurochka","snow princess tree"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "snow-maiden-kokoshnik", src: "art/snow-maiden-kokoshnik.webp", source: "original-assets/snow-maiden-kokoshnik.png",
    name: {"ru":"Снегурочка в кокошнике","en":"Snow Maiden in a kokoshnik"}, category: "characters", subcategory: "characters-snow-maiden",
    tags: ["снегурочка","кокошник","коса","белый мех","голубая шуба","русская сказка"], tagsEn: ["snow maiden","kokoshnik","braid","white fur","blue coat","russian fairytale","character","russian-traditions","russian-fairytale","winter","new-year"], aliases: ["снегурка","snegurochka portrait","snow princess"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "snow-maiden-berry-basket", src: "art/snow-maiden-berry-basket.webp", source: "original-assets/snow-maiden-berry-basket.png",
    name: {"ru":"Снегурочка с зимним букетом","en":"Snow Maiden with winter berries"}, category: "characters", subcategory: "characters-snow-maiden",
    tags: ["снегурочка","ягоды","букет","корзина","хвоя","кокошник","красный бант"], tagsEn: ["snow maiden","berries","bouquet","basket","evergreen","kokoshnik","red bow","character","russian-traditions","russian-fairytale","winter","new-year"], aliases: ["снегурка с корзинкой","snegurochka berries","winter princess bouquet"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "snow-maiden-crystal-snowflake", src: "art/snow-maiden-crystal-snowflake.webp", source: "original-assets/snow-maiden-crystal-snowflake.png",
    name: {"ru":"Снегурочка с хрустальной снежинкой","en":"Snow Maiden with crystal snowflake"}, category: "characters", subcategory: "characters-snow-maiden",
    tags: ["снегурочка","снежинка","хрусталь","кокошник","варежки","голубой","портрет"], tagsEn: ["snow maiden","snowflake","crystal","kokoshnik","mittens","blue","portrait","character","russian-traditions","russian-fairytale","winter","new-year"], aliases: ["снегурочка со снежинкой","snegurochka snowflake","ice princess"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "snow-maiden-winter-branch", src: "art/snow-maiden-winter-branch.webp", source: "original-assets/snow-maiden-winter-branch.png",
    name: {"ru":"Снегурочка с еловой веточкой","en":"Snow Maiden with winter branch"}, category: "characters", subcategory: "characters-snow-maiden",
    tags: ["снегурочка","ветка","хвоя","ягоды","голубая шуба","коса","кокошник"], tagsEn: ["snow maiden","branch","evergreen","berries","blue coat","braid","kokoshnik","character","russian-traditions","russian-fairytale","winter","new-year"], aliases: ["снегурка с веточкой","snegurochka branch","winter maiden"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "vintage-three-baubles", src: "art/vintage-three-baubles.webp", source: "original-assets/vintage-three-baubles.png",
    name: {"ru":"Три винтажные ёлочные игрушки","en":"Three vintage Christmas ornaments"}, category: "ornaments", subcategory: "ornaments-baubles",
    tags: ["шары","ёлочные игрушки","винтаж","стекло","зелёный","кремовый","красный","бант"], tagsEn: ["baubles","christmas ornaments","vintage","glass","green","ivory","red","bow","ornament","soviet","russian-traditions"], aliases: ["стеклянные подвески","vintage ornaments","retro christmas balls"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "brown-vintage-skates", src: "art/brown-vintage-skates.webp", source: "original-assets/brown-vintage-skates.png",
    name: {"ru":"Коричневые коньки с хвоей","en":"Brown vintage skates with evergreen"}, category: "seasonal-objects", subcategory: "seasonal-objects-skates",
    tags: ["коньки","коричневый","шнурки","хвоя","бант","ягоды","зимние забавы"], tagsEn: ["skates","brown","laces","evergreen","bow","berries","winter fun"], aliases: ["фигурные коньки","ice skates","vintage skating boots"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "glass-bird-ornament", src: "art/glass-bird-ornament.webp", source: "original-assets/glass-bird-ornament.png",
    name: {"ru":"Стеклянная птичка на еловой ветке","en":"Glass bird on spruce branch"}, category: "ornaments", subcategory: "ornaments-soviet",
    tags: ["птица","стекло","ёлочная игрушка","красная грудка","ветка","снег","винтаж"], tagsEn: ["bird","glass","ornament","red breast","branch","snow","vintage","soviet","russian-traditions","animal"], aliases: ["ёлочная птичка","glass robin","bird bauble"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "golden-cone-ornament", src: "art/golden-cone-ornament.webp", source: "original-assets/golden-cone-ornament.png",
    name: {"ru":"Золотая шишка на заснеженной ветке","en":"Golden cone on snowy branch"}, category: "ornaments", subcategory: "ornaments-soviet",
    tags: ["шишка","золото","ёлочная игрушка","снег","ветка","красный бант"], tagsEn: ["pine cone","gold","ornament","snow","branch","red bow","soviet","vintage","russian-traditions"], aliases: ["стеклянная шишка","golden pinecone","cone bauble"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "red-glass-star", src: "art/red-glass-star.webp", source: "original-assets/red-glass-star.png",
    name: {"ru":"Красная стеклянная звезда","en":"Red glass star"}, category: "ornaments", subcategory: "ornaments-stars",
    tags: ["звезда","красный","стекло","ёлочная игрушка","снег","ветка","винтаж"], tagsEn: ["star","red","glass","ornament","snow","branch","vintage","soviet","russian-traditions"], aliases: ["алая звёздочка","red christmas star","retro star"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "soviet-glass-ornaments", src: "art/soviet-glass-ornaments.webp", source: "original-assets/soviet-glass-ornaments.png",
    name: {"ru":"Коллекция ретро-игрушек","en":"Collection of retro glass ornaments"}, category: "ornaments", subcategory: "ornaments-soviet",
    tags: ["ёлочные игрушки","ретро","снеговик","птица","домик","звезда","стекло","набор"], tagsEn: ["ornaments","retro","snowman","bird","house","star","glass","collection","ornament","soviet","vintage","russian-traditions","animal"], aliases: ["советские игрушки","soviet christmas toys","vintage bauble collection"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "snowy-christmas-clock", src: "art/snowy-christmas-clock.webp", source: "original-assets/snowy-christmas-clock.png",
    name: {"ru":"Часы в заснеженных ветвях","en":"Clock in snowy spruce branches"}, category: "seasonal-objects", subcategory: "seasonal-objects-clocks",
    tags: ["часы","полночь","снег","хвоя","колокольчики","циферблат","бант"], tagsEn: ["clock","midnight","snow","evergreen","bells","dial","bow"], aliases: ["часы перед новым годом","new year clock","winter timepiece"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "mantel-clock-wreath", src: "art/mantel-clock-wreath.webp", source: "original-assets/mantel-clock-wreath.png",
    name: {"ru":"Каминные часы в рождественском венке","en":"Mantel clock in Christmas wreath"}, category: "seasonal-objects", subcategory: "seasonal-objects-clocks",
    tags: ["часы","каминные часы","венок","звёзды","шишки","хвоя","винтаж"], tagsEn: ["clock","mantel clock","wreath","stars","pine cones","evergreen","vintage"], aliases: ["старинные часы","antique clock","christmas timepiece"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "white-vintage-skates", src: "art/white-vintage-skates.webp", source: "original-assets/white-vintage-skates.png",
    name: {"ru":"Белые коньки с зимним декором","en":"White skates with winter decoration"}, category: "seasonal-objects", subcategory: "seasonal-objects-skates",
    tags: ["коньки","белый","шнурки","хвоя","шишки","ягоды","бант","зима"], tagsEn: ["skates","white","laces","evergreen","pine cones","berries","bow","winter"], aliases: ["белые фигурные коньки","ivory ice skates","winter skating"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "robin-bird-feeder", src: "art/robin-bird-feeder.webp", source: "original-assets/robin-bird-feeder.png",
    name: {"ru":"Малиновка на заснеженной кормушке","en":"Robin on snowy bird feeder"}, category: "animals", subcategory: "animals-birds",
    tags: ["птица","малиновка","зарянка","кормушка","снег","хвоя","красная грудка"], tagsEn: ["bird","robin","bird feeder","snow","evergreen","red breast","animal"], aliases: ["птичий домик","winter bird","birdhouse"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "winter-red-bow-bouquet", src: "art/winter-red-bow-bouquet.webp", source: "original-assets/winter-red-bow-bouquet.png",
    name: {"ru":"Зимний букет с красным бантом","en":"Winter bouquet with red bow"}, category: "botanical", subcategory: "botanical-wreaths",
    tags: ["букет","хвоя","падуб","омела","шишки","красный бант","ягоды"], tagsEn: ["bouquet","evergreen","holly","mistletoe","pine cones","red bow","berries"], aliases: ["рождественский букет","christmas bouquet","winter foliage bow"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "winter-kremlin-panorama", src: "art/winter-kremlin-panorama.webp", source: "original-assets/winter-kremlin-panorama.png",
    name: {"ru":"Зимняя панорама Кремля","en":"Winter Kremlin panorama"}, category: "landscapes", subcategory: "landscapes-cities",
    tags: ["кремль","москва","спасская башня","фонарь","снег","город","рябина","куранты"], tagsEn: ["kremlin","moscow","spasskaya tower","lantern","snow","city","rowan","chimes","russian-traditions","russian-symbol","landscape","clock","city-landscape"], aliases: ["красная площадь зимой","red square winter","moscow panorama"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "snowy-spruce-cones", src: "art/snowy-spruce-cones.webp", source: "original-assets/snowy-spruce-cones.png",
    name: {"ru":"Заснеженная хвоя с шишками","en":"Snowy spruce with pine cones"}, category: "botanical", subcategory: "botanical-branches",
    tags: ["хвоя","ветка","шишки","снег","ель","красные ягоды","лес"], tagsEn: ["evergreen","branch","pine cones","snow","spruce","red berries","forest"], aliases: ["еловая лапа с шишками","pine bough","snowy fir branch"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "filigree-golden-star", src: "art/filigree-golden-star.webp", source: "original-assets/filigree-golden-star.png",
    name: {"ru":"Ажурная золотая звезда","en":"Filigree golden star"}, category: "ornaments", subcategory: "ornaments-stars",
    tags: ["звезда","золото","ажур","орнамент","красный бант","шишки","ягоды"], tagsEn: ["star","gold","filigree","ornament","red bow","pine cones","berries"], aliases: ["резная звезда","golden christmas star","ornate star"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "beeswax-winter-candle", src: "art/beeswax-winter-candle.webp", source: "original-assets/beeswax-winter-candle.png",
    name: {"ru":"Медовая свеча с зимним декором","en":"Beeswax candle with winter decor"}, category: "seasonal-objects", subcategory: "seasonal-objects-candles",
    tags: ["свеча","воск","мёд","соты","огонь","хвоя","бант","уют"], tagsEn: ["candle","beeswax","honey","honeycomb","flame","evergreen","bow","cozy"], aliases: ["восковая свечка","honey candle","winter candle"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "silver-festive-bells", src: "art/silver-festive-bells.webp", source: "original-assets/silver-festive-bells.png",
    name: {"ru":"Серебряные колокольчики с лентой","en":"Silver festive bells with ribbon"}, category: "ornaments", subcategory: "ornaments-bells",
    tags: ["колокольчики","серебро","падуб","лента","красный бант","ягоды","узор"], tagsEn: ["bells","silver","holly","ribbon","red bow","berries","pattern","ornament"], aliases: ["праздничный звон","silver christmas bells","festive chimes"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "evergreen-jingle-bells", src: "art/evergreen-jingle-bells.webp", source: "original-assets/evergreen-jingle-bells.png",
    name: {"ru":"Хвойные ветви с бубенцами","en":"Evergreen branches with jingle bells"}, category: "ornaments", subcategory: "ornaments-bells",
    tags: ["бубенцы","колокольчики","золото","хвоя","шишки","красный бант","ягоды"], tagsEn: ["jingle bells","bells","gold","evergreen","pine cones","red bow","berries","ornament"], aliases: ["хвойная подвеска","christmas jingle bells","evergreen bell bouquet"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "mistletoe-burgundy-bow", src: "art/mistletoe-burgundy-bow.webp", source: "original-assets/mistletoe-burgundy-bow.png",
    name: {"ru":"Омела с бордовым бантом","en":"Mistletoe with burgundy bow"}, category: "botanical", subcategory: "botanical-mistletoe",
    tags: ["омела","белые ягоды","бордовый бант","зелёные листья","ветка","рождество"], tagsEn: ["mistletoe","white berries","burgundy bow","green leaves","branch","christmas"], aliases: ["веточка омелы","mistletoe sprig","kissing bough"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "woodland-fox-in-red-scarf", src: "art/woodland-fox-in-red-scarf.webp", source: "original-assets/woodland-fox-in-red-scarf.png",
    name: {"ru":"Лисичка в красном шарфе","en":"Woodland fox in a red scarf"}, category: "animals", subcategory: "animals-foxes",
    tags: ["лиса","лисичка","рыжий","красный шарф","лес","зима","зверята","пушистый хвост"], tagsEn: ["fox","red fox","woodland","red scarf","winter","animal","fluffy tail"], aliases: ["лисенок","little fox","fox cub"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "bear-carrying-evergreen", src: "art/bear-carrying-evergreen.webp", source: "original-assets/bear-carrying-evergreen.png",
    name: {"ru":"Медвежонок с вязаным шарфом и охапкой хвои","en":"Bear cub carrying evergreen branches"}, category: "animals", subcategory: "animals-bears",
    tags: ["медведь","медвежонок","красный шарф","свитер","снежинки","охапка веток","хвоя","снег","зверята"], tagsEn: ["bear","bear cub","red scarf","knitted sweater","snowflakes","evergreen bundle","snow","woodland animal","animal"], aliases: ["мишка с еловыми ветками","teddy bear winter","bear with fir boughs"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "snowy-cottage-glass-bauble", src: "art/snowy-cottage-glass-bauble.webp", source: "original-assets/snowy-cottage-glass-bauble.png",
    name: {"ru":"Стеклянный шар с заснеженным домиком","en":"Glass bauble with a snowy cottage"}, category: "ornaments", subcategory: "ornaments-baubles",
    tags: ["ёлочный шар","стекло","домик","заснеженная ель","тёплое окно","красный бант","золотая петелька","зима"], tagsEn: ["christmas bauble","glass ornament","cottage","snowy spruce","warm window","red bow","gold loop","winter","ornament"], aliases: ["зимний домик внутри шара","snow globe cottage","hanging winter bauble"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "hanging-five-golden-stars", src: "art/hanging-five-golden-stars.webp", source: "original-assets/hanging-five-golden-stars.png",
    name: {"ru":"Пять золотых звёзд под красным бантом","en":"Five golden stars beneath a red bow"}, category: "ornaments", subcategory: "ornaments-stars",
    tags: ["звёзды","золото","подвески","пять звёзд","красный бант","хвоя","ягоды","золотые нити"], tagsEn: ["stars","gold","hanging ornaments","five stars","red bow","evergreen","berries","gold strings","ornament"], aliases: ["золотая звёздная подвеска","gold star mobile","christmas hanging stars"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "knitted-red-mittens", src: "art/knitted-red-mittens.webp", source: "original-assets/knitted-red-mittens.png",
    name: {"ru":"Красные варежки со снежинками и бантом","en":"Red knitted mittens with snowflakes and a bow"}, category: "seasonal-objects", subcategory: "seasonal-objects-mittens",
    tags: ["варежки","рукавицы","красный","вязание","снежинки","кремовые манжеты","хвоя","ягоды","бант"], tagsEn: ["mittens","red","knitwear","knitted","snowflakes","cream cuffs","evergreen","berries","bow"], aliases: ["зимние рукавички","christmas mittens","winter gloves"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "holly-golden-berry-wreath", src: "art/holly-golden-berry-wreath.webp", source: "original-assets/holly-golden-berry-wreath.png",
    name: {"ru":"Венок из падуба с красными и золотыми ягодами","en":"Holly wreath with red and golden berries"}, category: "botanical", subcategory: "botanical-wreaths",
    tags: ["венок","падуб","остролист","красные ягоды","золотые ягоды","красный бант","зелёные листья","рождество"], tagsEn: ["wreath","holly","red berries","golden berries","red bow","green leaves","christmas"], aliases: ["рождественский венок из падуба","holly berry wreath","red ribbon wreath"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "winter-stag-red-bow", src: "art/winter-stag-red-bow.webp", source: "original-assets/winter-stag-red-bow.png",
    name: {"ru":"Олень с красным бантом у заснеженной ели","en":"Stag with a red bow beside a snowy spruce"}, category: "animals", subcategory: "animals-deer",
    tags: ["олень","рога","красный бант","лента","заснеженная ель","красные ягоды","снег","лес","зверята"], tagsEn: ["deer","stag","antlers","red bow","ribbon","snowy spruce","red berries","snow","woodland animal","animal"], aliases: ["сказочный олень зимой","winter deer red ribbon","woodland stag"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "winter-deer-family", src: "art/winter-deer-family.webp", source: "original-assets/winter-deer-family.png",
    name: {"ru":"Олень и оленёнок под снежной еловой веткой","en":"Stag and fawn beneath a snowy fir branch"}, category: "animals", subcategory: "animals-deer",
    tags: ["олень","оленёнок","пара","семья","рога","красный шарф","красный бант","хвоя","шишки","снег"], tagsEn: ["deer","stag","fawn","pair","family","antlers","red scarf","red bow","fir branch","pine cones","snow","animal"], aliases: ["лесная семья оленей","winter deer family","deer and baby"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "scarf-fox-candle-lantern", src: "art/scarf-fox-candle-lantern.webp", source: "original-assets/scarf-fox-candle-lantern.png",
    name: {"ru":"Лисичка в шарфе у светящегося фонаря","en":"Fox in a scarf beside a glowing lantern"}, category: "animals", subcategory: "animals-foxes",
    tags: ["лиса","лисичка","красный шарф","фонарь","свеча","огонь","хвоя","ягоды","шишки","снег"], tagsEn: ["fox","red fox","red scarf","lantern","candle","flame","evergreen","berries","pine cones","snow","animal"], aliases: ["лиса с фонариком","fox by candlelight","woodland fox lantern"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "fox-walking-snow-tracks", src: "art/fox-walking-snow-tracks.webp", source: "original-assets/fox-walking-snow-tracks.png",
    name: {"ru":"Рыжая лиса и следы в зимнем лесу","en":"Red fox and paw prints in a winter forest"}, category: "animals", subcategory: "animals-foxes",
    tags: ["лиса","рыжий","пушистый хвост","следы лап","снег","заснеженная ель","красные ягоды","сухие травы","лес"], tagsEn: ["fox","red fox","fluffy tail","paw prints","snow","snowy spruce","red berries","dry grasses","forest","animal"], aliases: ["лисичка на прогулке","fox walking in snow","winter fox tracks"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "gift-stack-wooden-sleigh", src: "art/gift-stack-wooden-sleigh.webp", source: "original-assets/gift-stack-wooden-sleigh.png",
    name: {"ru":"Подарки с красными лентами на деревянных санках","en":"Ribbon-wrapped gifts on a wooden sleigh"}, category: "seasonal-objects", subcategory: "seasonal-objects-gifts",
    tags: ["подарки","коробки","упаковка","красные ленты","бант","деревянные санки","верёвка","хвоя","шишки","снег"], tagsEn: ["gifts","presents","boxes","wrapping paper","red ribbons","bow","wooden sleigh","rope","evergreen","pine cones","snow","gift","sleigh"], aliases: ["санки с подарками","christmas presents on sled","stack of wrapped gifts"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "white-hare-snowy-spruce", src: "art/white-hare-snowy-spruce.webp", source: "original-assets/white-hare-snowy-spruce.png",
    name: {"ru":"Белый зайчик среди заснеженной хвои","en":"White hare among snow-covered evergreen branches"}, category: "animals", subcategory: "animals-hares",
    tags: ["заяц","зайчик","белая шерсть","длинные уши","хвоя","красные ягоды","шишки","снег","зверята"], tagsEn: ["hare","bunny","rabbit","white fur","long ears","evergreen","red berries","pine cones","snow","woodland animal","animal"], aliases: ["зайчик-беляк","white winter bunny","snow hare"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "scarf-hare-evergreen-bouquet", src: "art/scarf-hare-evergreen-bouquet.webp", source: "original-assets/scarf-hare-evergreen-bouquet.png",
    name: {"ru":"Зайчик в красном шарфе с хвойным букетом","en":"Hare in a red scarf holding an evergreen bouquet"}, category: "animals", subcategory: "animals-hares",
    tags: ["заяц","зайчик","красный шарф","снежинки","вязание","букет","хвоя","бечёвка","ягоды","шишки","снег"], tagsEn: ["hare","bunny","rabbit","red scarf","snowflakes","knitted","bouquet","evergreen","twine","berries","pine cones","snow","animal"], aliases: ["зайчонок с еловыми ветками","scarf bunny fir bouquet","christmas rabbit"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "winter-hare-pair", src: "art/winter-hare-pair.webp", source: "original-assets/winter-hare-pair.png",
    name: {"ru":"Два зайчика в шарфиках у заснеженной ели","en":"Two hares in scarves beside a snowy spruce"}, category: "animals", subcategory: "animals-hares",
    tags: ["зайцы","зайчики","пара","белый зайчик","рыжий зайчик","красный шарф","белый шарф","хвоя","ягоды","шишки","снег"], tagsEn: ["hares","bunnies","rabbits","pair","white bunny","brown bunny","red scarf","white scarf","evergreen","berries","pine cones","snow","animal","hare"], aliases: ["друзья зайчата","winter bunny friends","two rabbits in snow"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "mistletoe-white-berries-red-ribbon", src: "art/mistletoe-white-berries-red-ribbon.webp", source: "original-assets/mistletoe-white-berries-red-ribbon.png",
    name: {"ru":"Веточки омелы с белыми ягодами и красной лентой","en":"Mistletoe sprigs with white berries and a red ribbon"}, category: "botanical", subcategory: "botanical-mistletoe",
    tags: ["омела","белые ягоды","зелёные листья","веточки","красный бант","золотая кайма","рождество"], tagsEn: ["mistletoe","white berries","green leaves","sprigs","red bow","gold trim","christmas"], aliases: ["омела с алой лентой","red ribbon mistletoe","kissing mistletoe sprigs"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "mistletoe-ivory-berry-wreath", src: "art/mistletoe-ivory-berry-wreath.webp", source: "original-assets/mistletoe-ivory-berry-wreath.png",
    name: {"ru":"Венок из омелы с бордовым бантом","en":"Mistletoe wreath with a burgundy bow"}, category: "botanical", subcategory: "botanical-wreaths",
    tags: ["венок","омела","белые ягоды","кремовые ягоды","зелёные листья","бордовый бант","лента","рождество"], tagsEn: ["wreath","mistletoe","white berries","ivory berries","green leaves","burgundy bow","ribbon","christmas"], aliases: ["круглый венок из омелы","mistletoe kissing wreath","burgundy ribbon wreath"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "potted-red-poinsettias", src: "art/potted-red-poinsettias.webp", source: "original-assets/potted-red-poinsettias.png",
    name: {"ru":"Красные пуансеттии в горшочке с бантом","en":"Red poinsettias in a ribbon-wrapped pot"}, category: "botanical", subcategory: "botanical-poinsettia",
    tags: ["пуансеттия","красные цветы","рождественская звезда","зелёные листья","горшок","кремовый бант","хвоя","красные ягоды"], tagsEn: ["poinsettia","red flowers","christmas flower","green leaves","flower pot","cream bow","evergreen","red berries"], aliases: ["пуансеттия в кашпо","potted christmas poinsettia","red winter plant"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "sleeping-fawn-evergreen-nest", src: "art/sleeping-fawn-evergreen-nest.webp", source: "original-assets/sleeping-fawn-evergreen-nest.png",
    name: {"ru":"Спящий оленёнок в заснеженных еловых ветках","en":"Sleeping fawn nestled in snowy fir branches"}, category: "animals", subcategory: "animals-deer",
    tags: ["оленёнок","олень","спящий","пятнистый","гнёздышко","хвоя","шишки","красные ягоды","снег","уют"], tagsEn: ["fawn","baby deer","sleeping","spotted","nest","evergreen","pine cones","red berries","snow","cozy","animal","deer"], aliases: ["спящий малыш олень","sleeping woodland fawn","curled up deer"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "snowy-fir-winter-grasses", src: "art/snowy-fir-winter-grasses.webp", source: "original-assets/snowy-fir-winter-grasses.png",
    name: {"ru":"Заснеженная ель среди ягод и сухих трав","en":"Snow-covered spruce among berries and winter grasses"}, category: "landscapes", subcategory: "landscapes-winter-trees",
    tags: ["ель","ёлка","дерево","снег","красные ягоды","сухие травы","камыш","зима","лес"], tagsEn: ["spruce","fir tree","evergreen tree","snow","red berries","dry grasses","reeds","winter","forest","winter-tree","botanical","christmas-tree"], aliases: ["лесная ёлочка под снегом","snowy winter fir","evergreen in winter meadow"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "mistletoe-golden-bell-pendant", src: "art/mistletoe-golden-bell-pendant.webp", source: "original-assets/mistletoe-golden-bell-pendant.png",
    name: {"ru":"Подвеска из омелы с золотым колокольчиком","en":"Mistletoe pendant with a golden bell"}, category: "botanical", subcategory: "botanical-mistletoe",
    tags: ["омела","белые ягоды","золотой колокольчик","красный бант","подвеска","петелька","зелёные листья","рождество"], tagsEn: ["mistletoe","white berries","golden bell","red bow","pendant","hanging loop","green leaves","christmas"], aliases: ["веточка омелы с колокольчиком","mistletoe bell ornament","hanging mistletoe bell"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "squirrel-nut-snowy-stump", src: "art/squirrel-nut-snowy-stump.webp", source: "original-assets/squirrel-nut-snowy-stump.png",
    name: {"ru":"Белочка с орешком на заснеженном пеньке","en":"Squirrel with a nut on a snowy tree stump"}, category: "animals", subcategory: "animals-squirrels",
    tags: ["белка","белочка","орех","пушистый хвост","пенёк","снег","хвоя","шишки","красные ягоды","лес"], tagsEn: ["squirrel","nut","fluffy tail","tree stump","snow","evergreen","pine cones","red berries","woodland","animal"], aliases: ["рыжая белка на пне","winter squirrel with nut","squirrel snowy stump"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "squirrel-pair-nut-basket", src: "art/squirrel-pair-nut-basket.webp", source: "original-assets/squirrel-pair-nut-basket.png",
    name: {"ru":"Две белочки с корзинкой орехов","en":"Two squirrels with a basket of nuts"}, category: "animals", subcategory: "animals-squirrels",
    tags: ["белки","белочки","пара","корзинка","орехи","красный бант","красный шарф","хвоя","ягоды","снег"], tagsEn: ["squirrels","pair","basket","nuts","red bow","red scarf","evergreen","berries","snow","animal","squirrel"], aliases: ["друзья бельчата","squirrel friends nut basket","woodland squirrels"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "cream-skates-cranberry-ribbons", src: "art/cream-skates-cranberry-ribbons.webp", source: "original-assets/cream-skates-cranberry-ribbons.png",
    name: {"ru":"Кремовые коньки с бордовыми шнурками и бантом","en":"Cream ice skates with cranberry laces and a bow"}, category: "seasonal-objects", subcategory: "seasonal-objects-skates",
    tags: ["коньки","кремовая кожа","бордовые шнурки","красный бант","лезвия","хвоя","красные ягоды","зима","винтаж"], tagsEn: ["ice skates","cream leather","cranberry laces","red bow","blades","evergreen","red berries","winter","vintage"], aliases: ["фигурные коньки с ленточками","vintage cream ice skates","christmas skating boots"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "goldfinch-trio-rowan", src: "art/goldfinch-trio-rowan.webp", source: "original-assets/goldfinch-trio-rowan.png",
    name: {"ru":"Три щегла на заснеженной рябине","en":"Three goldfinches on snow-covered rowan branches"}, category: "animals", subcategory: "animals-birds",
    tags: ["птицы","щегол","щеглы","три птицы","рябина","красные ягоды","жёлтые крылья","хвоя","шишка","снег"], tagsEn: ["birds","goldfinch","goldfinches","three birds","rowan","red berries","yellow wings","evergreen","pine cone","snow","animal","bird"], aliases: ["зимние щеглы","winter goldfinch trio","goldfinches on berries"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "blue-tit-pair-holly", src: "art/blue-tit-pair-holly.webp", source: "original-assets/blue-tit-pair-holly.png",
    name: {"ru":"Две синицы-лазоревки среди заснеженного падуба","en":"Two blue tits among snowy holly branches"}, category: "animals", subcategory: "animals-birds",
    tags: ["птицы","синицы","лазоревка","пара","синяя шапочка","жёлтая грудка","падуб","красные ягоды","шишки","снег"], tagsEn: ["birds","blue tit","blue tits","pair","blue cap","yellow breast","holly","red berries","pine cones","snow","animal","bird"], aliases: ["зимние синички","winter blue tit pair","blue tits on holly"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "bear-in-red-scarf", src: "art/bear-in-red-scarf.webp", source: "original-assets/bear-in-red-scarf.png",
    name: {"ru":"Медвежонок в красном шарфе среди хвои","en":"Bear cub in a red scarf among evergreen branches"}, category: "animals", subcategory: "animals-bears",
    tags: ["медведь","медвежонок","красный шарф","снежинки","хвоя","шишки","красные ягоды","лес"], tagsEn: ["animal","bear","bear cub","red scarf","snowflakes","evergreen","pine cones","red berries","woodland"], aliases: ["мишка в шарфике","winter teddy bear","scarf bear"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "bear-with-christmas-gift", src: "art/bear-with-christmas-gift.webp", source: "original-assets/bear-with-christmas-gift.png",
    name: {"ru":"Медвежонок с рождественским подарком","en":"Bear cub holding a Christmas gift"}, category: "animals", subcategory: "animals-bears",
    tags: ["медведь","медвежонок","подарок","красный шарф","красный бант","упаковка","падуб"], tagsEn: ["animal","bear","bear cub","gift","red scarf","red bow","wrapping paper","holly","christmas"], aliases: ["мишка с подарком","gift giving bear","christmas teddy"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "christmas-raisin-almond-cake", src: "art/christmas-raisin-almond-cake.webp", source: "original-assets/christmas-raisin-almond-cake.png",
    name: {"ru":"Рождественский кекс с изюмом и миндалём","en":"Christmas raisin cake with almonds"}, category: "treats", subcategory: "treats-baking",
    tags: ["кекс","рождественская выпечка","изюм","миндаль","сладости","ломтик","падуб","корица"], tagsEn: ["treat","christmas-baking","cake","raisins","almonds","sweet bread","slice","holly","cinnamon"], aliases: ["рождественский пирог","christmas fruit cake","festive raisin bread"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "candy-canes-green-ribbon", src: "art/candy-canes-green-ribbon.webp", source: "original-assets/candy-canes-green-ribbon.png",
    name: {"ru":"Леденцы-трости с зелёным бантом","en":"Candy canes with a green ribbon"}, category: "treats", subcategory: "treats-candy",
    tags: ["леденцы","конфеты","трости","красно-белые полоски","зелёный бант","хвоя","ягоды","рождество"], tagsEn: ["treat","candy","candy canes","red and white","stripes","green ribbon","evergreen","berries","christmas"], aliases: ["рождественские карамельные трости","peppermint candy canes","striped sweets"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "christmas-candy-assortment", src: "art/christmas-candy-assortment.webp", source: "original-assets/christmas-candy-assortment.png",
    name: {"ru":"Рождественские сладости в ярких обёртках","en":"Christmas sweets in festive wrappers"}, category: "treats", subcategory: "treats-candy",
    tags: ["конфеты","леденцы","карамель","печенье","обёртки","красный","зелёный","золото","хвоя"], tagsEn: ["treat","candy","sweets","caramel","cookies","wrappers","red","green","gold","evergreen"], aliases: ["ассорти новогодних сладостей","christmas candy assortment","wrapped festive sweets"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "iced-christmas-cinnamon-rolls", src: "art/iced-christmas-cinnamon-rolls.webp", source: "original-assets/iced-christmas-cinnamon-rolls.png",
    name: {"ru":"Булочки с корицей и белой глазурью","en":"Christmas cinnamon rolls with white icing"}, category: "treats", subcategory: "treats-baking",
    tags: ["булочки","корица","глазурь","выпечка","тарелка","падуб","красные ягоды","сладости"], tagsEn: ["treat","christmas-baking","cinnamon rolls","icing","pastry","plate","holly","red berries"], aliases: ["синнабоны на Рождество","iced cinnamon buns","festive cinnamon pastries"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "christmas-gift-stack-red-ribbons", src: "art/christmas-gift-stack-red-ribbons.webp", source: "original-assets/christmas-gift-stack-red-ribbons.png",
    name: {"ru":"Подарочные коробки с красными лентами и апельсинами","en":"Stacked Christmas gifts with red ribbons and oranges"}, category: "seasonal-objects", subcategory: "seasonal-objects-gifts",
    tags: ["подарки","коробки","красные банты","зелёная упаковка","снежинки","апельсины","корица","хвоя","шишки"], tagsEn: ["gift","presents","boxes","red ribbons","green wrapping","snowflakes","oranges","cinnamon","evergreen","pine cones"], aliases: ["стопка новогодних подарков","stacked holiday presents","christmas gift composition"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "kraft-christmas-gifts-evergreen", src: "art/kraft-christmas-gifts-evergreen.webp", source: "original-assets/kraft-christmas-gifts-evergreen.png",
    name: {"ru":"Крафтовые подарки с бечёвкой и хвойными веточками","en":"Kraft Christmas gifts with twine and evergreen sprigs"}, category: "seasonal-objects", subcategory: "seasonal-objects-gifts",
    tags: ["подарки","крафт","бумага","бечёвка","деревянная звезда","хвоя","ягоды","шишки","натуральный"], tagsEn: ["gift","kraft paper","twine","wooden star","evergreen","berries","pine cones","natural wrapping"], aliases: ["экоупаковка подарков","rustic gift wrapping","natural christmas presents"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "christmas-candy-jar", src: "art/christmas-candy-jar.webp", source: "original-assets/christmas-candy-jar.png",
    name: {"ru":"Стеклянная банка с рождественскими леденцами","en":"Glass jar filled with Christmas candy"}, category: "treats", subcategory: "treats-candy",
    tags: ["банка","стекло","конфеты","леденцы","карамельные трости","красный бант","падуб","хвоя"], tagsEn: ["treat","candy","glass jar","sweets","candy canes","red bow","holly","evergreen"], aliases: ["баночка праздничных сладостей","christmas sweet jar","peppermint candy jar"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "christmas-tree-golden-star", src: "art/christmas-tree-golden-star.webp", source: "original-assets/christmas-tree-golden-star.png",
    name: {"ru":"Нарядная ёлка с золотой звездой и красными шарами","en":"Christmas tree with a golden star and red baubles"}, category: "botanical", subcategory: "botanical-trees",
    tags: ["ёлка","ель","золотая звезда","красные шары","золотые шары","ленты","огоньки","новый год"], tagsEn: ["christmas-tree","fir","golden star","red baubles","gold baubles","ribbons","lights","new-year"], aliases: ["новогодняя ёлочка со звездой","decorated holiday tree","gold star christmas fir"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "christmas-tree-red-baubles", src: "art/christmas-tree-red-baubles.webp", source: "original-assets/christmas-tree-red-baubles.png",
    name: {"ru":"Ёлка с красными шарами и звёздами","en":"Evergreen Christmas tree with red baubles and stars"}, category: "botanical", subcategory: "botanical-trees",
    tags: ["ёлка","ель","красные шары","звёзды","шишки","хвоя","новый год"], tagsEn: ["christmas-tree","evergreen","red baubles","stars","pine cones","new-year"], aliases: ["праздничная ель с шарами","red bauble christmas tree","decorated spruce"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "christmas-tree-natural-decorations", src: "art/christmas-tree-natural-decorations.webp", source: "original-assets/christmas-tree-natural-decorations.png",
    name: {"ru":"Ёлка с апельсинами, шишками и корицей","en":"Christmas tree with oranges, pine cones and cinnamon"}, category: "botanical", subcategory: "botanical-trees",
    tags: ["ёлка","апельсины","корица","шишки","натуральные украшения","красные банты","золотые колокольчики"], tagsEn: ["christmas-tree","oranges","cinnamon","pine cones","natural decorations","red bows","golden bells"], aliases: ["экоёлка с сушёными цитрусами","rustic orange christmas tree","natural festive fir"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "christmas-tree-red-bows", src: "art/christmas-tree-red-bows.webp", source: "original-assets/christmas-tree-red-bows.png",
    name: {"ru":"Ёлка с красными бантами и золотыми шарами","en":"Christmas tree with red bows and golden baubles"}, category: "botanical", subcategory: "botanical-trees",
    tags: ["ёлка","красные банты","красные шары","золотые шары","золотая звезда","шишки","рождество"], tagsEn: ["christmas-tree","red bows","red baubles","golden baubles","golden star","pine cones","christmas"], aliases: ["ёлочка с алыми лентами","red ribbon christmas fir","gold and red holiday tree"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "christmas-wreath-scarlet-bow", src: "art/christmas-wreath-scarlet-bow.webp", source: "original-assets/christmas-wreath-scarlet-bow.png",
    name: {"ru":"Хвойный венок с алым бантом и шишками","en":"Evergreen wreath with a scarlet bow and pine cones"}, category: "botanical", subcategory: "botanical-wreaths",
    tags: ["венок","хвоя","алый бант","шишки","красные ягоды","падуб","рождество"], tagsEn: ["wreath","evergreen","scarlet bow","pine cones","red berries","holly","christmas"], aliases: ["рождественский веночек с лентой","scarlet ribbon wreath","pine cone christmas wreath"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "cozy-snowy-cottage-lights", src: "art/cozy-snowy-cottage-lights.webp", source: "original-assets/cozy-snowy-cottage-lights.png",
    name: {"ru":"Уютный заснеженный домик с тёплыми окнами","en":"Cozy snow-covered cottage with glowing windows"}, category: "landscapes", subcategory: "landscapes-cottages",
    tags: ["домик","снег","тёплые окна","дымоходы","венок на двери","забор","ёлки","уют"], tagsEn: ["landscape","cottage","snow","glowing windows","chimneys","door wreath","fence","evergreen trees","cozy"], aliases: ["зимний дом с огоньками","cozy winter cottage","snowy house with lights"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "robin-snowy-rowan-branch", src: "art/robin-snowy-rowan-branch.webp", source: "original-assets/robin-snowy-rowan-branch.png",
    name: {"ru":"Малиновка на заснеженной ветке с ягодами","en":"Robin on a snowy branch with red berries"}, category: "animals", subcategory: "animals-birds",
    tags: ["птица","малиновка","зарянка","рыжая грудка","снежная ветка","красные ягоды","шишки","хвоя"], tagsEn: ["animal","bird","robin","orange breast","snowy branch","red berries","pine cones","evergreen"], aliases: ["зимняя зарянка на веточке","winter robin red berries","european robin"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "mother-bear-cub-snow", src: "art/mother-bear-cub-snow.webp", source: "original-assets/mother-bear-cub-snow.png",
    name: {"ru":"Медведица с медвежонком у заснеженных елей","en":"Mother bear and cub beside snowy fir trees"}, category: "animals", subcategory: "animals-bears",
    tags: ["медведица","медвежонок","медведи","семья","красные шарфы","снег","ели","лес"], tagsEn: ["animal","bear","mother bear","cub","family","red scarves","snow","fir trees","woodland"], aliases: ["мама медведица и малыш","winter bear family","mother and baby bear"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "decorated-tree-snowy-forest", src: "art/decorated-tree-snowy-forest.webp", source: "original-assets/decorated-tree-snowy-forest.png",
    name: {"ru":"Нарядная ёлка с подарками в заснеженном лесу","en":"Decorated Christmas tree with gifts in a snowy forest"}, category: "botanical", subcategory: "botanical-trees",
    tags: ["ёлка","золотая звезда","красные шары","подарки","снег","зимний лес","праздник"], tagsEn: ["christmas-tree","golden star","red baubles","gifts","snow","forest-landscape","landscape","winter"], aliases: ["новогодняя ель в лесу","forest christmas tree","snowy festive fir"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "gingerbread-house-candy", src: "art/gingerbread-house-candy.webp", source: "original-assets/gingerbread-house-candy.png",
    name: {"ru":"Пряничный домик с глазурью и леденцами","en":"Gingerbread house with icing and candy canes"}, category: "landscapes", subcategory: "landscapes-gingerbread-houses",
    tags: ["пряничный домик","пряник","глазурь","конфеты","леденцы","венок","сладости","рождество"], tagsEn: ["landscape","gingerbread-house","gingerbread","treat","icing","candy","candy canes","wreath","christmas"], aliases: ["сказочный съедобный домик","candy gingerbread cottage","christmas cookie house"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "ivory-gift-golden-bow", src: "art/ivory-gift-golden-bow.webp", source: "original-assets/ivory-gift-golden-bow.png",
    name: {"ru":"Кремовая подарочная коробка с золотым бантом","en":"Ivory gift box with a golden bow"}, category: "seasonal-objects", subcategory: "seasonal-objects-gifts",
    tags: ["подарок","коробка","кремовая упаковка","золотой бант","падуб","красные ягоды","шишки","хвоя"], tagsEn: ["gift","box","ivory wrapping","golden bow","holly","red berries","pine cones","evergreen"], aliases: ["светлый подарок с золотой лентой","cream christmas present","gold ribbon gift"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "gingerbread-man-red-bow", src: "art/gingerbread-man-red-bow.webp", source: "original-assets/gingerbread-man-red-bow.png",
    name: {"ru":"Имбирный человечек с красным бантом","en":"Gingerbread man with a red bow"}, category: "treats", subcategory: "treats-gingerbread-cookies",
    tags: ["имбирное печенье","человечек","пряничный человечек","глазурь","красный бант","падуб","красные пуговицы"], tagsEn: ["treat","gingerbread-cookie","gingerbread man","icing","red bow","holly","red buttons"], aliases: ["имбирный пряничный человек","ginger cookie person","christmas biscuit man"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "gingerbread-star-white-icing", src: "art/gingerbread-star-white-icing.webp", source: "original-assets/gingerbread-star-white-icing.png",
    name: {"ru":"Пряничная звезда с белой глазурью","en":"Gingerbread star with white icing"}, category: "treats", subcategory: "treats-gingerbread",
    tags: ["пряник","звезда","белая глазурь","сахарный узор","сердечко","выпечка","сладости"], tagsEn: ["treat","gingerbread","star","white icing","sugar decoration","heart","baking"], aliases: ["расписной пряник-звёздочка","iced gingerbread star","decorated christmas biscuit"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "green-knitted-mittens", src: "art/green-knitted-mittens.webp", source: "original-assets/green-knitted-mittens.png",
    name: {"ru":"Зелёные вязаные варежки с бордовым бантом","en":"Green knitted mittens with a burgundy bow"}, category: "seasonal-objects", subcategory: "seasonal-objects-mittens",
    tags: ["варежки","вязание","зелёный","кремовый узор","бордовый бант","хвоя","ягоды","зима"], tagsEn: ["mittens","knitted","green","cream pattern","burgundy bow","evergreen","berries","winter"], aliases: ["рукавички с хвойными веточками","green winter gloves","knitted festive mittens"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "hare-red-scarf-spruce", src: "art/hare-red-scarf-spruce.webp", source: "original-assets/hare-red-scarf-spruce.png",
    name: {"ru":"Зайчик в красном шарфе среди заснеженной хвои","en":"Hare in a red scarf among snowy evergreen branches"}, category: "animals", subcategory: "animals-hares",
    tags: ["заяц","зайчик","красный шарф","длинные уши","снег","хвоя","шишки","красные ягоды"], tagsEn: ["animal","hare","bunny","rabbit","red scarf","long ears","snow","evergreen","pine cones","red berries"], aliases: ["зимний зайчонок в шарфике","snowy scarf bunny","woodland winter rabbit"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "fawn-red-scarf-snowy-tree", src: "art/fawn-red-scarf-snowy-tree.webp", source: "original-assets/fawn-red-scarf-snowy-tree.png",
    name: {"ru":"Оленёнок в красном шарфе у заснеженной ёлки","en":"Fawn in a red scarf beside a snowy fir tree"}, category: "animals", subcategory: "animals-deer",
    tags: ["олень","оленёнок","пятнистый","рожки","красный шарф","падуб","снег","ель"], tagsEn: ["animal","deer","fawn","spotted","antlers","red scarf","holly","snow","fir tree"], aliases: ["маленький олень в зимнем лесу","scarf fawn winter forest","baby deer in snow"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "fox-robin-snow", src: "art/fox-robin-snow.webp", source: "original-assets/fox-robin-snow.png",
    name: {"ru":"Лисичка и малиновка на заснеженной ветке","en":"Little fox looking at a robin on a snowy branch"}, category: "animals", subcategory: "animals-foxes",
    tags: ["лиса","лисичка","малиновка","зарянка","птица","друзья","ветка","красные ягоды","снег"], tagsEn: ["animal","fox","bird","robin","friends","branch","red berries","snow","woodland"], aliases: ["лисёночек и зимняя птичка","fox and robin friends","winter woodland friendship"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "fox-snowy-forest", src: "art/fox-snowy-forest.webp", source: "original-assets/fox-snowy-forest.png",
    name: {"ru":"Рыжая лисичка в заснеженном лесу","en":"Red fox in a snow-covered forest"}, category: "animals", subcategory: "animals-foxes",
    tags: ["лиса","лисичка","рыжая","пушистый хвост","снег","ель","красные ягоды","шишки"], tagsEn: ["animal","fox","red fox","fluffy tail","snow","spruce","red berries","pine cones"], aliases: ["лисёночек среди зимних веток","snowy woodland fox","little forest fox"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "squirrel-red-scarf-acorn", src: "art/squirrel-red-scarf-acorn.webp", source: "original-assets/squirrel-red-scarf-acorn.png",
    name: {"ru":"Белочка в красном шарфе с жёлудем","en":"Squirrel in a red scarf holding an acorn"}, category: "animals", subcategory: "animals-squirrels",
    tags: ["белка","белочка","жёлудь","орех","красный шарф","пушистый хвост","хвоя","снег"], tagsEn: ["animal","squirrel","acorn","nut","red scarf","fluffy tail","evergreen","snow"], aliases: ["бельчонок с жёлудем","scarf squirrel with acorn","winter squirrel"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "burgundy-gift-golden-bow-holly", src: "art/burgundy-gift-golden-bow-holly.webp", source: "original-assets/burgundy-gift-golden-bow-holly.png",
    name: {"ru":"Бордовый подарок с золотым бантом и падубом","en":"Burgundy gift with a golden bow and holly"}, category: "seasonal-objects", subcategory: "seasonal-objects-gifts",
    tags: ["подарок","коробка","бордовый","золотой бант","орнамент","падуб","красные ягоды","хвоя"], tagsEn: ["gift","box","burgundy","golden bow","ornate pattern","holly","red berries","evergreen"], aliases: ["нарядный подарок с золотой лентой","luxurious christmas present","burgundy holly gift"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "ornate-gold-star-burgundy-bow", src: "art/ornate-gold-star-burgundy-bow.webp", source: "original-assets/ornate-gold-star-burgundy-bow.png",
    name: {"ru":"Рельефная золотая звезда с бордовым бантом","en":"Embossed golden star with a burgundy bow"}, category: "ornaments", subcategory: "ornaments-stars",
    tags: ["звезда","золото","рельеф","орнамент","подвеска","бордовый бант","петелька"], tagsEn: ["ornament","star","gold","embossed","ornate","hanging","burgundy bow","loop"], aliases: ["золотая ёлочная звёздочка","ornate gold star pendant","embossed christmas star"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "mistletoe-sprigs-velvet-bow", src: "art/mistletoe-sprigs-velvet-bow.webp", source: "original-assets/mistletoe-sprigs-velvet-bow.png",
    name: {"ru":"Пышная омела с кремовыми ягодами и красным бантом","en":"Lush mistletoe with ivory berries and a red bow"}, category: "botanical", subcategory: "botanical-mistletoe",
    tags: ["омела","кремовые ягоды","белые ягоды","зелёные листья","красный бант","бархатная лента","веточки"], tagsEn: ["mistletoe","ivory berries","white berries","green leaves","red bow","velvet ribbon","sprigs"], aliases: ["веточки омелы с бархатным бантом","velvet bow mistletoe","christmas kissing bough"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "hanging-birdhouse-robin", src: "art/hanging-birdhouse-robin.webp", source: "original-assets/hanging-birdhouse-robin.png",
    name: {"ru":"Малиновка у подвесного домика с красной крышей","en":"Robin at a hanging birdhouse with a red roof"}, category: "animals", subcategory: "animals-birds",
    tags: ["птица","малиновка","зарянка","скворечник","подвесной домик","красная крыша","снег","хвоя"], tagsEn: ["animal","bird","robin","birdhouse","hanging house","red roof","snow","evergreen"], aliases: ["зимняя птичка у скворечника","snowy red roof birdhouse","robin nesting box"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "snowy-cottage-pine-forest", src: "art/snowy-cottage-pine-forest.webp", source: "original-assets/snowy-cottage-pine-forest.png",
    name: {"ru":"Заснеженный деревянный домик среди елей","en":"Snowy wooden cottage among fir trees"}, category: "landscapes", subcategory: "landscapes-cottages",
    tags: ["домик","деревянный дом","снег","тёплые окна","дым","венок","забор","ели","лес"], tagsEn: ["landscape","cottage","wooden house","snow","glowing windows","smoke","wreath","fence","fir trees"], aliases: ["уютная лесная избушка","snowy woodland cabin","winter log cottage"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "snowy-fir-tree-winter-berries", src: "art/snowy-fir-tree-winter-berries.webp", source: "original-assets/snowy-fir-tree-winter-berries.png",
    name: {"ru":"Заснеженная ель с ягодами и сухими травами","en":"Snow-covered fir with berries and dry winter grasses"}, category: "landscapes", subcategory: "landscapes-winter-trees",
    tags: ["ель","ёлка","зимнее дерево","снег","красные ягоды","сухие травы","лес"], tagsEn: ["winter-tree","botanical","christmas-tree","fir","snow","red berries","dry grasses","forest"], aliases: ["лесная ёлочка в снегу","snowy winter fir tree","evergreen winter grasses"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "snowy-spruce-red-berries", src: "art/snowy-spruce-red-berries.webp", source: "original-assets/snowy-spruce-red-berries.png",
    name: {"ru":"Заснеженная ёлка с красными ягодами и шишками","en":"Snowy spruce with red berries and pine cones"}, category: "botanical", subcategory: "botanical-trees",
    tags: ["ель","ёлка","снег","красные ягоды","шишки","хвоя","зима"], tagsEn: ["christmas-tree","spruce","snow","red berries","pine cones","evergreen","winter-tree"], aliases: ["снежная ель с ягодами","snowy berry spruce","winter evergreen tree"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "snowman-pair-christmas-tree", src: "art/snowman-pair-christmas-tree.webp", source: "original-assets/snowman-pair-christmas-tree.png",
    name: {"ru":"Два снеговика у ёлки с подарками","en":"Two snowmen beside a Christmas tree and gifts"}, category: "characters", subcategory: "characters-snowmen",
    tags: ["снеговики","снеговик","пара","красный шарф","зелёный шарф","ёлка","подарки","снег"], tagsEn: ["character","snowmen","snowman","pair","red scarf","green scarf","christmas-tree","gifts","snow"], aliases: ["весёлые снеговички у ёлочки","snowman friends christmas tree","winter snow people"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "squirrel-nut-evergreen", src: "art/squirrel-nut-evergreen.webp", source: "original-assets/squirrel-nut-evergreen.png",
    name: {"ru":"Белочка с орешком и красным бантом","en":"Squirrel holding a nut and wearing a red bow"}, category: "animals", subcategory: "animals-squirrels",
    tags: ["белка","белочка","орешек","красный бант","пушистый хвост","хвоя","шишки","красные ягоды"], tagsEn: ["animal","squirrel","nut","red bow","fluffy tail","evergreen","pine cones","red berries"], aliases: ["рыжая белочка среди зимних веток","woodland squirrel red bow","winter squirrel with nut"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "twin-ivory-christmas-candles", src: "art/twin-ivory-christmas-candles.webp", source: "original-assets/twin-ivory-christmas-candles.png",
    name: {"ru":"Две кремовые свечи с хвойным декором","en":"Two ivory candles with evergreen decorations"}, category: "seasonal-objects", subcategory: "seasonal-objects-candles",
    tags: ["свечи","две свечи","кремовый","пламя","красный бант","хвоя","шишки","ягоды","падуб"], tagsEn: ["candles","two candles","ivory","flame","red bow","evergreen","pine cones","berries","holly"], aliases: ["рождественские свечки с лентой","twin christmas candles","ivory advent candles"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "red-bauble-gold-pattern", src: "art/red-bauble-gold-pattern.webp", source: "original-assets/red-bauble-gold-pattern.png",
    name: {"ru":"Красный ёлочный шар с золотым узором","en":"Red Christmas bauble with golden patterns"}, category: "ornaments", subcategory: "ornaments-baubles",
    tags: ["шар","ёлочная игрушка","красный","золотой узор","бархатный бант","хвоя","ягоды","винтаж"], tagsEn: ["ornament","bauble","red","gold pattern","velvet bow","evergreen","berries","vintage"], aliases: ["красный шарик с золотым орнаментом","ornate red glass bauble","vintage christmas ball"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "ivory-mittens-woodland-pattern", src: "art/ivory-mittens-woodland-pattern.webp", source: "original-assets/ivory-mittens-woodland-pattern.png",
    name: {"ru":"Кремовые варежки с узорами белочки и оленёнка","en":"Ivory mittens with squirrel and fawn patterns"}, category: "seasonal-objects", subcategory: "seasonal-objects-mittens",
    tags: ["варежки","кремовый","красные манжеты","белочка на узоре","оленёнок на узоре","ёлки","хвоя","вязание"], tagsEn: ["mittens","ivory","red cuffs","squirrel pattern","fawn pattern","fir trees","evergreen","knitted"], aliases: ["рукавички с лесными зверятами","woodland patterned winter mittens","squirrel and deer knitwear"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "ivory-mittens-evergreen-pattern", src: "art/ivory-mittens-evergreen-pattern.webp", source: "original-assets/ivory-mittens-evergreen-pattern.png",
    name: {"ru":"Светлые варежки с зелёным растительным узором","en":"Ivory mittens with green botanical patterns"}, category: "seasonal-objects", subcategory: "seasonal-objects-mittens",
    tags: ["варежки","светлый","вязание","зелёный узор","веточки","бордовая тесьма","хвоя","красные ягоды"], tagsEn: ["mittens","ivory","knitted","green pattern","botanical pattern","burgundy cord","evergreen","red berries"], aliases: ["белые рукавички с хвойным декором","green pattern winter mittens","ivory botanical knitwear"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "snowy-spruce-forest-path", src: "art/snowy-spruce-forest-path.webp", source: "original-assets/snowy-spruce-forest-path.png",
    name: {"ru":"Тропинка среди заснеженных елей","en":"Path winding through snow-covered spruce trees"}, category: "landscapes", subcategory: "landscapes-forests",
    tags: ["зимний лес","тропинка","снег","ели","красные ягоды","шишки","пейзаж","тишина"], tagsEn: ["landscape","forest-landscape","path","snow","spruce trees","red berries","pine cones","quiet winter"], aliases: ["заснеженная лесная дорожка","snowy forest trail","winter evergreen landscape"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "winter-forest-path-lantern", src: "art/winter-forest-path-lantern.webp", source: "original-assets/winter-forest-path-lantern.png",
    name: {"ru":"Светящийся фонарь у зимней лесной тропинки","en":"Glowing lantern beside a snowy forest path"}, category: "landscapes", subcategory: "landscapes-forests",
    tags: ["фонарь","тёплый свет","тропинка","зимний лес","ели","хвоя","ягоды","шишки","снег"], tagsEn: ["landscape","forest-landscape","lantern","warm light","path","winter forest","evergreen","berries","pine cones","snow"], aliases: ["лесной фонарь в снегу","snowy path glowing lantern","cozy winter forest trail"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "embossed-gold-bells-burgundy-bow", src: "art/embossed-gold-bells-burgundy-bow.webp", source: "original-assets/embossed-gold-bells-burgundy-bow.png",
    name: {"ru":"Рельефные золотые колокольчики с бордовым бантом","en":"Embossed golden bells with a burgundy bow"}, category: "ornaments", subcategory: "ornaments-bells",
    tags: ["колокольчики","золото","рельефный узор","бордовый бант","красные ягоды","хвоя","шишки"], tagsEn: ["ornament","bells","gold","embossed pattern","burgundy bow","red berries","evergreen","pine cones"], aliases: ["рождественские золотые колокольчики","ornate golden christmas bells","burgundy ribbon bells"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "evergreen-gifts-red-bows", src: "art/evergreen-gifts-red-bows.webp", source: "original-assets/evergreen-gifts-red-bows.png",
    name: {"ru":"Подарки с красными бантами и хвойными ветками","en":"Christmas gifts with red bows and evergreen branches"}, category: "seasonal-objects", subcategory: "seasonal-objects-gifts",
    tags: ["подарки","коробки","красные банты","зелёная упаковка","кремовая упаковка","падуб","хвоя","шишки","ягоды"], tagsEn: ["gift","boxes","red bows","green wrapping","ivory wrapping","holly","evergreen","pine cones","berries"], aliases: ["новогодние подарки с лентами","evergreen christmas gift arrangement","festive wrapped presents"], style: "vintage-watercolor", background: "transparent",
  },
  {
    id: "festive-reindeer-bells-red-ribbon", src: "art/festive-reindeer-bells-red-ribbon.webp", source: "original-assets/festive-reindeer-bells-red-ribbon.png",
    name: {"ru":"Олень с колокольчиками, хвоей и красной лентой","en":"Festive deer with bells, evergreen and a red ribbon"}, category: "animals", subcategory: "animals-deer",
    tags: ["олень","рога","колокольчики","красная лента","хвоя","шишки","красные ягоды","рождество"], tagsEn: ["animal","deer","reindeer","antlers","bells","red ribbon","evergreen","pine cones","red berries","christmas"], aliases: ["праздничный олень с нарядными рогами","christmas reindeer festive antlers","red ribbon woodland stag"], style: "vintage-watercolor", background: "transparent",
  },
];

const normalize = (text: string) => text.normalize('NFKC').toLocaleLowerCase().replaceAll('ё', 'е').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const labels = (value: LocalizedLabel | undefined) => value ? Object.values(value).join(' ') : '';
const imageTags = (image: ImageMetadata) => [...image.tags, ...image.tagsEn, ...Object.values(image.tagsByLocale ?? {}).flat()];
const tagSet = (image: ImageMetadata) => new Set(imageTags(image).map(normalize));
const matchesTaxon = (primary: string, taxon: ImageCategory | ImageMotif, tags: Set<string>) => primary === taxon.id || Boolean(taxon.includeTags?.some(tag => tags.has(normalize(tag))));

export function imageMatchesCategory(image: ImageMetadata, categoryId: string): boolean {
  const category = categories.find(item => item.id === categoryId);
  return Boolean(category && matchesTaxon(image.category, category, tagSet(image)));
}

/** Future motifs appear automatically as soon as explicitly tagged artwork exists. */
export function getAvailableMotifs(categoryId?: string): ImageMotif[] {
  const category = categoryId ? categories.find(item => item.id === categoryId) : undefined;
  if (categoryId && !category) return [];
  const pool = images.map(image => ({ image, tags: tagSet(image) })).filter(({ image, tags }) => !category || matchesTaxon(image.category, category, tags));
  return motifs.filter(motif => (!categoryId || motif.category === categoryId) && pool.some(({ image, tags }) => matchesTaxon(image.subcategory, motif, tags)));
}

/** Every query word must match explicit metadata, independently of the UI locale. */
export function searchImages(query = '', filters: ImageFilters = {}): ImageMetadata[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  const requestedTags = (filters.tags ?? []).map(normalize);
  const category = filters.category ? categories.find(item => item.id === filters.category) : undefined;
  const motif = filters.subcategory ? motifs.find(item => item.id === filters.subcategory) : undefined;
  if ((filters.category && !category) || (filters.subcategory && !motif) || (category && motif && motif.category !== category.id)) return [];
  return images.filter(image => {
    if (filters.background && image.background !== filters.background) return false;
    const tags = tagSet(image);
    if (category && !matchesTaxon(image.category, category, tags)) return false;
    if (motif && !matchesTaxon(image.subcategory, motif, tags)) return false;
    if (!requestedTags.every(tag => [...tags].some(value => value.includes(tag)))) return false;
    if (!words.length) return true;
    const imageCategories = categories.filter(item => matchesTaxon(image.category, item, tags));
    const imageMotifs = motifs.filter(item => matchesTaxon(image.subcategory, item, tags));
    const haystack = normalize([
      image.id, labels(image.name), ...imageCategories.flatMap(item => [item.id, labels(item.name)]),
      ...imageMotifs.flatMap(item => [item.id, labels(item.name)]), ...imageTags(image),
      ...image.aliases, image.style ?? '', image.background,
    ].join(' '));
    return words.every(word => haystack.includes(word));
  });
}

export const getImage = (id: string) => images.find(image => image.id === resolveImageId(id));
