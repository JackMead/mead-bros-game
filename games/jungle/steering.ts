/** Small helpers for pointing and moving animals. Pure logic: no Three.js, no DOM. */

/** The heading that faces along (dx, dz). Same convention as the player: 0 faces -Z, π/2 faces -X. */
export function headingOf(dx: number, dz: number): number {
  return Math.atan2(-dx, -dz);
}

/** Turns from one heading towards another by at most `maxStep` radians, the short way round. */
export function turnTowards(from: number, to: number, maxStep: number): number {
  let diff = (to - from) % (Math.PI * 2);
  if (diff > Math.PI) diff -= Math.PI * 2;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return from + Math.max(-maxStep, Math.min(maxStep, diff));
}

/** Moves along the heading at the current speed. */
export function moveForward(c: { x: number; z: number; heading: number; speed: number }, dt: number): void {
  c.x -= Math.sin(c.heading) * c.speed * dt;
  c.z -= Math.cos(c.heading) * c.speed * dt;
}
