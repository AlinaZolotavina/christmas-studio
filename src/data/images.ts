/**
 * Редактируемый вручную каталог. Предметы, категории и теги заданы после
 * визуального просмотра иллюстраций. Генератор не выводит их из имён файлов.
 * src — путь подготовленного файла относительно Vite BASE_URL.
 * source — исходник в репозитории; используется только assets:prepare.
 */
export interface LocalizedLabel { ru: string; en: string; [locale: string]: string }
export interface ImageCategory { id: string; name: LocalizedLabel }
export interface ImageSubcategory { id: string; category: string; name: LocalizedLabel }
export interface ImageMetadata {
  id: string;
  src: string;
  source: string;
  name: LocalizedLabel;
  category: string;
  subcategory: string;
  tags: string[];
  tagsEn: string[];
  aliases: string[];
  style?: string;
  background: 'transparent' | 'ivory';
  /** Дополнительные языки добавляются без изменения поискового алгоритма. */
  tagsByLocale?: Record<string, string[]>;
}
export interface ImageFilters {
  category?: string;
  subcategory?: string;
  background?: ImageMetadata['background'];
  tags?: string[];
}

export const categories: ImageCategory[] = [
  { id: 'botanical', name: { ru: 'Хвоя и цветы', en: 'Botanical' } },
  { id: 'characters', name: { ru: 'Сказочные герои', en: 'Characters' } },
  { id: 'ornaments', name: { ru: 'Ёлочные украшения', en: 'Ornaments' } },
  { id: 'winter-stories', name: { ru: 'Зимние истории', en: 'Winter stories' } },
  { id: 'seasonal-objects', name: { ru: 'Праздничные предметы', en: 'Seasonal objects' } },
];

export const subcategories: ImageSubcategory[] = [
  { id: 'botanical-branches', category: 'botanical', name: { ru: 'Ветви и букеты', en: 'Branches and bouquets' } },
  { id: 'botanical-wreaths', category: 'botanical', name: { ru: 'Венки', en: 'Wreaths' } },
  { id: 'botanical-flowers', category: 'botanical', name: { ru: 'Цветы', en: 'Flowers' } },
  { id: 'botanical-trees', category: 'botanical', name: { ru: 'Ёлки', en: 'Christmas trees' } },
  { id: 'characters-father-frost', category: 'characters', name: { ru: 'Дед Мороз', en: 'Father Frost' } },
  { id: 'characters-snow-maiden', category: 'characters', name: { ru: 'Снегурочка', en: 'Snow Maiden' } },
  { id: 'characters-woodland', category: 'characters', name: { ru: 'Лесные зверята', en: 'Woodland animals' } },
  { id: 'ornaments-stars', category: 'ornaments', name: { ru: 'Звёзды', en: 'Stars' } },
  { id: 'ornaments-baubles', category: 'ornaments', name: { ru: 'Шары и игрушки', en: 'Baubles and toys' } },
  { id: 'ornaments-bells', category: 'ornaments', name: { ru: 'Колокольчики', en: 'Bells' } },
  { id: 'winter-stories-houses', category: 'winter-stories', name: { ru: 'Домики', en: 'Houses' } },
  { id: 'winter-stories-troikas', category: 'winter-stories', name: { ru: 'Тройки', en: 'Troikas' } },
  { id: 'winter-stories-city', category: 'winter-stories', name: { ru: 'Зимний город', en: 'Winter city' } },
  { id: 'winter-stories-birds', category: 'winter-stories', name: { ru: 'Птицы', en: 'Birds' } },
  { id: 'seasonal-objects-candles', category: 'seasonal-objects', name: { ru: 'Свечи', en: 'Candles' } },
  { id: 'seasonal-objects-clocks', category: 'seasonal-objects', name: { ru: 'Часы', en: 'Clocks' } },
  { id: 'seasonal-objects-skates', category: 'seasonal-objects', name: { ru: 'Коньки', en: 'Skates' } },
  { id: 'seasonal-objects-sleighs', category: 'seasonal-objects', name: { ru: 'Санки', en: 'Sleighs' } },
  { id: 'seasonal-objects-gifts', category: 'seasonal-objects', name: { ru: 'Подарки', en: 'Gifts' } },
  { id: 'seasonal-objects-knitwear', category: 'seasonal-objects', name: { ru: 'Зимние аксессуары', en: 'Winter accessories' } },
];

