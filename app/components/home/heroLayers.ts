import {ART} from '~/config/shop';

export type LayerKind = 'A' | 'B' | 'C' | 'L' | 'R' | 'BOTTOM' | 'CL' | 'BR' | 'T';

export type HeroLayer = {
  kind: LayerKind;
  src: string;
  /**
   * Where the layer's centre sits at rest. `left` is a px offset from the
   * hero's horizontal centre; `top` is a share of the hero height plus the
   * same px nudge the hero text gets, so the ring tracks the content.
   */
  style: {left: string; top: string; width: string};
  /**
   * Static wreath orientation (deg, clockwise) applied to the art inside the
   * moving layer, on top of the recipe's own rotation. Keeping it on the inner
   * element leaves every recipe's fly-out direction untouched.
   */
  rotate: number;
};

const px = (n: number) => `${Math.round(n * 1000) / 1000}px`;
const deg = (n: number) => `${Math.round(n * 1000) / 1000}deg`;

/** Landing-page scroll recipes, verbatim. */
export function layerTransform(kind: LayerKind, p: number): string {
  switch (kind) {
    case 'A':      return `translate(${px(-p * 300)}, ${px(-p * 120)}) rotate(${deg(18 - p * 12)})`;
    case 'B':      return `translate(${px(p * 300)}, ${px(-p * 90)}) rotate(${deg(-12 + p * 14)})`;
    case 'C':      return `translate(0px, ${px(p * 260)}) rotate(${deg(-8 + p * 10)})`;
    case 'L':      return `translate(${px(-p * 300)}, ${px(p * 120)}) rotate(${deg(-p * 12)})`;
    case 'R':      return `translate(${px(p * 300)}, ${px(p * 90)}) rotate(${deg(p * 14)})`;
    case 'BOTTOM': return `translate(0px, ${px(p * 260)}) rotate(${deg(-8 + p * 10)})`;
    case 'CL':     return `translate(${px(-p * 300)}, ${px(p * 60)}) rotate(${deg(-62 - p * 10)})`;
    case 'BR':     return `translate(${px(p * 300)}, ${px(p * 60)}) rotate(${deg(58 + p * 10)})`;
    case 'T':      return `translate(0px, ${px(-p * 260)}) rotate(${deg(180 + p * 10)})`;
  }
}

/**
 * Wreath ring: layer centres sit on an ellipse (560px half-width, 46% of the
 * hero height half-height) around the hero text. Each vegetable is turned so
 * its root-to-leaf axis follows the ring like a laurel: stems gather at the
 * bottom, leaf tips meet at the top, and every layer keeps its landing-page
 * image, size and scroll recipe (which is why each kind sits on the side of
 * the ring it already flies away from).
 */
const ring = (angleDeg: number, dxNudge = 0, dyNudge = 0) => {
  const a = (angleDeg * Math.PI) / 180;
  const dx = Math.round(560 * Math.cos(a)) + dxNudge;
  const yPct = Math.round((50 + 46 * Math.sin(a)) * 10) / 10;
  return {left: `calc(50% ${dx < 0 ? '-' : '+'} ${Math.abs(dx)}px)`, top: `calc(${yPct}% + ${80 + dyNudge}px)`};
};

/** The twelve art layers of the landing-page hero, in DOM order. */
export const HERO_LAYERS: ReadonlyArray<HeroLayer> = [
  {kind: 'A',      src: ART.radishA,   style: {...ring(210), width: '720px'}, rotate: -31},       // 10 o'clock
  {kind: 'BR',     src: ART.beetBig,   style: {...ring(0, 30), width: '300px'}, rotate: -52},     // 3 o'clock, behind the 2 o'clock radish
  {kind: 'B',      src: ART.radishB,   style: {...ring(330), width: '760px'}, rotate: 20},        // 2 o'clock
  {kind: 'C',      src: ART.radishC,   style: {...ring(95, -30), width: '720px'}, rotate: -128},  // bottom, leaves sweep left
  {kind: 'L',      src: ART.radishB,   style: {...ring(150), width: '520px'}, rotate: 8},         // 8 o'clock
  {kind: 'R',      src: ART.radishA,   style: {...ring(30), width: '500px'}, rotate: -13},        // 4 o'clock
  {kind: 'T',      src: ART.radishC,   style: {...ring(240), width: '520px'}, rotate: -160},      // 11 o'clock
  {kind: 'T',      src: ART.radishA,   style: {...ring(300), width: '440px'}, rotate: 58},        // 1 o'clock
  {kind: 'BOTTOM', src: ART.carrotBig, style: {...ring(120), width: '300px'}, rotate: -61},       // 7 o'clock
  {kind: 'BOTTOM', src: ART.carrotBig, style: {...ring(60), width: '340px'}, rotate: 77},         // 5 o'clock
  {kind: 'CL',     src: ART.carrotBig, style: {...ring(180), width: '260px'}, rotate: 56},        // 9 o'clock
  {kind: 'BOTTOM', src: ART.beetBig,   style: {...ring(85, 30, -25), width: '340px'}, rotate: 95}, // bottom, leaves sweep right
];
