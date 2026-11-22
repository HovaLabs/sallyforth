import type {Route} from './+types/_index';
import {useLoaderData} from 'react-router';
import homeStyles from '~/styles/home.css?url';
import {Hero} from '~/components/home/Hero';
import {Marquee} from '~/components/home/Marquee';
import {SHOP} from '~/config/shop';
import {ARTICLE_CARD_FRAGMENT} from '~/lib/fragments-content';
import {BlogTeaser} from '~/components/home/BlogTeaser';
import {StoreCarousel} from '~/components/home/StoreCarousel';
import {pageMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = (args) => pageMeta(args, {
  title: 'SallyForth — Art, Gardens, and Stories',
  description: 'Shop hand-painted goods, find a craft for the kitchen table, and discover what to plant next in the Bits and Bobs Almanac at SallyForth.',
});

export const links: Route.LinksFunction = () => [{rel: 'stylesheet', href: homeStyles}];

export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;
  const featured = storefront
    .query(HOME_FEATURED_QUERY, {variables: {handle: SHOP.handles.featuredCollection}, cache: storefront.CacheShort()})
    .catch((error: Error) => { console.error(error); return null; });
  const articles = storefront
    .query(HOME_ARTICLES_QUERY, {variables: {handle: SHOP.handles.blog}, cache: storefront.CacheShort()})
    .catch((error: Error) => { console.error(error); return null; });
  return {featured, articles};
}

export default function Homepage() {
  const {featured, articles} = useLoaderData<typeof loader>();
  return (
    <div className="sf-home">
      <Hero />
      <Marquee />
      <BlogTeaser articles={articles} />
      <StoreCarousel featured={featured} />
    </div>
  );
}

const HOME_PRODUCT_CARD_FRAGMENT = `#graphql
  fragment HomeProductCard on Product {
    id
    handle
    title
    availableForSale
    featuredImage { id url altText width height }
    priceRange { minVariantPrice { amount currencyCode } }
    variants(first: 2) {
      nodes {
        id
        title
        availableForSale
        price { amount currencyCode }
        image { id url altText width height }
        selectedOptions { name value }
        product { handle title }
      }
    }
  }
` as const;

const HOME_FEATURED_QUERY = `#graphql
  ${HOME_PRODUCT_CARD_FRAGMENT}
  query HomeFeatured($handle: String!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      products(first: 8) { nodes { ...HomeProductCard } }
    }
    recent: products(first: 8, sortKey: BEST_SELLING) { nodes { ...HomeProductCard } }
  }
` as const;

const HOME_ARTICLES_QUERY = `#graphql
  ${ARTICLE_CARD_FRAGMENT}
  query HomeArticles($handle: String!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    blog(handle: $handle) {
      id
      handle
      articles(first: 3, sortKey: PUBLISHED_AT, reverse: true) { nodes { ...ArticleCard } }
    }
  }
` as const;