export const images: ImageMetadata[] = [
  {
    id: 'rustic-wooden-star', src: 'art/rustic-wooden-star.png', source: 'assets/Rustikaler Weihnachtsstern mit Tannenzweigen.png',
    name: { ru: 'Деревянная звезда с хвоей', en: 'Wooden star with evergreen' }, category: 'ornaments', subcategory: 'ornaments-stars',
    tags: ['звезда', 'дерево', 'подвеска', 'хвоя', 'шишка', 'красный бант', 'ягоды', 'рустик'], tagsEn: ['star', 'wooden', 'hanging ornament', 'fir', 'pine cone', 'red bow', 'berries', 'rustic'], aliases: ['рождественская звёздочка', 'christmas star', 'rustic star'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'snowy-spruce-branch', src: 'art/snowy-spruce-branch.png', source: 'assets/Snow-covered-spruce-branch.png',
    name: { ru: 'Заснеженная еловая ветка', en: 'Snowy spruce branch' }, category: 'botanical', subcategory: 'botanical-branches',
    tags: ['ель', 'ветка', 'снег', 'хвоя', 'зима', 'зелёный', 'лес'], tagsEn: ['spruce', 'branch', 'snow', 'evergreen', 'winter', 'green', 'forest'], aliases: ['еловая лапа', 'fir bough', 'snow branch'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'straw-christmas-star', src: 'art/straw-christmas-star.png', source: 'assets/Strohstern mit roter Schleife und Beeren.png',
    name: { ru: 'Соломенная звезда с лентой', en: 'Straw star with ribbon' }, category: 'ornaments', subcategory: 'ornaments-stars',
    tags: ['звезда', 'солома', 'красный бант', 'ягоды', 'подвеска', 'натуральный', 'рождество'], tagsEn: ['star', 'straw', 'red bow', 'berries', 'hanging', 'natural', 'christmas'], aliases: ['соломенная игрушка', 'straw ornament', 'scandinavian star'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'golden-holly-bells', src: 'art/golden-holly-bells.png', source: 'assets/Weihnachtsglocken mit Samtschleife.png',
    name: { ru: 'Золотые колокольчики с падубом', en: 'Golden bells with holly' }, category: 'ornaments', subcategory: 'ornaments-bells',
    tags: ['колокольчики', 'золото', 'падуб', 'лента', 'красный бант', 'ягоды', 'праздник'], tagsEn: ['bells', 'gold', 'holly', 'ribbon', 'red bow', 'berries', 'festive'], aliases: ['бубенцы', 'christmas bells', 'jingle bells'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'ivory-poinsettia-arrangement', src: 'art/ivory-poinsettia-arrangement.png', source: 'assets/christmas-arrangement-with-a-poinsettia-and-berries.png',
    name: { ru: 'Кремовая пуансеттия с ягодами', en: 'Ivory poinsettia with berries' }, category: 'botanical', subcategory: 'botanical-flowers',
    tags: ['пуансеттия', 'кремовый цветок', 'хвоя', 'красные ягоды', 'шишка', 'букет', 'рождество'], tagsEn: ['poinsettia', 'ivory flower', 'evergreen', 'red berries', 'pine cone', 'bouquet', 'christmas'], aliases: ['рождественская звезда цветок', 'christmas flower', 'white poinsettia'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'snowy-forest-bauble', src: 'art/snowy-forest-bauble.png', source: 'assets/christmas-bauble-with-a-snowy-forest.png',
    name: { ru: 'Шар с зимним лесом', en: 'Snowy forest bauble' }, category: 'ornaments', subcategory: 'ornaments-baubles',
    tags: ['шар', 'ёлочная игрушка', 'зимний лес', 'снег', 'кремовый', 'красный бант', 'ель'], tagsEn: ['bauble', 'ornament', 'winter forest', 'snow', 'ivory', 'red bow', 'spruce'], aliases: ['новогодний шарик', 'christmas ball', 'forest ornament'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'evergreen-holly-bouquet', src: 'art/evergreen-holly-bouquet.png', source: 'assets/christmas-bouquet-of-evergreens-and-holly.png',
    name: { ru: 'Хвойный букет с падубом', en: 'Evergreen and holly bouquet' }, category: 'botanical', subcategory: 'botanical-branches',
    tags: ['букет', 'хвоя', 'падуб', 'красные ягоды', 'шишки', 'зелёный', 'растения'], tagsEn: ['bouquet', 'evergreen', 'holly', 'red berries', 'pine cones', 'green', 'botanical'], aliases: ['зимняя композиция', 'winter foliage', 'christmas greenery'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'ornate-christmas-clock', src: 'art/ornate-christmas-clock.png', source: 'assets/christmas-clock-with-spruce-branches-and-a-bow.png',
    name: { ru: 'Золотые часы с красным бантом', en: 'Ornate golden Christmas clock' }, category: 'seasonal-objects', subcategory: 'seasonal-objects-clocks',
    tags: ['часы', 'золото', 'циферблат', 'полночь', 'хвоя', 'бант', 'колокольчики'], tagsEn: ['clock', 'gold', 'dial', 'midnight', 'evergreen', 'bow', 'bells'], aliases: ['новогодние часы', 'new year countdown', 'ornate clock'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'hanging-christmas-cottage', src: 'art/hanging-christmas-cottage.png', source: 'assets/christmas-cottage-on-a-spruce-branch.png',
    name: { ru: 'Ёлочный домик с тёплым окошком', en: 'Hanging cottage with glowing window' }, category: 'winter-stories', subcategory: 'winter-stories-houses',
    tags: ['домик', 'окно', 'снег', 'ёлочная игрушка', 'ветка', 'бант', 'уют'], tagsEn: ['cottage', 'window', 'snow', 'ornament', 'branch', 'bow', 'cozy'], aliases: ['зимняя избушка', 'christmas cottage', 'tiny house'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'holly-red-ribbon', src: 'art/holly-red-ribbon.png', source: 'assets/christmas-holly-bouque-with-a-red-ribbon.png',
    name: { ru: 'Падуб с алой лентой', en: 'Holly with red ribbon' }, category: 'botanical', subcategory: 'botanical-branches',
    tags: ['падуб', 'остролист', 'красные ягоды', 'бант', 'зелёные листья', 'букет'], tagsEn: ['holly', 'red berries', 'bow', 'green leaves', 'bouquet', 'ribbon'], aliases: ['веточка падуба', 'holly sprig', 'christmas holly'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'woodland-christmas-tree', src: 'art/woodland-christmas-tree.png', source: 'assets/christmas-tree-with-wooden-ornaments.png',
    name: { ru: 'Ёлочка с деревянными игрушками', en: 'Tree with wooden ornaments' }, category: 'botanical', subcategory: 'botanical-trees',
    tags: ['ёлка', 'ель', 'деревянные игрушки', 'олень', 'звезда', 'корзина', 'снег', 'шишки'], tagsEn: ['christmas tree', 'spruce', 'wooden ornaments', 'deer', 'star', 'basket', 'snow', 'pine cones'], aliases: ['новогодняя ёлочка', 'woodland tree', 'christmas fir'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'mistletoe-wreath', src: 'art/mistletoe-wreath.png', source: 'assets/christmas-wreath-with-a-bow.png',
    name: { ru: 'Венок с омелой и красным бантом', en: 'Mistletoe wreath with bow' }, category: 'botanical', subcategory: 'botanical-wreaths',
    tags: ['венок', 'омела', 'белые ягоды', 'красный бант', 'хвоя', 'круг', 'шишки'], tagsEn: ['wreath', 'mistletoe', 'white berries', 'red bow', 'evergreen', 'round', 'pine cones'], aliases: ['рождественский веночек', 'christmas wreath', 'door wreath'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'orange-cinnamon-wreath', src: 'art/orange-cinnamon-wreath.png', source: 'assets/christmas-wreath-with-a-red-bow-and-oranges.png',
    name: { ru: 'Венок с апельсинами и корицей', en: 'Orange and cinnamon wreath' }, category: 'botanical', subcategory: 'botanical-wreaths',
    tags: ['венок', 'апельсин', 'корица', 'колокольчики', 'ягоды', 'бант', 'пряности'], tagsEn: ['wreath', 'orange', 'cinnamon', 'bells', 'berries', 'bow', 'spices'], aliases: ['пряный венок', 'spiced wreath', 'citrus wreath'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'velvet-bow-wreath', src: 'art/velvet-bow-wreath.png', source: 'assets/christmas-wreath-with-a-red-velvet-bow.png',
    name: { ru: 'Хвойный венок с бархатным бантом', en: 'Evergreen velvet bow wreath' }, category: 'botanical', subcategory: 'botanical-wreaths',
    tags: ['венок', 'хвоя', 'бархат', 'бант', 'красные ягоды', 'шишки', 'падуб'], tagsEn: ['wreath', 'evergreen', 'velvet', 'bow', 'red berries', 'pine cones', 'holly'], aliases: ['еловый венок', 'festive wreath', 'red ribbon wreath'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'four-advent-candles', src: 'art/four-advent-candles.png', source: 'assets/christmas-wreath-with-four-candles.png',
    name: { ru: 'Четыре адвент-свечи', en: 'Four Advent candles' }, category: 'seasonal-objects', subcategory: 'seasonal-objects-candles',
    tags: ['свечи', 'адвент', 'четыре', 'огонь', 'венок', 'уют', 'тепло', 'звезда'], tagsEn: ['candles', 'advent', 'four', 'flame', 'wreath', 'cozy', 'warm', 'star'], aliases: ['рождественские свечки', 'advent wreath', 'candle arrangement'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'snowy-fairytale-cottage', src: 'art/snowy-fairytale-cottage.png', source: 'assets/fairytale-winter-teremok-in-the-snow.png',
    name: { ru: 'Сказочный теремок в снегу', en: 'Snowy fairytale cottage' }, category: 'winter-stories', subcategory: 'winter-stories-houses',
    tags: ['теремок', 'дом', 'сказка', 'снег', 'берёзы', 'ёлки', 'окна', 'уют'], tagsEn: ['cottage', 'house', 'fairytale', 'snow', 'birch', 'fir trees', 'windows', 'cozy'], aliases: ['зимний домик', 'russian terem', 'winter cabin'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'father-frost-christmas-tree', src: 'art/father-frost-christmas-tree.png', source: 'assets/father-frost-and-a-decorated-christmas-tree-with-gifts.png',
    name: { ru: 'Дед Мороз с ёлкой и подарками', en: 'Father Frost with tree and gifts' }, category: 'characters', subcategory: 'characters-father-frost',
    tags: ['дед мороз', 'ёлка', 'подарки', 'голубая шуба', 'посох', 'снежинка', 'сказка'], tagsEn: ['father frost', 'christmas tree', 'gifts', 'blue coat', 'staff', 'snowflake', 'fairytale'], aliases: ['дедушка мороз', 'ded moroz', 'santa with presents'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'father-frost-red-coat', src: 'art/father-frost-red-coat.png', source: 'assets/father-frost-in red-with-an-icy-staff-and-a-sack.png',
    name: { ru: 'Дед Мороз в красной шубе', en: 'Father Frost in red' }, category: 'characters', subcategory: 'characters-father-frost',
    tags: ['дед мороз', 'красная шуба', 'мешок', 'посох', 'борода', 'снежинка', 'подарки'], tagsEn: ['father frost', 'red coat', 'sack', 'staff', 'beard', 'snowflake', 'gifts'], aliases: ['санта', 'santa claus', 'ded moroz red'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'father-frost-blue-coat', src: 'art/father-frost-blue-coat.png', source: 'assets/father-frost-in-blue-with-an-icy-staff-and-a-sack.png',
    name: { ru: 'Дед Мороз с ледяным посохом', en: 'Blue Father Frost with icy staff' }, category: 'characters', subcategory: 'characters-father-frost',
    tags: ['дед мороз', 'синяя шуба', 'посох', 'мешок', 'узоры', 'борода', 'зима'], tagsEn: ['father frost', 'blue coat', 'staff', 'sack', 'ornament', 'beard', 'winter'], aliases: ['зимний волшебник', 'ded moroz', 'winter wizard'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'father-frost-gift-sack', src: 'art/father-frost-gift-sack.png', source: 'assets/father-frost-with-gifts-and-a-crystal-staff.png',
    name: { ru: 'Дед Мороз с мешком подарков', en: 'Father Frost with gift sack' }, category: 'characters', subcategory: 'characters-father-frost',
    tags: ['дед мороз', 'подарки', 'игрушки', 'мишка', 'мешок', 'голубой', 'посох'], tagsEn: ['father frost', 'gifts', 'toys', 'teddy bear', 'sack', 'blue', 'staff'], aliases: ['новогодний волшебник', 'gift bearer', 'ded moroz presents'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'father-frost-spruce-bouquet', src: 'art/father-frost-spruce-bouquet.png', source: 'assets/father-frost-with-spruce-branches-and-a-staff.png',
    name: { ru: 'Дед Мороз с еловым букетом', en: 'Father Frost with spruce bouquet' }, category: 'characters', subcategory: 'characters-father-frost',
    tags: ['дед мороз', 'хвоя', 'букет', 'посох', 'голубая шуба', 'красные ягоды', 'бант'], tagsEn: ['father frost', 'evergreen', 'bouquet', 'staff', 'blue coat', 'red berries', 'bow'], aliases: ['морозко', 'ded moroz greenery', 'winter father'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'green-gold-bauble', src: 'art/green-gold-bauble.png', source: 'assets/festive-christmas-bauble-with-fir-branches.png',
    name: { ru: 'Зелёный шар с золотым орнаментом', en: 'Green bauble with golden foliage' }, category: 'ornaments', subcategory: 'ornaments-baubles',
    tags: ['шар', 'зелёный', 'золото', 'орнамент', 'ветка', 'бант', 'ёлочная игрушка'], tagsEn: ['bauble', 'green', 'gold', 'ornament', 'branch', 'bow', 'christmas toy'], aliases: ['стеклянный шарик', 'green christmas ball', 'gold leaf ornament'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'winter-berry-cone-bouquet', src: 'art/winter-berry-cone-bouquet.png', source: 'assets/festive-winter-branch-with-berries-and-cones.png',
    name: { ru: 'Зимние ветви с ягодами и шишками', en: 'Winter branches with berries and cones' }, category: 'botanical', subcategory: 'botanical-branches',
    tags: ['ветви', 'хвоя', 'можжевельник', 'шишки', 'красные ягоды', 'зелень', 'букет'], tagsEn: ['branches', 'evergreen', 'juniper', 'pine cones', 'red berries', 'foliage', 'bouquet'], aliases: ['хвойная композиция', 'winter greenery', 'pine bouquet'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'holly-berry-branch', src: 'art/holly-berry-branch.png', source: 'assets/holly-branch-with-berries.png',
    name: { ru: 'Ветка падуба с красными ягодами', en: 'Holly branch with red berries' }, category: 'botanical', subcategory: 'botanical-branches',
    tags: ['падуб', 'остролист', 'ягоды', 'красный', 'зелёные листья', 'ветка', 'рождество'], tagsEn: ['holly', 'berries', 'red', 'green leaves', 'branch', 'christmas'], aliases: ['остролистник', 'holly leaves', 'berry sprig'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'snowy-holly-branch', src: 'art/snowy-holly-branch.png', source: 'assets/holly-branch-with-snow.png',
    name: { ru: 'Заснеженный падуб', en: 'Snowy holly' }, category: 'botanical', subcategory: 'botanical-branches',
    tags: ['падуб', 'снег', 'красные ягоды', 'ветка', 'зима', 'листья'], tagsEn: ['holly', 'snow', 'red berries', 'branch', 'winter', 'leaves'], aliases: ['падуб в снегу', 'frosted holly', 'snow holly sprig'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'red-wooden-sleigh', src: 'art/red-wooden-sleigh.png', source: 'assets/red-christmas-sleigh-with-fir-branches.png',
    name: { ru: 'Красные саночки с хвоей', en: 'Red sleigh with evergreen' }, category: 'seasonal-objects', subcategory: 'seasonal-objects-sleighs',
    tags: ['санки', 'сани', 'красный', 'дерево', 'хвоя', 'шишки', 'бант', 'зимние забавы'], tagsEn: ['sleigh', 'sled', 'red', 'wooden', 'evergreen', 'pine cones', 'bow', 'winter fun'], aliases: ['саночки', 'christmas sled', 'wooden sledge'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'red-poinsettia-flowers', src: 'art/red-poinsettia-flowers.png', source: 'assets/red-poinsettias-with-green-foliage.png',
    name: { ru: 'Красные пуансеттии', en: 'Red poinsettia flowers' }, category: 'botanical', subcategory: 'botanical-flowers',
    tags: ['пуансеттия', 'цветы', 'красный', 'зелёные листья', 'рождество', 'букет'], tagsEn: ['poinsettia', 'flowers', 'red', 'green leaves', 'christmas', 'bouquet'], aliases: ['рождественская звезда цветок', 'christmas flowers', 'red bloom'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'russian-troika-snow', src: 'art/russian-troika-snow.png', source: 'assets/russian-troika-in-a-sleigh.png',
    name: { ru: 'Русская тройка в зимнем лесу', en: 'Russian troika in winter forest' }, category: 'winter-stories', subcategory: 'winter-stories-troikas',
    tags: ['тройка', 'лошади', 'сани', 'дуга', 'снег', 'ель', 'русская зима'], tagsEn: ['troika', 'horses', 'sleigh', 'harness', 'snow', 'fir', 'russian winter'], aliases: ['три коня', 'russian horses', 'winter carriage'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'ornate-troika-sleigh', src: 'art/ornate-troika-sleigh.png', source: 'assets/russian-winter-troika-with-an-ornate-sleigh.png.png',
    name: { ru: 'Тройка с расписными санями', en: 'Troika with ornate sleigh' }, category: 'winter-stories', subcategory: 'winter-stories-troikas',
    tags: ['тройка', 'лошади', 'сани', 'роспись', 'снег', 'колокольчики', 'русская сказка'], tagsEn: ['troika', 'horses', 'sleigh', 'painted', 'snow', 'bells', 'russian fairytale'], aliases: ['русская упряжка', 'ornate winter sleigh', 'three horses'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'wooden-ornament-wreath', src: 'art/wooden-ornament-wreath.png', source: 'assets/rustic-christmasc-wreath-with-a-ribbon.png',
    name: { ru: 'Венок с деревянными подвесками', en: 'Wreath with wooden ornaments' }, category: 'botanical', subcategory: 'botanical-wreaths',
    tags: ['венок', 'деревянные игрушки', 'звезда', 'лошадка', 'сердце', 'корица', 'бант', 'шишки'], tagsEn: ['wreath', 'wooden ornaments', 'star', 'rocking horse', 'heart', 'cinnamon', 'bow', 'pine cones'], aliases: ['рустикальный венок', 'rustic wreath', 'woodland wreath'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'spasskaya-tower-spruce', src: 'art/spasskaya-tower-spruce.png', source: 'assets/snow-covered-spasskaya-tower-with-spruce-branches.png',
    name: { ru: 'Спасская башня с еловыми ветвями', en: 'Spasskaya tower with spruce' }, category: 'winter-stories', subcategory: 'winter-stories-city',
    tags: ['спасская башня', 'кремль', 'москва', 'куранты', 'снег', 'красная звезда', 'новый год'], tagsEn: ['spasskaya tower', 'kremlin', 'moscow', 'clock', 'snow', 'red star', 'new year'], aliases: ['кремлёвская башня', 'kremlin chimes', 'moscow landmark'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'snow-maiden-christmas-tree', src: 'art/snow-maiden-christmas-tree.png', source: 'assets/snow-maiden-decorates-the-winter-tree.png',
    name: { ru: 'Снегурочка украшает ёлку', en: 'Snow Maiden decorating a tree' }, category: 'characters', subcategory: 'characters-snow-maiden',
    tags: ['снегурочка', 'ёлка', 'игрушки', 'кокошник', 'голубая шуба', 'звезда', 'сказка'], tagsEn: ['snow maiden', 'christmas tree', 'ornaments', 'kokoshnik', 'blue coat', 'star', 'fairytale'], aliases: ['снегурка', 'snegurochka', 'snow princess tree'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'snow-maiden-kokoshnik', src: 'art/snow-maiden-kokoshnik.png', source: 'assets/snow-maiden-in-a-kokoshnik.png',
    name: { ru: 'Снегурочка в кокошнике', en: 'Snow Maiden in a kokoshnik' }, category: 'characters', subcategory: 'characters-snow-maiden',
    tags: ['снегурочка', 'кокошник', 'коса', 'белый мех', 'голубая шуба', 'русская сказка'], tagsEn: ['snow maiden', 'kokoshnik', 'braid', 'white fur', 'blue coat', 'russian fairytale'], aliases: ['снегурка', 'snegurochka portrait', 'snow princess'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'snow-maiden-berry-basket', src: 'art/snow-maiden-berry-basket.png', source: 'assets/snow-maiden-with-a-basket-of-winter-berries.png',
    name: { ru: 'Снегурочка с зимним букетом', en: 'Snow Maiden with winter berries' }, category: 'characters', subcategory: 'characters-snow-maiden',
    tags: ['снегурочка', 'ягоды', 'букет', 'корзина', 'хвоя', 'кокошник', 'красный бант'], tagsEn: ['snow maiden', 'berries', 'bouquet', 'basket', 'evergreen', 'kokoshnik', 'red bow'], aliases: ['снегурка с корзинкой', 'snegurochka berries', 'winter princess bouquet'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'snow-maiden-crystal-snowflake', src: 'art/snow-maiden-crystal-snowflake.png', source: 'assets/snow-maiden-with-a-crystal-snowflake.png',
    name: { ru: 'Снегурочка с хрустальной снежинкой', en: 'Snow Maiden with crystal snowflake' }, category: 'characters', subcategory: 'characters-snow-maiden',
    tags: ['снегурочка', 'снежинка', 'хрусталь', 'кокошник', 'варежки', 'голубой', 'портрет'], tagsEn: ['snow maiden', 'snowflake', 'crystal', 'kokoshnik', 'mittens', 'blue', 'portrait'], aliases: ['снегурочка со снежинкой', 'snegurochka snowflake', 'ice princess'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'snow-maiden-winter-branch', src: 'art/snow-maiden-winter-branch.png', source: 'assets/snow-maiden-with-a-winter-branch.png',
    name: { ru: 'Снегурочка с еловой веточкой', en: 'Snow Maiden with winter branch' }, category: 'characters', subcategory: 'characters-snow-maiden',
    tags: ['снегурочка', 'ветка', 'хвоя', 'ягоды', 'голубая шуба', 'коса', 'кокошник'], tagsEn: ['snow maiden', 'branch', 'evergreen', 'berries', 'blue coat', 'braid', 'kokoshnik'], aliases: ['снегурка с веточкой', 'snegurochka branch', 'winter maiden'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'vintage-three-baubles', src: 'art/vintage-three-baubles.png', source: 'assets/vintage-arrangement-of-christmas-tree-ornaments.png',
    name: { ru: 'Три винтажные ёлочные игрушки', en: 'Three vintage Christmas ornaments' }, category: 'ornaments', subcategory: 'ornaments-baubles',
    tags: ['шары', 'ёлочные игрушки', 'винтаж', 'стекло', 'зелёный', 'кремовый', 'красный', 'бант'], tagsEn: ['baubles', 'christmas ornaments', 'vintage', 'glass', 'green', 'ivory', 'red', 'bow'], aliases: ['стеклянные подвески', 'vintage ornaments', 'retro christmas balls'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'brown-vintage-skates', src: 'art/brown-vintage-skates.png', source: 'assets/vintage-brown-skates-with-with-spruce-branches.png',
    name: { ru: 'Коричневые коньки с хвоей', en: 'Brown vintage skates with evergreen' }, category: 'seasonal-objects', subcategory: 'seasonal-objects-skates',
    tags: ['коньки', 'коричневый', 'шнурки', 'хвоя', 'бант', 'ягоды', 'зимние забавы'], tagsEn: ['skates', 'brown', 'laces', 'evergreen', 'bow', 'berries', 'winter fun'], aliases: ['фигурные коньки', 'ice skates', 'vintage skating boots'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'glass-bird-ornament', src: 'art/glass-bird-ornament.png', source: 'assets/vintage-glass-bird-on-a-christmas-tree-branch.png',
    name: { ru: 'Стеклянная птичка на еловой ветке', en: 'Glass bird on spruce branch' }, category: 'ornaments', subcategory: 'ornaments-baubles',
    tags: ['птица', 'стекло', 'ёлочная игрушка', 'красная грудка', 'ветка', 'снег', 'винтаж'], tagsEn: ['bird', 'glass', 'ornament', 'red breast', 'branch', 'snow', 'vintage'], aliases: ['ёлочная птичка', 'glass robin', 'bird bauble'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'golden-cone-ornament', src: 'art/golden-cone-ornament.png', source: 'assets/vintage-pine-cone-on-a-snow-covered-branch.png',
    name: { ru: 'Золотая шишка на заснеженной ветке', en: 'Golden cone on snowy branch' }, category: 'ornaments', subcategory: 'ornaments-baubles',
    tags: ['шишка', 'золото', 'ёлочная игрушка', 'снег', 'ветка', 'красный бант'], tagsEn: ['pine cone', 'gold', 'ornament', 'snow', 'branch', 'red bow'], aliases: ['стеклянная шишка', 'golden pinecone', 'cone bauble'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'red-glass-star', src: 'art/red-glass-star.png', source: 'assets/vintage-red-star-on-a-snow-covered-branch.png',
    name: { ru: 'Красная стеклянная звезда', en: 'Red glass star' }, category: 'ornaments', subcategory: 'ornaments-stars',
    tags: ['звезда', 'красный', 'стекло', 'ёлочная игрушка', 'снег', 'ветка', 'винтаж'], tagsEn: ['star', 'red', 'glass', 'ornament', 'snow', 'branch', 'vintage'], aliases: ['алая звёздочка', 'red christmas star', 'retro star'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'soviet-glass-ornaments', src: 'art/soviet-glass-ornaments.png', source: 'assets/vintage-soviet-christmas-tree-ornaments.png',
    name: { ru: 'Коллекция ретро-игрушек', en: 'Collection of retro glass ornaments' }, category: 'ornaments', subcategory: 'ornaments-baubles',
    tags: ['ёлочные игрушки', 'ретро', 'снеговик', 'птица', 'домик', 'звезда', 'стекло', 'набор'], tagsEn: ['ornaments', 'retro', 'snowman', 'bird', 'house', 'star', 'glass', 'collection'], aliases: ['советские игрушки', 'soviet christmas toys', 'vintage bauble collection'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'snowy-christmas-clock', src: 'art/snowy-christmas-clock.png', source: 'assets/vintage-watch-amidst-snow-covered-spruce-branches.png',
    name: { ru: 'Часы в заснеженных ветвях', en: 'Clock in snowy spruce branches' }, category: 'seasonal-objects', subcategory: 'seasonal-objects-clocks',
    tags: ['часы', 'полночь', 'снег', 'хвоя', 'колокольчики', 'циферблат', 'бант'], tagsEn: ['clock', 'midnight', 'snow', 'evergreen', 'bells', 'dial', 'bow'], aliases: ['часы перед новым годом', 'new year clock', 'winter timepiece'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'mantel-clock-wreath', src: 'art/mantel-clock-wreath.png', source: 'assets/vintage-watch-in-a-christmas-wreath.png',
    name: { ru: 'Каминные часы в рождественском венке', en: 'Mantel clock in Christmas wreath' }, category: 'seasonal-objects', subcategory: 'seasonal-objects-clocks',
    tags: ['часы', 'каминные часы', 'венок', 'звёзды', 'шишки', 'хвоя', 'винтаж'], tagsEn: ['clock', 'mantel clock', 'wreath', 'stars', 'pine cones', 'evergreen', 'vintage'], aliases: ['старинные часы', 'antique clock', 'christmas timepiece'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'white-vintage-skates', src: 'art/white-vintage-skates.png', source: 'assets/vintage-white-skates-with-winter-decoration.png',
    name: { ru: 'Белые коньки с зимним декором', en: 'White skates with winter decoration' }, category: 'seasonal-objects', subcategory: 'seasonal-objects-skates',
    tags: ['коньки', 'белый', 'шнурки', 'хвоя', 'шишки', 'ягоды', 'бант', 'зима'], tagsEn: ['skates', 'white', 'laces', 'evergreen', 'pine cones', 'berries', 'bow', 'winter'], aliases: ['белые фигурные коньки', 'ivory ice skates', 'winter skating'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'robin-bird-feeder', src: 'art/robin-bird-feeder.png', source: 'assets/winter-bird-feeder-with-a-robin-and-snow.png',
    name: { ru: 'Малиновка на заснеженной кормушке', en: 'Robin on snowy bird feeder' }, category: 'winter-stories', subcategory: 'winter-stories-birds',
    tags: ['птица', 'малиновка', 'зарянка', 'кормушка', 'снег', 'хвоя', 'красная грудка'], tagsEn: ['bird', 'robin', 'bird feeder', 'snow', 'evergreen', 'red breast'], aliases: ['птичий домик', 'winter bird', 'birdhouse'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'winter-red-bow-bouquet', src: 'art/winter-red-bow-bouquet.png', source: 'assets/winter-bouquet-with-a-red-bow.png',
    name: { ru: 'Зимний букет с красным бантом', en: 'Winter bouquet with red bow' }, category: 'botanical', subcategory: 'botanical-branches',
    tags: ['букет', 'хвоя', 'падуб', 'омела', 'шишки', 'красный бант', 'ягоды'], tagsEn: ['bouquet', 'evergreen', 'holly', 'mistletoe', 'pine cones', 'red bow', 'berries'], aliases: ['рождественский букет', 'christmas bouquet', 'winter foliage bow'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'winter-kremlin-panorama', src: 'art/winter-kremlin-panorama.png', source: 'assets/winter-panorama-of-the-spasskaya-tower-of-the-kremlin.png',
    name: { ru: 'Зимняя панорама Кремля', en: 'Winter Kremlin panorama' }, category: 'winter-stories', subcategory: 'winter-stories-city',
    tags: ['кремль', 'москва', 'спасская башня', 'фонарь', 'снег', 'город', 'рябина', 'куранты'], tagsEn: ['kremlin', 'moscow', 'spasskaya tower', 'lantern', 'snow', 'city', 'rowan', 'chimes'], aliases: ['красная площадь зимой', 'red square winter', 'moscow panorama'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'snowy-spruce-cones', src: 'art/snowy-spruce-cones.png', source: 'assets/winter-spruce-branch-with-snow-and-cones.png',
    name: { ru: 'Заснеженная хвоя с шишками', en: 'Snowy spruce with pine cones' }, category: 'botanical', subcategory: 'botanical-branches',
    tags: ['хвоя', 'ветка', 'шишки', 'снег', 'ель', 'красные ягоды', 'лес'], tagsEn: ['evergreen', 'branch', 'pine cones', 'snow', 'spruce', 'red berries', 'forest'], aliases: ['еловая лапа с шишками', 'pine bough', 'snowy fir branch'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'filigree-golden-star', src: 'art/filigree-golden-star.png', source: 'assets/Винтажная золотая звезда с красным бантом.png',
    name: { ru: 'Ажурная золотая звезда', en: 'Filigree golden star' }, category: 'ornaments', subcategory: 'ornaments-stars',
    tags: ['звезда', 'золото', 'ажур', 'орнамент', 'красный бант', 'шишки', 'ягоды'], tagsEn: ['star', 'gold', 'filigree', 'ornament', 'red bow', 'pine cones', 'berries'], aliases: ['резная звезда', 'golden christmas star', 'ornate star'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'beeswax-winter-candle', src: 'art/beeswax-winter-candle.png', source: 'assets/Медовая свеча с зимним декором.png',
    name: { ru: 'Медовая свеча с зимним декором', en: 'Beeswax candle with winter decor' }, category: 'seasonal-objects', subcategory: 'seasonal-objects-candles',
    tags: ['свеча', 'воск', 'мёд', 'соты', 'огонь', 'хвоя', 'бант', 'уют'], tagsEn: ['candle', 'beeswax', 'honey', 'honeycomb', 'flame', 'evergreen', 'bow', 'cozy'], aliases: ['восковая свечка', 'honey candle', 'winter candle'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'silver-festive-bells', src: 'art/silver-festive-bells.png', source: 'assets/Праздничные колокольчики с лентой и падубом.png',
    name: { ru: 'Серебряные колокольчики с лентой', en: 'Silver festive bells with ribbon' }, category: 'ornaments', subcategory: 'ornaments-bells',
    tags: ['колокольчики', 'серебро', 'падуб', 'лента', 'красный бант', 'ягоды', 'узор'], tagsEn: ['bells', 'silver', 'holly', 'ribbon', 'red bow', 'berries', 'pattern'], aliases: ['праздничный звон', 'silver christmas bells', 'festive chimes'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'evergreen-jingle-bells', src: 'art/evergreen-jingle-bells.png', source: 'assets/сhristmas-evergreen-arrangement-with-bells.png',
    name: { ru: 'Хвойные ветви с бубенцами', en: 'Evergreen branches with jingle bells' }, category: 'ornaments', subcategory: 'ornaments-bells',
    tags: ['бубенцы', 'колокольчики', 'золото', 'хвоя', 'шишки', 'красный бант', 'ягоды'], tagsEn: ['jingle bells', 'bells', 'gold', 'evergreen', 'pine cones', 'red bow', 'berries'], aliases: ['хвойная подвеска', 'christmas jingle bells', 'evergreen bell bouquet'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'mistletoe-burgundy-bow', src: 'art/mistletoe-burgundy-bow.png', source: 'assets/сhristmas-mistletoe-with-a-burgundy-bow.png',
    name: { ru: 'Омела с бордовым бантом', en: 'Mistletoe with burgundy bow' }, category: 'botanical', subcategory: 'botanical-branches',
    tags: ['омела', 'белые ягоды', 'бордовый бант', 'зелёные листья', 'ветка', 'рождество'], tagsEn: ['mistletoe', 'white berries', 'burgundy bow', 'green leaves', 'branch', 'christmas'], aliases: ['веточка омелы', 'mistletoe sprig', 'kissing bough'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'woodland-fox-in-red-scarf', src: 'art/woodland-fox-in-red-scarf.png', source: 'assets/woodland-fox-in-red-scarf.png',
    name: { ru: 'Лисичка в красном шарфе', en: 'Woodland fox in a red scarf' }, category: 'characters', subcategory: 'characters-woodland',
    tags: ['лиса', 'лисичка', 'рыжий', 'красный шарф', 'лес', 'зима', 'зверята', 'пушистый хвост'], tagsEn: ['fox', 'red fox', 'woodland', 'red scarf', 'winter', 'animal', 'fluffy tail'], aliases: ['лисенок', 'little fox', 'fox cub'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'bear-carrying-evergreen', src: 'art/bear-carrying-evergreen.png', source: 'assets/bear-with-fir-branches-in-winter.png',
    name: { ru: 'Медвежонок с вязаным шарфом и охапкой хвои', en: 'Bear cub carrying evergreen branches' }, category: 'characters', subcategory: 'characters-woodland',
    tags: ['медведь', 'медвежонок', 'красный шарф', 'свитер', 'снежинки', 'охапка веток', 'хвоя', 'снег', 'зверята'], tagsEn: ['bear', 'bear cub', 'red scarf', 'knitted sweater', 'snowflakes', 'evergreen bundle', 'snow', 'woodland animal'], aliases: ['мишка с еловыми ветками', 'teddy bear winter', 'bear with fir boughs'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'snowy-cottage-glass-bauble', src: 'art/snowy-cottage-glass-bauble.png', source: 'assets/christmas-bauble-with-a-snowy-house.png',
    name: { ru: 'Стеклянный шар с заснеженным домиком', en: 'Glass bauble with a snowy cottage' }, category: 'ornaments', subcategory: 'ornaments-baubles',
    tags: ['ёлочный шар', 'стекло', 'домик', 'заснеженная ель', 'тёплое окно', 'красный бант', 'золотая петелька', 'зима'], tagsEn: ['christmas bauble', 'glass ornament', 'cottage', 'snowy spruce', 'warm window', 'red bow', 'gold loop', 'winter'], aliases: ['зимний домик внутри шара', 'snow globe cottage', 'hanging winter bauble'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'hanging-five-golden-stars', src: 'art/hanging-five-golden-stars.png', source: 'assets/christmas-decorations-with-golden-stars.png',
    name: { ru: 'Пять золотых звёзд под красным бантом', en: 'Five golden stars beneath a red bow' }, category: 'ornaments', subcategory: 'ornaments-stars',
    tags: ['звёзды', 'золото', 'подвески', 'пять звёзд', 'красный бант', 'хвоя', 'ягоды', 'золотые нити'], tagsEn: ['stars', 'gold', 'hanging ornaments', 'five stars', 'red bow', 'evergreen', 'berries', 'gold strings'], aliases: ['золотая звёздная подвеска', 'gold star mobile', 'christmas hanging stars'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'knitted-red-mittens', src: 'art/knitted-red-mittens.png', source: 'assets/christmas-mittens-with-a-bow-and-berries.png',
    name: { ru: 'Красные варежки со снежинками и бантом', en: 'Red knitted mittens with snowflakes and a bow' }, category: 'seasonal-objects', subcategory: 'seasonal-objects-knitwear',
    tags: ['варежки', 'рукавицы', 'красный', 'вязание', 'снежинки', 'кремовые манжеты', 'хвоя', 'ягоды', 'бант'], tagsEn: ['mittens', 'red', 'knitwear', 'knitted', 'snowflakes', 'cream cuffs', 'evergreen', 'berries', 'bow'], aliases: ['зимние рукавички', 'christmas mittens', 'winter gloves'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'holly-golden-berry-wreath', src: 'art/holly-golden-berry-wreath.png', source: 'assets/christmas-wreath-with-berries-and-a-bow.png',
    name: { ru: 'Венок из падуба с красными и золотыми ягодами', en: 'Holly wreath with red and golden berries' }, category: 'botanical', subcategory: 'botanical-wreaths',
    tags: ['венок', 'падуб', 'остролист', 'красные ягоды', 'золотые ягоды', 'красный бант', 'зелёные листья', 'рождество'], tagsEn: ['wreath', 'holly', 'red berries', 'golden berries', 'red bow', 'green leaves', 'christmas'], aliases: ['рождественский венок из падуба', 'holly berry wreath', 'red ribbon wreath'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'winter-stag-red-bow', src: 'art/winter-stag-red-bow.png', source: 'assets/deer-in-a-winter-forest.png',
    name: { ru: 'Олень с красным бантом у заснеженной ели', en: 'Stag with a red bow beside a snowy spruce' }, category: 'characters', subcategory: 'characters-woodland',
    tags: ['олень', 'рога', 'красный бант', 'лента', 'заснеженная ель', 'красные ягоды', 'снег', 'лес', 'зверята'], tagsEn: ['deer', 'stag', 'antlers', 'red bow', 'ribbon', 'snowy spruce', 'red berries', 'snow', 'woodland animal'], aliases: ['сказочный олень зимой', 'winter deer red ribbon', 'woodland stag'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'winter-deer-family', src: 'art/winter-deer-family.png', source: 'assets/deer-in-winter.png',
    name: { ru: 'Олень и оленёнок под снежной еловой веткой', en: 'Stag and fawn beneath a snowy fir branch' }, category: 'characters', subcategory: 'characters-woodland',
    tags: ['олень', 'оленёнок', 'пара', 'семья', 'рога', 'красный шарф', 'красный бант', 'хвоя', 'шишки', 'снег'], tagsEn: ['deer', 'stag', 'fawn', 'pair', 'family', 'antlers', 'red scarf', 'red bow', 'fir branch', 'pine cones', 'snow'], aliases: ['лесная семья оленей', 'winter deer family', 'deer and baby'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'scarf-fox-candle-lantern', src: 'art/scarf-fox-candle-lantern.png', source: 'assets/fox-and-the-shining-lantern.png',
    name: { ru: 'Лисичка в шарфе у светящегося фонаря', en: 'Fox in a scarf beside a glowing lantern' }, category: 'characters', subcategory: 'characters-woodland',
    tags: ['лиса', 'лисичка', 'красный шарф', 'фонарь', 'свеча', 'огонь', 'хвоя', 'ягоды', 'шишки', 'снег'], tagsEn: ['fox', 'red fox', 'red scarf', 'lantern', 'candle', 'flame', 'evergreen', 'berries', 'pine cones', 'snow'], aliases: ['лиса с фонариком', 'fox by candlelight', 'woodland fox lantern'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'fox-walking-snow-tracks', src: 'art/fox-walking-snow-tracks.png', source: 'assets/fox-in-a-snowy-winter-forest.png',
    name: { ru: 'Рыжая лиса и следы в зимнем лесу', en: 'Red fox and paw prints in a winter forest' }, category: 'characters', subcategory: 'characters-woodland',
    tags: ['лиса', 'рыжий', 'пушистый хвост', 'следы лап', 'снег', 'заснеженная ель', 'красные ягоды', 'сухие травы', 'лес'], tagsEn: ['fox', 'red fox', 'fluffy tail', 'paw prints', 'snow', 'snowy spruce', 'red berries', 'dry grasses', 'forest'], aliases: ['лисичка на прогулке', 'fox walking in snow', 'winter fox tracks'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'gift-stack-wooden-sleigh', src: 'art/gift-stack-wooden-sleigh.png', source: 'assets/gifts-on-a-snow-sleigh.png',
    name: { ru: 'Подарки с красными лентами на деревянных санках', en: 'Ribbon-wrapped gifts on a wooden sleigh' }, category: 'seasonal-objects', subcategory: 'seasonal-objects-gifts',
    tags: ['подарки', 'коробки', 'упаковка', 'красные ленты', 'бант', 'деревянные санки', 'верёвка', 'хвоя', 'шишки', 'снег'], tagsEn: ['gifts', 'presents', 'boxes', 'wrapping paper', 'red ribbons', 'bow', 'wooden sleigh', 'rope', 'evergreen', 'pine cones', 'snow'], aliases: ['санки с подарками', 'christmas presents on sled', 'stack of wrapped gifts'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'white-hare-snowy-spruce', src: 'art/white-hare-snowy-spruce.png', source: 'assets/hare-among-snow-covered-branches.png',
    name: { ru: 'Белый зайчик среди заснеженной хвои', en: 'White hare among snow-covered evergreen branches' }, category: 'characters', subcategory: 'characters-woodland',
    tags: ['заяц', 'зайчик', 'белая шерсть', 'длинные уши', 'хвоя', 'красные ягоды', 'шишки', 'снег', 'зверята'], tagsEn: ['hare', 'bunny', 'rabbit', 'white fur', 'long ears', 'evergreen', 'red berries', 'pine cones', 'snow', 'woodland animal'], aliases: ['зайчик-беляк', 'white winter bunny', 'snow hare'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'scarf-hare-evergreen-bouquet', src: 'art/scarf-hare-evergreen-bouquet.png', source: 'assets/hare-with-a-spruce-branch.png',
    name: { ru: 'Зайчик в красном шарфе с хвойным букетом', en: 'Hare in a red scarf holding an evergreen bouquet' }, category: 'characters', subcategory: 'characters-woodland',
    tags: ['заяц', 'зайчик', 'красный шарф', 'снежинки', 'вязание', 'букет', 'хвоя', 'бечёвка', 'ягоды', 'шишки', 'снег'], tagsEn: ['hare', 'bunny', 'rabbit', 'red scarf', 'snowflakes', 'knitted', 'bouquet', 'evergreen', 'twine', 'berries', 'pine cones', 'snow'], aliases: ['зайчонок с еловыми ветками', 'scarf bunny fir bouquet', 'christmas rabbit'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'winter-hare-pair', src: 'art/winter-hare-pair.png', source: 'assets/hares-in-a-snowy-garden.png',
    name: { ru: 'Два зайчика в шарфиках у заснеженной ели', en: 'Two hares in scarves beside a snowy spruce' }, category: 'characters', subcategory: 'characters-woodland',
    tags: ['зайцы', 'зайчики', 'пара', 'белый зайчик', 'рыжий зайчик', 'красный шарф', 'белый шарф', 'хвоя', 'ягоды', 'шишки', 'снег'], tagsEn: ['hares', 'bunnies', 'rabbits', 'pair', 'white bunny', 'brown bunny', 'red scarf', 'white scarf', 'evergreen', 'berries', 'pine cones', 'snow'], aliases: ['друзья зайчата', 'winter bunny friends', 'two rabbits in snow'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'mistletoe-white-berries-red-ribbon', src: 'art/mistletoe-white-berries-red-ribbon.png', source: 'assets/mistletoe-with-a-red-bow.png',
    name: { ru: 'Веточки омелы с белыми ягодами и красной лентой', en: 'Mistletoe sprigs with white berries and a red ribbon' }, category: 'botanical', subcategory: 'botanical-branches',
    tags: ['омела', 'белые ягоды', 'зелёные листья', 'веточки', 'красный бант', 'золотая кайма', 'рождество'], tagsEn: ['mistletoe', 'white berries', 'green leaves', 'sprigs', 'red bow', 'gold trim', 'christmas'], aliases: ['омела с алой лентой', 'red ribbon mistletoe', 'kissing mistletoe sprigs'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'mistletoe-ivory-berry-wreath', src: 'art/mistletoe-ivory-berry-wreath.png', source: 'assets/mistletoe-wreat- with-a-burgundy-bow.png',
    name: { ru: 'Венок из омелы с бордовым бантом', en: 'Mistletoe wreath with a burgundy bow' }, category: 'botanical', subcategory: 'botanical-wreaths',
    tags: ['венок', 'омела', 'белые ягоды', 'кремовые ягоды', 'зелёные листья', 'бордовый бант', 'лента', 'рождество'], tagsEn: ['wreath', 'mistletoe', 'white berries', 'ivory berries', 'green leaves', 'burgundy bow', 'ribbon', 'christmas'], aliases: ['круглый венок из омелы', 'mistletoe kissing wreath', 'burgundy ribbon wreath'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'potted-red-poinsettias', src: 'art/potted-red-poinsettias.png', source: 'assets/potted-poinsettia-with-berries-and-spruce.png',
    name: { ru: 'Красные пуансеттии в горшочке с бантом', en: 'Red poinsettias in a ribbon-wrapped pot' }, category: 'botanical', subcategory: 'botanical-flowers',
    tags: ['пуансеттия', 'красные цветы', 'рождественская звезда', 'зелёные листья', 'горшок', 'кремовый бант', 'хвоя', 'красные ягоды'], tagsEn: ['poinsettia', 'red flowers', 'christmas flower', 'green leaves', 'flower pot', 'cream bow', 'evergreen', 'red berries'], aliases: ['пуансеттия в кашпо', 'potted christmas poinsettia', 'red winter plant'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'sleeping-fawn-evergreen-nest', src: 'art/sleeping-fawn-evergreen-nest.png', source: 'assets/sleeping-fawn-in-a-snow-covered-fir-branch-nest.png',
    name: { ru: 'Спящий оленёнок в заснеженных еловых ветках', en: 'Sleeping fawn nestled in snowy fir branches' }, category: 'characters', subcategory: 'characters-woodland',
    tags: ['оленёнок', 'олень', 'спящий', 'пятнистый', 'гнёздышко', 'хвоя', 'шишки', 'красные ягоды', 'снег', 'уют'], tagsEn: ['fawn', 'baby deer', 'sleeping', 'spotted', 'nest', 'evergreen', 'pine cones', 'red berries', 'snow', 'cozy'], aliases: ['спящий малыш олень', 'sleeping woodland fawn', 'curled up deer'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'snowy-fir-winter-grasses', src: 'art/snowy-fir-winter-grasses.png', source: 'assets/snow-covered-spruce-with-berries-and-herbs.png',
    name: { ru: 'Заснеженная ель среди ягод и сухих трав', en: 'Snow-covered spruce among berries and winter grasses' }, category: 'botanical', subcategory: 'botanical-trees',
    tags: ['ель', 'ёлка', 'дерево', 'снег', 'красные ягоды', 'сухие травы', 'камыш', 'зима', 'лес'], tagsEn: ['spruce', 'fir tree', 'evergreen tree', 'snow', 'red berries', 'dry grasses', 'reeds', 'winter', 'forest'], aliases: ['лесная ёлочка под снегом', 'snowy winter fir', 'evergreen in winter meadow'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'mistletoe-golden-bell-pendant', src: 'art/mistletoe-golden-bell-pendant.png', source: 'assets/sprig-of-mistletoe-with-a-golden-bell.png',
    name: { ru: 'Подвеска из омелы с золотым колокольчиком', en: 'Mistletoe pendant with a golden bell' }, category: 'botanical', subcategory: 'botanical-branches',
    tags: ['омела', 'белые ягоды', 'золотой колокольчик', 'красный бант', 'подвеска', 'петелька', 'зелёные листья', 'рождество'], tagsEn: ['mistletoe', 'white berries', 'golden bell', 'red bow', 'pendant', 'hanging loop', 'green leaves', 'christmas'], aliases: ['веточка омелы с колокольчиком', 'mistletoe bell ornament', 'hanging mistletoe bell'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'squirrel-nut-snowy-stump', src: 'art/squirrel-nut-snowy-stump.png', source: 'assets/squirrel-on-a-snow-covered-tree-stump.png',
    name: { ru: 'Белочка с орешком на заснеженном пеньке', en: 'Squirrel with a nut on a snowy tree stump' }, category: 'characters', subcategory: 'characters-woodland',
    tags: ['белка', 'белочка', 'орех', 'пушистый хвост', 'пенёк', 'снег', 'хвоя', 'шишки', 'красные ягоды', 'лес'], tagsEn: ['squirrel', 'nut', 'fluffy tail', 'tree stump', 'snow', 'evergreen', 'pine cones', 'red berries', 'woodland'], aliases: ['рыжая белка на пне', 'winter squirrel with nut', 'squirrel snowy stump'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'squirrel-pair-nut-basket', src: 'art/squirrel-pair-nut-basket.png', source: 'assets/squirrels-with-a-basket-of-nuts.png',
    name: { ru: 'Две белочки с корзинкой орехов', en: 'Two squirrels with a basket of nuts' }, category: 'characters', subcategory: 'characters-woodland',
    tags: ['белки', 'белочки', 'пара', 'корзинка', 'орехи', 'красный бант', 'красный шарф', 'хвоя', 'ягоды', 'снег'], tagsEn: ['squirrels', 'pair', 'basket', 'nuts', 'red bow', 'red scarf', 'evergreen', 'berries', 'snow'], aliases: ['друзья бельчата', 'squirrel friends nut basket', 'woodland squirrels'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'cream-skates-cranberry-ribbons', src: 'art/cream-skates-cranberry-ribbons.png', source: 'assets/vintage-ice-skates-with-a-christmas-bow.png',
    name: { ru: 'Кремовые коньки с бордовыми шнурками и бантом', en: 'Cream ice skates with cranberry laces and a bow' }, category: 'seasonal-objects', subcategory: 'seasonal-objects-skates',
    tags: ['коньки', 'кремовая кожа', 'бордовые шнурки', 'красный бант', 'лезвия', 'хвоя', 'красные ягоды', 'зима', 'винтаж'], tagsEn: ['ice skates', 'cream leather', 'cranberry laces', 'red bow', 'blades', 'evergreen', 'red berries', 'winter', 'vintage'], aliases: ['фигурные коньки с ленточками', 'vintage cream ice skates', 'christmas skating boots'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'goldfinch-trio-rowan', src: 'art/goldfinch-trio-rowan.png', source: 'assets/winter-goldfinches-on-snow-covered-branches.png',
    name: { ru: 'Три щегла на заснеженной рябине', en: 'Three goldfinches on snow-covered rowan branches' }, category: 'winter-stories', subcategory: 'winter-stories-birds',
    tags: ['птицы', 'щегол', 'щеглы', 'три птицы', 'рябина', 'красные ягоды', 'жёлтые крылья', 'хвоя', 'шишка', 'снег'], tagsEn: ['birds', 'goldfinch', 'goldfinches', 'three birds', 'rowan', 'red berries', 'yellow wings', 'evergreen', 'pine cone', 'snow'], aliases: ['зимние щеглы', 'winter goldfinch trio', 'goldfinches on berries'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'blue-tit-pair-holly', src: 'art/blue-tit-pair-holly.png', source: 'assets/winter-tits-amidst-berries-and-snow.png',
    name: { ru: 'Две синицы-лазоревки среди заснеженного падуба', en: 'Two blue tits among snowy holly branches' }, category: 'winter-stories', subcategory: 'winter-stories-birds',
    tags: ['птицы', 'синицы', 'лазоревка', 'пара', 'синяя шапочка', 'жёлтая грудка', 'падуб', 'красные ягоды', 'шишки', 'снег'], tagsEn: ['birds', 'blue tit', 'blue tits', 'pair', 'blue cap', 'yellow breast', 'holly', 'red berries', 'pine cones', 'snow'], aliases: ['зимние синички', 'winter blue tit pair', 'blue tits on holly'], style: 'vintage-watercolor', background: 'transparent',
  },
];

const normalize = (text: string) => text.normalize('NFKC').toLocaleLowerCase().replaceAll('ё', 'е').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const labels = (value: LocalizedLabel | undefined) => value ? Object.values(value).join(' ') : '';

/** Все слова запроса должны встречаться в явно заданных метаданных, язык UI не влияет. */
export function searchImages(query = '', filters: ImageFilters = {}): ImageMetadata[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  const tagWords = (filters.tags ?? []).map(normalize);
  return images.filter(image => {
    if (filters.category && image.category !== filters.category) return false;
    if (filters.subcategory && image.subcategory !== filters.subcategory) return false;
    if (filters.background && image.background !== filters.background) return false;
    const category = categories.find(item => item.id === image.category);
    const subcategory = subcategories.find(item => item.id === image.subcategory);
    const haystack = normalize([
      image.id, labels(image.name), image.category, labels(category?.name),
      image.subcategory, labels(subcategory?.name), ...image.tags, ...image.tagsEn,
      ...image.aliases, ...Object.values(image.tagsByLocale ?? {}).flat(), image.style ?? '', image.background,
    ].join(' '));
    const explicitTags = [...image.tags, ...image.tagsEn, ...Object.values(image.tagsByLocale ?? {}).flat()].map(normalize);
    return words.every(word => haystack.includes(word)) && tagWords.every(tag => explicitTags.some(value => value.includes(tag)));
  });
}

export const getImage = (id: string) => images.find(image => image.id === id);
