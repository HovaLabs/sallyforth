import {useEffect, useRef} from 'react';
import {Link} from 'react-router';
import {ART, SHOP} from '~/config/shop';
import {heroProgress} from '~/lib/parallax';
import {HERO_LAYERS, layerTransform} from '~/components/home/heroLayers';

export function Hero() {
  const hero = useRef<HTMLDivElement>(null);
  const layers = useRef<Array<HTMLImageElement | null>>([]);

  useEffect(() => {
    const el = hero.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let ticking = false;
    const apply = () => {
      ticking = false;
      const y = window.scrollY || 0;
      const p = heroProgress(y, el.getBoundingClientRect().bottom + y);
      HERO_LAYERS.forEach((layer, i) => {
        const img = layers.current[i];
        if (img) img.style.transform = layerTransform(layer.kind, p);
      });
    };
    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(apply); }
    };
    window.addEventListener('scroll', onScroll, {passive: true});
    apply();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section id="hero" className="sf-hero" ref={hero} aria-label={SHOP.tagline}>
      {HERO_LAYERS.map((layer, i) => (
        <img
          key={i} // eslint-disable-line react/no-array-index-key -- static list, never reordered
          ref={(node) => { layers.current[i] = node; }}
          src={layer.src}
          alt=""
          className="sf-hero__layer"
          style={{...layer.style, transform: layerTransform(layer.kind, 0)}}
        />
      ))}
      <div className="sf-hero__text">
        <div className="sf-hero__halo halo">
          <div className="sf-hero__eyebrow">ART · GARDENS · STORIES</div>
          <div className="sf-hero__wordmark">
            <div className="sf-hero__wordmark-inner">
              <img src={ART.wordmarkScript} alt={SHOP.name} />
              <img src={ART.snail} alt="" className="sf-hero__snail" />
              <p className="sf-hero__tagline">Into the garden of creativity</p>
            </div>
          </div>
          <div className="sf-hero__ctas">
            <Link to="/collections/all" className="sf-hero__cta">SHOP THE STORE</Link>
            <Link to="/blog" className="sf-hero__alt">or start with the blog</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
