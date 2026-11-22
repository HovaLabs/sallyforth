import type {Route} from './+types/[llms.txt]';
import {BLOGS, SHOP} from '~/config/shop';
import {siteOrigin} from '~/lib/site-origin';

export function loader({request, context}: Route.LoaderArgs) {
  const origin = siteOrigin(request, context.env);
  const guide = `# ${SHOP.name}

> SallyForth brings together garden-inspired art, crafts, and stories for families.

## About SallyForth

- [A letter about the family garden](${origin}/about)
- [Frequently asked questions about SallyForth and its weekly letter](${origin}/faq)

## Reading and shopping

- [${BLOGS[SHOP.handles.blog].title}](${origin}${BLOGS[SHOP.handles.blog].path})
- [${BLOGS[SHOP.handles.almanac].title}](${origin}${BLOGS[SHOP.handles.almanac].path})
- [The store and its current catalog](${origin}/collections/all)
- [Published store policies](${origin}/policies)
`;
  return new Response(guide, {
    headers: {'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600'},
  });
}
