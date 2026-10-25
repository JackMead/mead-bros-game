import { describe, expect, it } from 'vitest';
import {
  creatureInView, headingOf, Population, soloBirdHeight, stepCreature, suits, turnTowards,
  type Creature, type CreatureSettings,
} from './creatures';
import { generateSpecies, speciesName } from './species';
import { branchesOf, type TreeSource } from './climbers';
import { mulberry32 } from './noise';
import { PlantCache, trunkRadiusAt, type Tree } from './plants';
import { createTerrain, type Terrain } from './terrain';

const WATER = -3;
const settings: CreatureSettings = {
  chunkSize: 48, waterLevel: WATER, viewRadius: 2, abundance: 1, leash: 25,
  birdAltitude: 28, flockDrift: 1.5, soloBirdAltitude: 9, fishJumpChance: 0.04, treeHop: 10, gravity: 22,
};
const species = generateSpecies(42);
const index = (kind: string, nth = 0) => species.map((s, i) => [s, i] as const).filter(([s]) => s.kind === kind)[nth]![1];

/** Dry land at height 0 for x < 20, a lake 6 m deep beyond. */
const shore: Terrain = { heightAt: (x) => (x < 20 ? 0 : -6), densityAt: () => 0.5 };

function animal(speciesIndex: number, over: Partial<Creature> = {}): Creature {
  return {
    species: speciesIndex, x: 0, y: 0, z: 0, heading: 0, speed: 0, vy: 0, mode: 'idle', timer: 1, phase: 0,
    graze: 0, tint: 0, homeX: 0, homeZ: 0, orbit: 0, orbitRadius: 20, orbitSpeed: 0.3, drift: 0,
    offsetX: 0, offsetY: 1, offsetZ: 0, tree: null, onTrunk: false, around: 0, climb: 0, goal: 0, from: null, to: null, swing: 0,
    rng: mulberry32(1), ...over,
  };
}

const noTrees: TreeSource = { treesIn: () => [], treesNear: () => [] };

function run(c: Creature, seconds: number, player = { x: 1000, y: 0, z: 1000 }, terrain = shore, trees = noTrees): void {
  for (let t = 0; t < seconds; t += 1 / 60) stepCreature(c, species[c.species]!, 1 / 60, player, terrain, settings, trees);
}

describe('species', () => {
  it('invents the same species for the same seed, and different ones for another', () => {
    expect(generateSpecies(42)).toEqual(species);
    expect(generateSpecies(43).map((s) => s.name)).not.toEqual(species.map((s) => s.name));
  });

  it('has three grazers of increasing size, two birds, a fish, a lizard and a monkey, all named differently', () => {
    expect(species.map((s) => s.kind)).toEqual(['grazer', 'grazer', 'grazer', 'bird', 'bird', 'fish', 'lizard', 'monkey']);
    expect(species.filter((s) => s.solo).map((s) => s.kind)).toEqual(['bird']);
    const [a, b, c] = species;
    expect(a!.body.length).toBeLessThan(b!.body.length);
    expect(b!.body.length).toBeLessThan(c!.body.length);
    expect(new Set(species.map((s) => s.name)).size).toBe(species.length);
  });

  it('makes capitalised, pronounceable names', () => {
    const rng = mulberry32(5);
    for (let i = 0; i < 20; i++) expect(speciesName(rng)).toMatch(/^[A-Z][a-z]{3,}$/);
  });

  it('never makes unfortunate names', () => {
    const rng = mulberry32(6);
    for (let i = 0; i < 5000; i++) expect(speciesName(rng).toLowerCase()).not.toMatch(/puke|sex|nazi|rape|tit|shit/);
  });
});

describe('spawning', () => {
  const terrain = createTerrain(7, WATER);
  const plants = new PlantCache(7, terrain, {
    chunkSize: 48, waterLevel: WATER, treeAttempts: 70, undergrowthAttempts: 240, fruitTreeShare: 0.25,
    waterfalls: { attempts: 12, minDrop: 8, minSteepness: 1, maxLength: 30, minPool: 8 },
  });
  const population = () => new Population(7, terrain, plants, species, settings);

  it('spawns the same animals in a chunk every time', () => {
    const strip = (cs: Creature[]) => cs.map(({ rng: _, ...rest }) => rest);
    expect(strip(population().spawnChunk(3, -2))).toEqual(strip(population().spawnChunk(3, -2)));
  });

  it('puts every animal in its habitat', () => {
    const p = population();
    let count = 0;
    for (let cx = -4; cx <= 4; cx++) {
      for (let cz = -4; cz <= 4; cz++) {
        for (const c of p.spawnChunk(cx, cz)) {
          count++;
          const sp = species[c.species]!;
          const ground = terrain.heightAt(c.x, c.z);
          if (sp.kind !== 'lizard' && sp.kind !== 'monkey') expect(suits(sp, ground, WATER)).toBe(true);
          if (sp.kind === 'monkey') {
            // Hanging by one hand from a branch of its tree.
            expect(branchesOf(c.tree!)).toContainEqual({ x: c.x, y: c.y, z: c.z });
          }
          if (sp.kind === 'fish') expect(c.y).toBeLessThan(WATER);
          if (sp.kind === 'bird' && !sp.solo) expect(c.y).toBeGreaterThan(ground + 20);
          if (sp.solo) expect(c.y).toBeCloseTo(soloBirdHeight(terrain, c.x, c.z, settings));
          if (sp.kind === 'lizard') {
            const t = c.tree!;
            expect(t.kind).not.toBe('palm');
            expect(Math.hypot(c.x - t.x, c.z - t.z)).toBeCloseTo(trunkRadiusAt(t, c.climb) + 0.05);
            expect(c.y).toBeGreaterThan(t.y);
            expect(c.y).toBeLessThan(t.y + t.height);
          }
        }
      }
    }
    expect(count).toBeGreaterThan(50);
  });

  it('only keeps animals in chunks near the player', () => {
    const p = population();
    p.sync(0, 0);
    const near = [...p.all()].length;
    p.sync(10_000, 10_000);
    const far = [...p.all()];
    expect(near).toBeGreaterThan(0);
    for (const c of far) expect(Math.abs(c.homeX - 10_000)).toBeLessThan(48 * 4);
  });
});

