import {describe, expect, it} from 'vitest';
import {computeMarqueeReps} from '~/lib/marquee';

describe('computeMarqueeReps', () => {
  it('repeats the unit until one sequence exceeds the viewport, plus one for safety', () => {
    expect(computeMarqueeReps(1280, 896)).toBe(3); // ceil(1280/896)=2, +1
    expect(computeMarqueeReps(375, 896)).toBe(2);  // ceil(375/896)=1, +1
    expect(computeMarqueeReps(2560, 896)).toBe(4); // ceil(2560/896)=3, +1
  });
  it('never returns less than 1 and survives a zero-width unit', () => {
    expect(computeMarqueeReps(0, 896)).toBe(1);
    expect(computeMarqueeReps(1280, 0)).toBe(1);
  });
});
