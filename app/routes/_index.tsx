import type {Route} from './+types/_index';
import homeStyles from '~/styles/home.css?url';
import {Hero} from '~/components/home/Hero';
import {Marquee} from '~/components/home/Marquee';
import {SHOP} from '~/config/shop';

export const meta: Route.MetaFunction = () => [
  {title: `${SHOP.name} — ${SHOP.tagline}`},
  {name: 'description', content: 'Art, gardens, and stories for growing families. Hand-painted goods, a blog, and the Bits and Bobs Almanac.'},
];

export const links: Route.LinksFunction = () => [{rel: 'stylesheet', href: homeStyles}];

export default function Homepage() {
  return (
    <div className="sf-home">
      <Hero />
      <Marquee />
    </div>
  );
}
