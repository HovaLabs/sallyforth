/**
 * Hero parallax progress in [0,1], derived from the hero's own height so the
 * animation ends exactly when the hero leaves the viewport (no hardcoded
 * scroll distance, no jump). Eased with 1 - (1-p)^2.
 */
export function heroProgress(scrollY: number, heroBottomAbs: number): number {
  const end = Math.max(1, heroBottomAbs);
  const raw = Math.min(1, Math.max(0, scrollY / end));
  return 1 - (1 - raw) * (1 - raw);
}
