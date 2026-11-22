/**
 * Scroll progress over the supplied distance, clamped to [0, 1] and eased out.
 */
export function heroProgress(scrollY: number, scrollDistance: number): number {
  const end = Math.max(1, scrollDistance);
  const raw = Math.min(1, Math.max(0, scrollY / end));
  return 1 - (1 - raw) * (1 - raw);
}
