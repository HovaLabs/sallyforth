import {describe, expect, it} from 'vitest';
import type {HomeFeaturedQuery, HomeProductCardFragment} from 'storefrontapi.generated';
import {FEATURED_LIMIT, featuredProducts} from '~/components/home/featuredProducts';

const product = (id: string): HomeProductCardFragment =>
  ({id, handle: id, title: id} as HomeProductCardFragment);

const query = (
  curated: HomeProductCardFragment[],
  recent: HomeProductCardFragment[],
): HomeFeaturedQuery =>
  ({
    collection: {id: 'c', handle: 'frontpage', title: 'Home page', products: {nodes: curated}},
    recent: {nodes: recent},
  } as unknown as HomeFeaturedQuery);

const ids = (products: HomeProductCardFragment[]) => products.map((p) => p.id);

describe('featuredProducts', () => {
  it('fills a sparse curated collection with the rest of the store', () => {
    // The real bug: "frontpage" holds only 1 product but the store has more.
    const data = query([product('radish')], [product('radish'), product('beet'), product('carrot')]);
    expect(ids(featuredProducts(data))).toEqual(['radish', 'beet', 'carrot']);
  });

  it('keeps the curated order first and never duplicates a product', () => {
    const data = query([product('radish'), product('beet')], [product('beet'), product('radish'), product('carrot')]);
    expect(ids(featuredProducts(data))).toEqual(['radish', 'beet', 'carrot']);
  });

  it('falls back to store products when the collection is empty', () => {
    const data = query([], [product('beet'), product('carrot')]);
    expect(ids(featuredProducts(data))).toEqual(['beet', 'carrot']);
  });

  it('caps the rail at FEATURED_LIMIT', () => {
    const many = Array.from({length: 12}, (_, i) => product(`p${i}`));
    expect(featuredProducts(query([], many))).toHaveLength(FEATURED_LIMIT);
  });

  it('returns an empty list when there is no data', () => {
    expect(featuredProducts(null)).toEqual([]);
  });
});
