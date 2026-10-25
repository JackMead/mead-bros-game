import { config } from './config';

export interface Player {
  x: number;
  y: number;
}

export interface World {
  player: Player;
}

/** Anything that can report a movement direction. `Input` satisfies this; tests can pass a stub. */
export interface AxisSource {
  axis(): { x: number; y: number };
}

export function createWorld(): World {
  return {
    player: {
      x: (config.width - config.player.size) / 2,
      y: (config.height - config.player.size) / 2,
    },
  };
}

/** Advance the world by `dt` seconds. Pure game logic: no drawing, no DOM. */
export function update(world: World, input: AxisSource, dt: number): void {
  const { x, y } = input.axis();
  // Normalise so diagonal movement isn't faster than straight movement.
  const len = Math.hypot(x, y) || 1;
  const p = world.player;
  p.x += (x / len) * config.player.speed * dt;
  p.y += (y / len) * config.player.speed * dt;

  // Keep the player on screen.
  p.x = clamp(p.x, 0, config.width - config.player.size);
  p.y = clamp(p.y, 0, config.height - config.player.size);
}

export function render(world: World, ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = config.background;
  ctx.fillRect(0, 0, config.width, config.height);

  const { x, y } = world.player;
  ctx.fillStyle = config.player.color;
  ctx.fillRect(Math.round(x), Math.round(y), config.player.size, config.player.size);
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
