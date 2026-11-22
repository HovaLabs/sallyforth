import type {Route} from './+types/about';
import aboutStyles from '~/styles/about.css?url';
import {ART, SHOP} from '~/config/shop';
import {pageMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = (args) => pageMeta(args, {
  title: 'About SallyForth — From My Little Patch',
  description: 'A letter about the family vegetable patch, flowering sweet peas, and lessons from a father that inspired SallyForth.',
  card: 'about',
  pageType: 'AboutPage',
});

export const links: Route.LinksFunction = () => [{rel: 'stylesheet', href: aboutStyles}];

export default function About() {
  return (
    <div className="sf-about">
      <div className="sf-about__stationery">
        <div className="sf-about__foliage" aria-hidden="true">
          <img className="sf-about__leaf sf-about__leaf--upper-left" src="/art/about-beet-leaves.webp" alt="" />
          <img className="sf-about__leaf sf-about__leaf--upper-right" src="/art/about-radish-leaves.webp" alt="" />
          <img className="sf-about__leaf sf-about__leaf--lower-left" src="/art/about-radish-leaves.webp" alt="" loading="lazy" />
          <img className="sf-about__leaf sf-about__leaf--lower-right" src="/art/about-beet-leaves.webp" alt="" loading="lazy" />
        </div>
        <article className="sf-letter" aria-labelledby="about-title">
          <header className="sf-letter__header">
            <div className="sf-letter__letterhead">
              <p className="sf-eyebrow">About SallyForth</p>
              <h1 id="about-title">From my little patch</h1>
              <p className="sf-letter__subtitle">A letter from the garden</p>
            </div>
            <div className="sf-letter__postage" aria-hidden="true">
              <div className="sf-letter__stamp">
                <img src={ART.radishA} alt="" />
                <span>SALLYFORTH</span>
              </div>
              <svg className="sf-letter__postmark" viewBox="0 0 76 28" fill="none">
                <path d="M1 6c16-9 30 8 47 1s21-4 26-2M1 13c16-9 30 8 47 1s21-4 26-2M2 20c16-9 30 8 47 1s21-4 26-2" stroke="currentColor" strokeLinecap="round" />
              </svg>
            </div>
          </header>
          <div className="sf-letter__body">
            <p className="sf-letter__greeting">Dear reader,</p>
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
            <div className="sf-letter__signature">
              <img src={ART.wordmarkScript} alt={SHOP.name} />
              <img src={ART.snail} alt="" />
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
}
