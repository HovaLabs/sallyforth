import {useEffect, useRef} from 'react';
import {ART, SHOP} from '~/config/shop';
import {heroProgress} from '~/lib/parallax';

export function Hero() {
  const hero = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = hero.current;
    if (!el) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      el.toggleAttribute('data-scrolled', y > 12);
      const progress = reducedMotion.matches ? 0 : heroProgress(y, el.getBoundingClientRect().bottom + y);
      el.style.setProperty('--sun-scale', String(1 + progress * 1.1));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, {passive: true});
    window.addEventListener('resize', schedule);
    reducedMotion.addEventListener('change', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reducedMotion.removeEventListener('change', schedule);
    };
  }, []);

  return (
    <section id="hero" className="sf-hero" ref={hero} aria-label={SHOP.tagline}>
      <div className="sf-hero__sky" aria-hidden="true">
        <div className="sf-hero__clouds sf-hero__clouds--far" />
        <div className="sf-hero__clouds sf-hero__clouds--near" />
      </div>
      <div className="sf-hero__garden" aria-hidden="true">
        <div className="sf-hero__sun">
          <img className="sf-hero__sun-disc" src="/art/hero-sun.webp" width={640} height={640} alt="" />
        </div>
        <img className="sf-hero__landscape" src="/art/hero-sunrise-garden.webp" width={1983} height={793} alt="" loading="eager" fetchPriority="high" />
      </div>
      <div className="sf-hero__text">
        <div className="sf-hero__eyebrow">ART · GARDENS · STORIES</div>
        <div className="sf-hero__wordmark">
          <h1><img src={ART.wordmarkScript} alt={SHOP.name} /></h1>
          <img src={ART.snail} alt="" className="sf-hero__snail" />
          <p className="sf-hero__tagline">Into the garden of creativity</p>
        </div>
      </div>
    </section>
  );
}
