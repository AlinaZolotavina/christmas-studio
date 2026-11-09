import type { ImageCategory, ImageMetadata, ImageMotif } from './images';

/** Explicit, visually reviewed decorative artwork; simple shapes use commands. */
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
export const decorationMotifs: ImageMotif[] = [
  {
    "id": "snowflakes-ornamental",
    "category": "snowflakes",
    "name": {
      "ru": "Ажурные снежинки",
      "en": "Ornamental snowflakes"
    }
  },
  {
    "id": "stars-golden",
    "category": "stars",
    "name": {
      "ru": "Золотые звёзды",
      "en": "Golden stars"
    }
  },
  {
    "id": "stars-ornamental",
    "category": "stars",
    "name": {
      "ru": "Нарядные звёзды",
      "en": "Ornamental stars"
    }
  },
  {
    "id": "evergreen-sprigs",
    "category": "evergreen",
    "name": {
      "ru": "Хвойные веточки",
      "en": "Evergreen sprigs"
    }
  },
  {
    "id": "berries-sprigs",
    "category": "berries",
    "name": {
      "ru": "Веточки с ягодами",
      "en": "Berry sprigs"
    }
  },
  {
    "id": "ribbons-bows",
    "category": "ribbons",
    "name": {
      "ru": "Банты",
      "en": "Bows"
    }
  },
  {
    "id": "ribbons-strips",
    "category": "ribbons",
    "name": {
      "ru": "Ленты",
      "en": "Ribbon strips"
    }
  },
  {
    "id": "frames-corners",
    "category": "frames",
    "name": {
      "ru": "Растительные уголки",
      "en": "Botanical corners"
    }
  },
  {
    "id": "frames-botanical-arcs",
    "category": "frames",
    "name": {
      "ru": "Растительные дуги",
      "en": "Botanical arches"
    }
  },
  {
    "id": "lines-ornamental",
    "category": "lines",
    "name": {
      "ru": "Орнаментальные разделители",
      "en": "Ornamental dividers"
    }
  },
  {
    "id": "lines-sparkles",
    "category": "lines",
    "name": {
      "ru": "Звёздные россыпи",
      "en": "Star sparkle dividers"
    }
  },
  {
    "id": "garlands-stars",
    "category": "garlands",
    "name": {
      "ru": "Гирлянды звёзд",
      "en": "Star garlands"
    }
  },
  {
    "id": "garlands-lights",
    "category": "garlands",
    "name": {
      "ru": "Гирлянды огоньков",
      "en": "Light garlands"
    }
  },
  {
    "id": "garlands-evergreen",
    "category": "garlands",
    "name": {
      "ru": "Хвойные гирлянды",
      "en": "Evergreen garlands"
    }
  },
  {
    "id": "garlands-botanical",
    "category": "garlands",
    "name": {
      "ru": "Ягодные гирлянды",
      "en": "Berry garlands"
    }
  }
];
export const decorations: ImageMetadata[] = [
  {
    "id": "burgundy-velvet-bow-with-gold-trim",
    "source": "original-assets/decorations/burgundy-velvet-bow-with-gold-trim.png",
    "src": "decorations/burgundy-velvet-bow-with-gold-trim.webp",
    "name": {
      "ru": "Бордовый бархатный бант с золотым кантом",
      "en": "Burgundy velvet bow with gold trim"
    },
    "category": "ribbons",
    "subcategory": "ribbons-bows",
    "tags": [
      "бант",
      "бархат",
      "бордовый",
      "золотой кант",
      "длинные ленты"
    ],
    "tagsEn": [
      "bow",
      "velvet",
      "burgundy",
      "gold trim",
      "long ribbons"
    ],
    "aliases": [
      "праздничный бархатный бантик",
      "gilded velvet ribbon bow"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "gilded-holly-scroll-divider",
    "source": "original-assets/decorations/gilded-holly-scroll-divider.png",
    "src": "decorations/gilded-holly-scroll-divider.webp",
    "name": {
      "ru": "Золотой разделитель с завитками и падубом",
      "en": "Gilded scroll divider with holly"
    },
    "category": "lines",
    "subcategory": "lines-ornamental",
    "tags": [
      "разделитель",
      "линия",
      "золото",
      "завитки",
      "падуб",
      "красные ягоды"
    ],
    "tagsEn": [
      "divider",
      "line",
      "gold",
      "scrolls",
      "holly",
      "red berries"
    ],
    "aliases": [
      "золотая виньетка с падубом",
      "ornamental holly flourish"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "gold-edged-burgundy-velvet-ribbon",
    "source": "original-assets/decorations/gold-edged-burgundy-velvet-ribbon.png",
    "src": "decorations/gold-edged-burgundy-velvet-ribbon.webp",
    "name": {
      "ru": "Волнистая бордовая лента с золотым краем",
      "en": "Wavy burgundy velvet ribbon with gold edging"
    },
    "category": "ribbons",
    "subcategory": "ribbons-strips",
    "tags": [
      "лента",
      "бархат",
      "бордовый",
      "золотой край",
      "волна",
      "полоса"
    ],
    "tagsEn": [
      "ribbon",
      "velvet",
      "burgundy",
      "gold edge",
      "wave",
      "strip"
    ],
    "aliases": [
      "праздничная бархатная лента",
      "flowing gold edged ribbon"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "golden-glitter-starburst-arc",
    "source": "original-assets/decorations/golden-glitter-starburst-arc.png",
    "src": "decorations/golden-glitter-starburst-arc.webp",
    "name": {
      "ru": "Дуга из золотых звёзд и искр",
      "en": "Arc of golden stars and sparkles"
    },
    "category": "lines",
    "subcategory": "lines-sparkles",
    "tags": [
      "золото",
      "звёзды",
      "искры",
      "дуга",
      "россыпь",
      "мерцание"
    ],
    "tagsEn": [
      "gold",
      "stars",
      "sparkles",
      "arc",
      "scatter",
      "glitter"
    ],
    "aliases": [
      "звёздная золотая россыпь",
      "golden stardust divider"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "golden-star-garland-with-burgundy-bows",
    "source": "original-assets/decorations/golden-star-garland-with-burgundy-bows.png",
    "src": "decorations/golden-star-garland-with-burgundy-bows.webp",
    "name": {
      "ru": "Гирлянда золотых звёзд с бордовыми бантами",
      "en": "Golden star garland with burgundy bows"
    },
    "category": "garlands",
    "subcategory": "garlands-stars",
    "tags": [
      "гирлянда",
      "золотые звёзды",
      "подвески",
      "бордовые банты",
      "нить"
    ],
    "tagsEn": [
      "garland",
      "golden stars",
      "hanging ornaments",
      "burgundy bows",
      "string"
    ],
    "aliases": [
      "звёздная праздничная подвеска",
      "hanging star bunting"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "golden-watercolour-eight-point-starburst",
    "source": "original-assets/decorations/golden-watercolour-eight-point-starburst.png",
    "src": "decorations/golden-watercolour-eight-point-starburst.webp",
    "name": {
      "ru": "Золотая восьмиконечная звезда",
      "en": "Golden watercolor eight-point starburst"
    },
    "category": "stars",
    "subcategory": "stars-golden",
    "tags": [
      "звезда",
      "восемь лучей",
      "золото",
      "сияние",
      "акварель"
    ],
    "tagsEn": [
      "star",
      "eight points",
      "gold",
      "starburst",
      "watercolor"
    ],
    "aliases": [
      "восьмилучевая золотая звёздочка",
      "golden radiant star"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "golden-watercolour-star",
    "source": "original-assets/decorations/golden-watercolour-star.png",
    "src": "decorations/golden-watercolour-star.webp",
    "name": {
      "ru": "Объёмная золотая пятиконечная звезда",
      "en": "Faceted golden five-point watercolor star"
    },
    "category": "stars",
    "subcategory": "stars-golden",
    "tags": [
      "звезда",
      "пять лучей",
      "золото",
      "грани",
      "объём",
      "акварель"
    ],
    "tagsEn": [
      "star",
      "five points",
      "gold",
      "faceted",
      "dimensional",
      "watercolor"
    ],
    "aliases": [
      "золотая рождественская звёздочка",
      "gold Christmas star"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "ornamental-christmas-pinecone-divider",
    "source": "original-assets/decorations/ornamental-christmas-pinecone-divider.png",
    "src": "decorations/ornamental-christmas-pinecone-divider.webp",
    "name": {
      "ru": "Орнаментальный разделитель с шишками и бантом",
      "en": "Ornamental divider with pine cones and a bow"
    },
    "category": "lines",
    "subcategory": "lines-ornamental",
    "tags": [
      "разделитель",
      "виньетка",
      "завитки",
      "шишки",
      "хвоя",
      "ягоды",
      "бордовый бант",
      "золото"
    ],
    "tagsEn": [
      "divider",
      "vignette",
      "scrolls",
      "pine cones",
      "evergreen",
      "berries",
      "burgundy bow",
      "gold"
    ],
    "aliases": [
      "рождественский хвойный разделитель",
      "pinecone Christmas flourish"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "ornate-burgundy-and-sage-snowflake-ornament",
    "source": "original-assets/decorations/ornate-burgundy-and-sage-snowflake-ornament.png",
    "src": "decorations/ornate-burgundy-and-sage-snowflake-ornament.webp",
    "name": {
      "ru": "Ажурная снежинка в бордовых и шалфейных тонах",
      "en": "Ornate burgundy and sage snowflake"
    },
    "category": "snowflakes",
    "subcategory": "snowflakes-ornamental",
    "tags": [
      "снежинка",
      "ажур",
      "бордовый",
      "шалфейный",
      "золото",
      "ягоды",
      "листья"
    ],
    "tagsEn": [
      "snowflake",
      "ornate",
      "burgundy",
      "sage",
      "gold",
      "berries",
      "leaves"
    ],
    "aliases": [
      "нарядная растительная снежинка",
      "botanical winter snowflake"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "ornate-golden-compass-star",
    "source": "original-assets/decorations/ornate-golden-compass-star.png",
    "src": "decorations/ornate-golden-compass-star.webp",
    "name": {
      "ru": "Золотая вытянутая звезда-роза ветров",
      "en": "Elongated golden compass star"
    },
    "category": "stars",
    "subcategory": "stars-ornamental",
    "tags": [
      "звезда",
      "золото",
      "восемь лучей",
      "роза ветров",
      "грани",
      "сияние"
    ],
    "tagsEn": [
      "star",
      "gold",
      "eight points",
      "compass rose",
      "facets",
      "radiance"
    ],
    "aliases": [
      "золотая путеводная звезда",
      "ornate compass starburst"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "ornate-holly-berry-snowflake",
    "source": "original-assets/decorations/ornate-holly-berry-snowflake.png",
    "src": "decorations/ornate-holly-berry-snowflake.webp",
    "name": {
      "ru": "Снежинка из листьев падуба и красных ягод",
      "en": "Ornate holly leaf and berry snowflake"
    },
    "category": "snowflakes",
    "subcategory": "snowflakes-ornamental",
    "tags": [
      "снежинка",
      "падуб",
      "красные ягоды",
      "кремовый",
      "золото",
      "листья"
    ],
    "tagsEn": [
      "snowflake",
      "holly",
      "red berries",
      "ivory",
      "gold",
      "leaves"
    ],
    "aliases": [
      "растительная рождественская снежинка",
      "holly berry winter ornament"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "rustic-linen-ribbon-bow",
    "source": "original-assets/decorations/rustic-linen-ribbon-bow.png",
    "src": "decorations/rustic-linen-ribbon-bow.webp",
    "name": {
      "ru": "Кремовый бант из льняной ленты",
      "en": "Rustic ivory linen ribbon bow"
    },
    "category": "ribbons",
    "subcategory": "ribbons-bows",
    "tags": [
      "бант",
      "лента",
      "лён",
      "кремовый",
      "натуральная ткань",
      "рустик"
    ],
    "tagsEn": [
      "bow",
      "ribbon",
      "linen",
      "ivory",
      "natural fabric",
      "rustic"
    ],
    "aliases": [
      "светлый тканевый бантик",
      "natural linen bow"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "vintage-burgundy-velvet-bow",
    "source": "original-assets/decorations/vintage-burgundy-velvet-bow.png",
    "src": "decorations/vintage-burgundy-velvet-bow.webp",
    "name": {
      "ru": "Винтажный бордовый бархатный бант",
      "en": "Vintage burgundy velvet bow"
    },
    "category": "ribbons",
    "subcategory": "ribbons-bows",
    "tags": [
      "бант",
      "бархат",
      "бордовый",
      "лента",
      "винтаж",
      "складки"
    ],
    "tagsEn": [
      "bow",
      "velvet",
      "burgundy",
      "ribbon",
      "vintage",
      "folds"
    ],
    "aliases": [
      "красный бархатный бантик",
      "classic velvet bow"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "watercolour-berry-and-leaf-sprig",
    "source": "original-assets/decorations/watercolour-berry-and-leaf-sprig.png",
    "src": "decorations/watercolour-berry-and-leaf-sprig.webp",
    "name": {
      "ru": "Веточка с белыми ягодами и зелёными листьями",
      "en": "Sprig with white berries and green leaves"
    },
    "category": "berries",
    "subcategory": "berries-sprigs",
    "tags": [
      "веточка",
      "белые ягоды",
      "зелёные листья",
      "растения",
      "акварель"
    ],
    "tagsEn": [
      "sprig",
      "white berries",
      "green leaves",
      "botanical",
      "watercolor"
    ],
    "aliases": [
      "нежная веточка с белыми ягодами",
      "white berry foliage"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "watercolour-cedar-sprig-on-transparent-background",
    "source": "original-assets/decorations/watercolour-cedar-sprig-on-transparent-background.png",
    "src": "decorations/watercolour-cedar-sprig-on-transparent-background.webp",
    "name": {
      "ru": "Плоская хвойная веточка",
      "en": "Flat evergreen foliage sprig"
    },
    "category": "evergreen",
    "subcategory": "evergreen-sprigs",
    "tags": [
      "веточка",
      "хвоя",
      "зелёный",
      "плоская хвоя",
      "акварель"
    ],
    "tagsEn": [
      "sprig",
      "evergreen",
      "green",
      "flat foliage",
      "watercolor"
    ],
    "aliases": [
      "зелёная хвойная лапка",
      "cedar foliage sprig"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "watercolour-christmas-evergreen-corner",
    "source": "original-assets/decorations/watercolour-christmas-evergreen-corner.png",
    "src": "decorations/watercolour-christmas-evergreen-corner.webp",
    "name": {
      "ru": "Хвойный уголок с шишками и ягодами",
      "en": "Evergreen corner with pine cones and berries"
    },
    "category": "frames",
    "subcategory": "frames-corners",
    "tags": [
      "уголок",
      "рамка",
      "хвоя",
      "шишки",
      "красные ягоды",
      "рождество"
    ],
    "tagsEn": [
      "corner",
      "frame",
      "evergreen",
      "pine cones",
      "red berries",
      "christmas"
    ],
    "aliases": [
      "рождественский еловый угол",
      "pine and berry corner decoration"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "watercolour-christmas-garland-with-glowing-bulbs",
    "source": "original-assets/decorations/watercolour-christmas-garland-with-glowing-bulbs.png",
    "src": "decorations/watercolour-christmas-garland-with-glowing-bulbs.webp",
    "name": {
      "ru": "Гирлянда тёплых лампочек с красными бантами",
      "en": "Glowing warm bulb garland with red bows"
    },
    "category": "garlands",
    "subcategory": "garlands-lights",
    "tags": [
      "гирлянда",
      "лампочки",
      "тёплый свет",
      "красные банты",
      "нить",
      "праздник"
    ],
    "tagsEn": [
      "garland",
      "bulbs",
      "warm light",
      "red bows",
      "string",
      "festive"
    ],
    "aliases": [
      "рождественские огоньки",
      "Christmas fairy lights"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "watercolour-christmas-garland-with-velvet-bow",
    "source": "original-assets/decorations/watercolour-christmas-garland-with-velvet-bow.png",
    "src": "decorations/watercolour-christmas-garland-with-velvet-bow.webp",
    "name": {
      "ru": "Хвойная гирлянда с шишками и бархатным бантом",
      "en": "Evergreen garland with pine cones and a velvet bow"
    },
    "category": "garlands",
    "subcategory": "garlands-evergreen",
    "tags": [
      "гирлянда",
      "хвоя",
      "шишки",
      "красные ягоды",
      "бархатный бант",
      "ветви"
    ],
    "tagsEn": [
      "garland",
      "evergreen",
      "pine cones",
      "red berries",
      "velvet bow",
      "branches"
    ],
    "aliases": [
      "праздничная еловая гирлянда",
      "Christmas greenery swag"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "watercolour-eight-point-christmas-star-ornament",
    "source": "original-assets/decorations/watercolour-eight-point-christmas-star-ornament.png",
    "src": "decorations/watercolour-eight-point-christmas-star-ornament.webp",
    "name": {
      "ru": "Кремово-золотая звезда с растительным узором",
      "en": "Ivory and gold star with botanical ornament"
    },
    "category": "stars",
    "subcategory": "stars-ornamental",
    "tags": [
      "звезда",
      "восемь лучей",
      "кремовый",
      "золото",
      "ягоды",
      "растительный узор",
      "подвеска"
    ],
    "tagsEn": [
      "star",
      "eight points",
      "ivory",
      "gold",
      "berries",
      "botanical pattern",
      "hanging ornament"
    ],
    "aliases": [
      "нарядная рождественская звезда",
      "floral eight point ornament"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "watercolour-evergreen-sprig-on-transparent-background",
    "source": "original-assets/decorations/watercolour-evergreen-sprig-on-transparent-background.png",
    "src": "decorations/watercolour-evergreen-sprig-on-transparent-background.webp",
    "name": {
      "ru": "Зелёная хвойная веточка без украшений",
      "en": "Plain green evergreen sprig"
    },
    "category": "evergreen",
    "subcategory": "evergreen-sprigs",
    "tags": [
      "веточка",
      "хвоя",
      "зелёный",
      "иголки",
      "растения",
      "акварель"
    ],
    "tagsEn": [
      "sprig",
      "evergreen",
      "green",
      "needles",
      "botanical",
      "watercolor"
    ],
    "aliases": [
      "простая еловая веточка",
      "plain fir foliage"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "watercolour-holly-and-berry-corner-ornament",
    "source": "original-assets/decorations/watercolour-holly-and-berry-corner-ornament.png",
    "src": "decorations/watercolour-holly-and-berry-corner-ornament.webp",
    "name": {
      "ru": "Уголок из падуба и красных ягод",
      "en": "Holly and red berry corner ornament"
    },
    "category": "frames",
    "subcategory": "frames-corners",
    "tags": [
      "уголок",
      "рамка",
      "падуб",
      "красные ягоды",
      "листья",
      "растения"
    ],
    "tagsEn": [
      "corner",
      "frame",
      "holly",
      "red berries",
      "leaves",
      "botanical"
    ],
    "aliases": [
      "растительный рождественский угол",
      "holly foliage corner"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "watercolour-holly-berry-garland-with-red-bow",
    "source": "original-assets/decorations/watercolour-holly-berry-garland-with-red-bow.png",
    "src": "decorations/watercolour-holly-berry-garland-with-red-bow.webp",
    "name": {
      "ru": "Гирлянда падуба с ягодами и красным бантом",
      "en": "Holly berry garland with a red bow"
    },
    "category": "garlands",
    "subcategory": "garlands-botanical",
    "tags": [
      "гирлянда",
      "падуб",
      "ягоды",
      "зелёные листья",
      "красный бант",
      "ветви"
    ],
    "tagsEn": [
      "garland",
      "holly",
      "berries",
      "green leaves",
      "red bow",
      "branches"
    ],
    "aliases": [
      "ягодная рождественская гирлянда",
      "holly and ribbon swag"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "watercolour-pine-and-berry-sprig",
    "source": "original-assets/decorations/watercolour-pine-and-berry-sprig.png",
    "src": "decorations/watercolour-pine-and-berry-sprig.webp",
    "name": {
      "ru": "Хвойная веточка с красными ягодами",
      "en": "Evergreen sprig with red berries"
    },
    "category": "evergreen",
    "subcategory": "evergreen-sprigs",
    "tags": [
      "веточка",
      "хвоя",
      "красные ягоды",
      "иголки",
      "зелёный"
    ],
    "tagsEn": [
      "sprig",
      "evergreen",
      "red berries",
      "needles",
      "green"
    ],
    "aliases": [
      "хвойный пучок с ягодами",
      "pine and berry foliage"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "watercolour-pine-branch-with-cones",
    "source": "original-assets/decorations/watercolour-pine-branch-with-cones.png",
    "src": "decorations/watercolour-pine-branch-with-cones.webp",
    "name": {
      "ru": "Сосновая ветка с шишками",
      "en": "Pine branch with cones"
    },
    "category": "evergreen",
    "subcategory": "evergreen-sprigs",
    "tags": [
      "сосна",
      "ветка",
      "шишки",
      "длинные иголки",
      "зелёный",
      "хвоя"
    ],
    "tagsEn": [
      "pine",
      "branch",
      "cones",
      "long needles",
      "green",
      "evergreen"
    ],
    "aliases": [
      "сосновая лапка с шишками",
      "pinecone foliage branch"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "watercolour-red-berry-sprig",
    "source": "original-assets/decorations/watercolour-red-berry-sprig.png",
    "src": "decorations/watercolour-red-berry-sprig.webp",
    "name": {
      "ru": "Веточка с красными ягодами и листьями",
      "en": "Red berry and leaf sprig"
    },
    "category": "berries",
    "subcategory": "berries-sprigs",
    "tags": [
      "веточка",
      "красные ягоды",
      "зелёные листья",
      "растения",
      "акварель"
    ],
    "tagsEn": [
      "sprig",
      "red berries",
      "green leaves",
      "botanical",
      "watercolor"
    ],
    "aliases": [
      "зимняя ягодная веточка",
      "winter red berry twig"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "watercolour-rosehip-branch-arch",
    "source": "original-assets/decorations/watercolour-rosehip-branch-arch.png",
    "src": "decorations/watercolour-rosehip-branch-arch.webp",
    "name": {
      "ru": "Дуга из ветки шиповника с красными ягодами",
      "en": "Arch of rosehip branches with red berries"
    },
    "category": "frames",
    "subcategory": "frames-botanical-arcs",
    "tags": [
      "дуга",
      "рамка",
      "шиповник",
      "красные ягоды",
      "зелёные листья",
      "ветка"
    ],
    "tagsEn": [
      "arch",
      "frame",
      "rosehip",
      "red berries",
      "green leaves",
      "branch"
    ],
    "aliases": [
      "ягодная растительная арка",
      "rosehip foliage arch"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "watercolour-snowflake-ornament-with-cranberries",
    "source": "original-assets/decorations/watercolour-snowflake-ornament-with-cranberries.png",
    "src": "decorations/watercolour-snowflake-ornament-with-cranberries.webp",
    "name": {
      "ru": "Золотая снежинка с бордовыми ягодами",
      "en": "Golden snowflake ornament with cranberry berries"
    },
    "category": "snowflakes",
    "subcategory": "snowflakes-ornamental",
    "tags": [
      "снежинка",
      "золото",
      "кремовый",
      "бордовые ягоды",
      "листья",
      "ажур"
    ],
    "tagsEn": [
      "snowflake",
      "gold",
      "ivory",
      "cranberry berries",
      "leaves",
      "ornate"
    ],
    "aliases": [
      "ягодная золотая снежинка",
      "cranberry winter ornament"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
  {
    "id": "watercolour-snowflake-ornament-with-holly-accents",
    "source": "original-assets/decorations/watercolour-snowflake-ornament-with-holly-accents.png",
    "src": "decorations/watercolour-snowflake-ornament-with-holly-accents.webp",
    "name": {
      "ru": "Нарядная снежинка с падубом и ягодами",
      "en": "Ornate snowflake with holly and berries"
    },
    "category": "snowflakes",
    "subcategory": "snowflakes-ornamental",
    "tags": [
      "снежинка",
      "падуб",
      "ягоды",
      "золото",
      "кремовый",
      "листья",
      "ажур"
    ],
    "tagsEn": [
      "snowflake",
      "holly",
      "berries",
      "gold",
      "ivory",
      "leaves",
      "ornate"
    ],
    "aliases": [
      "рождественская ажурная снежинка",
      "holly accented snowflake"
    ],
    "style": "vintage-watercolor",
    "background": "transparent"
  },
];
