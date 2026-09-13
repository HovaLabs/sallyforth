import {Link} from 'react-router';
import {NewsletterForm} from '~/components/NewsletterForm';
import {WaveDivider} from '~/components/WaveDivider';
import {ART, BLOGS, SHOP} from '~/config/shop';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="sf-footer foot">
      <WaveDivider variant="footer" fill="white" />
      <div className="sf-footgrid pad">
        <div>
          <div className="sf-footer__title">Join the garden party</div>
          <p className="sf-footer__blurb">One letter a week: a craft, a garden note, and a story to tell at dinner.</p>
          <NewsletterForm />
        </div>
        <div className="sf-footer__col">
          <div className="sf-eyebrow">Explore</div>
          <Link to={BLOGS[SHOP.handles.blog].path}>The Blog</Link>
          <Link to={BLOGS[SHOP.handles.almanac].path}>Bits and Bobs Almanac</Link>
          <Link to="/collections/all">The Store</Link>
        </div>
        <div className="sf-footer__col">
          <div className="sf-eyebrow">Meet us</div>
          <Link to="/about">About</Link>
          <Link to="/policies">Policies</Link>
        </div>
        <div className="sf-footer__col">
          <div className="sf-eyebrow">Connect</div>
          <a href="https://www.instagram.com/" rel="noopener noreferrer" target="_blank">Instagram</a>
          <a href="https://www.pinterest.com/" rel="noopener noreferrer" target="_blank">Pinterest</a>
          <a href="#newsletter" onClick={(e) => { e.preventDefault(); document.querySelector<HTMLInputElement>('.sf-newsletter__input')?.focus(); }}>Newsletter</a>
        </div>
      </div>
      <div className="sf-footcopy pad">
        <span>© {year} {SHOP.name} · grown with love</span>
        <span><Link to="/policies/privacy-policy">Privacy</Link> · <Link to="/policies/terms-of-service">Terms</Link></span>
      </div>
      <div className="sf-footer__wordmark">
        <img src={ART.wordmarkFooter} alt={SHOP.name} />
        <img src={ART.snail} alt="" className="sf-footer__snail" />
      </div>
    </footer>
  );
}
