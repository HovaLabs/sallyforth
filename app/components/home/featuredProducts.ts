import type {HomeFeaturedQuery, HomeProductCardFragment} from 'storefrontapi.generated';

/** Most cards the home "Store" carousel will show. */
export const FEATURED_LIMIT = 8;

/**
 * Products for the home "Store" carousel.
 *
 * The curated `frontpage` collection leads (in the merchandiser's order), then
 * the rest of the store fills the rail so the carousel never renders a lonely
 * single card when the collection is sparse. De-duped by product id, capped at
 * {@link FEATURED_LIMIT}.
 */
export function featuredProducts(
  data: HomeFeaturedQuery | null | undefined,
): HomeProductCardFragment[] {
  const curated = data?.collection?.products.nodes ?? [];
  const recent = data?.recent?.nodes ?? [];
  const seen = new Set(curated.map((p) => p.id));
  const filler = recent.filter((p) => !seen.has(p.id));
  return [...curated, ...filler].slice(0, FEATURED_LIMIT);
}
