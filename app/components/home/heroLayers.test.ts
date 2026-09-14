import {describe, expect, it} from 'vitest';
import {HERO_LAYERS, layerTransform} from '~/components/home/heroLayers';

describe('layerTransform', () => {
  it('matches the landing page recipes at rest (p = 0)', () => {
    expect(layerTransform('A', 0)).toBe('translate(0px, 0px) rotate(18deg)');
    expect(layerTransform('B', 0)).toBe('translate(0px, 0px) rotate(-12deg)');
    expect(layerTransform('T', 0)).toBe('translate(0px, 0px) rotate(180deg)');
    expect(layerTransform('BOTTOM', 0)).toBe('translate(0px, 0px) rotate(-8deg)');
  });
  it('moves layers at full progress', () => {
    expect(layerTransform('A', 1)).toBe('translate(-300px, -120px) rotate(6deg)');
    expect(layerTransform('CL', 1)).toBe('translate(-300px, 60px) rotate(-72deg)');
  });
  it('defines the twelve landing-page art layers', () => {
    expect(HERO_LAYERS).toHaveLength(12);
    for (const layer of HERO_LAYERS) expect(layer.src.startsWith('/art/')).toBe(true);
  });
  it('keeps the landing-page image, size, and scroll recipe of every layer', () => {
    // The wreath only moves, rotates and re-stacks layers; these triples are the original hero.
    expect(HERO_LAYERS.map((l) => [l.kind, l.src, l.style.width])).toEqual([
      ['A', '/art/radish-a.webp', '720px'],
      ['BR', '/art/beet-big.webp', '300px'],
      ['B', '/art/radish-b.webp', '760px'],
      ['C', '/art/radish-c.webp', '720px'],
      ['L', '/art/radish-b.webp', '520px'],
      ['R', '/art/radish-a.webp', '500px'],
      ['T', '/art/radish-c.webp', '520px'],
      ['T', '/art/radish-a.webp', '440px'],
      ['BOTTOM', '/art/carrot-big.webp', '300px'],
      ['BOTTOM', '/art/carrot-big.webp', '340px'],
      ['CL', '/art/carrot-big.webp', '260px'],
      ['BOTTOM', '/art/beet-big.webp', '340px'],
    ]);
  });
  it('places every layer by its centre on the wreath ring with a static rotation', () => {
    for (const layer of HERO_LAYERS) {
      expect(layer.style.left).toMatch(/^calc\(50% [+-] \d+px\)$/);
      expect(layer.style.top).toMatch(/^calc\([\d.]+% \+ \d+px\)$/);
      expect(Number.isFinite(layer.rotate)).toBe(true);
    }
  });
});
