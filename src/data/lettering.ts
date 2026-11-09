import type { ImageCategory, ImageMetadata, ImageMotif } from './images';

/** Visually reviewed greeting artwork; text records the words drawn in the PNG/SVG. */
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
  {
    "id": "wishes-holiday-greetings",
    "category": "wishes",
    "name": {
      "ru": "Праздничные поздравления",
      "en": "Holiday Greetings"
    }
  },
  {
    "id": "wishes-peace-on-earth",
    "category": "wishes",
    "name": {
      "ru": "Мира на земле",
      "en": "Peace on Earth"
    }
  },
  {
    "id": "wishes-kind-wishes",
    "category": "wishes",
    "name": {
      "ru": "Добрые пожелания",
      "en": "Kind Wishes"
    }
  },
  {
    "id": "christmas-joy-to-the-world",
    "category": "christmas",
    "name": {
      "ru": "Радость миру",
      "en": "Joy to the World"
    }
  },
  {
    "id": "new-year-wishes",
    "category": "new-year",
    "name": {
      "ru": "Пожелания в новом году",
      "en": "New Year Wishes"
    }
  },
  {
    "id": "new-year-father-frost-letter",
    "category": "new-year",
    "name": {
      "ru": "Письмо Деду Морозу",
      "en": "Letter to Father Frost"
    }
  },
  {
    "id": "magic-wishes-come-true",
    "category": "magic",
    "name": {
      "ru": "Исполнения желаний",
      "en": "Wishes Come True"
    }
  },
  {
    "id": "magic-winter-magic",
    "category": "magic",
    "name": {
      "ru": "Зимнее волшебство",
      "en": "Winter Magic"
    }
  },
  {
    "id": "winter-fairytale",
    "category": "winter",
    "name": {
      "ru": "Зимняя сказка",
      "en": "Winter Fairytale"
    }
  },
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

