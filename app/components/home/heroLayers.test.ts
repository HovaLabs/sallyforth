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
});
