import type { ImageCategory, ImageMetadata, ImageMotif } from './images';

/** Visually reviewed greeting artwork; text records the words drawn in the PNG. */
export interface LetteringMetadata extends ImageMetadata {
  text: string;
  /** Language of the artwork itself, independently of the metadata labels. */
  language: string;
}

export const letteringCategories: ImageCategory[] = [
  { id: 'christmas', name: { ru: 'Рождество', en: 'Christmas' } },
  { id: 'new-year', name: { ru: 'Новый год', en: 'New Year' } },
  { id: 'winter', name: { ru: 'Зима', en: 'Winter' } },
  { id: 'magic', name: { ru: 'Волшебство', en: 'Magic' } },
  { id: 'wishes', name: { ru: 'Пожелания', en: 'Wishes' } },
];

export const letteringMotifs: ImageMotif[] = [
  { id: 'christmas-merry-christmas', category: 'christmas', name: { ru: 'С Рождеством', en: 'Merry Christmas' } },
  { id: 'christmas-sweet-christmas', category: 'christmas', name: { ru: 'Сладкого Рождества', en: 'Sweet Christmas' } },
  { id: 'christmas-ho-ho-ho', category: 'christmas', name: { ru: 'Хо-хо-хо', en: 'Ho Ho Ho' } },
  { id: 'christmas-wonderful-time', category: 'christmas', name: { ru: 'Чудесная пора', en: 'The Most Wonderful Time' } },
  { id: 'new-year-happy-new-year', category: 'new-year', name: { ru: 'С Новым годом', en: 'Happy New Year' } },
  { id: 'winter-let-it-snow', category: 'winter', name: { ru: 'Пусть идёт снег', en: 'Let It Snow' } },
  { id: 'magic-believe-in-magic', category: 'magic', name: { ru: 'Верь в чудеса', en: 'Believe in Magic' } },
  { id: 'magic-christmas-magic', category: 'magic', name: { ru: 'Рождественское волшебство', en: 'Christmas Magic' } },
  { id: 'wishes-warmest-wishes', category: 'wishes', name: { ru: 'Самые тёплые пожелания', en: 'Warmest Wishes' } },
];

