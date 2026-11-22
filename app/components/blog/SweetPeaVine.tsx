import {useEffect, useRef, useState} from 'react';

const vineScale = 1.69;
const segmentHeight = 240 * vineScale;

export function SweetPeaVine() {
  const rail = useRef<HTMLDivElement>(null);
  const [segments, setSegments] = useState(1);

  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    const resize = new ResizeObserver(() => {
      setSegments(Math.max(1, Math.ceil(element.clientHeight / segmentHeight)));
    });
    resize.observe(element);
    return () => resize.disconnect();
  }, []);

  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    let frame = 0;
    function draw() {
      frame = 0;
      if (!element) return;
      const tip = window.innerHeight * 0.82 - element.getBoundingClientRect().top;
      element.style.setProperty('--tip', Math.max(0, tip) + 'px');
      element.querySelectorAll<SVGElement>('[data-bud]').forEach((bud) => {
        const growth = Math.min(1, Math.max(0, (tip - Number(bud.dataset.bud)) / (34 * vineScale)));
        bud.style.setProperty('--growth', String(growth));
      });
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(draw);
    }
    draw();
    window.addEventListener('scroll', schedule, {passive: true});
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [segments]);

  return (
    <div className="sf-pea" ref={rail} aria-hidden="true">
      {Array.from({length: segments}, (_, index) => (
        <svg key={index} style={{height: segmentHeight}} viewBox="0 0 70 240" preserveAspectRatio="none" focusable="false">
          <path d="M35 0 C58 38 61 66 43 92 S11 142 24 172 S20 215 35 240" fill="none" stroke="#647745" strokeWidth="2.4" />
          {[[43, 92, -1], [24, 172, 1]].map(([x, y, side]) => (
            <g key={y} transform={`translate(${x} ${y}) scale(${side} 1)`}>
              <g className="sf-pea__shoot" data-bud={index * segmentHeight + y * vineScale}>
                <path d="M0 0 Q12 -4 18 -24 C23 -45 36 -39 31 -31 Q27 -26 26 -32" fill="none" stroke="#647745" strokeWidth="1.6" />
                <path d="M9 -6 Q6 -21 12 -30 Q22 -15 9 -6Z" fill="#83965f" />
                <path d="M12 -11 Q23 -23 34 -18 Q25 -5 12 -11Z" fill="#a1ad72" />
                <path d="M10 -9 L12 -23 M15 -12 L28 -17" fill="none" stroke="#657744" strokeWidth=".8" />
              </g>
            </g>
          ))}
        </svg>
      ))}
    </div>
  );
}
