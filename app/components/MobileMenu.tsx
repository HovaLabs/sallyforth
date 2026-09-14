import {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router';
import {useAside} from '~/components/Aside';
import {CartIcon} from '~/components/Header';
import {ART, NAV_LINKS} from '~/config/shop';

const MENU_ART: Array<{src: string; style: React.CSSProperties}> = [
  {src: ART.radishB, style: {right: '-160px', top: '-40px', width: 420, transform: 'rotate(200deg)'}},
  {src: ART.radishB, style: {left: '-160px', top: '-40px', width: 420, transform: 'scaleX(-1) rotate(200deg)'}},
  {src: ART.radishB, style: {left: '-200px', top: '38%', width: 460, transform: 'scaleX(-1) rotate(-110deg)'}},
  {src: ART.radishB, style: {left: '-150px', bottom: '-240px', width: 440, transform: 'scaleX(-1) rotate(-40deg)'}},
  {src: ART.radishA, style: {left: '30%', top: '-300px', width: 420, transform: 'rotate(180deg)'}},
  {src: ART.radishB, style: {right: '-200px', top: '38%', width: 460, transform: 'rotate(-110deg)'}},
  {src: ART.radishC, style: {left: '34%', bottom: '-320px', width: 440, transform: 'rotate(-6deg)'}},
  {src: ART.radishB, style: {right: '-150px', bottom: '-240px', width: 440, transform: 'rotate(-40deg)'}},
];

/** How long the menu stays mounted after close so the exit animation can play (see .sf-menu--closing). */
const MENU_EXIT_MS = 260;

/** Full-screen menu (≤760px). Opens via useAside().open('mobile'). */
export function MobileMenu() {
  const {type, open, close} = useAside();
  const isOpen = type === 'mobile';
  const panel = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const [closing, setClosing] = useState(false);
  const wasOpen = useRef(false);

  // Keep the panel mounted briefly after close so it can animate out.
  useEffect(() => {
    if (isOpen) {
      wasOpen.current = true;
      setClosing(false);
      return;
    }
    if (!wasOpen.current) return;
    wasOpen.current = false;
    setClosing(true);
    const timer = setTimeout(() => setClosing(false), MENU_EXIT_MS);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButton.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab' && panel.current) {
        const focusables = panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previouslyFocused?.focus();
    };
  }, [isOpen, close]);

  if (!isOpen && !closing) return null;

  // `--i` staggers each item's entrance (see .sf-menu__links > * in layout.css).
  const stagger = (i: number) => ({'--i': i} as React.CSSProperties);

  return (
    <div
      className={`sf-menu${closing ? ' sf-menu--closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      aria-hidden={closing || undefined}
      ref={panel}
    >
      {MENU_ART.map((a, i) => (
        // eslint-disable-next-line react/no-array-index-key -- MENU_ART is a static, never-reordered decorative list
        <img key={i} src={a.src} alt="" className="sf-menu__art" style={a.style} />
      ))}
      <button ref={closeButton} type="button" className="sf-menu__close" onClick={close} aria-label="Close menu">×</button>
      <div className="sf-menu__links">
        {NAV_LINKS.map((item, i) => (
          <Link key={item.to} to={item.to} onClick={close} className={`sf-pill sf-pill--${item.tone} sf-menu__pill`} style={stagger(i)}>
            {item.label}
          </Link>
        ))}
        <button type="button" className="sf-pill sf-pill--outline sf-menu__pill" onClick={() => open('search')} style={stagger(NAV_LINKS.length)}>
          Search
        </button>
        <Link to="/cart" onClick={close} className="sf-pill sf-pill--outline sf-menu__pill" style={stagger(NAV_LINKS.length + 1)}>
          <CartIcon /> Cart
        </Link>
      </div>
    </div>
  );
}
