import {type CSSProperties, useEffect, useRef, useState} from 'react';
import {ART} from '~/config/shop';

const sprigs = {
  leaves: '/art/sweet-pea-leaves.webp',
  flower: '/art/sweet-pea-flower.webp',
  bud: '/art/sweet-pea-bud.webp',
  pod: ART.peapod,
};

function Stem({d}: {d: string}) {
  return (
    <g className="sf-pea__stem" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} pathLength="1" stroke="#293b26" strokeWidth="3" />
      <path d={d} pathLength="1" stroke="#91a34c" strokeWidth="1.2" />
    </g>
  );
}

type SprigProps = {kind: keyof typeof sprigs; x: number; y: number; size: number; angle: number};

function Sprig({kind, x, y, size, angle}: SprigProps) {
  // Each cutout meets the vine at its stalk. The seed pod hangs from the node.
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <image
        className="sf-pea__sprig"
        href={sprigs[kind]}
        x={-size / 2}
        y={kind === 'pod' ? -size * 0.04 : 0.6 - size}
        width={size}
        height={size}
        style={{'--node-x': x, '--node-y': y} as CSSProperties}
      />
    </g>
  );
}

export function HeroPeaVine() {
  return (
    <svg className="sf-hero-pea" viewBox="0 0 340 86" aria-hidden="true" focusable="false">
      <Stem d="M6 59 C26 63 40 57 54 51 S82 41 96 47 C108 52 120 57 130 58 C145 60 156 56 166 52 S189 40 201 41 C220 39 233 48 248 49 C259 50 270 45 278 41 C299 29 318 22 329 28 C341 35 333 46 326 43 C319 40 322 33 327 35" />
      <Sprig kind="leaves" x={54} y={51} size={41} angle={-42} />
      <Sprig kind="flower" x={96} y={47} size={43} angle={-18} />
      <Sprig kind="pod" x={130} y={58} size={30} angle={24} />
      <Sprig kind="leaves" x={166} y={52} size={39} angle={35} />
      <Sprig kind="bud" x={201} y={41} size={43} angle={-16} />
      <Sprig kind="leaves" x={248} y={49} size={32} angle={126} />
      <Sprig kind="leaves" x={278} y={41} size={25} angle={14} />
    </svg>
  );
}

const vineWidth = 84;
const segmentHeight = 288;
const climbingStem = 'M42 0 C42 20 58 36 57 58 C56 75 47 88 40 102 C32 119 25 135 25 153 C25 172 32 185 38 198 C44 213 36 226 35 239 C33 256 42 271 42 288';

export function SweetPeaVine() {
  const rail = useRef<HTMLDivElement>(null);
  const [segments, setSegments] = useState(1);

  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    const motion = window.matchMedia('(prefers-reduced-motion: no-preference)');
    let frame = 0;
    const schedule = () => {
      if (frame || !motion.matches) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const {top, width} = element.getBoundingClientRect();
        if (!width) return;
        const tip = Math.max(0, window.innerHeight * 0.82 - top);
        element.style.setProperty('--tip', `${tip}px`);
        element.style.setProperty('--tip-units', String(tip * vineWidth / width));
      });
    };
    const resize = new ResizeObserver(([{contentRect: {height, width}}]) => {
      if (!width) return;
      setSegments(Math.max(1, Math.ceil(height * vineWidth / (width * segmentHeight))));
      schedule();
    });
    resize.observe(element);
    motion.addEventListener('change', schedule);
    window.addEventListener('scroll', schedule, {passive: true});
    window.addEventListener('resize', schedule);
    return () => {
      resize.disconnect();
      cancelAnimationFrame(frame);
      motion.removeEventListener('change', schedule);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return (
    <div className="sf-pea" ref={rail} aria-hidden="true">
      <svg viewBox={`0 0 ${vineWidth} ${segments * segmentHeight}`} focusable="false">
        {Array.from({length: segments}, (_, index) => {
          const mirrored = index % 2 === 1;
          const top = index * segmentHeight;
          return (
            <g
              key={top}
              transform={`translate(${mirrored ? vineWidth : 0} ${top}) scale(${mirrored ? -1 : 1} 1)`}
              style={{'--segment-top': top} as CSSProperties}
            >
              <Stem d={climbingStem} />
              <Sprig kind="leaves" x={57} y={58} size={47} angle={-45} />
              <Sprig kind={mirrored ? 'bud' : 'flower'} x={40} y={102} size={45} angle={23} />
              <Sprig kind="pod" x={25} y={153} size={44} angle={16} />
              <Sprig kind="leaves" x={38} y={198} size={45} angle={34} />
              <Sprig kind={mirrored ? 'flower' : 'bud'} x={35} y={239} size={42} angle={-33} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
