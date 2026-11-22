import type {Route} from './+types/[sitemap.xml]';
import {getSitemapIndex} from '@shopify/hydrogen';
import {contentSitemapPaths, sitemapTypes} from '~/lib/sitemap.server';
import {siteOrigin} from '~/lib/site-origin';

export async function loader({
  request,
  context: {storefront, env},
}: Route.LoaderArgs) {
  const [articleMaps, pageMaps] = await Promise.all([
    contentSitemapPaths(storefront, 'articles'),
    contentSitemapPaths(storefront, 'pages'),
  ]);
  return getSitemapIndex({
    storefront,
    request: new Request(siteOrigin(request, env)),
    types: [...sitemapTypes],
    customChildSitemaps: ['/sitemap/site/1.xml', ...pageMaps, ...articleMaps],
  });
}
