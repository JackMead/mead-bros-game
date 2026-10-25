/**
 * Where every plant in a chunk goes, and what it looks like. Pure logic: no Three.js, no DOM.
 * chunks.ts draws these; animals use the trees to climb and swing through.
 */
import type { Obstacle } from './movement';
import { hash2, mulberry32 } from './noise';
import type { Hsl } from './species';
import type { Terrain } from './terrain';

export type TreeKind = 'broadleaf' | 'fruit' | 'emergent' | 'palm';

/** One lump of a tree's crown: an ellipsoid `r` wide and `r * squash` tall. */
export interface Blob {
  x: number;
  y: number;
  z: number;
  r: number;
  squash: number;
  turn: number;
  colour: Hsl;
}

export interface Tree {
  kind: TreeKind;
  /** Base of the trunk. */
  x: number;
  y: number;
  z: number;
  height: number;
  /** Trunk radius at the ground and at the top. */
  baseRadius: number;
  topRadius: number;
  /** Lean of the trunk in radians, about X then Z. Only palms lean. */
  tiltX: number;
  tiltZ: number;
  turn: number;
  bark: Hsl;
  crown: Blob[];
  /** Fruit hanging under the crown (fruit trees only). */
  fruit: { x: number; y: number; z: number }[];
  /** Flat roots flaring out from the base (emergent giants only). */
  buttresses: number;
}

export type SmallKind = 'fern' | 'bush' | 'flower' | 'rock' | 'bamboo';

export interface SmallPlant {
  kind: SmallKind;
  x: number;
  y: number;
  z: number;
  /** Uniform size, or width for bushes and rocks. */
  scale: number;
  /** Height for bamboo; height as a fraction of width for bushes and rocks. */
  tall: number;
  turn: number;
  /** Lean for bamboo canes. */
  tiltX: number;
  tiltZ: number;
  colour: Hsl;
}

export interface PlantLayout {
  trees: Tree[];
  small: SmallPlant[];
  /** Trunks and big rocks the player can't walk through. */
  obstacles: Obstacle[];
}

export interface PlantSettings {
  chunkSize: number;
  waterLevel: number;
  treeAttempts: number;
  undergrowthAttempts: number;
  /** Share of ordinary broadleaf trees that bear fruit instead. */
  fruitTreeShare: number;
}

const FLOWER_HUES = [0.0, 0.95, 0.08, 0.8, 0.13];
const FRUIT_HUES = [0.0, 0.05, 0.1, 0.14, 0.85];

/** Each world has its own kind of fruit: this is its colour. */
export function fruitColour(seed: number): Hsl {
  const rng = mulberry32(hash2(seed, 0xf2017, 3));
  return { h: FRUIT_HUES[Math.floor(rng() * FRUIT_HUES.length)]!, s: 0.8 + rng() * 0.15, l: 0.5 + rng() * 0.1 };
}

/** Radius of a tree's trunk at height `y` above its base. */
export function trunkRadiusAt(tree: Tree, y: number): number {
  const t = Math.min(1, Math.max(0, y / tree.height));
  return tree.baseRadius + (tree.topRadius - tree.baseRadius) * t;
}

