import { describe, expect, it } from 'vitest';
import { createTerrain, type Terrain } from './terrain';
import { downhillPath, findWaterfall, type WaterfallSettings } from './waterfalls';

const WATER = -3;
const settings: WaterfallSettings = { chunkSize: 48, waterLevel: WATER, attempts: 12, minDrop: 8, minSteepness: 1, maxLength: 30, minPool: 8 };

/** A steep slope (2 m down per metre east) running into a lake that starts at x = 21.5. */
const cliff: Terrain = { heightAt: (x) => (x < 21.5 ? 40 - x * 2 : -6), densityAt: () => 0 };
/** The same slope, but into a gorge only 4 m wide with a high far bank. */
const gorge: Terrain = { heightAt: (x) => (x < 21.5 ? 40 - x * 2 : x < 25.5 ? -6 : 30), densityAt: () => 0 };
const plain: Terrain = { heightAt: () => 5, densityAt: () => 0 };
const gentle: Terrain = { heightAt: (x) => 20 - x * 0.3, densityAt: () => 0 };

describe('waterfalls', () => {
  it('runs down a cliff into the water', () => {
    const w = findWaterfall(0, 0, 1, cliff, settings)!;
    expect(w).not.toBeNull();
    expect(w.path[0]!.y).toBeGreaterThanOrEqual(WATER + settings.minDrop);
    expect(w.path[w.path.length - 1]!.y).toBeLessThan(WATER);
    expect(w.drop / (w.path.length - 1)).toBeGreaterThan(settings.minSteepness);
    expect(w.bottomWidth).toBeGreaterThan(w.topWidth);
  });

  it('never flows uphill', () => {
    const w = findWaterfall(0, 0, 1, cliff, settings)!;
    for (let i = 1; i < w.path.length; i++) expect(w.path[i]!.y).toBeLessThanOrEqual(w.path[i - 1]!.y + 1e-9);
  });

  it('skips falls hidden in a narrow gorge', () => {
    expect(findWaterfall(0, 0, 1, gorge, settings)).toBeNull();
  });

  it('finds none on flat ground or gentle slopes', () => {
    expect(findWaterfall(0, 0, 1, plain, settings)).toBeNull();
    expect(findWaterfall(0, 0, 1, gentle, settings)).toBeNull();
  });

  it('gives up when the way down never reaches water', () => {
    expect(downhillPath(plain, 10, 10, WATER, 30)).toBeNull();
  });

  it('is the same every time, and turns up now and then in real worlds', () => {
    const terrain = createTerrain(777, WATER);
    let found = 0;
    for (let cx = -5; cx < 5; cx++) {
      for (let cz = -5; cz < 5; cz++) {
        const w = findWaterfall(cx, cz, 777, terrain, settings);
        expect(findWaterfall(cx, cz, 777, terrain, settings)).toEqual(w);
        if (w) found++;
      }
    }
    expect(found).toBeGreaterThan(2);
    expect(found).toBeLessThan(30);
  });
});
