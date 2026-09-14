import {useEffect, useRef} from 'react';
import {ART} from '~/config/shop';

/** Landing-page About hero scroll recipe, verbatim (p = min(1, scrollY / 600)). */
function beetTransform(p: number): string {
  return `translate(${-p * 160}px, ${p * 140}px) rotate(${10 - p * 8}deg)`;
}
function carrotTransform(p: number): string {
  return `translate(${p * 160}px, ${-p * 120}px) rotate(${-8 + p * 8}deg)`;
}

export function AboutHero() {
  const beet = useRef<HTMLImageElement>(null);
  const carrot = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let ticking = false;
    const apply = () => {
      ticking = false;
      const p = Math.min(1, (window.scrollY || 0) / 600);
      if (beet.current) beet.current.style.transform = beetTransform(p);
      if (carrot.current) carrot.current.style.transform = carrotTransform(p);
    };
    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(apply); }
    };
    window.addEventListener('scroll', onScroll, {passive: true});
    apply();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className="sf-about-hero" aria-labelledby="about-title">
      <img
        ref={beet}
        src={ART.beetBig}
        alt=""
        className="sf-about-hero__art sf-about-hero__art--beet"
        style={{transform: beetTransform(0)}}
      />
      <img
        ref={carrot}
        src={ART.carrotBig}
        alt=""
        className="sf-about-hero__art sf-about-hero__art--carrot"
        style={{transform: carrotTransform(0)}}
      />
      <div className="sf-about-hero__text">
        <div className="sf-about-hero__eyebrow">ABOUT US</div>
        <h1 id="about-title" className="sf-about-hero__title">Welcome to SallyForth</h1>
        <p className="sf-about-hero__lede">
          Where curiosity takes root and creativity blooms for kiddos and extended families…
        </p>
      </div>
    </section>
  );
}
