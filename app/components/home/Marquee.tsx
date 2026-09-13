import {useEffect, useRef, useState} from 'react';
import {ART} from '~/config/shop';
import {computeMarqueeReps} from '~/lib/marquee';

const ITEMS: Array<[string, string, number]> = [
  ['GROW', ART.carrot, 26], ['MAKE', ART.tomato, 24], ['TELL', ART.peapod, 26],
  ['GROW', ART.beet, 26], ['MAKE', ART.eggplant, 26], ['TELL', ART.blueberries, 22],
];

function Unit() {
  return (
    <div className="sf-marquee__unit">
      {ITEMS.map(([word, src, h], i) => (
        <span key={i} className="sf-marquee__item" /* eslint-disable-line react/no-array-index-key */>
          <span>{word}</span>
          <img src={src} alt="" style={{height: h}} />
        </span>
      ))}
    </div>
  );
}

/**
 * Seamless strip: one sequence = enough units to exceed the viewport (+1);
 * the sequence is rendered twice and animated by -50%. Rebuilds on resize and
 * after fonts load. Static under prefers-reduced-motion (CSS).
 */
export function Marquee() {
  const track = useRef<HTMLDivElement>(null);
  const [reps, setReps] = useState(1);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => {
      const unit = el.querySelector<HTMLElement>('.sf-marquee__unit');
      const unitW = unit?.getBoundingClientRect().width ?? 0;
      setReps(computeMarqueeReps(window.innerWidth, unitW));
    };
    measure();
    if (document.fonts) {
      document.fonts.ready.then(measure).catch(() => {});
    }
    let t: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(t); t = setTimeout(measure, 200); };
    window.addEventListener('resize', onResize, {passive: true});
    return () => { clearTimeout(t); window.removeEventListener('resize', onResize); };
  }, []);

  const copies = Array.from({length: reps * 2}, (_, i) => (
    <Unit
      key={i}
    />
  ));
  return (
    <div className="sf-marquee">
      <div className="sf-marquee__track" ref={track} aria-hidden="true" style={{animationDuration: `${28 * reps}s`}}>
        {copies}
      </div>
      <p className="sr-only">Grow, make, tell.</p>
    </div>
  );
}
