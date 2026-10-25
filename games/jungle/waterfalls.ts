/** Where waterfalls tumble down steep slopes into rivers and lakes. Pure logic: no Three.js, no DOM. */
import { hash2, mulberry32 } from './noise';
import type { Terrain } from './terrain';

export interface Waterfall {
  /** Ground points from the top of the fall down to the water, about a metre apart. */
  path: { x: number; y: number; z: number }[];
  /** Width at the top and at the bottom, in metres. */
  topWidth: number;
  bottomWidth: number;
  /** Height from the top of the fall to the water. */
  drop: number;
}

export interface WaterfallSettings {
  chunkSize: number;
  waterLevel: number;
  /** Spots tried per chunk. */
  attempts: number;
  /** Shortest drop worth calling a waterfall, in metres. */
  minDrop: number;
  /** Gentlest average slope (drop over distance) that still counts. */
  minSteepness: number;
  /** Longest a fall can be, measured along the ground. */
  maxLength: number;
  /** Open water needed in front of the fall, in metres, so it's visible rather than hidden in a gorge. */
  minPool: number;
}

/** The steepest-descent path from (x, z) down to the water, or null if it doesn't get there. */
export function downhillPath(terrain: Terrain, x: number, z: number, waterLevel: number, maxLength: number) {
  const path = [{ x, y: terrain.heightAt(x, z), z }];
  const e = 0.5;
  for (let step = 0; step < maxLength; step++) {
    const last = path[path.length - 1]!;
    if (last.y < waterLevel) return path;
    const gx = terrain.heightAt(last.x + e, last.z) - terrain.heightAt(last.x - e, last.z);
    const gz = terrain.heightAt(last.x, last.z + e) - terrain.heightAt(last.x, last.z - e);
    const g = Math.hypot(gx, gz);
    if (g < 1e-4) return null; // flat: water would pool, not fall
    const nx = last.x - gx / g;
    const nz = last.z - gz / g;
    path.push({ x: nx, y: terrain.heightAt(nx, nz), z: nz });
  }
  return null;
}

/** Whether there's open water for `distance` metres straight on from the foot of the fall. */
export function opensOntoWater(terrain: Terrain, path: readonly { x: number; z: number }[], waterLevel: number, distance: number): boolean {
  const bottom = path[path.length - 1]!;
  const before = path[Math.max(0, path.length - 3)]!;
  let dx = bottom.x - before.x;
  let dz = bottom.z - before.z;
  const len = Math.hypot(dx, dz);
  if (len < 1e-6) return false;
  dx /= len;
  dz /= len;
  for (let d = 1; d <= distance; d++) {
    if (terrain.heightAt(bottom.x + dx * d, bottom.z + dz * d) >= waterLevel) return false;
  }
  return true;
}

/** At most one waterfall per chunk: the steepest good spot, if there is one. */
export function findWaterfall(cx: number, cz: number, seed: number, terrain: Terrain, s: WaterfallSettings): Waterfall | null {
  const rng = mulberry32(hash2(cx, cz, seed ^ 0x3a7e2f));
  let best: Waterfall | null = null;
  let bestSteepness = s.minSteepness;
  for (let i = 0; i < s.attempts; i++) {
    const x = (cx + rng()) * s.chunkSize;
    const z = (cz + rng()) * s.chunkSize;
    const h = terrain.heightAt(x, z);
    if (h < s.waterLevel + s.minDrop) continue;
    const path = downhillPath(terrain, x, z, s.waterLevel, s.maxLength);
    if (!path) continue;
    const drop = h - s.waterLevel;
    const steepness = drop / (path.length - 1);
    if (steepness <= bestSteepness || !opensOntoWater(terrain, path, s.waterLevel, s.minPool)) continue;
    bestSteepness = steepness;
    const width = 2.5 + rng() * 2;
    best = { path, topWidth: width, bottomWidth: width * (1.6 + rng() * 0.8), drop };
  }
  return best;
}
