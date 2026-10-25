import { config } from './config';
import { Input } from './engine/input';
import { startLoop } from './engine/loop';
import { createWorld, render, update } from './game/world';

const canvas = document.querySelector<HTMLCanvasElement>('#game');
if (!canvas) throw new Error('Missing #game canvas');

canvas.width = config.width;
canvas.height = config.height;
const ctx = canvas.getContext('2d');
if (!ctx) throw new Error('2D context not available');

const input = new Input(window);
const world = createWorld();

startLoop({
  step: config.fixedStep,
  update: (dt) => update(world, input, dt),
  render: () => render(world, ctx),
});
