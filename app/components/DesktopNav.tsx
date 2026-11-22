import {useCallback, useEffect, useRef} from 'react';
import {NavLink, useLocation} from 'react-router';
import {NAV_LINKS} from '~/config/shop';

export function DesktopNav() {
  const navRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const {pathname} = useLocation();

  const highlight = useCallback((link: HTMLAnchorElement | null) => {
    const nav = navRef.current;
    const pill = pillRef.current;
    if (!nav || !pill) return;
    nav.querySelectorAll<HTMLAnchorElement>('a').forEach((item) => {
      item.dataset.highlighted = String(item === link);
    });
    if (link) {
      pill.style.width = `${link.offsetWidth}px`;
      pill.style.transform = `translateX(${link.offsetLeft}px)`;
    }
    pill.style.opacity = link ? '1' : '0';
  }, []);

  const restore = useCallback(() => {
    const nav = navRef.current;
    highlight(nav?.querySelector<HTMLAnchorElement>('a:focus-visible') ?? nav?.querySelector<HTMLAnchorElement>('a.active') ?? null);
  }, [highlight]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const update = () => {
      highlight(nav.querySelector<HTMLAnchorElement>('a:hover') ?? nav.querySelector<HTMLAnchorElement>('a:focus-visible') ?? nav.querySelector<HTMLAnchorElement>('a.active'));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(nav);
    nav.querySelectorAll('a').forEach((link) => observer.observe(link));
    return () => observer.disconnect();
  }, [pathname, highlight]);

  return (
    <nav ref={navRef} className="sf-nav__links" aria-label="Primary" onMouseLeave={restore}>
      <span ref={pillRef} className="sf-nav__highlight" aria-hidden="true" />
      {NAV_LINKS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          prefetch="intent"
          className="sf-pill sf-nav__pill"
          onMouseEnter={(event) => highlight(event.currentTarget)}
          onFocus={(event) => highlight(event.currentTarget)}
          onBlur={restore}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
