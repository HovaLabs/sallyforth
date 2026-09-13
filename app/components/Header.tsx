import {Suspense} from 'react';
import {Await, Link, NavLink, useAsyncValue} from 'react-router';
import {type CartViewPayload, useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {ART, NAV_LINKS, SHOP} from '~/config/shop';

export function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.2L21 8H6.2" />
      <circle cx="10" cy="20" r="1.3" />
      <circle cx="17" cy="20" r="1.3" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

export function Header({cart}: {cart: Promise<CartApiQueryFragment | null>}) {
  const {open, type} = useAside();
  return (
    <header className="sf-header">
      <div className="sf-nav">
        <Link to="/" prefetch="intent" className="sf-nav__logo" aria-label={`${SHOP.name} home`}>
          <img src={ART.tomato} alt="" width="56" height="56" />
        </Link>
        <div className="sf-nav__right">
          <nav className="sf-nav__links" aria-label="Primary">
            {NAV_LINKS.map((item) => (
              <NavLink key={item.to} to={item.to} prefetch="intent" className={`sf-pill sf-pill--${item.tone} sf-nav__pill`}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="sf-nav__icons">
            <button type="button" className="sf-nav__icon" onClick={() => open('search')} aria-label="Search">
              <SearchIcon />
            </button>
            <CartToggle cart={cart} />
          </div>
          <button
            type="button"
            className="sf-burger"
            onClick={() => open('mobile')}
            aria-label="Menu"
            aria-haspopup="dialog"
            aria-expanded={type === 'mobile'}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  );
}

function CartBadge({count}: {count: number}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();
  return (
    <a
      href="/cart"
      className="sf-nav__icon"
      aria-label={`Cart (${count})`}
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {cart, prevCart, shop, url: window.location.href || ''} as CartViewPayload);
      }}
    >
      <CartIcon />
      {count > 0 ? <span className="sf-nav__count">{count}</span> : null}
    </a>
  );
}

export function CartToggle({cart}: {cart: Promise<CartApiQueryFragment | null>}) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}
