/** Page decoration is separate from the printable illustration library. */
export const homeHeroArtwork = {
  id: 'home-hero-products', source: 'original-assets/site/hero/products-set.png', src: 'site/products-set.webp', width: 1536, height: 1024,
} as const;

export const templateHeroArtwork = {
  tags: {
    id: 'templates-hero-tags',
    source: 'original-assets/site/hero/advent-tags-hero.png',
    src: 'site/advent-tags-hero.webp',
    width: 1121, height: 1024,
  },
  postcards: {
    id: 'templates-hero-postcards',
    source: 'original-assets/site/hero/postcards-hero.png',
    src: 'site/postcards-hero.webp',
    width: 1536, height: 1024,
  },
} as const;

export const templateCoverArtwork = [
  { id: 'template-woodland-cover', source: 'original-assets/site/templates/coniferous-fairytale.png', src: 'site/coniferous-fairytale.webp', width: 1536, height: 1024 },
  { id: 'template-winter-cover', source: 'original-assets/site/templates/winter-fairytale.png', src: 'site/winter-fairytale.webp', width: 1536, height: 1024 },
  { id: 'template-vintage-cover', source: 'original-assets/site/templates/tasty-christmas.png', src: 'site/tasty-christmas.webp', width: 1536, height: 1024 },
  { id: 'template-forest-friends-cover', source: 'original-assets/site/templates/forest-friends.png', src: 'site/forest-friends.webp', width: 1536, height: 1024 },
  { id: 'template-warm-gifts-cover', source: 'original-assets/site/templates/warm-gifts.png', src: 'site/warm-gifts.webp', width: 1536, height: 1024 },
  { id: 'template-classic-christmas-cover', source: 'original-assets/site/templates/classic-christmas.png', src: 'site/classic-christmas.webp', width: 1536, height: 1024 },
] as const;

export const postcardTemplateArtwork = [
  { id: 'postcard-blank-portrait-cover', templateId: 'blank-a6-portrait', source: 'original-assets/site/products/blank-a6-portrait-postcard.png', src: 'site/blank-a6-portrait-postcard.webp', width: 1536, height: 1024 },
  { id: 'postcard-blank-landscape-cover', templateId: 'blank-a6-landscape', source: 'original-assets/site/products/blank-a6-landscape-postcard.png', src: 'site/blank-a6-landscape-postcard.webp', width: 1536, height: 1024 },
  { id: 'postcard-blank-square-cover', templateId: 'blank-square', source: 'original-assets/site/products/blank-square-postcard.png', src: 'site/blank-square-postcard.webp', width: 1536, height: 1024 },
  { id: 'postcard-template-santa-cover', templateId: 'santa-christmas-a6-portrait', source: 'original-assets/site/templates/santa-christmas-postcard.jpg', src: 'site/santa-christmas-postcard.webp', width: 1536, height: 1024 },
  { id: 'postcard-template-elf-cover', templateId: 'elf-workshop-a6-landscape', source: 'original-assets/site/templates/elf-workshop-postcard.jpg', src: 'site/elf-workshop-postcard.webp', width: 1536, height: 1024 },
  { id: 'postcard-template-squirrels-cover', templateId: 'squirrel-christmas-square', source: 'original-assets/site/templates/squirrel-christmas-postcard.jpg', src: 'site/squirrel-christmas-postcard.webp', width: 1536, height: 1024 },
] as const;

export const aboutArtwork = [
  { id: 'about-hero-branch', source: 'original-assets/site/hero/branch-and-evergreen-berries.png', src: 'site/branch-and-evergreen-berries.webp', width: 951, height: 526 },
  { id: 'about-gift', source: 'original-assets/site/decorations/christmas-gift-box-with-pinecone.png', src: 'site/christmas-gift-box-with-pinecone.webp', width: 1536, height: 1024 },
  { id: 'about-feedback-envelope', source: 'original-assets/site/decorations/envelope-with-heart-and-holly.png', src: 'site/envelope-with-heart-and-holly.webp', width: 1536, height: 1024 },
] as const;

export const productArtwork = [
  { id: 'product-tags-cover', source: 'original-assets/site/products/advent-tags.png', src: 'site/advent-tags.webp', width: 1536, height: 1024 },
  { id: 'product-postcards-cover', source: 'original-assets/site/products/christmas-card.png', src: 'site/christmas-card.webp', width: 1536, height: 1024 },
  { id: 'product-stickers-cover', source: 'original-assets/site/products/sticker-with-evergreen-decor.png', src: 'site/sticker-with-evergreen-decor.webp', width: 1536, height: 1024 },
] as const;

export const ideasArtwork = {
  tags: { id: 'ideas-advent-tag-attachment', source: 'original-assets/site/ideas/advent-tag-gift-attachment.jpg', src: 'site/advent-tag-gift-attachment.webp', width: 1536, height: 1024 },
  postcards: { id: 'ideas-postcard-garland', source: 'original-assets/site/ideas/christmas-postcard-garland.png', src: 'site/christmas-postcard-garland.webp', width: 1536, height: 1024 },
} as const;

