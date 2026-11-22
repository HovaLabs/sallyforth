import type {Storefront} from '@shopify/hydrogen';
import {blogPathForHandle} from '~/lib/blog';
import {hasPageContent} from '~/lib/page-content';

export const sitemapTypes = ['products', 'collections', 'blogs'] as const;
type ContentType = 'articles' | 'pages';
type Entry = {path: string; updatedAt?: string};

// Shopify's native sitemap omits CMS bodies and articles' parent blog handles.
async function contentPage(storefront: Storefront, type: ContentType, after: string | null) {
  const options = {variables: {after}, cache: storefront.CacheLong()};
  if (type === 'pages') {
    const {pages} = await storefront.query(PAGES_SITEMAP_QUERY, options);
    const entries = pages.nodes.filter(({body}) => hasPageContent(body)).map(({handle, updatedAt}) => ({
      path: `/pages/${encodeURIComponent(handle)}`, updatedAt,
    }));
    return {entries, pageInfo: pages.pageInfo};
  }
  const {articles} = await storefront.query(ARTICLE_SITEMAP_QUERY, options);
  const entries = articles.nodes.map(({blog, handle}) => ({
    path: `${blogPathForHandle(blog.handle)}/${encodeURIComponent(handle)}`,
  }));
  return {entries, pageInfo: articles.pageInfo};
}

export async function contentSitemapPaths(storefront: Storefront, type: ContentType) {
  const paths: string[] = [];
  let after: string | null = null;
  do {
    const {entries, pageInfo} = await contentPage(storefront, type, after);
    if (entries.length) {
      const page = after ? `after-${encodeURIComponent(after)}` : '1';
      paths.push(`/sitemap/${type}/${page}.xml`);
    }
    after = pageInfo.hasNextPage ? pageInfo.endCursor ?? null : null;
  } while (after);
  return paths;
}

export async function contentSitemap(storefront: Storefront, origin: string, type: ContentType, page: string) {
  if (page !== '1' && !/^after-[\w+/=-]+$/.test(page)) {
    throw new Response('Sitemap not found', {status: 404});
  }
  const {entries} = await contentPage(storefront, type, page === '1' ? null : page.slice(6));
  if (!entries.length) throw new Response('Sitemap not found', {status: 404});
  return urlSet(origin, entries);
}

export async function siteSitemap(storefront: Storefront, origin: string) {
  const {shop, allCollection} = await storefront.query(SITE_SITEMAP_QUERY, {cache: storefront.CacheLong()});
  const paths = ['/', '/about', '/faq', '/collections', '/blogs'];
  // A merchant-published "all" collection already has this URL in Shopify's collection sitemap.
  if (!allCollection) paths.push('/collections/all');
  const policies = [
    shop.privacyPolicy, shop.shippingPolicy, shop.termsOfService,
    shop.refundPolicy, shop.subscriptionPolicy,
  ];
  if (policies.some(Boolean)) paths.push('/policies');
  for (const policy of policies) {
    if (policy) paths.push(`/policies/${encodeURIComponent(policy.handle)}`);
  }
  return urlSet(origin, paths.map((path) => ({path})));
}

function urlSet(origin: string, entries: Entry[]) {
  const urls = entries.map(({path, updatedAt}) => {
    const location = new URL(path, origin).href.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
    const lastmod = updatedAt ? `<lastmod>${updatedAt}</lastmod>` : '';
    return `  <url><loc>${location}</loc>${lastmod}</url>`;
  });
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`,
    {headers: {'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600'}},
  );
}

const ARTICLE_SITEMAP_QUERY = `#graphql
  query ArticleSitemapPage($after: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    articles(first: 250, after: $after, sortKey: ID) {
      nodes { handle blog { handle } }
      pageInfo { endCursor hasNextPage }
    }
  }
` as const;

const PAGES_SITEMAP_QUERY = `#graphql
  query CmsSitemapPage($after: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    pages(first: 50, after: $after, sortKey: ID) {
      nodes { handle body updatedAt }
      pageInfo { endCursor hasNextPage }
    }
  }
` as const;

const SITE_SITEMAP_QUERY = `#graphql
  query SiteSitemap($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    allCollection: collection(handle: "all") { id }
    shop {
      privacyPolicy { handle }
      shippingPolicy { handle }
      termsOfService { handle }
      refundPolicy { handle }
      subscriptionPolicy { handle }
    }
  }
` as const;
