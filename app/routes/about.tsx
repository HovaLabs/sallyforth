import type {Route} from './+types/about';
import aboutStyles from '~/styles/about.css?url';
import {ART, SHOP} from '~/config/shop';

export const meta: Route.MetaFunction = () => [
  {title: `About — ${SHOP.name}`},
  {
    name: 'description',
    content:
      'It started in my little patch of the family garden. A letter about the beginnings of SallyForth.',
  },
];

export const links: Route.LinksFunction = () => [{rel: 'stylesheet', href: aboutStyles}];

export default function About() {
  return (
    <div className="sf-about">
      <article className="sf-letter" aria-labelledby="about-title">
        <header className="sf-letter__header">
          <div>
            <p className="sf-letter__eyebrow">ABOUT SALLYFORTH</p>
            <h1 id="about-title">From my little patch</h1>
            <p className="sf-letter__subtitle">A letter from the garden</p>
          </div>
          <div className="sf-letter__stamp" aria-hidden="true">
            <img src={ART.peapod} alt="" width="68" height="76" />
            <span>SALLYFORTH</span>
          </div>
        </header>
        <div className="sf-letter__body">
          <p>
            It started in my little patch of the family garden. My Daddy gave me
            this to make sure that I understood how to plant, care for, and
            harvest tomatoes, radishes, beets, carrots, and turnips. There were
            his favorites. I threw some flowering sweet pea seeds in for my birth
            flower. Loved the scent; it made me feel so special, like wearing my
            mom’s perfume.
          </p>
          <p>
            I am in my overalls, a sweet sun hat approved by my mom, and hauling
            a trowel that I still have today. Digging into the dark, fresh soil,
            finding critters (snails and worms), and burying my seeds from my
            pockets made a perfect way for my Daddy’s life lessons.
          </p>
        </div>
        <footer className="sf-letter__closing">
          <p>SallyForth begins</p>
          <img src={ART.snail} alt="" width="76" height="56" />
        </footer>
      </article>
    </div>
  );
}