/** Explicit metadata: PNG/SVG originals remain unchanged; src is the public print path. */
export const lettering: LetteringMetadata[] = [
  {
    "id": "merry-christmas-red-playful",
    "source": "original-assets/lettering/merry-christmas-red-playful.svg",
    "src": "lettering/merry-christmas-red-playful.svg",
    "name": {
      "ru": "Красная кистевая надпись «Merry Christmas!»",
      "en": "Red playful brush lettering: Merry Christmas"
    },
    "text": "Merry Christmas!",
    "language": "en",
    "category": "christmas",
    "subcategory": "christmas-merry-christmas",
    "tags": [
      "Merry Christmas!",
      "рождество",
      "красная",
      "кистевая надпись",
      "векторная надпись"
    ],
    "tagsEn": [
      "merry christmas",
      "christmas",
      "red",
      "playful brush lettering",
      "vector lettering"
    ],
    "aliases": [
      "Merry Christmas",
      "английская надпись"
    ],
    "style": "vector-playful",
    "background": "transparent"
  },
  {
    "id": "happy-holidays-green-playful",
    "source": "original-assets/lettering/happy-holidays-green-playful.svg",
    "src": "lettering/happy-holidays-green-playful.svg",
    "name": {
      "ru": "Зелёная кистевая надпись «Happy Holidays!»",
      "en": "Green playful brush lettering: Happy Holidays"
    },
    "text": "Happy Holidays!",
    "language": "en",
    "category": "wishes",
    "subcategory": "wishes-holiday-greetings",
    "tags": [
      "Happy Holidays!",
      "пожелания",
      "зелёная",
      "кистевая надпись",
      "векторная надпись"
    ],
    "tagsEn": [
      "happy holidays",
      "wishes",
      "green",
      "playful brush lettering",
      "vector lettering"
    ],
    "aliases": [
      "Happy Holidays",
      "английская надпись"
    ],
    "style": "vector-playful",
    "background": "transparent"
  },
  {
    "id": "let-it-snow-blue-playful",
    "source": "original-assets/lettering/let-it-snow-blue-playful.svg",
    "src": "lettering/let-it-snow-blue-playful.svg",
    "name": {
      "ru": "Голубая кистевая надпись «Let It Snow!»",
      "en": "Blue playful brush lettering: Let It Snow"
    },
    "text": "Let It Snow!",
    "language": "en",
    "category": "winter",
    "subcategory": "winter-let-it-snow",
    "tags": [
      "Let It Snow!",
      "зима",
      "голубая",
      "кистевая надпись",
      "векторная надпись"
    ],
    "tagsEn": [
      "let it snow",
      "winter",
      "blue",
      "playful brush lettering",
      "vector lettering"
    ],
    "aliases": [
      "Let It Snow",
      "английская надпись"
    ],
    "style": "vector-playful",
    "background": "transparent"
  },
  {
    "id": "joy-to-the-world-red-playful",
    "source": "original-assets/lettering/joy-to-the-world-red-playful.svg",
    "src": "lettering/joy-to-the-world-red-playful.svg",
    "name": {
      "ru": "Красная кистевая надпись «Joy to the World!»",
      "en": "Red playful brush lettering: Joy to the World"
    },
    "text": "Joy to the World!",
    "language": "en",
    "category": "christmas",
    "subcategory": "christmas-joy-to-the-world",
    "tags": [
      "Joy to the World!",
      "рождество",
      "красная",
      "кистевая надпись",
      "векторная надпись"
    ],
    "tagsEn": [
      "joy to the world",
      "christmas",
      "red",
      "playful brush lettering",
      "vector lettering"
    ],
    "aliases": [
      "Joy to the World",
      "английская надпись"
    ],
    "style": "vector-playful",
    "background": "transparent"
  },
  {
    "id": "happy-new-year-red-playful",
    "source": "original-assets/lettering/happy-new-year-red-playful.svg",
    "src": "lettering/happy-new-year-red-playful.svg",
    "name": {
      "ru": "Красная кистевая надпись «Happy New Year!»",
      "en": "Red playful brush lettering: Happy New Year"
    },
    "text": "Happy New Year!",
    "language": "en",
    "category": "new-year",
    "subcategory": "new-year-happy-new-year",
    "tags": [
      "Happy New Year!",
      "новый год",
      "красная",
      "кистевая надпись",
      "векторная надпись"
    ],
    "tagsEn": [
      "happy new year",
      "new year",
      "red",
      "playful brush lettering",
      "vector lettering"
    ],
    "aliases": [
      "Happy New Year",
      "английская надпись"
    ],
    "style": "vector-playful",
    "background": "transparent"
  },
  {
    "id": "seasons-greetings-red-playful",
    "source": "original-assets/lettering/seasons-greetings-red-playful.svg",
    "src": "lettering/seasons-greetings-red-playful.svg",
    "name": {
      "ru": "Красная кистевая надпись «Season’s Greetings!»",
      "en": "Red playful brush lettering: Season’s Greetings"
    },
    "text": "Season’s Greetings!",
    "language": "en",
    "category": "wishes",
    "subcategory": "wishes-holiday-greetings",
    "tags": [
      "Season’s Greetings!",
      "пожелания",
      "красная",
      "кистевая надпись",
      "векторная надпись"
    ],
    "tagsEn": [
      "season’s greetings",
      "wishes",
      "red",
      "playful brush lettering",
      "vector lettering"
    ],
    "aliases": [
      "Season’s Greetings",
      "английская надпись"
    ],
    "style": "vector-playful",
    "background": "transparent"
  },
  {
    "id": "ho-ho-ho-green-playful",
    "source": "original-assets/lettering/ho-ho-ho-green-playful.svg",
    "src": "lettering/ho-ho-ho-green-playful.svg",
    "name": {
      "ru": "Зелёная кистевая надпись «Ho Ho Ho!»",
      "en": "Green playful brush lettering: Ho Ho Ho"
    },
    "text": "Ho Ho Ho!",
    "language": "en",
    "category": "christmas",
    "subcategory": "christmas-ho-ho-ho",
    "tags": [
      "Ho Ho Ho!",
      "рождество",
      "зелёная",
      "кистевая надпись",
      "векторная надпись"
    ],
    "tagsEn": [
      "ho ho ho",
      "christmas",
      "green",
      "playful brush lettering",
      "vector lettering"
    ],
    "aliases": [
      "Ho Ho Ho",
      "английская надпись"
    ],
    "style": "vector-playful",
    "background": "transparent"
  },
  {
    "id": "peace-on-earth-green-playful",
    "source": "original-assets/lettering/peace-on-earth-green-playful.svg",
    "src": "lettering/peace-on-earth-green-playful.svg",
    "name": {
      "ru": "Зелёная кистевая надпись «Peace on Earth!»",
      "en": "Green playful brush lettering: Peace on Earth"
    },
    "text": "Peace on Earth!",
    "language": "en",
    "category": "wishes",
    "subcategory": "wishes-peace-on-earth",
    "tags": [
      "Peace on Earth!",
      "пожелания",
      "зелёная",
      "кистевая надпись",
      "векторная надпись"
    ],
    "tagsEn": [
      "peace on earth",
      "wishes",
      "green",
      "playful brush lettering",
      "vector lettering"
    ],
    "aliases": [
      "Peace on Earth",
      "английская надпись"
    ],
    "style": "vector-playful",
    "background": "transparent"
  },
  {
    "id": "warm-winter-wishes-blue-playful",
    "source": "original-assets/lettering/warm-winter-wishes-blue-playful.svg",
    "src": "lettering/warm-winter-wishes-blue-playful.svg",
    "name": {
      "ru": "Голубая кистевая надпись «Warm Winter Wishes!»",
      "en": "Blue playful brush lettering: Warm Winter Wishes"
    },
    "text": "Warm Winter Wishes!",
    "language": "en",
    "category": "wishes",
    "subcategory": "wishes-warmest-wishes",
    "tags": [
      "Warm Winter Wishes!",
      "пожелания",
      "голубая",
      "кистевая надпись",
      "векторная надпись"
    ],
    "tagsEn": [
      "warm winter wishes",
      "wishes",
      "blue",
      "playful brush lettering",
      "vector lettering"
    ],
    "aliases": [
      "Warm Winter Wishes",
      "английская надпись"
    ],
    "style": "vector-playful",
    "background": "transparent"
  },
  {
    "id": "happy-new-year-russian-red-playful",
    "source": "original-assets/lettering/happy-new-year-russian-red-playful.svg",
    "src": "lettering/happy-new-year-russian-red-playful.svg",
    "name": {
      "ru": "Красная кистевая надпись «С Новым годом!»",
      "en": "Red playful brush lettering: Happy New Year"
    },
    "text": "С Новым годом!",
    "language": "ru",
    "category": "new-year",
    "subcategory": "new-year-happy-new-year",
    "tags": [
      "С Новым годом!",
      "новый год",
      "красная",
      "кистевая надпись",
      "векторная надпись"
    ],
    "tagsEn": [
      "happy new year",
      "new year",
      "red",
      "playful brush lettering",
      "vector lettering"
    ],
    "aliases": [
      "Happy New Year",
      "русская надпись"
    ],
    "style": "vector-playful",
    "background": "transparent"
  },
  {
    "id": "merry-christmas-russian-green-playful",
    "source": "original-assets/lettering/merry-christmas-russian-green-playful.svg",
    "src": "lettering/merry-christmas-russian-green-playful.svg",
    "name": {
      "ru": "Зелёная кистевая надпись «С Рождеством Христовым!»",
      "en": "Green playful brush lettering: Merry Christmas"
    },
    "text": "С Рождеством Христовым!",
    "language": "ru",
    "category": "christmas",
    "subcategory": "christmas-merry-christmas",
    "tags": [
      "С Рождеством Христовым!",
      "рождество",
      "зелёная",
      "кистевая надпись",
      "векторная надпись"
    ],
    "tagsEn": [
      "merry christmas",
      "christmas",
      "green",
      "playful brush lettering",
      "vector lettering"
    ],
    "aliases": [
      "Merry Christmas",
      "русская надпись"
    ],
    "style": "vector-playful",
    "background": "transparent"
  },
  {
    "id": "magical-holiday-russian-green-playful",
    "source": "original-assets/lettering/magical-holiday-russian-green-playful.svg",
    "src": "lettering/magical-holiday-russian-green-playful.svg",
    "name": {
      "ru": "Зелёная кистевая надпись «Волшебного праздника!»",
      "en": "Green playful brush lettering: Have a Magical Holiday"
    },
    "text": "Волшебного праздника!",
    "language": "ru",
    "category": "wishes",
    "subcategory": "wishes-holiday-greetings",
    "tags": [
      "Волшебного праздника!",
      "пожелания",
      "зелёная",
      "кистевая надпись",
      "векторная надпись"
    ],
    "tagsEn": [
      "have a magical holiday",
      "wishes",
      "green",
      "playful brush lettering",
      "vector lettering"
    ],
    "aliases": [
      "Have a Magical Holiday",
      "русская надпись"
    ],
    "style": "vector-playful",
    "background": "transparent"
  },
  {
    "id": "health-joy-kindness-russian-green-playful",
    "source": "original-assets/lettering/health-joy-kindness-russian-green-playful.svg",
    "src": "lettering/health-joy-kindness-russian-green-playful.svg",
    "name": {
      "ru": "Зелёная кистевая надпись «Здоровья, радости и добра!»",
      "en": "Green playful brush lettering: Health Joy and Kindness"
    },
    "text": "Здоровья, радости и добра!",
    "language": "ru",
    "category": "wishes",
    "subcategory": "wishes-kind-wishes",
    "tags": [
      "Здоровья, радости и добра!",
      "пожелания",
      "зелёная",
      "кистевая надпись",
      "векторная надпись"
    ],
    "tagsEn": [
      "health joy and kindness",
      "wishes",
      "green",
      "playful brush lettering",
      "vector lettering"
    ],
    "aliases": [
      "Health Joy and Kindness",
      "русская надпись"
    ],
    "style": "vector-playful",
    "background": "transparent"
  },
  {
    "id": "warmth-and-comfort-russian-red-playful",
    "source": "original-assets/lettering/warmth-and-comfort-russian-red-playful.svg",
    "src": "lettering/warmth-and-comfort-russian-red-playful.svg",
    "name": {
      "ru": "Красная кистевая надпись «Тепла и уюта!»",
      "en": "Red playful brush lettering: Warmth and Comfort"
    },
    "text": "Тепла и уюта!",
    "language": "ru",
    "category": "wishes",
    "subcategory": "wishes-warmest-wishes",
    "tags": [
      "Тепла и уюта!",
      "пожелания",
      "красная",
      "кистевая надпись",
      "векторная надпись"
    ],
    "tagsEn": [
      "warmth and comfort",
      "wishes",
      "red",
      "playful brush lettering",
      "vector lettering"
    ],
    "aliases": [
      "Warmth and Comfort",
      "русская надпись"
    ],
    "style": "vector-playful",
    "background": "transparent"
  },
  {
    "id": "new-year-happiness-russian-green-playful",
    "source": "original-assets/lettering/new-year-happiness-russian-green-playful.svg",
    "src": "lettering/new-year-happiness-russian-green-playful.svg",
    "name": {
      "ru": "Зелёная кистевая надпись «Счастья в новом году!»",
      "en": "Green playful brush lettering: Happiness in the New Year"
    },
    "text": "Счастья в новом году!",
    "language": "ru",
    "category": "new-year",
    "subcategory": "new-year-wishes",
    "tags": [
      "Счастья в новом году!",
      "новый год",
      "зелёная",
      "кистевая надпись",
      "векторная надпись"
    ],
    "tagsEn": [
      "happiness in the new year",
      "new year",
      "green",
      "playful brush lettering",
      "vector lettering"
    ],
    "aliases": [
      "Happiness in the New Year",
      "русская надпись"
    ],
    "style": "vector-playful",
    "background": "transparent"
  },
  {
    "id": "wishes-come-true-russian-green-playful",
    "source": "original-assets/lettering/wishes-come-true-russian-green-playful.svg",
    "src": "lettering/wishes-come-true-russian-green-playful.svg",
    "name": {
      "ru": "Зелёная кистевая надпись «Исполнения желаний!»",
      "en": "Green playful brush lettering: May Your Wishes Come True"
    },
    "text": "Исполнения желаний!",
    "language": "ru",
    "category": "magic",
    "subcategory": "magic-wishes-come-true",
    "tags": [
      "Исполнения желаний!",
      "волшебство",
      "зелёная",
      "кистевая надпись",
      "векторная надпись"
    ],
    "tagsEn": [
      "may your wishes come true",
      "magic",
      "green",
      "playful brush lettering",
      "vector lettering"
    ],
    "aliases": [
      "May Your Wishes Come True",
      "русская надпись"
    ],
    "style": "vector-playful",
    "background": "transparent"
  },
  {
    "id": "new-year-miracles-russian-green-playful",
    "source": "original-assets/lettering/new-year-miracles-russian-green-playful.svg",
    "src": "lettering/new-year-miracles-russian-green-playful.svg",
    "name": {
      "ru": "Зелёная кистевая надпись «Чудес в новом году!»",
      "en": "Green playful brush lettering: Miracles in the New Year"
    },
    "text": "Чудес в новом году!",
    "language": "ru",
    "category": "new-year",
    "subcategory": "new-year-wishes",
    "tags": [
      "Чудес в новом году!",
      "новый год",
      "зелёная",
      "кистевая надпись",
      "векторная надпись"
    ],
    "tagsEn": [
      "miracles in the new year",
      "new year",
      "green",
      "playful brush lettering",
      "vector lettering"
    ],
    "aliases": [
      "Miracles in the New Year",
      "русская надпись"
    ],
    "style": "vector-playful",
    "background": "transparent"
  },
  {
    "id": "happy-christmas-russian-red-playful",
    "source": "original-assets/lettering/happy-christmas-russian-red-playful.svg",
    "src": "lettering/happy-christmas-russian-red-playful.svg",
    "name": {
      "ru": "Красная кистевая надпись «Счастливого Рождества!»",
      "en": "Red playful brush lettering: Happy Christmas"
    },
    "text": "Счастливого Рождества!",
    "language": "ru",
    "category": "christmas",
    "subcategory": "christmas-merry-christmas",
    "tags": [
      "Счастливого Рождества!",
      "рождество",
      "красная",
      "кистевая надпись",
      "векторная надпись"
    ],
    "tagsEn": [
      "happy christmas",
      "christmas",
      "red",
      "playful brush lettering",
      "vector lettering"
    ],
    "aliases": [
      "Happy Christmas",
      "русская надпись"
    ],
    "style": "vector-playful",
    "background": "transparent"
  },
  {
    "id": "merry-christmas-russian-red-script",
    "source": "original-assets/lettering/merry-christmas-russian-red-script.svg",
    "src": "lettering/merry-christmas-russian-red-script.svg",
    "name": {
      "ru": "Красная рукописная надпись «С Рождеством!»",
      "en": "Red script lettering: Merry Christmas"
    },
    "text": "С Рождеством!",
    "language": "ru",
    "category": "christmas",
    "subcategory": "christmas-merry-christmas",
    "tags": [
      "С Рождеством!",
      "рождество",
      "красная",
      "рукописная надпись",
      "векторная надпись"
    ],
    "tagsEn": [
      "merry christmas",
      "christmas",
      "red",
      "script lettering",
      "vector lettering"
    ],
    "aliases": [
      "Merry Christmas",
      "русская надпись"
    ],
    "style": "vector-script",
    "background": "transparent"
  },
  {
    "id": "believe-in-miracles-russian-red-script",
    "source": "original-assets/lettering/believe-in-miracles-russian-red-script.svg",
    "src": "lettering/believe-in-miracles-russian-red-script.svg",
    "name": {
      "ru": "Красная рукописная надпись «Верь в чудеса!»",
      "en": "Red script lettering: Believe in Miracles"
    },
    "text": "Верь в чудеса!",
    "language": "ru",
    "category": "magic",
    "subcategory": "magic-believe-in-magic",
    "tags": [
      "Верь в чудеса!",
      "волшебство",
      "красная",
      "рукописная надпись",
      "векторная надпись"
    ],
    "tagsEn": [
      "believe in miracles",
      "magic",
      "red",
      "script lettering",
      "vector lettering"
    ],
    "aliases": [
      "Believe in Miracles",
      "русская надпись"
    ],
    "style": "vector-script",
    "background": "transparent"
  },
  {
    "id": "happy-new-year-russian-red-handwritten",
    "source": "original-assets/lettering/happy-new-year-russian-red-handwritten.svg",
    "src": "lettering/happy-new-year-russian-red-handwritten.svg",
    "name": {
      "ru": "Красная рукописная надпись «С Новым годом!»",
      "en": "Red handwritten lettering: Happy New Year"
    },
    "text": "С Новым годом!",
    "language": "ru",
    "category": "new-year",
    "subcategory": "new-year-happy-new-year",
    "tags": [
      "С Новым годом!",
      "новый год",
      "красная",
      "рукописная надпись",
      "векторная надпись"
    ],
    "tagsEn": [
      "happy new year",
      "new year",
      "red",
      "handwritten lettering",
      "vector lettering"
    ],
    "aliases": [
      "Happy New Year",
      "русская надпись"
    ],
    "style": "vector-handwritten",
    "background": "transparent"
  },
  {
    "id": "magical-holidays-russian-red-handwritten",
    "source": "original-assets/lettering/magical-holidays-russian-red-handwritten.svg",
    "src": "lettering/magical-holidays-russian-red-handwritten.svg",
    "name": {
      "ru": "Красная рукописная надпись «Волшебных праздников!»",
      "en": "Red handwritten lettering: Magical Holidays"
    },
    "text": "Волшебных праздников!",
    "language": "ru",
    "category": "wishes",
    "subcategory": "wishes-holiday-greetings",
    "tags": [
      "Волшебных праздников!",
      "пожелания",
      "красная",
      "рукописная надпись",
      "векторная надпись"
    ],
    "tagsEn": [
      "magical holidays",
      "wishes",
      "red",
      "handwritten lettering",
      "vector lettering"
    ],
    "aliases": [
      "Magical Holidays",
      "русская надпись"
    ],
    "style": "vector-handwritten",
    "background": "transparent"
  },
  {
    "id": "new-year-happiness-russian-red-script",
    "source": "original-assets/lettering/new-year-happiness-russian-red-script.svg",
    "src": "lettering/new-year-happiness-russian-red-script.svg",
    "name": {
      "ru": "Красная рукописная надпись «Счастья в новом году!»",
      "en": "Red script lettering: Happiness in the New Year"
    },
    "text": "Счастья в новом году!",
    "language": "ru",
    "category": "new-year",
    "subcategory": "new-year-wishes",
    "tags": [
      "Счастья в новом году!",
      "новый год",
      "красная",
      "рукописная надпись",
      "векторная надпись"
    ],
    "tagsEn": [
      "happiness in the new year",
      "new year",
      "red",
      "script lettering",
      "vector lettering"
    ],
    "aliases": [
      "Happiness in the New Year",
      "русская надпись"
    ],
    "style": "vector-script",
    "background": "transparent"
  },
  {
    "id": "winter-fairytale-russian-red-script",
    "source": "original-assets/lettering/winter-fairytale-russian-red-script.svg",
    "src": "lettering/winter-fairytale-russian-red-script.svg",
    "name": {
      "ru": "Красная рукописная надпись «Зимняя сказка»",
      "en": "Red script lettering: Winter Fairytale"
    },
    "text": "Зимняя сказка",
    "language": "ru",
    "category": "winter",
    "subcategory": "winter-fairytale",
    "tags": [
      "Зимняя сказка",
      "зима",
      "красная",
      "рукописная надпись",
      "векторная надпись"
    ],
    "tagsEn": [
      "winter fairytale",
      "winter",
      "red",
      "script lettering",
      "vector lettering"
    ],
    "aliases": [
      "Winter Fairytale",
      "русская надпись"
    ],
    "style": "vector-script",
    "background": "transparent"
  },
  {
    "id": "cozy-christmas-russian-red-handwritten",
    "source": "original-assets/lettering/cozy-christmas-russian-red-handwritten.svg",
    "src": "lettering/cozy-christmas-russian-red-handwritten.svg",
    "name": {
      "ru": "Красная рукописная надпись «Уютного Рождества!»",
      "en": "Red handwritten lettering: Cozy Christmas"
    },
    "text": "Уютного Рождества!",
    "language": "ru",
    "category": "christmas",
    "subcategory": "christmas-merry-christmas",
    "tags": [
      "Уютного Рождества!",
      "рождество",
      "красная",
      "рукописная надпись",
      "векторная надпись"
    ],
    "tagsEn": [
      "cozy christmas",
      "christmas",
      "red",
      "handwritten lettering",
      "vector lettering"
    ],
    "aliases": [
      "Cozy Christmas",
      "русская надпись"
    ],
    "style": "vector-handwritten",
    "background": "transparent"
  },
  {
    "id": "letter-to-father-frost-russian-red-handwritten",
    "source": "original-assets/lettering/letter-to-father-frost-russian-red-handwritten.svg",
    "src": "lettering/letter-to-father-frost-russian-red-handwritten.svg",
    "name": {
      "ru": "Красная рукописная надпись «Письмо Деду Морозу»",
      "en": "Red handwritten lettering: Letter to Father Frost"
    },
    "text": "Письмо Деду Морозу",
    "language": "ru",
    "category": "new-year",
    "subcategory": "new-year-father-frost-letter",
    "tags": [
      "Письмо Деду Морозу",
      "новый год",
      "красная",
      "рукописная надпись",
      "векторная надпись"
    ],
    "tagsEn": [
      "letter to father frost",
      "new year",
      "red",
      "handwritten lettering",
      "vector lettering"
    ],
    "aliases": [
      "Letter to Father Frost",
      "русская надпись"
    ],
    "style": "vector-handwritten",
    "background": "transparent"
  },
  {
    "id": "christmas-magic-russian-red-script",
    "source": "original-assets/lettering/christmas-magic-russian-red-script.svg",
    "src": "lettering/christmas-magic-russian-red-script.svg",
    "name": {
      "ru": "Красная рукописная надпись «Рождественское волшебство»",
      "en": "Red script lettering: Christmas Magic"
    },
    "text": "Рождественское волшебство",
    "language": "ru",
    "category": "magic",
    "subcategory": "magic-christmas-magic",
    "tags": [
      "Рождественское волшебство",
      "волшебство",
      "красная",
      "рукописная надпись",
      "векторная надпись"
    ],
    "tagsEn": [
      "christmas magic",
      "magic",
      "red",
      "script lettering",
      "vector lettering"
    ],
    "aliases": [
      "Christmas Magic",
      "русская надпись"
    ],
    "style": "vector-script",
    "background": "transparent"
  },
  {
    "id": "happy-holidays-russian-green-calligraphy",
    "source": "original-assets/lettering/happy-holidays-russian-green-calligraphy.svg",
    "src": "lettering/happy-holidays-russian-green-calligraphy.svg",
    "name": {
      "ru": "Зелёная каллиграфическая надпись «Счастливых праздников!»",
      "en": "Green calligraphic lettering: Happy Holidays"
    },
    "text": "Счастливых праздников!",
    "language": "ru",
    "category": "wishes",
    "subcategory": "wishes-holiday-greetings",
    "tags": [
      "Счастливых праздников!",
      "пожелания",
      "зелёная",
      "каллиграфическая надпись",
      "векторная надпись"
    ],
    "tagsEn": [
      "happy holidays",
      "wishes",
      "green",
      "calligraphic lettering",
      "vector lettering"
    ],
    "aliases": [
      "Happy Holidays",
      "русская надпись"
    ],
    "style": "vector-calligraphy",
    "background": "transparent"
  },
  {
    "id": "joy-and-prosperity-russian-green-calligraphy",
    "source": "original-assets/lettering/joy-and-prosperity-russian-green-calligraphy.svg",
    "src": "lettering/joy-and-prosperity-russian-green-calligraphy.svg",
    "name": {
      "ru": "Зелёная каллиграфическая надпись «Радости и благополучия!»",
      "en": "Green calligraphic lettering: Joy and Prosperity"
    },
    "text": "Радости и благополучия!",
    "language": "ru",
    "category": "wishes",
    "subcategory": "wishes-kind-wishes",
    "tags": [
      "Радости и благополучия!",
      "пожелания",
      "зелёная",
      "каллиграфическая надпись",
      "векторная надпись"
    ],
    "tagsEn": [
      "joy and prosperity",
      "wishes",
      "green",
      "calligraphic lettering",
      "vector lettering"
    ],
    "aliases": [
      "Joy and Prosperity",
      "русская надпись"
    ],
    "style": "vector-calligraphy",
    "background": "transparent"
  },
  {
    "id": "happy-new-year-russian-black-calligraphy",
    "source": "original-assets/lettering/happy-new-year-russian-black-calligraphy.svg",
    "src": "lettering/happy-new-year-russian-black-calligraphy.svg",
    "name": {
      "ru": "Чёрная каллиграфическая надпись «С Новым годом!»",
      "en": "Black calligraphic lettering: Happy New Year"
    },
    "text": "С Новым годом!",
    "language": "ru",
    "category": "new-year",
    "subcategory": "new-year-happy-new-year",
    "tags": [
      "С Новым годом!",
      "новый год",
      "чёрная",
      "каллиграфическая надпись",
      "векторная надпись"
    ],
    "tagsEn": [
      "happy new year",
      "new year",
      "black",
      "calligraphic lettering",
      "vector lettering"
    ],
    "aliases": [
      "Happy New Year",
      "русская надпись"
    ],
    "style": "vector-calligraphy",
    "background": "transparent"
  },
  {
    "id": "new-year-warmth-and-comfort-russian-black-calligraphy",
    "source": "original-assets/lettering/new-year-warmth-and-comfort-russian-black-calligraphy.svg",
    "src": "lettering/new-year-warmth-and-comfort-russian-black-calligraphy.svg",
    "name": {
      "ru": "Чёрная каллиграфическая надпись «Тепла и уюта в новом году!»",
      "en": "Black calligraphic lettering: Warmth and Comfort in the New Year"
    },
    "text": "Тепла и уюта в новом году!",
    "language": "ru",
    "category": "new-year",
    "subcategory": "new-year-wishes",
    "tags": [
      "Тепла и уюта в новом году!",
      "новый год",
      "чёрная",
      "каллиграфическая надпись",
      "векторная надпись"
    ],
    "tagsEn": [
      "warmth and comfort in the new year",
      "new year",
      "black",
      "calligraphic lettering",
      "vector lettering"
    ],
    "aliases": [
      "Warmth and Comfort in the New Year",
      "русская надпись"
    ],
    "style": "vector-calligraphy",
    "background": "transparent"
  },
  {
    "id": "new-year-miracles-russian-black-calligraphy",
    "source": "original-assets/lettering/new-year-miracles-russian-black-calligraphy.svg",
    "src": "lettering/new-year-miracles-russian-black-calligraphy.svg",
    "name": {
      "ru": "Чёрная каллиграфическая надпись «Чудес в новом году!»",
      "en": "Black calligraphic lettering: Miracles in the New Year"
    },
    "text": "Чудес в новом году!",
    "language": "ru",
    "category": "new-year",
    "subcategory": "new-year-wishes",
    "tags": [
      "Чудес в новом году!",
      "новый год",
      "чёрная",
      "каллиграфическая надпись",
      "векторная надпись"
    ],
    "tagsEn": [
      "miracles in the new year",
      "new year",
      "black",
      "calligraphic lettering",
      "vector lettering"
    ],
    "aliases": [
      "Miracles in the New Year",
      "русская надпись"
    ],
    "style": "vector-calligraphy",
    "background": "transparent"
  },
  {
    "id": "winter-magic-russian-black-calligraphy",
    "source": "original-assets/lettering/winter-magic-russian-black-calligraphy.svg",
    "src": "lettering/winter-magic-russian-black-calligraphy.svg",
    "name": {
      "ru": "Чёрная каллиграфическая надпись «Зимнего волшебства!»",
      "en": "Black calligraphic lettering: Winter Magic"
    },
    "text": "Зимнего волшебства!",
    "language": "ru",
    "category": "magic",
    "subcategory": "magic-winter-magic",
    "tags": [
      "Зимнего волшебства!",
      "волшебство",
      "чёрная",
      "каллиграфическая надпись",
      "векторная надпись"
    ],
    "tagsEn": [
      "winter magic",
      "magic",
      "black",
      "calligraphic lettering",
      "vector lettering"
    ],
    "aliases": [
      "Winter Magic",
      "русская надпись"
    ],
    "style": "vector-calligraphy",
    "background": "transparent"
  },
  {
    "id": "new-year-happiness-russian-black-calligraphy",
    "source": "original-assets/lettering/new-year-happiness-russian-black-calligraphy.svg",
    "src": "lettering/new-year-happiness-russian-black-calligraphy.svg",
    "name": {
      "ru": "Чёрная каллиграфическая надпись «Счастья в новом году!»",
      "en": "Black calligraphic lettering: Happiness in the New Year"
    },
    "text": "Счастья в новом году!",
    "language": "ru",
    "category": "new-year",
    "subcategory": "new-year-wishes",
    "tags": [
      "Счастья в новом году!",
      "новый год",
      "чёрная",
      "каллиграфическая надпись",
      "векторная надпись"
    ],
    "tagsEn": [
      "happiness in the new year",
      "new year",
      "black",
      "calligraphic lettering",
      "vector lettering"
    ],
    "aliases": [
      "Happiness in the New Year",
      "русская надпись"
    ],
    "style": "vector-calligraphy",
    "background": "transparent"
  },
  {
    "id": "merry-christmas-russian-black-calligraphy",
    "source": "original-assets/lettering/merry-christmas-russian-black-calligraphy.svg",
    "src": "lettering/merry-christmas-russian-black-calligraphy.svg",
    "name": {
      "ru": "Чёрная каллиграфическая надпись «С Рождеством Христовым!»",
      "en": "Black calligraphic lettering: Merry Christmas"
    },
    "text": "С Рождеством Христовым!",
    "language": "ru",
    "category": "christmas",
    "subcategory": "christmas-merry-christmas",
    "tags": [
      "С Рождеством Христовым!",
      "рождество",
      "чёрная",
      "каллиграфическая надпись",
      "векторная надпись"
    ],
    "tagsEn": [
      "merry christmas",
      "christmas",
      "black",
      "calligraphic lettering",
      "vector lettering"
    ],
    "aliases": [
      "Merry Christmas",
      "русская надпись"
    ],
    "style": "vector-calligraphy",
    "background": "transparent"
  },
  {
    id: 'golden-glitter-merry-christmas', source: 'original-assets/lettering/golden-glitter-merry-christmas.png', src: 'lettering/golden-glitter-merry-christmas.webp',
    name: { ru: 'Золотая надпись «Merry Christmas!» с блёстками', en: 'Golden glitter Merry Christmas calligraphy' },
    text: 'Merry Christmas!', language: 'en', category: 'christmas', subcategory: 'christmas-merry-christmas',
    tags: ['с рождеством', 'рождество', 'золото', 'блёстки', 'каллиграфия', 'одна строка', 'росчерки'], tagsEn: ['merry christmas', 'christmas', 'gold', 'glitter', 'calligraphy', 'single line', 'flourishes'], aliases: ['золотое рождественское поздравление', 'золотая надпись для открытки с эльфом', 'gold christmas greeting', 'elf workshop greeting'], style: 'glitter-calligraphy', background: 'transparent',
  },
  {
    id: 'red-brush-calligraphy-merry-christmas', source: 'original-assets/lettering/red-brush-calligraphy-merry-christmas.png', src: 'lettering/red-brush-calligraphy-merry-christmas.webp',
    name: { ru: 'Красная кистевая каллиграфия «Merry Christmas!»', en: 'Red brush Merry Christmas calligraphy' },
    text: 'Merry Christmas!', language: 'en', category: 'christmas', subcategory: 'christmas-merry-christmas',
    tags: ['с рождеством', 'рождество', 'красный', 'кисть', 'каллиграфия', 'две строки', 'росчерк'], tagsEn: ['merry christmas', 'christmas', 'red', 'brush', 'calligraphy', 'two lines', 'flourish'], aliases: ['красное рождественское поздравление', 'красная надпись для открытки с белочками', 'red christmas script', 'squirrel christmas greeting'], style: 'watercolor-brush-lettering', background: 'transparent',
  },
  {
    id: 'vintage-watercolour-ho-ho-ho', source: 'original-assets/lettering/vintage-watercolour-ho-ho-ho.png', src: 'lettering/vintage-watercolour-ho-ho-ho.webp',
    name: { ru: 'Красная винтажная надпись «Ho Ho Ho»', en: 'Red vintage watercolor Ho Ho Ho lettering' },
    text: 'Ho Ho Ho', language: 'en', category: 'christmas', subcategory: 'christmas-ho-ho-ho',
    tags: ['хо-хо-хо', 'рождество', 'санта', 'красный', 'акварель', 'винтаж', 'росчерки'], tagsEn: ['ho ho ho', 'christmas', 'santa', 'red', 'watercolor', 'vintage', 'flourishes'], aliases: ['смех санты', 'красная надпись для открытки с сантой', 'santa laugh', 'vintage santa greeting'], style: 'vintage-watercolor-lettering', background: 'transparent',
  },
  {
    id: 'believe-in-magic-calligraphy', source: 'original-assets/lettering/believe-in-magic-calligraphy.png', src: 'lettering/believe-in-magic-calligraphy.webp',
    name: { ru: 'Голубая каллиграфия «Believe in Magic»', en: 'Blue Believe in Magic calligraphy' },
    text: 'Believe in Magic', language: 'en', category: 'magic', subcategory: 'magic-believe-in-magic',
    tags: ['верь в чудеса', 'волшебство', 'голубой', 'каллиграфия', 'росчерки'], tagsEn: ['believe in magic', 'blue', 'calligraphy', 'flourishes'], aliases: ['вера в чудо', 'blue magic greeting'], style: 'watercolor-calligraphy', background: 'transparent',
  },
  {
    id: 'believe-in-magic-retro-lettering', source: 'original-assets/lettering/believe-in-magic-retro-lettering.png', src: 'lettering/believe-in-magic-retro-lettering.webp',
    name: { ru: 'Золотая ретронадпись «Believe in Magic»', en: 'Golden retro Believe in Magic lettering' },
    text: 'Believe in Magic', language: 'en', category: 'magic', subcategory: 'magic-believe-in-magic',
    tags: ['верь в чудеса', 'волшебство', 'золото', 'звёзды', 'ретро'], tagsEn: ['believe in magic', 'gold', 'stars', 'retro', 'lettering'], aliases: ['золотое волшебство', 'gold magic typography'], style: 'vintage-typography', background: 'transparent',
  },
  {
    id: 'believe-in-magic-winter-woodland-lettering', source: 'original-assets/lettering/believe-in-magic-winter-woodland-lettering.png', src: 'lettering/believe-in-magic-winter-woodland-lettering.webp',
    name: { ru: 'Надпись «Believe in Magic» с хвоей и синими ягодами', en: 'Believe in Magic with evergreen and blue berries' },
    text: 'Believe in Magic', language: 'en', category: 'magic', subcategory: 'magic-believe-in-magic',
    tags: ['верь в чудеса', 'хвоя', 'синие ягоды', 'звёзды', 'зелёный', 'голубой'], tagsEn: ['believe in magic', 'evergreen', 'blue berries', 'stars', 'green', 'blue'], aliases: ['лесное волшебство', 'woodland magic greeting'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'burgundy-vintage-ho-ho-ho-calligraphy', source: 'original-assets/lettering/burgundy-vintage-ho-ho-ho-calligraphy.svg', src: 'lettering/burgundy-vintage-ho-ho-ho-calligraphy.svg',
    name: { ru: 'Бордовая винтажная каллиграфия «Ho Ho Ho!»', en: 'Burgundy vintage Ho Ho Ho calligraphy' },
    text: 'Ho Ho Ho!', language: 'en', category: 'christmas', subcategory: 'christmas-ho-ho-ho',
    tags: ['хо-хо-хо', 'рождество', 'бордовый', 'каллиграфия', 'росчерки'], tagsEn: ['ho ho ho', 'christmas', 'burgundy', 'calligraphy', 'flourishes'], aliases: ['смех санты', 'santa laugh'], style: 'vintage-calligraphy', background: 'transparent',
  },
  {
    id: 'christmas-magic-calligraphy', source: 'original-assets/lettering/christmas-magic-calligraphy.png', src: 'lettering/christmas-magic-calligraphy.webp',
    name: { ru: 'Бордовая каллиграфия «Christmas Magic»', en: 'Burgundy Christmas Magic calligraphy' },
    text: 'Christmas Magic', language: 'en', category: 'magic', subcategory: 'magic-christmas-magic',
    tags: ['рождественское волшебство', 'рождество', 'бордовый', 'каллиграфия', 'росчерки'], tagsEn: ['christmas magic', 'christmas', 'burgundy', 'calligraphy', 'flourishes'], aliases: ['магия рождества', 'festive magic script'], style: 'watercolor-calligraphy', background: 'transparent',
  },
  {
    id: 'christmas-magic-in-olive-script', source: 'original-assets/lettering/christmas-magic-in-olive-script.png', src: 'lettering/christmas-magic-in-olive-script.webp',
    name: { ru: 'Оливковая каллиграфия «Christmas Magic»', en: 'Olive Christmas Magic calligraphy' },
    text: 'Christmas Magic', language: 'en', category: 'magic', subcategory: 'magic-christmas-magic',
    tags: ['рождественское волшебство', 'рождество', 'оливковый', 'зелёный', 'каллиграфия'], tagsEn: ['christmas magic', 'olive green', 'calligraphy', 'flourishes'], aliases: ['магия рождества', 'olive holiday script'], style: 'vintage-calligraphy', background: 'transparent',
  },
  {
    id: 'cranberry-watercolour-ho-ho-ho', source: 'original-assets/lettering/cranberry-watercolour-ho-ho-ho.png', src: 'lettering/cranberry-watercolour-ho-ho-ho.webp',
    name: { ru: 'Клюквенная акварельная надпись «Ho Ho Ho!»', en: 'Cranberry watercolor Ho Ho Ho calligraphy' },
    text: 'Ho Ho Ho!', language: 'en', category: 'christmas', subcategory: 'christmas-ho-ho-ho',
    tags: ['хо-хо-хо', 'клюквенный', 'красный', 'акварель', 'каллиграфия'], tagsEn: ['ho ho ho', 'cranberry red', 'watercolor', 'calligraphy'], aliases: ['смех санты', 'red santa greeting'], style: 'watercolor-calligraphy', background: 'transparent',
  },
  {
    id: 'elegant-burgundy-ho-ho-ho-calligraphy', source: 'original-assets/lettering/elegant-burgundy-ho-ho-ho-calligraphy.png', src: 'lettering/elegant-burgundy-ho-ho-ho-calligraphy.webp',
    name: { ru: 'Бордовая надпись «Ho Ho Ho!» с длинными росчерками', en: 'Elegant burgundy Ho Ho Ho with long flourishes' },
    text: 'Ho Ho Ho!', language: 'en', category: 'christmas', subcategory: 'christmas-ho-ho-ho',
    tags: ['хо-хо-хо', 'бордовый', 'красный', 'каллиграфия', 'росчерки'], tagsEn: ['ho ho ho', 'burgundy', 'red', 'calligraphy', 'long flourishes'], aliases: ['смех санты', 'elegant santa script'], style: 'vintage-calligraphy', background: 'transparent',
  },
  {
    id: 'elegant-green-christmas-calligraphy', source: 'original-assets/lettering/elegant-green-christmas-calligraphy.png', src: 'lettering/elegant-green-christmas-calligraphy.webp',
    name: { ru: 'Зелёная каллиграфия «Merry Christmas!» с листьями', en: 'Elegant green Merry Christmas with leaves' },
    text: 'Merry Christmas!', language: 'en', category: 'christmas', subcategory: 'christmas-merry-christmas',
    tags: ['с рождеством', 'зелёный', 'листья', 'каллиграфия', 'росчерки'], tagsEn: ['merry christmas', 'green', 'leaves', 'calligraphy', 'flourishes'], aliases: ['рождественское поздравление', 'green christmas greeting'], style: 'vintage-calligraphy', background: 'transparent',
  },
  {
    id: 'evergreen-happy-new-year-calligraphy', source: 'original-assets/lettering/evergreen-happy-new-year-calligraphy.png', src: 'lettering/evergreen-happy-new-year-calligraphy.webp',
    name: { ru: 'Хвойно-зелёная каллиграфия «Happy New Year!»', en: 'Evergreen green Happy New Year calligraphy' },
    text: 'Happy New Year!', language: 'en', category: 'new-year', subcategory: 'new-year-happy-new-year',
    tags: ['с новым годом', 'новый год', 'зелёный', 'каллиграфия', 'росчерки'], tagsEn: ['happy new year', 'new year', 'evergreen green', 'calligraphy', 'flourishes'], aliases: ['новогоднее поздравление', 'green new year greeting'], style: 'vintage-calligraphy', background: 'transparent',
  },
  {
    id: 'festive-cranberry-ho-ho-ho-lettering', source: 'original-assets/lettering/festive-cranberry-ho-ho-ho-lettering.png', src: 'lettering/festive-cranberry-ho-ho-ho-lettering.webp',
    name: { ru: 'Клюквенная надпись «Ho Ho Ho!» с падубом и бантом', en: 'Cranberry Ho Ho Ho with holly and a bow' },
    text: 'Ho Ho Ho!', language: 'en', category: 'christmas', subcategory: 'christmas-ho-ho-ho',
    tags: ['хо-хо-хо', 'красный', 'падуб', 'ягоды', 'бант', 'звёзды'], tagsEn: ['ho ho ho', 'cranberry red', 'holly', 'berries', 'bow', 'stars'], aliases: ['смех санты', 'festive holly lettering'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'frosty-blue-let-it-snow-lettering', source: 'original-assets/lettering/frosty-blue-let-it-snow-lettering.png', src: 'lettering/frosty-blue-let-it-snow-lettering.webp',
    name: { ru: 'Морозная голубая каллиграфия «Let It Snow»', en: 'Frosty blue Let It Snow calligraphy' },
    text: 'Let It Snow', language: 'en', category: 'winter', subcategory: 'winter-let-it-snow',
    tags: ['пусть идёт снег', 'зима', 'голубой', 'мороз', 'каллиграфия', 'росчерки'], tagsEn: ['let it snow', 'winter', 'blue', 'frosty', 'calligraphy', 'flourishes'], aliases: ['снежное пожелание', 'blue winter script'], style: 'watercolor-calligraphy', background: 'transparent',
  },
  {
    id: 'frosty-wonderful-time-typography', source: 'original-assets/lettering/frosty-wonderful-time-typography.png', src: 'lettering/frosty-wonderful-time-typography.webp',
    name: { ru: 'Надпись «The Most Wonderful Time» с голубым бантом и хвоей', en: 'The Most Wonderful Time with a blue bow and evergreen' },
    text: 'The Most Wonderful Time', language: 'en', category: 'christmas', subcategory: 'christmas-wonderful-time',
    tags: ['чудесная пора', 'зима', 'синий', 'хвоя', 'голубой бант', 'снежинки'], tagsEn: ['the most wonderful time', 'winter', 'blue', 'evergreen', 'blue bow', 'snowflakes'], aliases: ['самое чудесное время', 'frosty holiday typography'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'golden-merry-christmas-brush-lettering', source: 'original-assets/lettering/golden-merry-christmas-brush-lettering.png', src: 'lettering/golden-merry-christmas-brush-lettering.webp',
    name: { ru: 'Золотая надпись «Merry Christmas» с колокольчиками', en: 'Golden Merry Christmas brush lettering with bells' },
    text: 'Merry Christmas', language: 'en', category: 'christmas', subcategory: 'christmas-merry-christmas',
    tags: ['с рождеством', 'золото', 'колокольчики', 'красный бант', 'кремовый бант', 'хвоя'], tagsEn: ['merry christmas', 'gold', 'bells', 'red bow', 'ivory bow', 'evergreen', 'brush lettering'], aliases: ['золотое поздравление', 'gold christmas bells greeting'], style: 'watercolor-brush-lettering', background: 'transparent',
  },
  {
    id: 'golden-merry-christmas-calligraphy', source: 'original-assets/lettering/golden-merry-christmas-calligraphy.png', src: 'lettering/golden-merry-christmas-calligraphy.webp',
    name: { ru: 'Золотая каллиграфия «Merry Christmas!»', en: 'Golden Merry Christmas calligraphy' },
    text: 'Merry Christmas!', language: 'en', category: 'christmas', subcategory: 'christmas-merry-christmas',
    tags: ['с рождеством', 'золото', 'каллиграфия', 'росчерки'], tagsEn: ['merry christmas', 'gold', 'calligraphy', 'flourishes'], aliases: ['золотое поздравление', 'golden holiday script'], style: 'vintage-calligraphy', background: 'transparent',
  },
  {
    id: 'hand-lettered-happy-new-year', source: 'original-assets/lettering/hand-lettered-happy-new-year.png', src: 'lettering/hand-lettered-happy-new-year.webp',
    name: { ru: 'Зелёно-красная каллиграфия «Happy New Year!»', en: 'Green and red hand-lettered Happy New Year' },
    text: 'Happy New Year!', language: 'en', category: 'new-year', subcategory: 'new-year-happy-new-year',
    tags: ['с новым годом', 'новый год', 'зелёный', 'красный', 'золото', 'каллиграфия'], tagsEn: ['happy new year', 'new year', 'green', 'red', 'gold', 'hand lettering'], aliases: ['новогоднее поздравление', 'red green new year greeting'], style: 'vintage-calligraphy', background: 'transparent',
  },
  {
    id: 'hand-painted-merry-christmas-with-holly', source: 'original-assets/lettering/hand-painted-merry-christmas-with-holly.png', src: 'lettering/hand-painted-merry-christmas-with-holly.webp',
    name: { ru: 'Оливковая надпись «Merry Christmas» с падубом', en: 'Hand-painted olive Merry Christmas with holly' },
    text: 'Merry Christmas', language: 'en', category: 'christmas', subcategory: 'christmas-merry-christmas',
    tags: ['с рождеством', 'оливковый', 'падуб', 'ягоды', 'кремовый бант', 'звёзды'], tagsEn: ['merry christmas', 'olive green', 'holly', 'berries', 'ivory bow', 'stars'], aliases: ['рождественское поздравление', 'botanical brush greeting'], style: 'watercolor-brush-lettering', background: 'transparent',
  },
  {
    id: 'icy-blue-ho-ho-ho-lettering', source: 'original-assets/lettering/icy-blue-ho-ho-ho-lettering.png', src: 'lettering/icy-blue-ho-ho-ho-lettering.webp',
    name: { ru: 'Ледяная голубая надпись «Ho Ho Ho!» с бантом', en: 'Icy blue Ho Ho Ho with a bow' },
    text: 'Ho Ho Ho!', language: 'en', category: 'christmas', subcategory: 'christmas-ho-ho-ho',
    tags: ['хо-хо-хо', 'голубой', 'снег', 'снежинки', 'голубой бант', 'хвоя'], tagsEn: ['ho ho ho', 'icy blue', 'snow', 'snowflakes', 'blue bow', 'evergreen'], aliases: ['смех санты', 'frosty santa greeting'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'let-it-snow-retro-lettering', source: 'original-assets/lettering/let-it-snow-retro-lettering.png', src: 'lettering/let-it-snow-retro-lettering.webp',
    name: { ru: 'Синяя ретронадпись «Let It Snow» со снежинками', en: 'Blue retro Let It Snow with snowflakes' },
    text: 'Let It Snow', language: 'en', category: 'winter', subcategory: 'winter-let-it-snow',
    tags: ['пусть идёт снег', 'зима', 'синий', 'снег', 'снежинки', 'ретро'], tagsEn: ['let it snow', 'winter', 'blue', 'snow', 'snowflakes', 'retro'], aliases: ['снежное пожелание', 'snowy winter typography'], style: 'vintage-typography', background: 'transparent',
  },
  {
    id: 'let-it-snow-vintage-calligraphy', source: 'original-assets/lettering/let-it-snow-vintage-calligraphy.png', src: 'lettering/let-it-snow-vintage-calligraphy.webp',
    name: { ru: 'Зелёно-красная каллиграфия «Let It Snow»', en: 'Green and red vintage Let It Snow calligraphy' },
    text: 'Let It Snow', language: 'en', category: 'winter', subcategory: 'winter-let-it-snow',
    tags: ['пусть идёт снег', 'зима', 'зелёный', 'красный', 'золото', 'каллиграфия'], tagsEn: ['let it snow', 'winter', 'green', 'red', 'gold', 'calligraphy'], aliases: ['снежное пожелание', 'festive snow script'], style: 'vintage-calligraphy', background: 'transparent',
  },
  {
    id: 'let-it-snow-watercolour-calligraphy', source: 'original-assets/lettering/let-it-snow-watercolour-calligraphy.png', src: 'lettering/let-it-snow-watercolour-calligraphy.webp',
    name: { ru: 'Голубая акварельная каллиграфия «Let It Snow»', en: 'Blue watercolor Let It Snow calligraphy' },
    text: 'Let It Snow...', language: 'en', category: 'winter', subcategory: 'winter-let-it-snow',
    tags: ['пусть идёт снег', 'зима', 'голубой', 'акварель', 'каллиграфия', 'росчерки'], tagsEn: ['let it snow', 'winter', 'blue', 'watercolor', 'calligraphy', 'flourishes'], aliases: ['снежное пожелание', 'watercolour snow script'], style: 'watercolor-calligraphy', background: 'transparent',
  },
  {
    id: 'let-it-snow-watercolour-lettering', source: 'original-assets/lettering/let-it-snow-watercolour-lettering.png', src: 'lettering/let-it-snow-watercolour-lettering.webp',
    name: { ru: 'Акварельная надпись «Let It Snow» с голубыми снежинками', en: 'Watercolor Let It Snow with blue snowflakes' },
    text: 'Let It Snow', language: 'en', category: 'winter', subcategory: 'winter-let-it-snow',
    tags: ['пусть идёт снег', 'зима', 'голубой', 'снег', 'снежинки', 'акварель'], tagsEn: ['let it snow', 'winter', 'blue', 'snow', 'snowflakes', 'watercolor'], aliases: ['снежное пожелание', 'watercolour snowflake lettering'], style: 'watercolor-brush-lettering', background: 'transparent',
  },
  {
    id: 'merry-christmas-botanical-greeting', source: 'original-assets/lettering/merry-christmas-botanical-greeting.png', src: 'lettering/merry-christmas-botanical-greeting.webp',
    name: { ru: 'Надпись «Merry Christmas!» с хвоей и красным бантом', en: 'Botanical Merry Christmas with evergreen and a red bow' },
    text: 'Merry Christmas!', language: 'en', category: 'christmas', subcategory: 'christmas-merry-christmas',
    tags: ['с рождеством', 'зелёный', 'хвоя', 'красные ягоды', 'красный бант'], tagsEn: ['merry christmas', 'green', 'evergreen', 'red berries', 'red bow'], aliases: ['хвойное поздравление', 'evergreen christmas greeting'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'merry-christmas-calligraphy-in-red-and-gold', source: 'original-assets/lettering/merry-christmas-calligraphy-in-red-and-gold.png', src: 'lettering/merry-christmas-calligraphy-in-red-and-gold.webp',
    name: { ru: 'Красная каллиграфия «Merry Christmas!» с золотистыми бликами', en: 'Red Merry Christmas calligraphy with golden highlights' },
    text: 'Merry Christmas!', language: 'en', category: 'christmas', subcategory: 'christmas-merry-christmas',
    tags: ['с рождеством', 'красный', 'золото', 'каллиграфия', 'росчерки'], tagsEn: ['merry christmas', 'red', 'golden highlights', 'calligraphy', 'flourishes'], aliases: ['красное поздравление', 'red gold holiday script'], style: 'watercolor-calligraphy', background: 'transparent',
  },
  {
    id: 'sweet-christmas-evergreen-lettering', source: 'original-assets/lettering/sweet-christmas-evergreen-lettering.png', src: 'lettering/sweet-christmas-evergreen-lettering.webp',
    name: { ru: 'Зелёная надпись «Sweet Christmas!» с хвоей и бантом', en: 'Green Sweet Christmas with evergreen and a bow' },
    text: 'Sweet Christmas!', language: 'en', category: 'christmas', subcategory: 'christmas-sweet-christmas',
    tags: ['сладкого рождества', 'рождество', 'зелёный', 'хвоя', 'ягоды', 'красный бант'], tagsEn: ['sweet christmas', 'green', 'evergreen', 'berries', 'red bow'], aliases: ['сладкое рождество', 'evergreen sweet greeting'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'sweet-christmas-watercolour-calligraphy', source: 'original-assets/lettering/sweet-christmas-watercolour-calligraphy.png', src: 'lettering/sweet-christmas-watercolour-calligraphy.webp',
    name: { ru: 'Голубая каллиграфия «Sweet Christmas»', en: 'Blue watercolor Sweet Christmas calligraphy' },
    text: 'Sweet Christmas', language: 'en', category: 'christmas', subcategory: 'christmas-sweet-christmas',
    tags: ['сладкого рождества', 'рождество', 'голубой', 'каллиграфия', 'акварель'], tagsEn: ['sweet christmas', 'blue', 'calligraphy', 'watercolor'], aliases: ['сладкое рождество', 'watercolour sweet christmas'], style: 'watercolor-calligraphy', background: 'transparent',
  },
  {
    id: 'vintage-christmas-magic-sticker', source: 'original-assets/lettering/vintage-christmas-magic-sticker.png', src: 'lettering/vintage-christmas-magic-sticker.webp',
    name: { ru: 'Кремово-золотая надпись «Christmas Magic» с игрушками', en: 'Ivory and gold Christmas Magic with ornaments' },
    text: 'Christmas Magic', language: 'en', category: 'magic', subcategory: 'magic-christmas-magic',
    tags: ['рождественское волшебство', 'кремовый', 'золото', 'ёлочные игрушки', 'бант', 'звёзды'], tagsEn: ['christmas magic', 'ivory', 'gold', 'ornaments', 'bow', 'stars'], aliases: ['магия рождества', 'vintage magic sticker'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'vintage-happy-new-year-calligraphy', source: 'original-assets/lettering/vintage-happy-new-year-calligraphy.png', src: 'lettering/vintage-happy-new-year-calligraphy.webp',
    name: { ru: 'Винтажная каллиграфия «Happy New Year!» с золотыми росчерками', en: 'Vintage Happy New Year with golden flourishes' },
    text: 'Happy New Year!', language: 'en', category: 'new-year', subcategory: 'new-year-happy-new-year',
    tags: ['с новым годом', 'новый год', 'зелёный', 'красный', 'золото', 'росчерки'], tagsEn: ['happy new year', 'new year', 'green', 'red', 'gold', 'flourishes'], aliases: ['новогоднее поздравление', 'vintage new year script'], style: 'vintage-calligraphy', background: 'transparent',
  },
  {
    id: 'vintage-happy-new-year-clockwork', source: 'original-assets/lettering/vintage-happy-new-year-clockwork.png', src: 'lettering/vintage-happy-new-year-clockwork.webp',
    name: { ru: 'Золотая надпись «Happy New Year!» с часами', en: 'Golden Happy New Year with a clock' },
    text: 'Happy New Year!', language: 'en', category: 'new-year', subcategory: 'new-year-happy-new-year',
    tags: ['с новым годом', 'новый год', 'золото', 'часы', 'полночь', 'звёзды', 'хвоя'], tagsEn: ['happy new year', 'new year', 'gold', 'clock', 'midnight', 'stars', 'evergreen'], aliases: ['новогодние куранты', 'new year countdown lettering'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'vintage-ho-ho-ho-holiday-garland', source: 'original-assets/lettering/vintage-ho-ho-ho-holiday-garland.png', src: 'lettering/vintage-ho-ho-ho-holiday-garland.webp',
    name: { ru: 'Зелёная надпись «Ho Ho Ho!» с шапкой Санты', en: 'Green Ho Ho Ho with a Santa hat' },
    text: 'Ho Ho Ho!', language: 'en', category: 'christmas', subcategory: 'christmas-ho-ho-ho',
    tags: ['хо-хо-хо', 'зелёный', 'шапка санты', 'хвоя', 'красный бант', 'звёзды'], tagsEn: ['ho ho ho', 'green', 'santa hat', 'evergreen', 'red bow', 'stars'], aliases: ['смех санты', 'santa holiday garland'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'vintage-holiday-lettering-with-pine-and-bell', source: 'original-assets/lettering/vintage-holiday-lettering-with-pine-and-bell.png', src: 'lettering/vintage-holiday-lettering-with-pine-and-bell.webp',
    name: { ru: 'Кремовая надпись «The Most Wonderful Time» с хвоей и колокольчиком', en: 'Ivory The Most Wonderful Time with pine and a bell' },
    text: 'The Most Wonderful Time', language: 'en', category: 'christmas', subcategory: 'christmas-wonderful-time',
    tags: ['чудесная пора', 'кремовый', 'хвоя', 'колокольчик', 'кремовый бант', 'звёзды'], tagsEn: ['the most wonderful time', 'ivory', 'pine', 'bell', 'ivory bow', 'stars'], aliases: ['самое чудесное время', 'vintage holiday lettering'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'vintage-holly-happy-new-year-lettering', source: 'original-assets/lettering/vintage-holly-happy-new-year-lettering.png', src: 'lettering/vintage-holly-happy-new-year-lettering.webp',
    name: { ru: 'Зелёная надпись «Happy New Year!» с хвоей и ягодами', en: 'Green Happy New Year with evergreen and berries' },
    text: 'Happy New Year!', language: 'en', category: 'new-year', subcategory: 'new-year-happy-new-year',
    tags: ['с новым годом', 'новый год', 'зелёный', 'хвоя', 'ягоды', 'красный бант'], tagsEn: ['happy new year', 'new year', 'green', 'evergreen', 'berries', 'red bow'], aliases: ['новогоднее поздравление', 'botanical new year lettering'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'vintage-holly-ho-ho-ho-lettering', source: 'original-assets/lettering/vintage-holly-ho-ho-ho-lettering.png', src: 'lettering/vintage-holly-ho-ho-ho-lettering.webp',
    name: { ru: 'Зелёная надпись «Ho Ho Ho!» с падубом и красным бантом', en: 'Green Ho Ho Ho with holly and a red bow' },
    text: 'Ho Ho Ho!', language: 'en', category: 'christmas', subcategory: 'christmas-ho-ho-ho',
    tags: ['хо-хо-хо', 'зелёный', 'падуб', 'красные ягоды', 'красный бант'], tagsEn: ['ho ho ho', 'green', 'holly', 'red berries', 'red bow'], aliases: ['смех санты', 'holly santa lettering'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'vintage-merry-christmas-calligraphy', source: 'original-assets/lettering/vintage-merry-christmas-calligraphy.png', src: 'lettering/vintage-merry-christmas-calligraphy.webp',
    name: { ru: 'Зелёно-красная каллиграфия «Merry Christmas!»', en: 'Green and red vintage Merry Christmas calligraphy' },
    text: 'Merry Christmas!', language: 'en', category: 'christmas', subcategory: 'christmas-merry-christmas',
    tags: ['с рождеством', 'зелёный', 'красный', 'золото', 'каллиграфия', 'росчерки'], tagsEn: ['merry christmas', 'green', 'red', 'gold', 'calligraphy', 'flourishes'], aliases: ['рождественское поздравление', 'traditional christmas script'], style: 'vintage-calligraphy', background: 'transparent',
  },
  {
    id: 'vintage-merry-christmas-holly-typography', source: 'original-assets/lettering/vintage-merry-christmas-holly-typography.png', src: 'lettering/vintage-merry-christmas-holly-typography.webp',
    name: { ru: 'Красная надпись «Merry Christmas!» с падубом', en: 'Red Merry Christmas typography with holly' },
    text: 'Merry Christmas!', language: 'en', category: 'christmas', subcategory: 'christmas-merry-christmas',
    tags: ['с рождеством', 'красный', 'падуб', 'ягоды', 'красный бант', 'ретро'], tagsEn: ['merry christmas', 'red', 'holly', 'berries', 'red bow', 'retro'], aliases: ['рождественское поздравление', 'red holly christmas lettering'], style: 'vintage-watercolor', background: 'transparent',
  },
  {
    id: 'vintage-retro-merry-christmas-lettering', source: 'original-assets/lettering/vintage-retro-merry-christmas-lettering.png', src: 'lettering/vintage-retro-merry-christmas-lettering.webp',
    name: { ru: 'Ретронадпись «Merry Christmas!» с золотыми колокольчиками', en: 'Retro Merry Christmas with golden bells' },
    text: 'Merry Christmas!', language: 'en', category: 'christmas', subcategory: 'christmas-merry-christmas',
    tags: ['с рождеством', 'зелёный', 'красный', 'колокольчики', 'хвоя', 'звёзды', 'ретро'], tagsEn: ['merry christmas', 'green', 'red', 'bells', 'evergreen', 'stars', 'retro'], aliases: ['рождественское поздравление', 'retro christmas bells greeting'], style: 'vintage-typography', background: 'transparent',
  },
  {
    id: 'warmest-wishes-vintage-calligraphy', source: 'original-assets/lettering/warmest-wishes-vintage-calligraphy.png', src: 'lettering/warmest-wishes-vintage-calligraphy.webp',
    name: { ru: 'Винтажная каллиграфия «Warmest Wishes»', en: 'Vintage Warmest Wishes calligraphy' },
    text: 'Warmest Wishes', language: 'en', category: 'wishes', subcategory: 'wishes-warmest-wishes',
    tags: ['тёплые пожелания', 'зелёный', 'красный', 'золото', 'каллиграфия', 'росчерки'], tagsEn: ['warmest wishes', 'green', 'red', 'gold', 'calligraphy', 'flourishes'], aliases: ['с теплом', 'warm holiday wishes'], style: 'vintage-calligraphy', background: 'transparent',
  },
  {
    id: 'watercolour-happy-new-year-lettering', source: 'original-assets/lettering/watercolour-happy-new-year-lettering.png', src: 'lettering/watercolour-happy-new-year-lettering.webp',
    name: { ru: 'Красная акварельная каллиграфия «Happy new year!»', en: 'Red watercolor Happy new year calligraphy' },
    text: 'Happy new year!', language: 'en', category: 'new-year', subcategory: 'new-year-happy-new-year',
    tags: ['с новым годом', 'новый год', 'красный', 'акварель', 'каллиграфия'], tagsEn: ['happy new year', 'new year', 'red', 'watercolor', 'calligraphy'], aliases: ['новогоднее поздравление', 'watercolour new year greeting'], style: 'watercolor-calligraphy', background: 'transparent',
  },
  {
    id: 'watercolour-ho-ho-ho-with-winter-foliage', source: 'original-assets/lettering/watercolour-ho-ho-ho-with-winter-foliage.png', src: 'lettering/watercolour-ho-ho-ho-with-winter-foliage.webp',
    name: { ru: 'Голубая надпись «Ho Ho Ho!» с зимними листьями', en: 'Blue Ho Ho Ho with winter foliage' },
    text: 'Ho Ho Ho!', language: 'en', category: 'christmas', subcategory: 'christmas-ho-ho-ho',
    tags: ['хо-хо-хо', 'голубой', 'зимние листья', 'ягоды', 'каллиграфия'], tagsEn: ['ho ho ho', 'blue', 'winter foliage', 'berries', 'calligraphy'], aliases: ['смех санты', 'blue botanical santa greeting'], style: 'watercolor-calligraphy', background: 'transparent',
  },
  {
    id: 'watercolour-merry-christmas-calligraphy-1', source: 'original-assets/lettering/watercolour-merry-christmas-calligraphy-1.png', src: 'lettering/watercolour-merry-christmas-calligraphy-1.webp',
    name: { ru: 'Клюквенная каллиграфия «Merry Christmas!»', en: 'Cranberry watercolor Merry Christmas calligraphy' },
    text: 'Merry Christmas!', language: 'en', category: 'christmas', subcategory: 'christmas-merry-christmas',
    tags: ['с рождеством', 'клюквенный', 'красный', 'каллиграфия', 'акварель'], tagsEn: ['merry christmas', 'cranberry red', 'calligraphy', 'watercolor'], aliases: ['рождественское поздравление', 'red watercolour christmas script'], style: 'watercolor-calligraphy', background: 'transparent',
  },
  {
    id: 'watercolour-merry-christmas-calligraphy-2', source: 'original-assets/lettering/watercolour-merry-christmas-calligraphy-2.png', src: 'lettering/watercolour-merry-christmas-calligraphy-2.webp',
    name: { ru: 'Ледяная каллиграфия «Merry Christmas!» с голубым бантом', en: 'Icy Merry Christmas calligraphy with a blue bow' },
    text: 'Merry Christmas!', language: 'en', category: 'christmas', subcategory: 'christmas-merry-christmas',
    tags: ['с рождеством', 'голубой', 'зимние листья', 'голубой бант', 'каллиграфия'], tagsEn: ['merry christmas', 'icy blue', 'winter foliage', 'blue bow', 'calligraphy'], aliases: ['морозное поздравление', 'frosty watercolour christmas script'], style: 'watercolor-calligraphy', background: 'transparent',
  },
  {
    id: 'watercolour-merry-christmas-calligraphy', source: 'original-assets/lettering/watercolour-merry-christmas-calligraphy.png', src: 'lettering/watercolour-merry-christmas-calligraphy.webp',
    name: { ru: 'Голубая каллиграфия «Merry Christmas!»', en: 'Blue watercolor Merry Christmas calligraphy' },
    text: 'Merry Christmas!', language: 'en', category: 'christmas', subcategory: 'christmas-merry-christmas',
    tags: ['с рождеством', 'голубой', 'каллиграфия', 'акварель', 'росчерки'], tagsEn: ['merry christmas', 'blue', 'calligraphy', 'watercolor', 'flourishes'], aliases: ['рождественское поздравление', 'blue watercolour christmas script'], style: 'watercolor-calligraphy', background: 'transparent',
  },
  {
    id: 'watercolour-merry-christmas-with-berries', source: 'original-assets/lettering/watercolour-merry-christmas-with-berries.png', src: 'lettering/watercolour-merry-christmas-with-berries.webp',
    name: { ru: 'Клюквенная надпись «Merry Christmas» с ягодами и бантом', en: 'Cranberry Merry Christmas with berries and a bow' },
    text: 'Merry Christmas', language: 'en', category: 'christmas', subcategory: 'christmas-merry-christmas',
    tags: ['с рождеством', 'клюквенный', 'красный', 'ягоды', 'хвоя', 'красный бант'], tagsEn: ['merry christmas', 'cranberry red', 'berries', 'evergreen', 'red bow'], aliases: ['рождественское поздравление', 'watercolour berry christmas greeting'], style: 'watercolor-brush-lettering', background: 'transparent',
  },
];
