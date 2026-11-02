/** Page decoration is separate from the printable illustration library. */
export const templateHeroArtwork = {
  left: {
    id: 'templates-hero-left',
    source: 'assets/backgrounds/snowy-lantern-and-evergreen-berries.png',
    src: 'site/snowy-lantern-and-evergreen-berries.webp',
    width: 1536, height: 1024,
  },
  right: {
    id: 'templates-hero-right',
    source: 'assets/backgrounds/snowy-forest-cottage-glow.png',
    src: 'site/snowy-forest-cottage-glow.webp',
    width: 1536, height: 1024,
  },
  sprig: {
    id: 'templates-hero-sprig',
    source: 'assets/backgrounds/holly-berry-sprig.png',
    src: 'site/holly-berry-sprig.webp',
    width: 2172, height: 724,
  },
} as const;

export const templateCoverArtwork = [
  { id: 'template-woodland-cover', source: 'assets/artwork-placeholders/coniferous-fairytale.png', src: 'site/coniferous-fairytale.webp', width: 1536, height: 1024 },
  { id: 'template-winter-cover', source: 'assets/artwork-placeholders/winter-stories.png', src: 'site/winter-stories.webp', width: 1536, height: 1024 },
  { id: 'template-vintage-cover', source: 'assets/artwork-placeholders/vintage-celebration.png', src: 'site/vintage-celebration.webp', width: 1536, height: 1024 },
  { id: 'template-forest-friends-cover', source: 'assets/artwork-placeholders/forest-friends.png', src: 'site/forest-friends.webp', width: 1536, height: 1024 },
  { id: 'template-warm-gifts-cover', source: 'assets/artwork-placeholders/warm-gifts.png', src: 'site/warm-gifts.webp', width: 1536, height: 1024 },
  { id: 'template-classic-christmas-cover', source: 'assets/artwork-placeholders/classic-christmas.png', src: 'site/classic-christmas.webp', width: 1536, height: 1024 },
] as const;

export const pageArtwork = [...Object.values(templateHeroArtwork), ...templateCoverArtwork];