export const postcardIdeasArtwork = {
  framed: { id: 'idea-framed-postcard', source: 'original-assets/site/ideas/framed-christmas-postcard.jpg', src: 'site/framed-christmas-postcard.webp', width: 1024, height: 1024 },
  garland: { id: 'idea-postcard-garland-display', source: 'original-assets/site/ideas/christmas-postcard-garland-display.jpg', src: 'site/christmas-postcard-garland-display.webp', width: 1024, height: 1024 },
  ornaments: { id: 'idea-postcard-tree-ornaments', source: 'original-assets/site/ideas/christmas-postcard-tree-ornaments.jpg', src: 'site/christmas-postcard-tree-ornaments.webp', width: 1024, height: 1024 },
  placeCard: { id: 'idea-guest-place-card', source: 'original-assets/site/ideas/christmas-guest-place-card.jpg', src: 'site/christmas-guest-place-card.webp', width: 1024, height: 1024 },
  menu: { id: 'idea-dinner-menu-card', source: 'original-assets/site/ideas/christmas-dinner-menu-card.jpg', src: 'site/christmas-dinner-menu-card.webp', width: 1024, height: 1024 },
  bookmark: { id: 'idea-postcard-bookmark', source: 'original-assets/site/ideas/winter-postcard-bookmark.jpg', src: 'site/winter-postcard-bookmark.webp', width: 1024, height: 1024 },
} as const;

export const postcardIdeasHeroArtwork = {
  id: 'postcard-ideas-hero', source: 'original-assets/site/hero/snowmen-decorating-christmas-tree.png', src: 'site/snowmen-decorating-christmas-tree.webp', width: 1535, height: 1024,
} as const;

export const tagIdeasArtwork = {
  ribbon: { id: 'idea-tag-ribbon', source: 'original-assets/site/ideas/advent-tag-ribbon.jpg', src: 'site/advent-tag-ribbon.webp', width: 1024, height: 1024 },
  twine: { id: 'idea-tag-twine', source: 'original-assets/site/ideas/advent-tag-twine.jpg', src: 'site/advent-tag-twine.webp', width: 1024, height: 1024 },
  tape: { id: 'idea-tag-decorative-tape', source: 'original-assets/site/ideas/advent-tag-decorative-tape.jpg', src: 'site/advent-tag-decorative-tape.webp', width: 1024, height: 1024 },
  waxSeal: { id: 'idea-tag-wax-seal', source: 'original-assets/site/ideas/advent-tag-wax-seal.jpg', src: 'site/advent-tag-wax-seal.webp', width: 1024, height: 1024 },
  clothespin: { id: 'idea-tag-mini-clothespin', source: 'original-assets/site/ideas/advent-tag-mini-clothespin.jpg', src: 'site/advent-tag-mini-clothespin.webp', width: 1024, height: 1024 },
  clip: { id: 'idea-tag-binder-clip', source: 'original-assets/site/ideas/advent-tag-binder-clip.jpg', src: 'site/advent-tag-binder-clip.webp', width: 1024, height: 1024 },
  corners: { id: 'idea-tag-decorative-corners', source: 'original-assets/site/ideas/advent-tag-decorative-corners.jpg', src: 'site/advent-tag-decorative-corners.webp', width: 1536, height: 1024 },
  glue: { id: 'idea-tag-glued-to-wrapping', source: 'original-assets/site/ideas/advent-tag-glued-to-wrapping.jpg', src: 'site/advent-tag-glued-to-wrapping.webp', width: 1024, height: 1024 },
  ring: { id: 'idea-tag-metal-ring', source: 'original-assets/site/ideas/advent-tag-metal-ring.jpg', src: 'site/advent-tag-metal-ring.webp', width: 1121, height: 1024 },
  elastic: { id: 'idea-tag-elastic-band', source: 'original-assets/site/ideas/advent-tag-elastic-band.jpg', src: 'site/advent-tag-elastic-band.webp', width: 1024, height: 1024 },
} as const;

export const tagIdeasHeroArtwork = {
  id: 'tag-ideas-hero', source: 'original-assets/site/hero/festive-gift-box-with-snowman-tag.png', src: 'site/festive-gift-box-with-snowman-tag.webp', width: 1121, height: 1024,
} as const;

export const brandArtwork = {
  id: 'workshop-logo', source: 'original-assets/site/branding/logo.svg', src: 'site/branding/logo.svg', width: 300, height: 300,
} as const;

export const helpStepArtwork = {
  template: { id: 'help-choose-template', source: 'original-assets/site/icons/help/choose-template.svg', src: 'site/icons/help/choose-template.svg', width: 324, height: 343 },
  edit: { id: 'help-edit-design', source: 'original-assets/site/icons/help/edit-design.svg', src: 'site/icons/help/edit-design.svg', width: 325, height: 300 },
  check: { id: 'help-check-result', source: 'original-assets/site/icons/help/check-result.svg', src: 'site/icons/help/check-result.svg', width: 342, height: 308 },
  print: { id: 'help-print-design', source: 'original-assets/site/icons/help/print-design.svg', src: 'site/icons/help/print-design.svg', width: 316, height: 311 },
} as const;

export const languageArtwork = {
  id: 'language-settings', source: 'original-assets/site/icons/language-settings-icon.svg', src: 'site/icons/language-settings-icon.svg', width: 300, height: 300,
} as const;

export const pageArtwork = [homeHeroArtwork, ...Object.values(templateHeroArtwork), ...templateCoverArtwork, ...postcardTemplateArtwork, ...aboutArtwork, ...productArtwork, ...Object.values(ideasArtwork), ...Object.values(postcardIdeasArtwork), postcardIdeasHeroArtwork, ...Object.values(tagIdeasArtwork), tagIdeasHeroArtwork, brandArtwork, ...Object.values(helpStepArtwork), languageArtwork];
