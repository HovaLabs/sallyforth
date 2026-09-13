import {describe, expect, it} from 'vitest';
import {heroProgress} from '~/lib/parallax';

describe('heroProgress', () => {
  it('is 0 at the top and 1 once the hero has scrolled past', () => {
    expect(heroProgress(0, 900)).toBe(0);
    expect(heroProgress(900, 900)).toBe(1);
    expect(heroProgress(5000, 900)).toBe(1);
  });
  it('eases out: 1 - (1-p)^2', () => {
    expect(heroProgress(450, 900)).toBeCloseTo(0.75, 5);
  });
  it('is continuous around the old hardcoded 520px threshold', () => {
    const a = heroProgress(519, 914);
    const b = heroProgress(521, 914);
    expect(b - a).toBeGreaterThan(0);
    expect(b - a).toBeLessThan(0.01);
  });
  it('clamps negative scroll and guards a zero-height hero', () => {
    expect(heroProgress(-50, 900)).toBe(0);
    expect(heroProgress(10, 0)).toBe(1);
  });
});
