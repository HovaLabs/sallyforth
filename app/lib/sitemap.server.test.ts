import type {Storefront} from '@shopify/hydrogen';
import {expect, it, vi} from 'vitest';
import {contentSitemap, contentSitemapPaths, siteSitemap} from './sitemap.server';

it.each([true, false])('avoids duplicating a published "all" collection (published: %s)', async (published) => {
  const storefront = {
    CacheLong: vi.fn(),
    query: vi.fn().mockResolvedValue({shop: {}, allCollection: published ? {id: 'all'} : null}),
  } as unknown as Storefront;
  const response = await siteSitemap(storefront, 'https://example.com');
  expect((await response.text()).includes('<loc>https://example.com/collections/all</loc>')).toBe(!published);
});

it('follows article cursors and preserves distinct blog URLs for identical handles', async () => {
  const cursor = 'YWJj+/=';
  const storefront = {
    CacheLong: vi.fn(),
    query: vi.fn((_query: string, {variables}: {variables: {after: string | null}}) => {
      const firstPage = variables.after === null;
      if (!firstPage) expect(variables.after).toBe(cursor);
      return {articles: {
        nodes: [{handle: 'spring', blog: {handle: firstPage ? 'blog' : 'bits-and-bobs-almanac'}}],
        pageInfo: {hasNextPage: firstPage, endCursor: firstPage ? cursor : null},
      }};
    }),
  } as unknown as Storefront;

  const pages = await contentSitemapPaths(storefront, 'articles');
  expect(pages).toEqual(['/sitemap/articles/1.xml', '/sitemap/articles/after-YWJj%2B%2F%3D.xml']);
  const origin = 'https://example.com';
  const first = await contentSitemap(storefront, origin, 'articles', '1');
  const next = await contentSitemap(storefront, origin, 'articles', 'after-' + cursor);
  expect(await first.text()).toContain('<loc>https://example.com/blog/spring</loc>');
  expect(await next.text()).toContain('<loc>https://example.com/bits-and-bobs-almanac/spring</loc>');
});

it('continues past blank CMS pages and lists text and embedded content with their modification dates', async () => {
  const storefront = {
    CacheLong: vi.fn(),
    query: vi.fn((_query: string, {variables}: {variables: {after: string | null}}) => {
      const first = variables.after === null;
      const bodies = first ? {empty: '<p><br>&nbsp;<!-- comment --></p>'} : {
        'other-empty': '<div>&#160;\u200b</div>',
        text: '<p>A</p>', picture: '<img src="/peas.jpg">', contact: '<form><input></form>',
      };
      return {pages: {
        nodes: Object.entries(bodies).map(([handle, body]) => ({handle, body, updatedAt: '2026-11-01T00:00:00Z'})),
        pageInfo: {hasNextPage: first, endCursor: first ? 'next' : null},
      }};
    }),
  } as unknown as Storefront;
  expect(await contentSitemapPaths(storefront, 'pages')).toEqual(['/sitemap/pages/after-next.xml']);
  const response = await contentSitemap(storefront, 'https://example.com', 'pages', 'after-next');
  const xml = await response.text();
  for (const handle of ['text', 'picture', 'contact']) {
    expect(xml).toContain(`<loc>https://example.com/pages/${handle}</loc><lastmod>2026-11-01T00:00:00Z</lastmod>`);
  }
  expect(xml).not.toContain('other-empty');
});
