import type {Route} from './+types/about';
import aboutStyles from '~/styles/about.css?url';
import {AboutHero} from '~/components/about/AboutHero';
import {AboutStory} from '~/components/about/AboutStory';
import {SHOP} from '~/config/shop';

export const meta: Route.MetaFunction = () => [
  {title: `About — ${SHOP.name}`},
  {
    name: 'description',
    content:
      'Where curiosity takes root and creativity blooms for kiddos and extended families — art, gardens, and stories from the SallyForth patch.',
  },
];

export const links: Route.LinksFunction = () => [{rel: 'stylesheet', href: aboutStyles}];

export default function About() {
  return (
    <div className="sf-about">
      <AboutHero />
      <AboutStory />
    </div>
  );
}
