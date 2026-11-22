import {describe, expect, it} from 'vitest';
import {pageMeta} from './seo';
import {siteOrigin} from './site-origin';

const origin = 'https://store.example';
const matches = [{id: 'root', data: {siteOrigin: origin}}];
const page = {title: 'The Store', description: 'Garden-inspired goods.', card: 'shop' as const};

describe('storefront metadata', () => {
  it('uses a configured storefront domain for the canonical URL and artwork', () => {
    const request = new Request('https://preview.example/collections/all?utm_medium=social');
    expect(siteOrigin(request, {PUBLIC_SITE_URL: origin})).toBe(origin);
    expect(siteOrigin(request, {})).toBe('https://preview.example');
    const meta = pageMeta({matches, location: new URL(request.url)}, page);
    expect(meta).toContainEqual({tagName: 'link', rel: 'canonical', href: origin + '/collections/all'});
    expect(meta).toContainEqual({property: 'og:image', content: origin + '/social/shop.jpg'});
  });

  it('preserves pagination on listings and drops unrelated or tracking parameters', () => {
    const location = new URL('https://preview.example/blog?utm_source=mail&direction=previous&cursor=a%2Bb%3D');
    const meta = pageMeta({matches, location}, {...page, paginated: true});
    expect(meta).toContainEqual({property: 'og:url', content: origin + '/blog?direction=previous&cursor=a%2Bb%3D'});
    expect(pageMeta({matches, location}, page)).toContainEqual({property: 'og:url', content: origin + '/blog'});
  });

  it('keeps noindex pages and error responses out of the public entity graph', () => {
    const location = new URL(origin + '/cart');
    for (const meta of [
      pageMeta({matches, location}, {...page, noindex: true}),
      pageMeta({matches, location, error: new Error('Unavailable')}, page),
    ]) {
      expect(meta).toContainEqual({name: 'robots', content: 'noindex, follow'});
      expect(meta.some((tag) => 'script:ld+json' in tag)).toBe(false);
    }
  });
});
