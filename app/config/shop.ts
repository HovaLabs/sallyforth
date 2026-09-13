export const SHOP = {
  name: 'SallyForth',
  tagline: 'Growing families, together',
  handles: {
    featuredCollection: 'frontpage',
    blog: 'blog',
    almanac: 'bits-and-bobs-almanac',
    about: 'about',
  },
} as const;

export type NavTone = 'red' | 'rust' | 'green' | 'olive';

export const NAV_LINKS: ReadonlyArray<{label: string; to: string; tone: NavTone}> = [
  {label: 'Shop', to: '/collections/all', tone: 'red'},
  {label: 'About', to: '/about', tone: 'rust'},
  {label: 'Blog', to: '/blog', tone: 'green'},
  {label: 'Bits and Bobs Almanac', to: '/bits-and-bobs-almanac', tone: 'olive'},
];

export const BLOGS = {
  [SHOP.handles.blog]: {
    path: '/blog',
    title: 'The Blog',
    tagline: 'Stories, crafts, and garden notes from the SallyForth table.',
    art: ['tomato', 'carrot'] as [string, string],
  },
  [SHOP.handles.almanac]: {
    path: '/bits-and-bobs-almanac',
    title: 'Bits and Bobs Almanac',
    tagline: 'Small seasonal things worth knowing: bits, bobs, and what to plant next.',
    art: ['snail', 'radish-a'] as [string, string],
  },
} as const;

const art = (name: string) => `/art/${name}`;
export const ART = {
  tomato: art('tomato.webp'),
  carrot: art('carrot.webp'),
  peapod: art('peapod.webp'),
  beet: art('beet.webp'),
  eggplant: art('eggplant.webp'),
  blueberries: art('blueberries.webp'),
  radish2: art('radish2.webp'),
  radishA: art('radish-a.webp'),
  radishB: art('radish-b.webp'),
  radishC: art('radish-c.webp'),
  snail: art('snail.webp'),
  carrotBig: art('carrot-big.webp'),
  beetBig: art('beet-big.webp'),
  blogArtLeft: art('blog-art-left.webp'),
  blogTile: art('blog-tile.webp'),
  wordmarkScript: art('wordmark-script.svg'),
  wordmarkFooter: art('wordmark-footer.svg'),
} as const;
