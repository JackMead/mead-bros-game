import { createNoise2D, fbm, smoothstep } from './noise';

/** The shape of the world, as pure functions of position. Same seed, same world. */
export interface Terrain {
  /** Ground height in metres at world position (x, z). */
  heightAt(x: number, z: number): number;
  /** How thick the jungle is here, from 0 (clearing) to 1 (dense). */
  densityAt(x: number, z: number): number;
}

export function createTerrain(seed: number, waterLevel: number): Terrain {
  const hills = createNoise2D(seed);
  const detail = createNoise2D(seed + 101);
  const rivers = createNoise2D(seed + 202);
  const density = createNoise2D(seed + 303);

  return {
    heightAt(x, z) {
      const land = fbm(hills, x * 0.005, z * 0.005, 4) * 24 + 4 + detail(x * 0.08, z * 0.08) * 0.6;
      // Rivers follow the lines where a second noise field crosses zero.
      const river = smoothstep(0.07, 0, Math.abs(fbm(rivers, x * 0.0035, z * 0.0035, 2)));
      const bed = waterLevel - 2.5;
      return land + (Math.min(land, bed) - land) * river;
    },
    densityAt(x, z) {
      return smoothstep(-0.35, 0.35, fbm(density, x * 0.012, z * 0.012, 2));
    },
  };
}

/** Finds dry land nearest the origin by searching outward in rings. */
export function findSpawn(terrain: Terrain, waterLevel: number): { x: number; z: number } {
  for (let r = 0; r < 3000; r += 6) {
    const steps = Math.max(1, Math.floor(r / 3));
    for (let k = 0; k < steps; k++) {
      const a = (k / steps) * Math.PI * 2;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (terrain.heightAt(x, z) > waterLevel + 1.5) return { x, z };
    }
  }
  return { x: 0, z: 0 };
}
