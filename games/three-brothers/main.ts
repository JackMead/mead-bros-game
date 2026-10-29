import { chapters } from './chapters';
import { config } from './config';
import { startLoop } from '../../src/engine/loop';
import type { Action } from './engine';
import { render } from './render';
import { createUi, hold, hoverAt, showTitle, tap, update, type Store } from './ui';

const canvas = document.querySelector<HTMLCanvasElement>('#game');
if (!canvas) throw new Error('Missing #game canvas');
const ctx = canvas.getContext('2d');
if (!ctx) throw new Error('2D context not available');

// Progress lives in this browser only. Storage can be blocked (private windows), so never rely on it.
const key = (id: string) => `three-brothers:save:${id}`;
const store: Store = {
  load: (id) => {
    try {
      const raw = localStorage.getItem(key(id));
      return raw ? (JSON.parse(raw) as Action[]) : null;
    } catch {
      return null;
    }
  },
  save: (id, history) => {
    try {
      localStorage.setItem(key(id), JSON.stringify(history));
    } catch {
      /* not saved; fine */
    }
  },
  clear: (id) => {
    try {
      localStorage.removeItem(key(id));
    } catch {
      /* nothing to clear */
    }
  },
};

const ui = createUi(chapters);
showTitle(ui, store);

// Fit the 16:9 game into the window, drawn sharply at the screen's real resolution.
let scale = 1;
function resize(): void {
  scale = Math.min(window.innerWidth / config.width, window.innerHeight / config.height);
  const dpr = window.devicePixelRatio || 1;
  canvas!.style.width = `${config.width * scale}px`;
  canvas!.style.height = `${config.height * scale}px`;
  canvas!.width = Math.round(config.width * scale * dpr);
  canvas!.height = Math.round(config.height * scale * dpr);
  ctx!.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
}
window.addEventListener('resize', resize);
resize();

const toGame = (e: PointerEvent) => {
  const r = canvas.getBoundingClientRect();
  return { x: ((e.clientX - r.left) / r.width) * config.width, y: ((e.clientY - r.top) / r.height) * config.height };
};

// A press becomes a "tap" when released quickly, or a "hold" (look) after a moment
// or on right-click. Moving a finger more than a little cancels it.
let press: { x: number; y: number; t: number; done: boolean } | null = null;

canvas.addEventListener('contextmenu', (e) => e.preventDefault());
canvas.addEventListener('pointerdown', (e) => {
  const p = toGame(e);
  if (e.button === 2) {
    hold(ui, p.x, p.y, store);
    press = null;
    return;
  }
  press = { ...p, t: 0, done: false };
});
canvas.addEventListener('pointermove', (e) => {
  const p = toGame(e);
  if (e.pointerType === 'mouse') {
    hoverAt(ui, p.x, p.y);
    canvas.style.cursor = ui.hover || ui.hoverChoice !== null ? 'pointer' : 'default';
  }
  if (press && Math.hypot(p.x - press.x, p.y - press.y) > 14) press.done = true;
});
canvas.addEventListener('pointerup', () => {
  if (press && !press.done) tap(ui, press.x, press.y, store);
  press = null;
});
canvas.addEventListener('pointercancel', () => (press = null));

startLoop({
  step: config.fixedStep,
  update: (dt) => {
    update(ui, dt);
    if (press && !press.done) {
      press.t += dt;
      if (press.t >= config.longPressSeconds) {
        press.done = true;
        hold(ui, press.x, press.y, store);
      }
    }
  },
  render: () => render(ui, ctx),
});
