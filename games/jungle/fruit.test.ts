import { describe, expect, it } from 'vitest';
import { Orchard, type FruitSettings } from './fruit';
import { mulberry32 } from './noise';
import type { Tree } from './plants';
import type { Terrain } from './terrain';

const WATER = -3;
const settings: FruitSettings = { waterLevel: WATER, gravity: 22, radius: 40, dropChance: 0.5, lifetime: 10, maxFallen: 100 };
/** Flat ground at 0 for x < 50, a lake beyond. */
const terrain: Terrain = { heightAt: (x) => (x < 50 ? 0 : -6), densityAt: () => 0 };

function fruitTree(x: number, fruit = 6): Tree {
  return {
    kind: 'fruit', x, y: 0, z: 0, height: 6, baseRadius: 0.4, topRadius: 0.25, tiltX: 0, tiltZ: 0, turn: 0,
    bark: { h: 0, s: 0, l: 0 }, crown: [], buttresses: 0,
    fruit: Array.from({ length: fruit }, (_, i) => ({ x: x + i * 0.3, y: 4, z: 0 })),
  };
}

function orchard(trees: Tree[], over: Partial<FruitSettings> = {}): Orchard {
  return new Orchard((x, z, r) => trees.filter((t) => Math.hypot(t.x - x, t.z - z) <= r), terrain, { ...settings, ...over }, mulberry32(3));
}

function run(o: Orchard, seconds: number, player = { x: 0, z: 0 }): number {
  let dropped = 0;
  for (let t = 0; t < seconds; t += 1 / 60) dropped += o.step(1 / 60, player).length;
  return dropped;
}

describe('falling fruit', () => {
  it('drops fruit from fruit trees near the player, and lands it on the ground', () => {
    const o = orchard([fruitTree(0)]);
    run(o, 2);
    expect(o.fallen.length).toBeGreaterThan(0);
    run(o, 2);
    const landed = o.fallen.filter((f) => f.landed);
    expect(landed.length).toBeGreaterThan(0);
    for (const f of landed) expect(f.y).toBeCloseTo(0.2);
  });

  it('never drops the same fruit twice, and stops when a tree is bare', () => {
    const tree = fruitTree(0, 4);
    const o = orchard([tree], { lifetime: 1000 });
    const dropped = run(o, 60);
    expect(dropped).toBe(4);
    expect(new Set(o.fallen.map((f) => f.index)).size).toBe(4);
  });

  it('ignores trees far from the player and trees without fruit', () => {
    const o = orchard([fruitTree(500), { ...fruitTree(0), fruit: [] }]);
    expect(run(o, 10)).toBe(0);
  });

  it('floats fruit that falls into water', () => {
    const o = orchard([fruitTree(60)]);
    run(o, 3, { x: 60, z: 0 });
    const landed = o.fallen.filter((f) => f.landed);
    expect(landed.length).toBeGreaterThan(0);
    for (const f of landed) expect(f.y).toBeCloseTo(WATER + 0.2);
  });

  it('clears fallen fruit after its lifetime, and caps how much lies around', () => {
    const o = orchard([fruitTree(0, 50)], { lifetime: 2, maxFallen: 5 });
    for (let t = 0; t < 30; t += 1 / 60) {
      o.step(1 / 60, { x: 0, z: 0 });
      expect(o.fallen.length).toBeLessThanOrEqual(5);
      for (const f of o.fallen) expect(f.age).toBeLessThanOrEqual(2 + 1 / 60);
    }
  });
});
