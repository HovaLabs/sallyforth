import {type RouterContextProvider} from 'react-router';
import type {ArticleCardFragment} from 'storefrontapi.generated';
import {ARTICLE_CARD_FRAGMENT} from '~/lib/fragments-content';

/**
 * Up to `limit` other recent posts from the same blog, for the article page's
 * "More from the garden" strip. Non-critical: logs and returns [] on failure
 * rather than failing the page.
 */
export async function loadMoreArticles(
  {context}: {context: Readonly<RouterContextProvider>},
  blogHandle: string,
  excludeHandle: string | undefined,
  limit = 3,
): Promise<ArticleCardFragment[]> {
  try {
    const data = await context.storefront.query(MORE_ARTICLES_QUERY, {
      variables: {handle: blogHandle},
      cache: context.storefront.CacheShort(),
    });
    return (data.blog?.articles.nodes ?? []).filter((article) => article.handle !== excludeHandle).slice(0, limit);
  } catch (error) {
    console.error(error);
    return [];
  }
}

const MORE_ARTICLES_QUERY = `#graphql
  ${ARTICLE_CARD_FRAGMENT}
  query MoreArticles($handle: String!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    blog(handle: $handle) {
      id
      handle
      articles(first: 4, sortKey: PUBLISHED_AT, reverse: true) { nodes { ...ArticleCard } }
    }
  }
` as const;
