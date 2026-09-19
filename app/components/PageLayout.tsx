import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {AsideProvider} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Frame} from '~/components/Frame';
import {Header} from '~/components/Header';
import {MobileMenu} from '~/components/MobileMenu';

interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  publicStoreDomain: string;
  children?: React.ReactNode;
}

export function PageLayout({cart, children = null}: PageLayoutProps) {
  return (
    <AsideProvider>
      <MobileMenu />
      <a className="sf-skip" href="#main">Skip to content</a>
      <Frame>
        <Header cart={cart} />
        <main id="main">{children}</main>
        <Footer />
      </Frame>
    </AsideProvider>
  );
}
