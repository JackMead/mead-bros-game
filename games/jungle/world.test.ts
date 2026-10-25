import { describe, expect, it } from 'vitest';
import { stepPlayer, type MoveSettings, type PlayerState } from './movement';
import { createNoise2D, fbm, mulberry32 } from './noise';
import { createTerrain, findSpawn } from './terrain';

const WATER = -3;
const settings: MoveSettings = {
  walkSpeed: 6, sprintSpeed: 11, swimFactor: 0.5, jumpSpeed: 7, gravity: 22, radius: 0.4, waterLevel: WATER,
};
const flat = () => 0;
const player = (over: Partial<PlayerState> = {}): PlayerState => ({
  x: 0, y: 0, z: 0, vy: 0, yaw: 0, pitch: 0, onGround: true, ...over,
});
const idle = { forward: 0, right: 0, sprint: false, jump: false };

describe('noise', () => {
  it('is deterministic for a seed and differs between seeds', () => {
    expect(mulberry32(7)()).toBe(mulberry32(7)());
    const a = createNoise2D(1);
    const b = createNoise2D(1);
    const c = createNoise2D(2);
    expect(a(3.3, 4.4)).toBe(b(3.3, 4.4));
    expect(a(3.3, 4.4)).not.toBe(c(3.3, 4.4));
  });

  it('stays roughly within [-1, 1]', () => {
    const n = createNoise2D(42);
    for (let i = 0; i < 5000; i++) {
      const v = fbm(n, i * 0.137, i * 0.291, 4);
      expect(Math.abs(v)).toBeLessThan(1.1);
    }
  });
});

describe('terrain', () => {
  it('generates the same world for the same seed', () => {
    const a = createTerrain(123, WATER);
    const b = createTerrain(123, WATER);
    expect(a.heightAt(50, -80)).toBe(b.heightAt(50, -80));
  });

  it('has hills, valleys and water', () => {
    const t = createTerrain(123, WATER);
    const heights = Array.from({ length: 4000 }, (_, i) => t.heightAt((i % 63) * 17, Math.floor(i / 63) * 17));
    expect(Math.max(...heights) - Math.min(...heights)).toBeGreaterThan(10);
    expect(heights.some((h) => h < WATER)).toBe(true);
  });

  it('spawns the player on dry land', () => {
    for (const seed of [1, 2, 3, 99, 4242]) {
      const t = createTerrain(seed, WATER);
      const { x, z } = findSpawn(t, WATER);
      expect(t.heightAt(x, z)).toBeGreaterThan(WATER);
    }
  });
});

describe('stepPlayer', () => {
  it('walks towards -Z when facing yaw 0', () => {
    const p = player();
    stepPlayer(p, { ...idle, forward: 1 }, 0.1, flat, [], settings);
    expect(p.z).toBeCloseTo(-0.6);
    expect(p.x).toBeCloseTo(0);
  });

  it('turning 90° left makes forward point towards -X', () => {
    const p = player({ yaw: Math.PI / 2 });
    stepPlayer(p, { ...idle, forward: 1 }, 0.1, flat, [], settings);
    expect(p.x).toBeCloseTo(-0.6);
    expect(p.z).toBeCloseTo(0);
  });

  it('falls and lands on the ground', () => {
    const p = player({ y: 10, onGround: false });
    for (let i = 0; i < 120; i++) stepPlayer(p, idle, 1 / 60, () => 2, [], settings);
    expect(p.y).toBe(2);
    expect(p.onGround).toBe(true);
  });

  it('jumps only from the ground', () => {
    const p = player();
    stepPlayer(p, { ...idle, jump: true }, 1 / 60, flat, [], settings);
    expect(p.y).toBeGreaterThan(0);
    const vy = p.vy;
    stepPlayer(p, { ...idle, jump: true }, 1 / 60, flat, [], settings);
    expect(p.vy).toBeLessThan(vy);
  });

  it('cannot walk through a tree trunk', () => {
    const p = player({ z: 2 });
    for (let i = 0; i < 60; i++) {
      stepPlayer(p, { ...idle, forward: 1 }, 1 / 60, flat, [{ x: 0, z: 0, r: 1 }], settings);
    }
    expect(Math.hypot(p.x, p.z)).toBeGreaterThanOrEqual(1.4 - 1e-9);
  });

  it('moves slower in deep water', () => {
    const p = player({ y: -6 });
    stepPlayer(p, { ...idle, forward: 1 }, 0.1, () => -6, [], settings);
    expect(p.z).toBeCloseTo(-0.3);
  });
});
