import {describe, expect, it} from 'vitest';
import {ART, BLOGS, NAV_LINKS} from '~/config/shop';

describe('shop config', () => {
  it('every blog art name is a key of ART', () => {
    for (const blog of Object.values(BLOGS)) {
      for (const name of blog.art) expect(ART).toHaveProperty(name);
    }
  });
  it('nav links use the short URLs', () => {
    expect(NAV_LINKS.map((l) => l.to)).toEqual(['/collections/all', '/about', '/blog', '/bits-and-bobs-almanac']);
  });
});
