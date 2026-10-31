import { describe, expect, it } from 'vitest';
import { config } from './config';
import { generateFloor } from './generate';
import { dist, distances, same, tileAt } from './grid';
import { longRoad } from './kits/longRoad';

const seeds = Array.from({ length: 300 }, (_, i) => i * 7919 + 1);

describe('generateFloor', () => {
  it('is the same for the same seed and depth', () => {
    expect(generateFloor(123, 3, longRoad)).toEqual(generateFloor(123, 3, longRoad));
  });

  it('differs between seeds and depths', () => {
    const a = generateFloor(1, 1, longRoad);
    expect(generateFloor(2, 1, longRoad)).not.toEqual(a);
    expect(generateFloor(1, 2, longRoad)).not.toEqual(a);
  });

  it('always makes the stairs, items and every open square reachable', () => {
    for (const seed of seeds) {
      for (let depth = 1; depth <= config.run.floors; depth++) {
        const f = generateFloor(seed, depth, longRoad);
        const reach = distances(f, f.start, (p) => tileAt(f, p) === 'floor');
        const at = (p: { x: number; y: number }) => reach[p.y * f.width + p.x];
        expect(at(f.stairs)).toBeGreaterThan(0);
        for (const item of f.items) expect(at(item.pos)).toBeGreaterThan(0);
        f.tiles.forEach((t, i) => {
          if (t === 'floor') expect(reach[i]).toBeGreaterThanOrEqual(0);
        });
      }
    }
  });

  it('keeps enemies away from the start and off items and the stairs', () => {
    for (const seed of seeds) {
      for (let depth = 1; depth <= config.run.floors; depth++) {
        const f = generateFloor(seed, depth, longRoad);
        for (const e of f.enemies) {
          expect(tileAt(f, e.pos)).toBe('floor');
          expect(dist(e.pos, f.start)).toBeGreaterThanOrEqual(config.gen.safeRadius);
          expect(same(e.pos, f.stairs)).toBe(false);
          expect(f.items.some((i) => same(i.pos, e.pos))).toBe(false);
        }
        expect(f.enemies.length).toBeLessThanOrEqual(config.gen.maxEnemies);
      }
    }
  });

  it('puts the ring on the first floor only', () => {
    for (const seed of seeds.slice(0, 50)) {
      expect(generateFloor(seed, 1, longRoad).items.filter((i) => i.kind === 'ring')).toHaveLength(1);
      expect(generateFloor(seed, 2, longRoad).items.some((i) => i.kind === 'ring')).toBe(false);
    }
  });

  it('gets harder and richer with depth', () => {
    let shallow = 0;
    let deep = 0;
    let shallowValue = 0;
    let deepValue = 0;
    for (const seed of seeds) {
      const a = generateFloor(seed, 1, longRoad);
      const b = generateFloor(seed, 8, longRoad);
      shallow += a.enemies.length;
      deep += b.enemies.length;
      shallowValue += a.items.filter((i) => i.kind === 'relic').reduce((s, i) => s + i.value, 0);
      deepValue += b.items.filter((i) => i.kind === 'relic').reduce((s, i) => s + i.value, 0);
    }
    expect(deep).toBeGreaterThan(shallow);
    expect(deepValue).toBeGreaterThan(shallowValue * 2);
  });
});
