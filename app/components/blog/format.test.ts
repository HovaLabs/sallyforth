import {describe, expect, it} from 'vitest';
import {excerptFromHtml, formatDate} from './format';

describe('excerptFromHtml', () => {
  it('strips tags and collapses whitespace', () => {
    expect(excerptFromHtml('<p>Hello   <em>garden</em></p>\n<p>friends</p>')).toBe('Hello garden friends');
  });

  it('decodes the common entities Shopify emits', () => {
    expect(excerptFromHtml('<p>Peas &amp; beans&nbsp;&rsquo;n&rsquo; things &quot;here&quot;</p>')).toBe('Peas & beans ’n’ things "here"');
  });

  it('cuts on a word boundary and appends an ellipsis', () => {
    const html = '<p>The quick brown fox jumps over the lazy dog again and again</p>';
    expect(excerptFromHtml(html, 20)).toBe('The quick brown fox…');
  });

  it('returns the whole text untouched when it fits', () => {
    expect(excerptFromHtml('<p>Short and sweet.</p>', 160)).toBe('Short and sweet.');
  });

  it('is empty for missing content', () => {
    expect(excerptFromHtml(null)).toBe('');
    expect(excerptFromHtml(undefined)).toBe('');
    expect(excerptFromHtml('<p></p>')).toBe('');
  });
});

describe('formatDate', () => {
  it('formats in UTC as an upper-cased long date', () => {
    expect(formatDate('2026-09-13T00:00:00Z')).toBe('SEPTEMBER 13, 2026');
  });
});
