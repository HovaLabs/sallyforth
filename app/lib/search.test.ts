import {expect, it} from 'vitest';
import type {RegularSearchQuery, SearchArticleFragment} from 'storefrontapi.generated';
import {regularSearchPreviews, urlWithTrackingParams} from './search';

const article: SearchArticleFragment = {
  __typename: 'Article',
  id: 'post',
  title: 'In the garden',
  handle: 'in-the-garden',
  blog: {handle: 'bits-and-bobs-almanac', title: 'Bits and Bobs Almanac'},
  publishedAt: '2026-09-13',
  contentHtml: '<p>Fresh peas.</p><p>In bloom.</p><img src="pea.jpg">',
};
const results: RegularSearchQuery = {
  products: {nodes: [], pageInfo: {hasNextPage: false, hasPreviousPage: false}},
  articles: {nodes: [article]},
  pages: {nodes: [{
    __typename: 'Page', id: 'page', title: 'Our story', handle: 'our-story', bodySummary: 'Our story',
    body: '<!-- <img src="/old.png"> --><img src="data:,"><img src="/bed.jpg?w=50&amp;h=40">',
  }]},
};
const requestUrl = 'https://example.com/search?q=garden';

it('uses published inline images and derives the excerpt from the article body', () => {
  const {articles, pages} = regularSearchPreviews(results, requestUrl);
  expect(articles.nodes[0]).toMatchObject({
    inlineImage: 'https://example.com/bits-and-bobs-almanac/pea.jpg',
    excerpt: 'Fresh peas. In bloom.',
  });
  expect(pages.nodes[0].inlineImage).toBe('https://example.com/bed.jpg?w=50&h=40');
  expect(articles.nodes[0]).not.toHaveProperty('contentHtml');
  expect(pages.nodes[0]).not.toHaveProperty('body');
});

it('prefers the featured image and authored excerpt and allows an entry with no image', () => {
  const image = {url: 'https://cdn.example.com/flowers.jpg'};
  const {articles} = regularSearchPreviews({
    ...results,
    articles: {nodes: [
      {...article, image, excerpt: 'Fresh from the garden.'},
      {...article, contentHtml: '<p>Text only.</p>'},
    ]},
  }, requestUrl);
  expect(articles.nodes[0]).toMatchObject({image, excerpt: 'Fresh from the garden.'});
  expect(articles.nodes[0].inlineImage).toBeUndefined();
  expect(articles.nodes[1].inlineImage).toBeUndefined();
});

it('preserves the original search term and Shopify tracking when a result is opened', () => {
  const term = 'peas & radishes';
  const path = urlWithTrackingParams({baseUrl: '/blog/garden', trackingParams: '_pos=1', term});
  const url = new URL(path, requestUrl);
  expect(url.searchParams.get('q')).toBe(term);
  expect(url.searchParams.get('_pos')).toBe('1');
});
