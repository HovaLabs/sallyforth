import {useEffect, useRef} from 'react';
import {ART, SHOP} from '~/config/shop';
import {heroProgress} from '~/lib/parallax';
import {wreathLayers} from './wreath';

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
      el.style.setProperty('--wreath-scale', String(1 + progress * 0.8));
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
      <div className="sf-hero__composition">
        <div className="sf-hero__wreath" aria-hidden="true">
          {wreathLayers.map(({name, pieces}) => (
            <div key={name} className={`sf-hero__wreath-layer sf-hero__wreath-layer--${name}`}>
              {pieces.map(({src, x, y, size, angle, stem}) => (
                <img
                  key={`${src}-${x}-${y}-${angle}`}
                  src={src}
                  alt=""
                  data-stem={stem}
                  style={{left: `${x}%`, top: `${y}%`, height: `${size}em`, rotate: `${angle}deg`}}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="sf-hero__text">
          <div className="sf-hero__eyebrow">ART · GARDENS · STORIES</div>
          <div className="sf-hero__wordmark">
            <h1>
              <img className="sf-hero__signature" src={ART.wordmarkScript} width={1942} height={885} fetchPriority="high" alt={SHOP.name} />
              <img src={ART.snail} alt="" className="sf-hero__snail" />
            </h1>
            <p className="sf-hero__tagline">Into the garden of creativity</p>
          </div>
        </div>
      </div>
    </section>
  );
}
