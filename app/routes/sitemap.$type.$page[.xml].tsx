import type {Route} from './+types/sitemap.$type.$page[.xml]';
import {getSitemap} from '@shopify/hydrogen';
import {blogPathForHandle} from '~/lib/blog';
import {contentSitemap, siteSitemap, sitemapTypes} from '~/lib/sitemap.server';
import {siteOrigin} from '~/lib/site-origin';

export async function loader({
  request,
  params,
  context: {storefront, env},
}: Route.LoaderArgs) {
  const origin = siteOrigin(request, env);
  if (params.type === 'site' && params.page === '1') return siteSitemap(storefront, origin);
  if (params.type === 'articles' || params.type === 'pages') {
    return contentSitemap(storefront, origin, params.type, params.page);
  }
  if (!sitemapTypes.some((type) => type === params.type) || !/^[1-9]\d*$/.test(params.page)) {
    throw new Response('Sitemap not found', {status: 404});
  }

  return getSitemap({
    storefront,
    request: new Request(origin),
    params,
    getLink: ({type, handle = ''}) =>
      origin + (type === 'blogs' ? blogPathForHandle(handle) : `/${type}/${encodeURIComponent(handle)}`),
  });
}
