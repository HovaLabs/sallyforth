import type {
  PredictiveSearchQuery,
  RegularSearchQuery,
} from 'storefrontapi.generated';
import {excerptFromHtml} from '~/components/blog/format';
import {blogPathForHandle} from '~/lib/blog';

type ResultWithItems<Type extends 'predictive' | 'regular', Items> = {
  type: Type;
  term: string;
  error?: string;
  result: {total: number; items: Items};
};

export type RegularSearchReturn = ResultWithItems<
  'regular',
  ReturnType<typeof regularSearchPreviews>
>;
export type PredictiveSearchReturn = ResultWithItems<
  'predictive',
  NonNullable<PredictiveSearchQuery['predictiveSearch']>
>;

function visibleContent(html: string) {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|template)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
}

function inlineImageSrc(html: string, pageUrl: URL): string | undefined {
  for (const tag of html.match(/<img\b[^>]*>/gi) ?? []) {
    const match = /\ssrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s"'<>]+))/i.exec(tag);
    const src = (match?.[1] ?? match?.[2] ?? match?.[3])?.trim();
    if (!src) continue;

    try {
      const url = new URL(src.replace(/&amp;/gi, '&'), pageUrl);
      if (url.protocol === 'https:' || url.protocol === 'http:') return url.href;
    } catch {
      // A malformed URL can precede a usable image in the same entry.
    }
  }
}

/** Keep only the excerpts and images needed to render each search preview. */
export function regularSearchPreviews(
  {articles, pages, products}: RegularSearchQuery,
  requestUrl: string,
) {
  const articleNodes = articles.nodes.map(({contentHtml, ...article}) => {
    const html = visibleContent(contentHtml);
    const path = `${blogPathForHandle(article.blog.handle)}/${encodeURIComponent(article.handle)}`;
    return {
      ...article,
      excerpt: article.excerpt?.trim() || excerptFromHtml(html, 170),
      inlineImage: article.image ? undefined : inlineImageSrc(html, new URL(path, requestUrl)),
    };
  });
  const pageNodes = pages.nodes.map(({body, ...page}) => ({
    ...page,
    inlineImage: inlineImageSrc(visibleContent(body), new URL(`/pages/${page.handle}`, requestUrl)),
  }));

  return {products, articles: {nodes: articleNodes}, pages: {nodes: pageNodes}};
}

/**
 * Returns the empty state of a predictive search result to reset the search state.
 */
export function getEmptyPredictiveSearchResult(): PredictiveSearchReturn['result'] {
  return {
    total: 0,
    items: {
      articles: [],
      collections: [],
      products: [],
      pages: [],
      queries: [],
    },
  };
}

interface UrlWithTrackingParams {
  /** The base URL to which the tracking parameters will be appended. */
  baseUrl: string;
  /** The trackingParams returned by the Storefront API. */
  trackingParams?: string | null;
  /** Any additional query parameters to be appended to the URL. */
  params?: Record<string, string>;
  /** The search term to be appended to the URL. */
  term: string;
}

/**
 * A utility function that appends tracking parameters to a URL. Tracking parameters are
 * used internally by Shopify to enhance search results and admin dashboards.
 * @example
 * ```ts
 * const baseUrl = 'www.example.com';
 * const trackingParams = 'utm_source=shopify&utm_medium=shopify_app&utm_campaign=storefront';
 * const params = { foo: 'bar' };
 * const term = 'search term';
 * const url = urlWithTrackingParams({ baseUrl, trackingParams, params, term });
 * console.log(url);
 * // Output: 'https://www.example.com?foo=bar&q=search%20term&utm_source=shopify&utm_medium=shopify_app&utm_campaign=storefront'
 * ```
 */
export function urlWithTrackingParams({
  baseUrl,
  trackingParams,
  params: extraParams,
  term,
}: UrlWithTrackingParams) {
  let search = new URLSearchParams({
    ...extraParams,
    q: term,
  }).toString();

  if (trackingParams) {
    search = `${search}&${trackingParams}`;
  }

  return `${baseUrl}?${search}`;
}
