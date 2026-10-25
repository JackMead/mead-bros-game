import { describe, expect, it } from 'vitest';
import { fruitColour, layoutChunk, PlantCache, trunkRadiusAt, type PlantSettings, type Tree } from './plants';
import { createTerrain } from './terrain';

const WATER = -3;
const settings: PlantSettings = {
  chunkSize: 48, waterLevel: WATER, treeAttempts: 70, undergrowthAttempts: 240, fruitTreeShare: 0.25,
  waterfalls: { attempts: 12, minDrop: 8, minSteepness: 1, maxLength: 30, minPool: 8 },
};
const terrain = createTerrain(11, WATER);

/** Every tree in a block of chunks, so rare kinds turn up. */
function manyTrees(): Tree[] {
  const out: Tree[] = [];
  for (let cx = -5; cx <= 5; cx++) for (let cz = -5; cz <= 5; cz++) out.push(...layoutChunk(cx, cz, 11, terrain, settings).trees);
  return out;
}

describe('plants', () => {
  it('lays out the same plants in a chunk every time', () => {
    expect(layoutChunk(2, -3, 11, terrain, settings)).toEqual(layoutChunk(2, -3, 11, terrain, settings));
  });

  it('grows every kind of tree, all on dry land', () => {
    const trees = manyTrees();
    for (const kind of ['broadleaf', 'fruit', 'emergent', 'palm']) {
      expect(trees.some((t) => t.kind === kind)).toBe(true);
    }
    for (const t of trees) expect(terrain.heightAt(t.x, t.z)).toBeGreaterThan(WATER);
  });

  it('makes emergents the tallest trees, towering over the broadleaf canopy', () => {
    const trees = manyTrees();
    const tallestBroadleaf = Math.max(...trees.filter((t) => t.kind === 'broadleaf').map((t) => t.height));
    for (const t of trees.filter((t) => t.kind === 'emergent')) {
      expect(t.height).toBeGreaterThan(tallestBroadleaf);
      expect(t.buttresses).toBeGreaterThan(0);
    }
  });

  it('hangs fruit under the crown of fruit trees only', () => {
    for (const t of manyTrees()) {
      if (t.kind !== 'fruit') {
        expect(t.fruit).toHaveLength(0);
        continue;
      }
      expect(t.fruit.length).toBeGreaterThan(0);
      const crownTop = Math.max(...t.crown.map((b) => b.y));
      for (const f of t.fruit) {
        expect(f.y).toBeLessThan(crownTop);
        expect(f.y).toBeGreaterThan(t.y + 2);
      }
    }
  });

  it('puts every trunk and big rock in the obstacle list', () => {
    const layout = layoutChunk(0, 0, 11, terrain, settings);
    for (const t of layout.trees) expect(layout.obstacles.some((o) => o.x === t.x && o.z === t.z)).toBe(true);
  });

  it('keeps plants off waterfalls', () => {
    let falls = 0;
    for (let cx = -5; cx <= 5; cx++) {
      for (let cz = -5; cz <= 5; cz++) {
        const { waterfall, trees, small } = layoutChunk(cx, cz, 11, terrain, settings);
        if (!waterfall) continue;
        falls++;
        for (const p of [...trees, ...small]) {
          for (const q of waterfall.path) expect(Math.hypot(p.x - q.x, p.z - q.z)).toBeGreaterThan(waterfall.bottomWidth / 2);
        }
      }
    }
    expect(falls).toBeGreaterThan(0);
  });

  it('tapers trunks from base to top', () => {
    const t = manyTrees().find((t) => t.kind === 'broadleaf')!;
    expect(trunkRadiusAt(t, 0)).toBe(t.baseRadius);
    expect(trunkRadiusAt(t, t.height)).toBeCloseTo(t.topRadius);
    expect(trunkRadiusAt(t, t.height / 2)).toBeLessThan(t.baseRadius);
  });

  it('gives each world its own fruit colour', () => {
    const colours = new Set([1, 2, 3, 4, 5, 6, 7, 8].map((s) => fruitColour(s).h));
    expect(colours.size).toBeGreaterThan(1);
  });
});

describe('PlantCache', () => {
  it('returns the same layout object for a chunk until it is evicted', () => {
    const cache = new PlantCache(11, terrain, settings, 4);
    const first = cache.get(0, 0);
    expect(cache.get(0, 0)).toBe(first);
    for (let i = 1; i <= 4; i++) cache.get(i, 0);
    expect(cache.get(0, 0)).not.toBe(first);
    expect(cache.get(0, 0)).toEqual(first);
  });

  it('finds trees within a radius, across chunk borders', () => {
    const cache = new PlantCache(11, terrain, settings);
    const near = cache.treesNear(48, 48, 30);
    expect(near.length).toBeGreaterThan(0);
    for (const t of near) expect(Math.hypot(t.x - 48, t.z - 48)).toBeLessThanOrEqual(30);
    const chunksTouched = new Set(near.map((t) => `${Math.floor(t.x / 48)},${Math.floor(t.z / 48)}`));
    expect(chunksTouched.size).toBeGreaterThan(1);
  });
});