describe('grazers', () => {
  it('run away from a nearby player', () => {
    const c = animal(index('grazer'));
    const before = Math.hypot(c.x - 3, c.z);
    run(c, 1, { x: 3, y: 0, z: 0 });
    expect(c.mode).toBe('flee');
    expect(Math.hypot(c.x - 3, c.z)).toBeGreaterThan(before + 2);
  });

  it('never walk into the water, even when chased towards it', () => {
    const c = animal(index('grazer', 1), { x: 15 });
    for (let i = 0; i < 600; i++) {
      run(c, 1 / 60, { x: c.x - 4, y: 0, z: c.z });
      expect(c.x).toBeLessThan(20);
    }
  });

  it('stay near home when left alone', () => {
    const c = animal(index('grazer'), { x: -50, homeX: -50 });
    run(c, 120);
    expect(Math.hypot(c.x - c.homeX, c.z - c.homeZ)).toBeLessThan(settings.leash + 10);
    expect(c.y).toBe(0);
  });
});

describe('fish', () => {
  it('stay in the water and under the surface, except when leaping', () => {
    const c = animal(index('fish'), { x: 40, homeX: 40, y: WATER - 1 });
    let highest = -Infinity;
    for (let i = 0; i < 60 * 120; i++) {
      run(c, 1 / 60);
      expect(c.x).toBeGreaterThan(20);
      if (c.mode === 'jump') highest = Math.max(highest, c.y);
      else expect(c.y).toBeLessThan(WATER);
    }
    // At least one leap clears the surface.
    expect(highest).toBeGreaterThan(WATER + 0.4);
  });
});

describe('birds', () => {
  it('fly high above the ground in a circle around a drifting home', () => {
    const c = animal(index('bird'), { y: 28 });
    for (let i = 0; i < 60 * 30; i++) {
      run(c, 1 / 60);
      expect(c.y).toBeGreaterThan(20);
      const r = Math.hypot(c.x - c.homeX - c.offsetX, c.z - c.homeZ - c.offsetZ);
      expect(r).toBeCloseTo(c.orbitRadius, 5);
    }
    expect(Math.hypot(c.homeX, c.homeZ)).toBeCloseTo(30 * settings.flockDrift, 0);
  });
});

describe('solo birds', () => {
  const solo = index('bird', 1);

  it('fly alone, below the flocks but clear of the ground', () => {
    const terrain = createTerrain(7, WATER);
    const c = animal(solo, { y: soloBirdHeight(terrain, 0, 0, settings) });
    for (let i = 0; i < 60 * 60; i++) {
      run(c, 1 / 60, undefined, terrain);
      const ground = Math.max(terrain.heightAt(c.x, c.z), WATER);
      expect(c.y - ground).toBeGreaterThan(5);
      expect(c.y - ground).toBeLessThan(settings.birdAltitude);
    }
  });

  it('wander but come back towards home', () => {
    const c = animal(solo, { y: 9 });
    let farthest = 0;
    for (let i = 0; i < 60 * 300; i++) {
      run(c, 1 / 60);
      farthest = Math.max(farthest, Math.hypot(c.x, c.z));
    }
    expect(farthest).toBeGreaterThan(20);
    expect(farthest).toBeLessThan(settings.leash * 3 + 60);
  });
});