/** Lays out every plant in one chunk. Same seed and chunk, same plants. */
export function layoutChunk(cx: number, cz: number, seed: number, t: Terrain, s: PlantSettings): PlantLayout {
  const rng = mulberry32(hash2(cx, cz, seed));
  const S = s.chunkSize;
  const W = s.waterLevel;
  const x0 = cx * S;
  const z0 = cz * S;
  const trees: Tree[] = [];
  const small: SmallPlant[] = [];
  const obstacles: Obstacle[] = [];
  const turn = () => rng() * Math.PI * 2;
  const green = (h: number, sat: number, l: number): Hsl => ({ h: h + rng() * 0.1, s: sat, l: l + rng() * 0.12 });

  for (let i = 0; i < s.treeAttempts; i++) {
    const x = x0 + rng() * S;
    const z = z0 + rng() * S;
    const y = t.heightAt(x, z);
    const d = t.densityAt(x, z);
    const roll = rng();
    if (y < W + 0.3) continue;
    const nearWater = y < W + 3;

    let tree: Tree | null = null;
    if (!nearWater && roll < 0.015 + 0.02 * d) {
      tree = emergent(x, y, z, rng);
    } else if (!nearWater && roll < 0.08 + 0.32 * d) {
      tree = rng() < s.fruitTreeShare ? fruitTree(x, y, z, rng) : broadleaf(x, y, z, rng);
    } else if (roll > 1 - (nearWater ? 0.25 : 0.05)) {
      tree = palm(x, y, z, rng);
    }
    if (!tree) continue;
    trees.push(tree);
    obstacles.push({ x, z, r: tree.kind === 'palm' ? 0.35 : tree.baseRadius });
  }

  for (let i = 0; i < s.undergrowthAttempts; i++) {
    const x = x0 + rng() * S;
    const z = z0 + rng() * S;
    const y = t.heightAt(x, z);
    const d = t.densityAt(x, z);
    const roll = rng();
    if (y < W + 0.2) continue;
    const base = { x, y, z, tall: 1, turn: turn(), tiltX: 0, tiltZ: 0 };

    if (roll < 0.25 + 0.45 * d) {
      if (rng() < 0.55) {
        small.push({ ...base, kind: 'fern', y: y - 0.1, scale: 0.8 + rng() * 1.6, colour: green(0.23, 0.6, 0.26) });
      } else {
        const r = 0.7 + rng() * 1.3;
        small.push({ ...base, kind: 'bush', y: y + 0.2, scale: r, tall: 0.7, colour: green(0.24, 0.55, 0.18) });
      }
    } else if (roll > 0.97) {
      const hue = FLOWER_HUES[Math.floor(rng() * FLOWER_HUES.length)]!;
      const count = 3 + Math.floor(rng() * 4);
      for (let k = 0; k < count; k++) {
        const fx = x + (rng() - 0.5) * 2;
        const fz = z + (rng() - 0.5) * 2;
        small.push({ ...base, kind: 'flower', x: fx, z: fz, y: t.heightAt(fx, fz) + 0.3 + rng() * 0.5,
          scale: 0.8 + rng() * 0.6, turn: turn(), colour: { h: hue, s: 0.85, l: 0.55 } });
      }
    } else if (roll > 0.955) {
      const r = 0.5 + rng() * 1.5;
      small.push({ ...base, kind: 'rock', y: y + r * 0.2, scale: r, tall: 0.7, colour: { h: 0.2, s: 0.08, l: 0.3 + rng() * 0.12 } });
      if (r > 1) obstacles.push({ x, z, r: r * 0.8 });
    } else if (roll > 0.94 && y < W + 8) {
      // A clump of bamboo canes, fond of damp ground near water.
      const canes = 6 + Math.floor(rng() * 8);
      for (let k = 0; k < canes; k++) {
        const bx = x + (rng() - 0.5) * 2.2;
        const bz = z + (rng() - 0.5) * 2.2;
        small.push({ ...base, kind: 'bamboo', x: bx, z: bz, y: t.heightAt(bx, bz) - 0.2, scale: 0.08 + rng() * 0.05,
          tall: 4 + rng() * 5, tiltX: (rng() - 0.5) * 0.25, tiltZ: (rng() - 0.5) * 0.25,
          colour: { h: 0.17 + rng() * 0.06, s: 0.5, l: 0.35 + rng() * 0.12 } });
      }
      obstacles.push({ x, z, r: 0.9 });
    }
  }

  return { trees, small, obstacles };
}

function bark(rng: () => number, l = 0.22): Hsl {
  return { h: 0.07 + rng() * 0.03, s: 0.35, l: l + rng() * 0.08 };
}

function tree(kind: TreeKind, x: number, y: number, z: number, height: number, girth: number, rng: () => number): Tree {
  return {
    kind, x, y, z, height, baseRadius: 0.6 * girth, topRadius: 0.35 * girth, tiltX: 0, tiltZ: 0,
    turn: rng() * Math.PI * 2, bark: bark(rng), crown: [], fruit: [], buttresses: 0,
  };
}

/** Piles crown blobs up from `from` to the top of the trunk, spread `spread` metres either side. */
function crown(tr: Tree, count: number, spread: number, size: readonly [number, number], squash: readonly [number, number],
  from: number, leaf: () => Hsl, rng: () => number): void {
  for (let b = 0; b < count; b++) {
    const r = size[0] + rng() * (size[1] - size[0]);
    const lift = from + (1 - from) * (b / Math.max(1, count - 1));
    tr.crown.push({
      x: tr.x + (rng() - 0.5) * spread * 2,
      y: tr.y + tr.height * lift + (rng() - 0.5) * 1.5,
      z: tr.z + (rng() - 0.5) * spread * 2,
      r,
      squash: squash[0] + rng() * (squash[1] - squash[0]),
      turn: rng() * Math.PI * 2,
      colour: leaf(),
    });
  }
}

/** The everyday jungle tree: a lumpy crown on a tall trunk. */
function broadleaf(x: number, y: number, z: number, rng: () => number): Tree {
  const tr = tree('broadleaf', x, y, z, 8 + rng() * 12, 0.7 + rng() * 0.7, rng);
  crown(tr, 4 + Math.floor(rng() * 4), 2 + tr.height * 0.15, [2.2, 4.8], [0.6, 0.9], 0.72,
    () => ({ h: 0.22 + rng() * 0.1, s: 0.5 + rng() * 0.25, l: 0.2 + rng() * 0.14 }), rng);
  return tr;
}

