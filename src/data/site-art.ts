/** Page decoration is separate from the printable illustration library. */
export const homeHeroArtwork = {
  id: 'home-hero-products', source: 'assets/site/hero/products-set.png', src: 'site/products-set.webp', width: 1536, height: 1024,
} as const;

export const templateHeroArtwork = {
  left: {
    id: 'templates-hero-left',
    source: 'assets/site/hero/snowy-lantern-and-evergreen-berries.png',
    src: 'site/snowy-lantern-and-evergreen-berries.webp',
    width: 1536, height: 1024,
  },
  right: {
    id: 'templates-hero-right',
    source: 'assets/site/hero/snowy-forest-cottage-glow.png',
    src: 'site/snowy-forest-cottage-glow.webp',
    width: 1536, height: 1024,
  },
  sprig: {
    id: 'templates-hero-sprig',
    source: 'assets/site/hero/holly-berry-sprig.png',
    src: 'site/holly-berry-sprig.webp',
    width: 2172, height: 724,
  },
} as const;

export const templateCoverArtwork = [
  { id: 'template-woodland-cover', source: 'assets/site/templates/coniferous-fairytale.png', src: 'site/coniferous-fairytale.webp', width: 1536, height: 1024 },
  { id: 'template-winter-cover', source: 'assets/site/templates/winter-stories.png', src: 'site/winter-stories.webp', width: 1536, height: 1024 },
  { id: 'template-vintage-cover', source: 'assets/site/templates/vintage-celebration.png', src: 'site/vintage-celebration.webp', width: 1536, height: 1024 },
  { id: 'template-forest-friends-cover', source: 'assets/site/templates/forest-friends.png', src: 'site/forest-friends.webp', width: 1536, height: 1024 },
  { id: 'template-warm-gifts-cover', source: 'assets/site/templates/warm-gifts.png', src: 'site/warm-gifts.webp', width: 1536, height: 1024 },
  { id: 'template-classic-christmas-cover', source: 'assets/site/templates/classic-christmas.png', src: 'site/classic-christmas.webp', width: 1536, height: 1024 },
] as const;

export const postcardTemplateArtwork = [
  { id: 'postcard-template-santa-cover', templateId: 'santa-christmas-a6-portrait', source: 'assets/site/templates/santa-christmas-postcard.jpg', src: 'site/santa-christmas-postcard.webp', width: 1536, height: 1024 },
  { id: 'postcard-template-elf-cover', templateId: 'elf-workshop-a6-landscape', source: 'assets/site/templates/elf-workshop-postcard.jpg', src: 'site/elf-workshop-postcard.webp', width: 1536, height: 1024 },
  { id: 'postcard-template-squirrels-cover', templateId: 'squirrel-christmas-square', source: 'assets/site/templates/squirrel-christmas-postcard.jpg', src: 'site/squirrel-christmas-postcard.webp', width: 1536, height: 1024 },
] as const;

export const aboutArtwork = [
  { id: 'about-hero-branch', source: 'assets/site/hero/branch-and-evergreen-berries.png', src: 'site/branch-and-evergreen-berries.webp', width: 951, height: 526 },
  { id: 'about-gift', source: 'assets/site/decorations/christmas-gift-box-with-pinecone.png', src: 'site/christmas-gift-box-with-pinecone.webp', width: 1536, height: 1024 },
  { id: 'about-feedback-envelope', source: 'assets/site/decorations/envelope-with-heart-and-holly.png', src: 'site/envelope-with-heart-and-holly.webp', width: 1536, height: 1024 },
] as const;

export const productArtwork = [
  { id: 'product-tags-cover', source: 'assets/site/products/advent-tags.png', src: 'site/advent-tags.webp', width: 1536, height: 1024 },
  { id: 'product-postcards-cover', source: 'assets/site/products/christmas-card.png', src: 'site/christmas-card.webp', width: 1536, height: 1024 },
  { id: 'product-stickers-cover', source: 'assets/site/products/sticker-with-evergreen-decor.png', src: 'site/sticker-with-evergreen-decor.webp', width: 1536, height: 1024 },
] as const;

export const brandArtwork = {
  id: 'workshop-logo', source: 'assets/site/branding/logo.svg', src: 'site/branding/logo.svg', width: 300, height: 300,
} as const;

export const helpStepArtwork = {
  template: { id: 'help-choose-template', source: 'assets/site/icons/help/choose-template.svg', src: 'site/icons/help/choose-template.svg', width: 324, height: 343 },
  edit: { id: 'help-edit-design', source: 'assets/site/icons/help/edit-design.svg', src: 'site/icons/help/edit-design.svg', width: 325, height: 300 },
  check: { id: 'help-check-result', source: 'assets/site/icons/help/check-result.svg', src: 'site/icons/help/check-result.svg', width: 342, height: 308 },
  print: { id: 'help-print-design', source: 'assets/site/icons/help/print-design.svg', src: 'site/icons/help/print-design.svg', width: 316, height: 311 },
} as const;

export const languageArtwork = {
  id: 'language-settings', source: 'assets/site/icons/language-settings-icon.svg', src: 'site/icons/language-settings-icon.svg', width: 300, height: 300,
} as const;

export const pageArtwork = [homeHeroArtwork, ...Object.values(templateHeroArtwork), ...templateCoverArtwork, ...postcardTemplateArtwork, ...aboutArtwork, ...productArtwork, brandArtwork, ...Object.values(helpStepArtwork), languageArtwork];