describe('lizards', () => {
  const lizard = index('lizard');
  const trunk = (x: number, z = 0): Tree => ({
    kind: 'broadleaf', x, y: 0, z, height: 15, baseRadius: 0.6, topRadius: 0.35, tiltX: 0, tiltZ: 0, turn: 0,
    bark: { h: 0, s: 0, l: 0 }, crown: [], fruit: [], buttresses: 0,
  });
  const onTree = (tree: Tree, over: Partial<Creature> = {}) =>
    animal(lizard, { tree, onTrunk: true, around: 0, climb: 3, goal: 3, x: tree.x + 0.6, ...over });

  it('stay on the trunk surface as they climb about', () => {
    const tree = trunk(0);
    const c = onTree(tree, { rng: mulberry32(9) });
    const trees: TreeSource = { treesIn: () => [tree], treesNear: () => [tree] };
    for (let i = 0; i < 60 * 60; i++) {
      run(c, 1 / 60, undefined, shore, trees);
      expect(c.tree).toBe(tree);
      expect(c.climb).toBeGreaterThanOrEqual(0);
      expect(c.climb).toBeLessThanOrEqual(tree.height * 0.7 + 1e-9);
      expect(Math.hypot(c.x, c.z)).toBeCloseTo(trunkRadiusAt(tree, c.climb) + 0.05);
    }
  });

  it('dart up and round to the far side when the player comes close', () => {
    const tree = trunk(0);
    const c = onTree(tree, { around: Math.PI }); // on the -X side, facing the player
    const player = { x: -3, y: 0, z: 0 };
    run(c, 3, player, shore, { treesIn: () => [tree], treesNear: () => [tree] });
    expect(c.mode).toBe('flee');
    expect(c.climb).toBeGreaterThan(6);
    expect(c.x).toBeGreaterThan(0); // now on the +X side, away from the player
  });

  it('climb down and run across to another tree', () => {
    const a = trunk(0);
    const b = trunk(6);
    const c = onTree(a, { mode: 'leave', goal: 0 });
    run(c, 20, undefined, shore, { treesIn: () => [a, b], treesNear: () => [a, b] });
    expect(c.tree).toBe(b);
  });
});

describe('monkeys', () => {
  const monkey = index('monkey');
  /** A row of trees 5 m apart, each with a crown at 10 m. */
  const row: Tree[] = Array.from({ length: 8 }, (_, i) => ({
    kind: 'broadleaf', x: i * 5, y: 0, z: 0, height: 10, baseRadius: 0.5, topRadius: 0.3, tiltX: 0, tiltZ: 0, turn: 0,
    bark: { h: 0, s: 0, l: 0 }, fruit: [], buttresses: 0,
    crown: [{ x: i * 5, y: 10, z: 0, r: 3, squash: 0.7, turn: 0, colour: { h: 0, s: 0, l: 0 } }],
  }));
  const trees: TreeSource = {
    treesIn: () => row,
    treesNear: (x, z, r) => row.filter((t) => Math.hypot(t.x - x, t.z - z) <= r),
  };
  const hangingAt = (i: number, over: Partial<Creature> = {}) => {
    const branch = branchesOf(row[i]!)[0]!;
    return animal(monkey, { tree: row[i]!, from: branch, ...branch, homeX: row[i]!.x, homeZ: 0, timer: 0, ...over });
  };

  it('swing from tree to tree along a dipping arc, never dropping far below the branches', () => {
    const c = hangingAt(3);
    const branchY = branchesOf(row[0]!)[0]!.y;
    const visited = new Set<Tree>();
    for (let i = 0; i < 60 * 60; i++) {
      run(c, 1 / 60, undefined, shore, trees);
      visited.add(c.tree!);
      expect(c.y).toBeLessThanOrEqual(branchY + 1e-9);
      expect(c.y).toBeGreaterThan(branchY - 2.01);
      if (!c.to) expect({ x: c.x, y: c.y, z: c.z }).toEqual(c.from);
    }
    expect(visited.size).toBeGreaterThan(2);
  });

  it('swing away from the player', () => {
    const c = hangingAt(3); // at x = 15
    const player = { x: 18, y: 0, z: 0 };
    run(c, 4, player, shore, trees);
    expect(c.x).toBeLessThan(10);
  });

  it('stay put when there is nowhere to swing to', () => {
    const lone = row[0]!;
    const c = hangingAt(0);
    run(c, 30, undefined, shore, { treesIn: () => [lone], treesNear: () => [lone] });
    expect(c.from).toEqual(branchesOf(lone)[0]);
    expect(c.to).toBeNull();
  });
});

describe('helpers', () => {
  it('headingOf matches the player convention: 0 faces -Z, π/2 faces -X', () => {
    expect(headingOf(0, -1)).toBeCloseTo(0);
    expect(headingOf(-1, 0)).toBeCloseTo(Math.PI / 2);
  });

  it('turnTowards takes the short way round and limits the step', () => {
    expect(turnTowards(3, -3, 10)).toBeCloseTo(3 + (2 * Math.PI - 6));
    expect(turnTowards(0, 1, 0.1)).toBeCloseTo(0.1);
  });

  it('finds the animal in the middle of the view, and ignores ones off to the side', () => {
    const ahead = animal(index('grazer', 2), { z: -10 });
    const aside = animal(index('grazer', 2), { x: 10 });
    const eye = { x: 0, y: 0.5, z: 0 };
    expect(creatureInView([ahead, aside], species, eye, { x: 0, y: 0, z: -1 }, 30)).toBe(ahead);
    expect(creatureInView([ahead, aside], species, eye, { x: 0, y: 1, z: 0 }, 30)).toBeNull();
    expect(creatureInView([ahead], species, eye, { x: 0, y: 0, z: -1 }, 5)).toBeNull();
  });
});
