/**
 * How many copies of the marquee unit make one sequence at least as wide as
 * the viewport (+1 for safety). The strip renders the sequence twice and
 * animates translateX(-50%), so the loop is seamless at any width.
 */
export function computeMarqueeReps(viewportWidth: number, unitWidth: number): number {
  if (!(viewportWidth > 0) || !(unitWidth > 0)) return 1;
  return Math.max(1, Math.ceil(viewportWidth / unitWidth) + 1);
}