/** Explicit metadata: source PNGs stay full resolution; src is the public print path. */
export const lettering: LetteringMetadata[] = [
  {
    id: 'golden-glitter-merry-christmas', source: 'assets/lettering/golden-glitter-merry-christmas.png', src: 'lettering/golden-glitter-merry-christmas.png',
    name: { ru: 'Золотая надпись «Merry Christmas!» с блёстками', en: 'Golden glitter Merry Christmas calligraphy' },
    text: 'Merry Christmas!', language: 'en', category: 'christmas', subcategory: 'christmas-merry-christmas',
    tags: ['с рождеством', 'рождество', 'золото', 'блёстки', 'каллиграфия', 'одна строка', 'росчерки'], tagsEn: ['merry christmas', 'christmas', 'gold', 'glitter', 'calligraphy', 'single line', 'flourishes'], aliases: ['золотое рождественское поздравление', 'золотая надпись для открытки с эльфом', 'gold christmas greeting', 'elf workshop greeting'], style: 'glitter-calligraphy', background: 'transparent',
  },
  {
    id: 'red-brush-calligraphy-merry-christmas', source: 'assets/lettering/red-brush-calligraphy-merry-christmas.png', src: 'lettering/red-brush-calligraphy-merry-christmas.png',
    name: { ru: 'Красная кистевая каллиграфия «Merry Christmas!»', en: 'Red brush Merry Christmas calligraphy' },
    text: 'Merry Christmas!', language: 'en', category: 'christmas', subcategory: 'christmas-merry-christmas',
    tags: ['с рождеством', 'рождество', 'красный', 'кисть', 'каллиграфия', 'две строки', 'росчерк'], tagsEn: ['merry christmas', 'christmas', 'red', 'brush', 'calligraphy', 'two lines', 'flourish'], aliases: ['красное рождественское поздравление', 'красная надпись для открытки с белочками', 'red christmas script', 'squirrel christmas greeting'], style: 'watercolor-brush-lettering', background: 'transparent',
  },
  {
    id: 'vintage-watercolour-ho-ho-ho', source: 'assets/lettering/vintage-watercolour-ho-ho-ho.png', src: 'lettering/vintage-watercolour-ho-ho-ho.png',
    name: { ru: 'Красная винтажная надпись «Ho Ho Ho»', en: 'Red vintage watercolor Ho Ho Ho lettering' },
    text: 'Ho Ho Ho', language: 'en', category: 'christmas', subcategory: 'christmas-ho-ho-ho',
    tags: ['хо-хо-хо', 'рождество', 'санта', 'красный', 'акварель', 'винтаж', 'росчерки'], tagsEn: ['ho ho ho', 'christmas', 'santa', 'red', 'watercolor', 'vintage', 'flourishes'], aliases: ['смех санты', 'красная надпись для открытки с сантой', 'santa laugh', 'vintage santa greeting'], style: 'vintage-watercolor-lettering', background: 'transparent',
  },
  {
    id: 'believe-in-magic-calligraphy', source: 'assets/lettering/believe-in-magic-calligraphy.png', src: 'lettering/believe-in-magic-calligraphy.png',
    name: { ru: 'Голубая каллиграфия «Believe in Magic»', en: 'Blue Believe in Magic calligraphy' },
    text: 'Believe in Magic', language: 'en', category: 'magic', subcategory: 'magic-believe-in-magic',
    tags: ['верь в чудеса', 'волшебство', 'голубой', 'каллиграфия', 'росчерки'], tagsEn: ['believe in magic', 'blue', 'calligraphy', 'flourishes'], aliases: ['вера в чудо', 'blue magic greeting'], style: 'watercolor-calligraphy', background: 'transparent',
  },
  {
    id: 'believe-in-magic-retro-lettering', source: 'assets/lettering/believe-in-magic-retro-lettering.png', src: 'lettering/believe-in-magic-retro-lettering.png',
    name: { ru: 'Золотая ретронадпись «Believe in Magic»', en: 'Golden retro Believe in Magic lettering' },
    text: 'Believe in Magic', language: 'en', category: 'magic', subcategory: 'magic-believe-in-magic',
    tags: ['верь в чудеса', 'волшебство', 'золото', 'звёзды', 'ретро'], tagsEn: ['believe in magic', 'gold', 'stars', 'retro', 'lettering'], aliases: ['золотое волшебство', 'gold magic typography'], style: 'vintage-typography', background: 'transparent',
  },
  {
    id: 'believe-in-magic-winter-woodland-lettering', source: 'assets/lettering/believe-in-magic-winter-woodland-lettering.png', src: 'lettering/believe-in-magic-winter-woodland-lettering.png',
    name: { ru: 'Надпись «Believe in Magic» с хвоей и синими ягодами', en: 'Believe in Magic with evergreen and blue berries' },
    text: 'Believe in Magic', language: 'en', category: 'magic', subcategory: 'magic-believe-in-magic',
    tags: ['верь в чудеса', 'хвоя', 'синие ягоды', 'звёзды', 'зелёный', 'голубой'], tagsEn: ['believe in magic', 'evergreen', 'blue berries', 'stars', 'green', 'blue'], aliases: ['лесное волшебство', 'woodland magic greeting'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'burgundy-vintage-ho-ho-ho-calligraphy', source: 'assets/lettering/burgundy-vintage-ho-ho-ho-calligraphy.png', src: 'lettering/burgundy-vintage-ho-ho-ho-calligraphy.png',
    name: { ru: 'Бордовая винтажная каллиграфия «Ho Ho Ho!»', en: 'Burgundy vintage Ho Ho Ho calligraphy' },
    text: 'Ho Ho Ho!', language: 'en', category: 'christmas', subcategory: 'christmas-ho-ho-ho',
    tags: ['хо-хо-хо', 'рождество', 'бордовый', 'каллиграфия', 'росчерки'], tagsEn: ['ho ho ho', 'christmas', 'burgundy', 'calligraphy', 'flourishes'], aliases: ['смех санты', 'santa laugh'], style: 'vintage-calligraphy', background: 'transparent',
  },
  {
    id: 'christmas-magic-calligraphy', source: 'assets/lettering/christmas-magic-calligraphy.png', src: 'lettering/christmas-magic-calligraphy.png',
    name: { ru: 'Бордовая каллиграфия «Christmas Magic»', en: 'Burgundy Christmas Magic calligraphy' },
    text: 'Christmas Magic', language: 'en', category: 'magic', subcategory: 'magic-christmas-magic',
    tags: ['рождественское волшебство', 'рождество', 'бордовый', 'каллиграфия', 'росчерки'], tagsEn: ['christmas magic', 'christmas', 'burgundy', 'calligraphy', 'flourishes'], aliases: ['магия рождества', 'festive magic script'], style: 'watercolor-calligraphy', background: 'transparent',
  },
  {
    id: 'christmas-magic-in-olive-script', source: 'assets/lettering/christmas-magic-in-olive-script.png', src: 'lettering/christmas-magic-in-olive-script.png',
    name: { ru: 'Оливковая каллиграфия «Christmas Magic»', en: 'Olive Christmas Magic calligraphy' },
    text: 'Christmas Magic', language: 'en', category: 'magic', subcategory: 'magic-christmas-magic',
    tags: ['рождественское волшебство', 'рождество', 'оливковый', 'зелёный', 'каллиграфия'], tagsEn: ['christmas magic', 'olive green', 'calligraphy', 'flourishes'], aliases: ['магия рождества', 'olive holiday script'], style: 'vintage-calligraphy', background: 'transparent',
  },
  {
    id: 'cranberry-watercolour-ho-ho-ho', source: 'assets/lettering/cranberry-watercolour-ho-ho-ho.png', src: 'lettering/cranberry-watercolour-ho-ho-ho.png',
    name: { ru: 'Клюквенная акварельная надпись «Ho Ho Ho!»', en: 'Cranberry watercolor Ho Ho Ho calligraphy' },
    text: 'Ho Ho Ho!', language: 'en', category: 'christmas', subcategory: 'christmas-ho-ho-ho',
    tags: ['хо-хо-хо', 'клюквенный', 'красный', 'акварель', 'каллиграфия'], tagsEn: ['ho ho ho', 'cranberry red', 'watercolor', 'calligraphy'], aliases: ['смех санты', 'red santa greeting'], style: 'watercolor-calligraphy', background: 'transparent',
  },
  {
    id: 'elegant-burgundy-ho-ho-ho-calligraphy', source: 'assets/lettering/elegant-burgundy-ho-ho-ho-calligraphy.png', src: 'lettering/elegant-burgundy-ho-ho-ho-calligraphy.png',
    name: { ru: 'Бордовая надпись «Ho Ho Ho!» с длинными росчерками', en: 'Elegant burgundy Ho Ho Ho with long flourishes' },
    text: 'Ho Ho Ho!', language: 'en', category: 'christmas', subcategory: 'christmas-ho-ho-ho',
    tags: ['хо-хо-хо', 'бордовый', 'красный', 'каллиграфия', 'росчерки'], tagsEn: ['ho ho ho', 'burgundy', 'red', 'calligraphy', 'long flourishes'], aliases: ['смех санты', 'elegant santa script'], style: 'vintage-calligraphy', background: 'transparent',
  },
  {
    id: 'elegant-green-christmas-calligraphy', source: 'assets/lettering/elegant-green-christmas-calligraphy.png', src: 'lettering/elegant-green-christmas-calligraphy.png',
    name: { ru: 'Зелёная каллиграфия «Merry Christmas!» с листьями', en: 'Elegant green Merry Christmas with leaves' },
    text: 'Merry Christmas!', language: 'en', category: 'christmas', subcategory: 'christmas-merry-christmas',
    tags: ['с рождеством', 'зелёный', 'листья', 'каллиграфия', 'росчерки'], tagsEn: ['merry christmas', 'green', 'leaves', 'calligraphy', 'flourishes'], aliases: ['рождественское поздравление', 'green christmas greeting'], style: 'vintage-calligraphy', background: 'transparent',
  },
  {
    id: 'evergreen-happy-new-year-calligraphy', source: 'assets/lettering/evergreen-happy-new-year-calligraphy.png', src: 'lettering/evergreen-happy-new-year-calligraphy.png',
    name: { ru: 'Хвойно-зелёная каллиграфия «Happy New Year!»', en: 'Evergreen green Happy New Year calligraphy' },
    text: 'Happy New Year!', language: 'en', category: 'new-year', subcategory: 'new-year-happy-new-year',
    tags: ['с новым годом', 'новый год', 'зелёный', 'каллиграфия', 'росчерки'], tagsEn: ['happy new year', 'new year', 'evergreen green', 'calligraphy', 'flourishes'], aliases: ['новогоднее поздравление', 'green new year greeting'], style: 'vintage-calligraphy', background: 'transparent',
  },
  {
    id: 'festive-cranberry-ho-ho-ho-lettering', source: 'assets/lettering/festive-cranberry-ho-ho-ho-lettering.png', src: 'lettering/festive-cranberry-ho-ho-ho-lettering.png',
    name: { ru: 'Клюквенная надпись «Ho Ho Ho!» с падубом и бантом', en: 'Cranberry Ho Ho Ho with holly and a bow' },
    text: 'Ho Ho Ho!', language: 'en', category: 'christmas', subcategory: 'christmas-ho-ho-ho',
    tags: ['хо-хо-хо', 'красный', 'падуб', 'ягоды', 'бант', 'звёзды'], tagsEn: ['ho ho ho', 'cranberry red', 'holly', 'berries', 'bow', 'stars'], aliases: ['смех санты', 'festive holly lettering'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'frosty-blue-let-it-snow-lettering', source: 'assets/lettering/frosty-blue-let-it-snow-lettering.png', src: 'lettering/frosty-blue-let-it-snow-lettering.png',
    name: { ru: 'Морозная голубая каллиграфия «Let It Snow»', en: 'Frosty blue Let It Snow calligraphy' },
    text: 'Let It Snow', language: 'en', category: 'winter', subcategory: 'winter-let-it-snow',
    tags: ['пусть идёт снег', 'зима', 'голубой', 'мороз', 'каллиграфия', 'росчерки'], tagsEn: ['let it snow', 'winter', 'blue', 'frosty', 'calligraphy', 'flourishes'], aliases: ['снежное пожелание', 'blue winter script'], style: 'watercolor-calligraphy', background: 'transparent',
  },
  {
    id: 'frosty-wonderful-time-typography', source: 'assets/lettering/frosty-wonderful-time-typography.png', src: 'lettering/frosty-wonderful-time-typography.png',
    name: { ru: 'Надпись «The Most Wonderful Time» с голубым бантом и хвоей', en: 'The Most Wonderful Time with a blue bow and evergreen' },
    text: 'The Most Wonderful Time', language: 'en', category: 'christmas', subcategory: 'christmas-wonderful-time',
    tags: ['чудесная пора', 'зима', 'синий', 'хвоя', 'голубой бант', 'снежинки'], tagsEn: ['the most wonderful time', 'winter', 'blue', 'evergreen', 'blue bow', 'snowflakes'], aliases: ['самое чудесное время', 'frosty holiday typography'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'golden-merry-christmas-brush-lettering', source: 'assets/lettering/golden-merry-christmas-brush-lettering.png', src: 'lettering/golden-merry-christmas-brush-lettering.png',
    name: { ru: 'Золотая надпись «Merry Christmas» с колокольчиками', en: 'Golden Merry Christmas brush lettering with bells' },
    text: 'Merry Christmas', language: 'en', category: 'christmas', subcategory: 'christmas-merry-christmas',
    tags: ['с рождеством', 'золото', 'колокольчики', 'красный бант', 'кремовый бант', 'хвоя'], tagsEn: ['merry christmas', 'gold', 'bells', 'red bow', 'ivory bow', 'evergreen', 'brush lettering'], aliases: ['золотое поздравление', 'gold christmas bells greeting'], style: 'watercolor-brush-lettering', background: 'transparent',
  },
  {
    id: 'golden-merry-christmas-calligraphy', source: 'assets/lettering/golden-merry-christmas-calligraphy.png', src: 'lettering/golden-merry-christmas-calligraphy.png',
    name: { ru: 'Золотая каллиграфия «Merry Christmas!»', en: 'Golden Merry Christmas calligraphy' },
    text: 'Merry Christmas!', language: 'en', category: 'christmas', subcategory: 'christmas-merry-christmas',
    tags: ['с рождеством', 'золото', 'каллиграфия', 'росчерки'], tagsEn: ['merry christmas', 'gold', 'calligraphy', 'flourishes'], aliases: ['золотое поздравление', 'golden holiday script'], style: 'vintage-calligraphy', background: 'transparent',
  },
  {
    id: 'hand-lettered-happy-new-year', source: 'assets/lettering/hand-lettered-happy-new-year.png', src: 'lettering/hand-lettered-happy-new-year.png',
    name: { ru: 'Зелёно-красная каллиграфия «Happy New Year!»', en: 'Green and red hand-lettered Happy New Year' },
    text: 'Happy New Year!', language: 'en', category: 'new-year', subcategory: 'new-year-happy-new-year',
    tags: ['с новым годом', 'новый год', 'зелёный', 'красный', 'золото', 'каллиграфия'], tagsEn: ['happy new year', 'new year', 'green', 'red', 'gold', 'hand lettering'], aliases: ['новогоднее поздравление', 'red green new year greeting'], style: 'vintage-calligraphy', background: 'transparent',
  },
  {
    id: 'hand-painted-merry-christmas-with-holly', source: 'assets/lettering/hand-painted-merry-christmas-with-holly.png', src: 'lettering/hand-painted-merry-christmas-with-holly.png',
    name: { ru: 'Оливковая надпись «Merry Christmas» с падубом', en: 'Hand-painted olive Merry Christmas with holly' },
    text: 'Merry Christmas', language: 'en', category: 'christmas', subcategory: 'christmas-merry-christmas',
    tags: ['с рождеством', 'оливковый', 'падуб', 'ягоды', 'кремовый бант', 'звёзды'], tagsEn: ['merry christmas', 'olive green', 'holly', 'berries', 'ivory bow', 'stars'], aliases: ['рождественское поздравление', 'botanical brush greeting'], style: 'watercolor-brush-lettering', background: 'transparent',
  },
  {
    id: 'icy-blue-ho-ho-ho-lettering', source: 'assets/lettering/icy-blue-ho-ho-ho-lettering.png', src: 'lettering/icy-blue-ho-ho-ho-lettering.png',
    name: { ru: 'Ледяная голубая надпись «Ho Ho Ho!» с бантом', en: 'Icy blue Ho Ho Ho with a bow' },
    text: 'Ho Ho Ho!', language: 'en', category: 'christmas', subcategory: 'christmas-ho-ho-ho',
    tags: ['хо-хо-хо', 'голубой', 'снег', 'снежинки', 'голубой бант', 'хвоя'], tagsEn: ['ho ho ho', 'icy blue', 'snow', 'snowflakes', 'blue bow', 'evergreen'], aliases: ['смех санты', 'frosty santa greeting'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'let-it-snow-retro-lettering', source: 'assets/lettering/let-it-snow-retro-lettering.png', src: 'lettering/let-it-snow-retro-lettering.png',
    name: { ru: 'Синяя ретронадпись «Let It Snow» со снежинками', en: 'Blue retro Let It Snow with snowflakes' },
    text: 'Let It Snow', language: 'en', category: 'winter', subcategory: 'winter-let-it-snow',
    tags: ['пусть идёт снег', 'зима', 'синий', 'снег', 'снежинки', 'ретро'], tagsEn: ['let it snow', 'winter', 'blue', 'snow', 'snowflakes', 'retro'], aliases: ['снежное пожелание', 'snowy winter typography'], style: 'vintage-typography', background: 'transparent',
  },
  {
    id: 'let-it-snow-vintage-calligraphy', source: 'assets/lettering/let-it-snow-vintage-calligraphy.png', src: 'lettering/let-it-snow-vintage-calligraphy.png',
    name: { ru: 'Зелёно-красная каллиграфия «Let It Snow»', en: 'Green and red vintage Let It Snow calligraphy' },
    text: 'Let It Snow', language: 'en', category: 'winter', subcategory: 'winter-let-it-snow',
    tags: ['пусть идёт снег', 'зима', 'зелёный', 'красный', 'золото', 'каллиграфия'], tagsEn: ['let it snow', 'winter', 'green', 'red', 'gold', 'calligraphy'], aliases: ['снежное пожелание', 'festive snow script'], style: 'vintage-calligraphy', background: 'transparent',
  },
  {
    id: 'let-it-snow-watercolour-calligraphy', source: 'assets/lettering/let-it-snow-watercolour-calligraphy.png', src: 'lettering/let-it-snow-watercolour-calligraphy.png',
    name: { ru: 'Голубая акварельная каллиграфия «Let It Snow»', en: 'Blue watercolor Let It Snow calligraphy' },
    text: 'Let It Snow...', language: 'en', category: 'winter', subcategory: 'winter-let-it-snow',
    tags: ['пусть идёт снег', 'зима', 'голубой', 'акварель', 'каллиграфия', 'росчерки'], tagsEn: ['let it snow', 'winter', 'blue', 'watercolor', 'calligraphy', 'flourishes'], aliases: ['снежное пожелание', 'watercolour snow script'], style: 'watercolor-calligraphy', background: 'transparent',
  },
  {
    id: 'let-it-snow-watercolour-lettering', source: 'assets/lettering/let-it-snow-watercolour-lettering.png', src: 'lettering/let-it-snow-watercolour-lettering.png',
    name: { ru: 'Акварельная надпись «Let It Snow» с голубыми снежинками', en: 'Watercolor Let It Snow with blue snowflakes' },
    text: 'Let It Snow', language: 'en', category: 'winter', subcategory: 'winter-let-it-snow',
    tags: ['пусть идёт снег', 'зима', 'голубой', 'снег', 'снежинки', 'акварель'], tagsEn: ['let it snow', 'winter', 'blue', 'snow', 'snowflakes', 'watercolor'], aliases: ['снежное пожелание', 'watercolour snowflake lettering'], style: 'watercolor-brush-lettering', background: 'transparent',
  },
  {
    id: 'merry-christmas-botanical-greeting', source: 'assets/lettering/merry-christmas-botanical-greeting.png', src: 'lettering/merry-christmas-botanical-greeting.png',
    name: { ru: 'Надпись «Merry Christmas!» с хвоей и красным бантом', en: 'Botanical Merry Christmas with evergreen and a red bow' },
    text: 'Merry Christmas!', language: 'en', category: 'christmas', subcategory: 'christmas-merry-christmas',
    tags: ['с рождеством', 'зелёный', 'хвоя', 'красные ягоды', 'красный бант'], tagsEn: ['merry christmas', 'green', 'evergreen', 'red berries', 'red bow'], aliases: ['хвойное поздравление', 'evergreen christmas greeting'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'merry-christmas-calligraphy-in-red-and-gold', source: 'assets/lettering/merry-christmas-calligraphy-in-red-and-gold.png', src: 'lettering/merry-christmas-calligraphy-in-red-and-gold.png',
    name: { ru: 'Красная каллиграфия «Merry Christmas!» с золотистыми бликами', en: 'Red Merry Christmas calligraphy with golden highlights' },
    text: 'Merry Christmas!', language: 'en', category: 'christmas', subcategory: 'christmas-merry-christmas',
    tags: ['с рождеством', 'красный', 'золото', 'каллиграфия', 'росчерки'], tagsEn: ['merry christmas', 'red', 'golden highlights', 'calligraphy', 'flourishes'], aliases: ['красное поздравление', 'red gold holiday script'], style: 'watercolor-calligraphy', background: 'transparent',
  },
  {
    id: 'sweet-christmas-evergreen-lettering', source: 'assets/lettering/sweet-christmas-evergreen-lettering.png', src: 'lettering/sweet-christmas-evergreen-lettering.png',
    name: { ru: 'Зелёная надпись «Sweet Christmas!» с хвоей и бантом', en: 'Green Sweet Christmas with evergreen and a bow' },
    text: 'Sweet Christmas!', language: 'en', category: 'christmas', subcategory: 'christmas-sweet-christmas',
    tags: ['сладкого рождества', 'рождество', 'зелёный', 'хвоя', 'ягоды', 'красный бант'], tagsEn: ['sweet christmas', 'green', 'evergreen', 'berries', 'red bow'], aliases: ['сладкое рождество', 'evergreen sweet greeting'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'sweet-christmas-watercolour-calligraphy', source: 'assets/lettering/sweet-christmas-watercolour-calligraphy.png', src: 'lettering/sweet-christmas-watercolour-calligraphy.png',
    name: { ru: 'Голубая каллиграфия «Sweet Christmas»', en: 'Blue watercolor Sweet Christmas calligraphy' },
    text: 'Sweet Christmas', language: 'en', category: 'christmas', subcategory: 'christmas-sweet-christmas',
    tags: ['сладкого рождества', 'рождество', 'голубой', 'каллиграфия', 'акварель'], tagsEn: ['sweet christmas', 'blue', 'calligraphy', 'watercolor'], aliases: ['сладкое рождество', 'watercolour sweet christmas'], style: 'watercolor-calligraphy', background: 'transparent',
  },
  {
    id: 'vintage-christmas-magic-sticker', source: 'assets/lettering/vintage-christmas-magic-sticker.png', src: 'lettering/vintage-christmas-magic-sticker.png',
    name: { ru: 'Кремово-золотая надпись «Christmas Magic» с игрушками', en: 'Ivory and gold Christmas Magic with ornaments' },
    text: 'Christmas Magic', language: 'en', category: 'magic', subcategory: 'magic-christmas-magic',
    tags: ['рождественское волшебство', 'кремовый', 'золото', 'ёлочные игрушки', 'бант', 'звёзды'], tagsEn: ['christmas magic', 'ivory', 'gold', 'ornaments', 'bow', 'stars'], aliases: ['магия рождества', 'vintage magic sticker'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'vintage-happy-new-year-calligraphy', source: 'assets/lettering/vintage-happy-new-year-calligraphy.png', src: 'lettering/vintage-happy-new-year-calligraphy.png',
    name: { ru: 'Винтажная каллиграфия «Happy New Year!» с золотыми росчерками', en: 'Vintage Happy New Year with golden flourishes' },
    text: 'Happy New Year!', language: 'en', category: 'new-year', subcategory: 'new-year-happy-new-year',
    tags: ['с новым годом', 'новый год', 'зелёный', 'красный', 'золото', 'росчерки'], tagsEn: ['happy new year', 'new year', 'green', 'red', 'gold', 'flourishes'], aliases: ['новогоднее поздравление', 'vintage new year script'], style: 'vintage-calligraphy', background: 'transparent',
  },
  {
    id: 'vintage-happy-new-year-clockwork', source: 'assets/lettering/vintage-happy-new-year-clockwork.png', src: 'lettering/vintage-happy-new-year-clockwork.png',
    name: { ru: 'Золотая надпись «Happy New Year!» с часами', en: 'Golden Happy New Year with a clock' },
    text: 'Happy New Year!', language: 'en', category: 'new-year', subcategory: 'new-year-happy-new-year',
    tags: ['с новым годом', 'новый год', 'золото', 'часы', 'полночь', 'звёзды', 'хвоя'], tagsEn: ['happy new year', 'new year', 'gold', 'clock', 'midnight', 'stars', 'evergreen'], aliases: ['новогодние куранты', 'new year countdown lettering'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'vintage-ho-ho-ho-holiday-garland', source: 'assets/lettering/vintage-ho-ho-ho-holiday-garland.png', src: 'lettering/vintage-ho-ho-ho-holiday-garland.png',
    name: { ru: 'Зелёная надпись «Ho Ho Ho!» с шапкой Санты', en: 'Green Ho Ho Ho with a Santa hat' },
    text: 'Ho Ho Ho!', language: 'en', category: 'christmas', subcategory: 'christmas-ho-ho-ho',
    tags: ['хо-хо-хо', 'зелёный', 'шапка санты', 'хвоя', 'красный бант', 'звёзды'], tagsEn: ['ho ho ho', 'green', 'santa hat', 'evergreen', 'red bow', 'stars'], aliases: ['смех санты', 'santa holiday garland'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'vintage-holiday-lettering-with-pine-and-bell', source: 'assets/lettering/vintage-holiday-lettering-with-pine-and-bell.png', src: 'lettering/vintage-holiday-lettering-with-pine-and-bell.png',
    name: { ru: 'Кремовая надпись «The Most Wonderful Time» с хвоей и колокольчиком', en: 'Ivory The Most Wonderful Time with pine and a bell' },
    text: 'The Most Wonderful Time', language: 'en', category: 'christmas', subcategory: 'christmas-wonderful-time',
    tags: ['чудесная пора', 'кремовый', 'хвоя', 'колокольчик', 'кремовый бант', 'звёзды'], tagsEn: ['the most wonderful time', 'ivory', 'pine', 'bell', 'ivory bow', 'stars'], aliases: ['самое чудесное время', 'vintage holiday lettering'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'vintage-holly-happy-new-year-lettering', source: 'assets/lettering/vintage-holly-happy-new-year-lettering.png', src: 'lettering/vintage-holly-happy-new-year-lettering.png',
    name: { ru: 'Зелёная надпись «Happy New Year!» с хвоей и ягодами', en: 'Green Happy New Year with evergreen and berries' },
    text: 'Happy New Year!', language: 'en', category: 'new-year', subcategory: 'new-year-happy-new-year',
    tags: ['с новым годом', 'новый год', 'зелёный', 'хвоя', 'ягоды', 'красный бант'], tagsEn: ['happy new year', 'new year', 'green', 'evergreen', 'berries', 'red bow'], aliases: ['новогоднее поздравление', 'botanical new year lettering'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'vintage-holly-ho-ho-ho-lettering', source: 'assets/lettering/vintage-holly-ho-ho-ho-lettering.png', src: 'lettering/vintage-holly-ho-ho-ho-lettering.png',
    name: { ru: 'Зелёная надпись «Ho Ho Ho!» с падубом и красным бантом', en: 'Green Ho Ho Ho with holly and a red bow' },
    text: 'Ho Ho Ho!', language: 'en', category: 'christmas', subcategory: 'christmas-ho-ho-ho',
    tags: ['хо-хо-хо', 'зелёный', 'падуб', 'красные ягоды', 'красный бант'], tagsEn: ['ho ho ho', 'green', 'holly', 'red berries', 'red bow'], aliases: ['смех санты', 'holly santa lettering'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'vintage-merry-christmas-calligraphy', source: 'assets/lettering/vintage-merry-christmas-calligraphy.png', src: 'lettering/vintage-merry-christmas-calligraphy.png',
    name: { ru: 'Зелёно-красная каллиграфия «Merry Christmas!»', en: 'Green and red vintage Merry Christmas calligraphy' },
    text: 'Merry Christmas!', language: 'en', category: 'christmas', subcategory: 'christmas-merry-christmas',
    tags: ['с рождеством', 'зелёный', 'красный', 'золото', 'каллиграфия', 'росчерки'], tagsEn: ['merry christmas', 'green', 'red', 'gold', 'calligraphy', 'flourishes'], aliases: ['рождественское поздравление', 'traditional christmas script'], style: 'vintage-calligraphy', background: 'transparent',
  },
  {
    id: 'vintage-merry-christmas-holly-typography', source: 'assets/lettering/vintage-merry-christmas-holly-typography.png', src: 'lettering/vintage-merry-christmas-holly-typography.png',
    name: { ru: 'Красная надпись «Merry Christmas!» с падубом', en: 'Red Merry Christmas typography with holly' },
    text: 'Merry Christmas!', language: 'en', category: 'christmas', subcategory: 'christmas-merry-christmas',
    tags: ['с рождеством', 'красный', 'падуб', 'ягоды', 'красный бант', 'ретро'], tagsEn: ['merry christmas', 'red', 'holly', 'berries', 'red bow', 'retro'], aliases: ['рождественское поздравление', 'red holly christmas lettering'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'vintage-retro-merry-christmas-lettering', source: 'assets/lettering/vintage-retro-merry-christmas-lettering.png', src: 'lettering/vintage-retro-merry-christmas-lettering.png',
    name: { ru: 'Ретронадпись «Merry Christmas!» с золотыми колокольчиками', en: 'Retro Merry Christmas with golden bells' },
    text: 'Merry Christmas!', language: 'en', category: 'christmas', subcategory: 'christmas-merry-christmas',
    tags: ['с рождеством', 'зелёный', 'красный', 'колокольчики', 'хвоя', 'звёзды', 'ретро'], tagsEn: ['merry christmas', 'green', 'red', 'bells', 'evergreen', 'stars', 'retro'], aliases: ['рождественское поздравление', 'retro christmas bells greeting'], style: 'vintage-typography', background: 'transparent',
  },
  {
    id: 'warmest-wishes-vintage-calligraphy', source: 'assets/lettering/warmest-wishes-vintage-calligraphy.png', src: 'lettering/warmest-wishes-vintage-calligraphy.png',
    name: { ru: 'Винтажная каллиграфия «Warmest Wishes»', en: 'Vintage Warmest Wishes calligraphy' },
    text: 'Warmest Wishes', language: 'en', category: 'wishes', subcategory: 'wishes-warmest-wishes',
    tags: ['тёплые пожелания', 'зелёный', 'красный', 'золото', 'каллиграфия', 'росчерки'], tagsEn: ['warmest wishes', 'green', 'red', 'gold', 'calligraphy', 'flourishes'], aliases: ['с теплом', 'warm holiday wishes'], style: 'vintage-calligraphy', background: 'transparent',
  },
  {
    id: 'watercolour-happy-new-year-lettering', source: 'assets/lettering/watercolour-happy-new-year-lettering.png', src: 'lettering/watercolour-happy-new-year-lettering.png',
    name: { ru: 'Красная акварельная каллиграфия «Happy new year!»', en: 'Red watercolor Happy new year calligraphy' },
    text: 'Happy new year!', language: 'en', category: 'new-year', subcategory: 'new-year-happy-new-year',
    tags: ['с новым годом', 'новый год', 'красный', 'акварель', 'каллиграфия'], tagsEn: ['happy new year', 'new year', 'red', 'watercolor', 'calligraphy'], aliases: ['новогоднее поздравление', 'watercolour new year greeting'], style: 'watercolor-calligraphy', background: 'transparent',
  },
  {
    id: 'watercolour-ho-ho-ho-with-winter-foliage', source: 'assets/lettering/watercolour-ho-ho-ho-with-winter-foliage.png', src: 'lettering/watercolour-ho-ho-ho-with-winter-foliage.png',
    name: { ru: 'Голубая надпись «Ho Ho Ho!» с зимними листьями', en: 'Blue Ho Ho Ho with winter foliage' },
    text: 'Ho Ho Ho!', language: 'en', category: 'christmas', subcategory: 'christmas-ho-ho-ho',
    tags: ['хо-хо-хо', 'голубой', 'зимние листья', 'ягоды', 'каллиграфия'], tagsEn: ['ho ho ho', 'blue', 'winter foliage', 'berries', 'calligraphy'], aliases: ['смех санты', 'blue botanical santa greeting'], style: 'watercolor-calligraphy', background: 'transparent',
  },
  {
    id: 'watercolour-merry-christmas-calligraphy-1', source: 'assets/lettering/watercolour-merry-christmas-calligraphy-1.png', src: 'lettering/watercolour-merry-christmas-calligraphy-1.png',
    name: { ru: 'Клюквенная каллиграфия «Merry Christmas!»', en: 'Cranberry watercolor Merry Christmas calligraphy' },
    text: 'Merry Christmas!', language: 'en', category: 'christmas', subcategory: 'christmas-merry-christmas',
    tags: ['с рождеством', 'клюквенный', 'красный', 'каллиграфия', 'акварель'], tagsEn: ['merry christmas', 'cranberry red', 'calligraphy', 'watercolor'], aliases: ['рождественское поздравление', 'red watercolour christmas script'], style: 'watercolor-calligraphy', background: 'transparent',
  },
  {
    id: 'watercolour-merry-christmas-calligraphy-2', source: 'assets/lettering/watercolour-merry-christmas-calligraphy-2.png', src: 'lettering/watercolour-merry-christmas-calligraphy-2.png',
    name: { ru: 'Ледяная каллиграфия «Merry Christmas!» с голубым бантом', en: 'Icy Merry Christmas calligraphy with a blue bow' },
    text: 'Merry Christmas!', language: 'en', category: 'christmas', subcategory: 'christmas-merry-christmas',
    tags: ['с рождеством', 'голубой', 'зимние листья', 'голубой бант', 'каллиграфия'], tagsEn: ['merry christmas', 'icy blue', 'winter foliage', 'blue bow', 'calligraphy'], aliases: ['морозное поздравление', 'frosty watercolour christmas script'], style: 'watercolor-calligraphy', background: 'transparent',
  },
  {
    id: 'watercolour-merry-christmas-calligraphy', source: 'assets/lettering/watercolour-merry-christmas-calligraphy.png', src: 'lettering/watercolour-merry-christmas-calligraphy.png',
    name: { ru: 'Голубая каллиграфия «Merry Christmas!»', en: 'Blue watercolor Merry Christmas calligraphy' },
    text: 'Merry Christmas!', language: 'en', category: 'christmas', subcategory: 'christmas-merry-christmas',
    tags: ['с рождеством', 'голубой', 'каллиграфия', 'акварель', 'росчерки'], tagsEn: ['merry christmas', 'blue', 'calligraphy', 'watercolor', 'flourishes'], aliases: ['рождественское поздравление', 'blue watercolour christmas script'], style: 'watercolor-calligraphy', background: 'transparent',
  },
  {
    id: 'watercolour-merry-christmas-with-berries', source: 'assets/lettering/watercolour-merry-christmas-with-berries.png', src: 'lettering/watercolour-merry-christmas-with-berries.png',
    name: { ru: 'Клюквенная надпись «Merry Christmas» с ягодами и бантом', en: 'Cranberry Merry Christmas with berries and a bow' },
    text: 'Merry Christmas', language: 'en', category: 'christmas', subcategory: 'christmas-merry-christmas',
    tags: ['с рождеством', 'клюквенный', 'красный', 'ягоды', 'хвоя', 'красный бант'], tagsEn: ['merry christmas', 'cranberry red', 'berries', 'evergreen', 'red bow'], aliases: ['рождественское поздравление', 'watercolour berry christmas greeting'], style: 'watercolor-brush-lettering', background: 'transparent',
  },
];
