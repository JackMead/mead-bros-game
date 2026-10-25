import { describe, expect, it } from 'vitest';
import { config } from './config';
import { createWorld, update } from './world';

const stick = (x: number, y: number) => ({ axis: () => ({ x, y }) });

describe('world.update', () => {
  it('moves the player right at configured speed', () => {
    const world = createWorld();
    const startX = world.player.x;
    update(world, stick(1, 0), 0.5);
    expect(world.player.x).toBeCloseTo(startX + config.player.speed * 0.5);
  });

  it('does not move faster diagonally', () => {
    const world = createWorld();
    const { x, y } = world.player;
    update(world, stick(1, 1), 0.1);
    const dist = Math.hypot(world.player.x - x, world.player.y - y);
    expect(dist).toBeCloseTo(config.player.speed * 0.1);
  });

  it('keeps the player inside the screen', () => {
    const world = createWorld();
    update(world, stick(-1, -1), 100);
    expect(world.player.x).toBe(0);
    expect(world.player.y).toBe(0);
  });
});
