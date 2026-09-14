/** Upper-cased long date in UTC, matching the home blog teaser ("SEPTEMBER 13, 2026"). */
export function formatDate(iso: string): string {
  return new Date(iso)
    .toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'})
    .toUpperCase();
}

const ENTITIES: Array<[RegExp, string]> = [
  [/&nbsp;/g, ' '],
  [/&amp;/g, '&'],
  [/&quot;/g, '"'],
  [/&#39;|&apos;|&rsquo;/g, '’'],
  [/&lsquo;/g, '‘'],
  [/&ndash;/g, '–'],
  [/&mdash;/g, '—'],
];

/**
 * Plain-text excerpt from an article's HTML body, cut on a word boundary.
 * Used where the query only gives us `contentHtml` (no `excerpt` field).
 */
export function excerptFromHtml(html: string | null | undefined, max = 160): string {
  if (!html) return '';
  let text = html.replace(/<[^>]+>/g, ' ');
  for (const [pattern, replacement] of ENTITIES) text = text.replace(pattern, replacement);
  text = text.replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd() + '…';
}
