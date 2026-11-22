import {Link} from 'react-router';
import {FooterGarden} from '~/components/FooterGarden';
import {NewsletterForm} from '~/components/NewsletterForm';
import {WaveDivider} from '~/components/WaveDivider';
import {ART, BLOGS, SHOP} from '~/config/shop';

export function Footer() {
  return (
    <footer className="sf-footer">
      <WaveDivider variant="footer" fill="white" />
      <div className="sf-footer__scene">
        <FooterGarden />
        <div className="sf-footgrid pad">
          <div id="footer-newsletter" className="sf-footer__invite">
            <h2>Join the garden party</h2>
            <NewsletterForm />
          </div>
          <div className="sf-footer__directory">
            <nav className="sf-footer__col" aria-label="Explore">
              <h3>Explore</h3>
              <Link to={BLOGS[SHOP.handles.blog].path}>The Blog</Link>
              <Link to={BLOGS[SHOP.handles.almanac].path}>Bits and Bobs Almanac</Link>
              <Link to="/collections/all">The Store</Link>
            </nav>
            <nav className="sf-footer__col" aria-label="Meet us">
              <h3>Meet us</h3>
              <Link to="/about">About</Link>
              <Link to="/faq">FAQ</Link>
              <Link to="/licensing">Licensing</Link>
              <Link to="/policies">Policies</Link>
            </nav>
            <nav className="sf-footer__col" aria-label="Connect">
              <h3>Connect</h3>
              <a href="https://www.instagram.com/" rel="noopener noreferrer" target="_blank">Instagram</a>
              <a href="https://www.pinterest.com/" rel="noopener noreferrer" target="_blank">Pinterest</a>
              <a href="#footer-newsletter" onClick={(event) => {
                const email = document.querySelector<HTMLInputElement>('#footer-newsletter input[type="email"]');
                if (email) {
                  event.preventDefault();
                  email.focus();
                }
              }}>Newsletter</a>
            </nav>
          </div>
        </div>
        <div className="sf-footer__signoff">
          <p className="sf-footer__quote">Keep a song in your heart and your shoes tied</p>
          <img src={ART.snail} alt="" className="sf-footer__snail" loading="lazy" />
        </div>
        <div className="sf-footcopy pad">
          <span>© {new Date().getFullYear()} {SHOP.name} · grown with love</span>
          <span><Link to="/policies/privacy-policy">Privacy</Link> · <Link to="/policies/terms-of-service">Terms</Link></span>
        </div>
      </div>
    </footer>
  );
}