/** Shorter, with a dense round crown and fruit hanging underneath. */
function fruitTree(x: number, y: number, z: number, rng: () => number): Tree {
  const tr = tree('fruit', x, y, z, 5 + rng() * 3, 0.5 + rng() * 0.3, rng);
  crown(tr, 3 + Math.floor(rng() * 3), 1.6, [2, 3], [0.8, 1], 0.75,
    () => ({ h: 0.25 + rng() * 0.06, s: 0.6, l: 0.28 + rng() * 0.1 }), rng);
  const count = 8 + Math.floor(rng() * 8);
  for (let k = 0; k < count; k++) {
    // Hang each fruit just below the edge of a random crown blob.
    const b = tr.crown[Math.floor(rng() * tr.crown.length)]!;
    const a = rng() * Math.PI * 2;
    const out = b.r * (0.5 + rng() * 0.35);
    const below = b.y - b.r * b.squash * (0.45 + rng() * 0.3);
    tr.fruit.push({ x: b.x + Math.cos(a) * out, y: Math.max(below, y + 2.2), z: b.z + Math.sin(a) * out });
  }
  return tr;
}

/** A rare giant towering over the canopy, with a flat umbrella crown and buttress roots. */
function emergent(x: number, y: number, z: number, rng: () => number): Tree {
  const tr = tree('emergent', x, y, z, 26 + rng() * 10, 1.4 + rng() * 0.5, rng);
  tr.bark = bark(rng, 0.32);
  tr.buttresses = 4 + Math.floor(rng() * 3);
  crown(tr, 6 + Math.floor(rng() * 4), 6 + rng() * 3, [3, 5], [0.3, 0.45], 0.9,
    () => ({ h: 0.2 + rng() * 0.08, s: 0.45 + rng() * 0.2, l: 0.24 + rng() * 0.1 }), rng);
  return tr;
}

function palm(x: number, y: number, z: number, rng: () => number): Tree {
  const tr = tree('palm', x, y, z, 5 + rng() * 5, 1, rng);
  tr.y = y - 0.2;
  tr.baseRadius = 0.28;
  tr.topRadius = 0.16;
  tr.tiltX = (rng() - 0.5) * 0.5;
  tr.tiltZ = (rng() - 0.5) * 0.5;
  tr.bark = { h: 0.09, s: 0.3, l: 0.35 + rng() * 0.1 };
  const size = 2.4 + rng();
  // The fronds sit on top of the leaning trunk (rotated about X, then Z, as Three.js's 'XYZ' Euler does).
  const h = tr.height;
  const top = { x: x - h * Math.sin(tr.tiltZ), y: tr.y + h * Math.cos(tr.tiltZ) * Math.cos(tr.tiltX), z: z + h * Math.cos(tr.tiltZ) * Math.sin(tr.tiltX) };
  tr.crown.push({ ...top, r: size, squash: (1 + rng() * 0.4) / size, turn: rng() * Math.PI * 2,
    colour: { h: 0.2 + rng() * 0.08, s: 0.6, l: 0.26 + rng() * 0.1 } });
  return tr;
}

/** Remembers recent chunk layouts, so the renderer and the animals share one copy. */
export class PlantCache {
  private readonly layouts = new Map<string, PlantLayout>();

  constructor(
    private readonly seed: number,
    private readonly terrain: Terrain,
    private readonly settings: PlantSettings,
    private readonly capacity = 256,
  ) {}

  get(cx: number, cz: number): PlantLayout {
    const key = `${cx},${cz}`;
    let layout = this.layouts.get(key);
    if (!layout) {
      layout = layoutChunk(cx, cz, this.seed, this.terrain, this.settings);
      this.layouts.set(key, layout);
      if (this.layouts.size > this.capacity) this.layouts.delete(this.layouts.keys().next().value!);
    }
    return layout;
  }

  /** Every tree whose base is within `radius` of (x, z). */
  treesNear(x: number, z: number, radius: number): Tree[] {
    const S = this.settings.chunkSize;
    const out: Tree[] = [];
    for (let cx = Math.floor((x - radius) / S); cx <= Math.floor((x + radius) / S); cx++) {
      for (let cz = Math.floor((z - radius) / S); cz <= Math.floor((z + radius) / S); cz++) {
        for (const tr of this.get(cx, cz).trees) {
          if (Math.hypot(tr.x - x, tr.z - z) <= radius) out.push(tr);
        }
      }
    }
    return out;
  }
}
