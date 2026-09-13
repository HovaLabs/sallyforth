import {ART} from '~/config/shop';

export type LayerKind = 'A' | 'B' | 'C' | 'L' | 'R' | 'BOTTOM' | 'CL' | 'BR' | 'T';

export type HeroLayer = {
  kind: LayerKind;
  src: string;
  /** absolute-position CSS for the layer at rest */
  style: {left?: string; right?: string; top?: string; bottom?: string; width: string};
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

/** The twelve art layers of the landing-page hero, in DOM order. */
export const HERO_LAYERS: ReadonlyArray<HeroLayer> = [
  {kind: 'A', src: ART.radishA, style: {left: '-260px', top: '-120px', width: '720px'}},
  {kind: 'B', src: ART.radishB, style: {right: '-300px', top: '-80px', width: '760px'}},
  {kind: 'C', src: ART.radishC, style: {left: '32%', bottom: '-360px', width: '720px'}},
  {kind: 'L', src: ART.radishB, style: {left: '-80px', bottom: '-140px', width: '520px'}},
  {kind: 'R', src: ART.radishA, style: {right: '-60px', bottom: '-120px', width: '500px'}},
  {kind: 'T', src: ART.radishC, style: {left: '22%', top: '-300px', width: '520px'}},
  {kind: 'T', src: ART.radishA, style: {right: '18%', top: '-220px', width: '440px'}},
  {kind: 'BOTTOM', src: ART.carrotBig, style: {left: '12%', bottom: '-420px', width: '300px'}},
  {kind: 'BOTTOM', src: ART.carrotBig, style: {right: '10%', bottom: '-460px', width: '340px'}},
  {kind: 'CL', src: ART.carrotBig, style: {left: '-120px', top: '26%', width: '260px'}},
  {kind: 'BOTTOM', src: ART.beetBig, style: {left: '38%', bottom: '-520px', width: '340px'}},
  {kind: 'BR', src: ART.beetBig, style: {right: '-140px', top: '22%', width: '300px'}},
];
