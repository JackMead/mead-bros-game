import { chapters } from './chapters';
import { config } from './config';
import { startLoop } from '../../src/engine/loop';
import type { Action } from './engine';
import { render } from './render';
import { decodeSaves, encodeSaves, usableSaves, type Saves } from './savelink';
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

const say = (text: string) => (ui.notice = { text, t: 3 });

// "Continue on another device": a link with every chapter's progress in it.
store.share = async () => {
  const saves: Saves = {};
  for (const c of chapters) {
    const h = store.load(c.id);
    if (h?.length) saves[c.id] = h;
  }
  if (!Object.keys(saves).length) return say('Nothing to send yet: play a bit first.');
  const url = `${location.origin}${location.pathname}${await encodeSaves(saves)}`;
  const title = 'The Three Brothers of Yorkshire: my saved game';
  try {
    if (navigator.share) {
      await navigator.share({ title, text: 'Open this to carry on where I left off.', url });
      return;
    }
    await navigator.clipboard.writeText(url);
    say('Link copied. Open it on your other device.');
  } catch {
    // Share sheet closed, or clipboard blocked: show the link so it can be copied by hand.
    window.prompt('Copy this link and open it on your other device:', url);
  }
};

// Opened from a save link: offer to load it, then tidy the address bar.
void (async () => {
  const saves = await decodeSaves(location.hash);
  if (!saves) return;
  history.replaceState(null, '', location.pathname + location.search);
  const ok = usableSaves(chapters, saves);
  if (!Object.keys(ok).length) return say("That link's save doesn't fit this version of the game.");
  const clash = Object.keys(ok).some((id) => store.load(id)?.length);
  if (clash && !window.confirm("Load the saved game from the link? It replaces this browser's progress on those chapters.")) return;
  for (const [id, h] of Object.entries(ok)) store.save(id, h);
  showTitle(ui, store);
  say('Saved game loaded. Tap a chapter to carry on.');
})();

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
