import { cast } from './cast';
import { config } from './config';
import { ICONS } from './props';
import type { BrotherId, Chapter, Hotspot, Stand } from './types';
import type { Effect, Ui } from './ui';

/**
 * Drawing for cinematic cues (see cues.ts for what each one means).
 * Drawing only: everything is worked out from when each effect started.
 */

const { width, height } = config;

const since = (ui: Ui, e: Effect) => ui.time - e.start;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const easeInOut = (p: number) => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2);
const easeOut = (p: number) => 1 - (1 - p) ** 3;

/** Clock for animated scenery: stops while time is frozen. */
export function sceneryTime(ui: Ui): number {
  return ui.cinema.frozenAt ?? ui.time;
}

/** How far to nudge the whole scene this frame. */
export function shakeOffset(ui: Ui): { x: number; y: number } {
  let amp = 0;
  for (const e of ui.cinema.effects) {
    if (e.name !== 'shake') continue;
    const p = since(ui, e) / Number(e.args[0]);
    if (p < 1) amp = Math.max(amp, 7 * (1 - p));
  }
  if (!amp) return { x: 0, y: 0 };
  return { x: Math.sin(ui.time * 61) * amp, y: Math.cos(ui.time * 47) * amp * 0.6 };
}

/** Effects that belong in the scene, behind the brothers. */
export function drawCinemaBack(ctx: CanvasRenderingContext2D, ui: Ui, bg: HTMLImageElement | null): void {
  for (const e of ui.cinema.effects) {
    if (e.name === 'place') drawPlaced(ctx, ui, e);
    else if (e.name === 'awaken') drawAwaken(ctx, ui, e, bg);
    else if (e.name === 'turn-head' && bg) drawTurnHead(ctx, ui, e, bg);
    else if (e.name === 'vortex') drawVortex(ctx, ui, e);
  }
}

/** Effects over everything in the scene. */
export function drawCinemaFront(ctx: CanvasRenderingContext2D, ui: Ui): void {
  for (const e of ui.cinema.effects) {
    if (e.name === 'streaks') drawStreaks(ctx, ui, e);
  }
  for (const e of ui.cinema.effects) {
    if (e.name !== 'flash') continue;
    const t = since(ui, e);
    const a = t < 0.08 ? t / 0.08 : Math.max(0, 1 - (t - 0.08) / 0.9);
    if (a > 0) {
      ctx.fillStyle = `rgba(255,250,240,${a})`;
      ctx.fillRect(-20, -20, width + 40, height + 40);
    }
  }
}

export type Pulled = 'gone' | { x: number; y: number; rotation: number; scale: number } | null;

/** Where a brother being sucked into the vortex is, or 'gone', or null if he isn't. */
export function pulled(ui: Ui, b: BrotherId, stand: Stand, h: number): Pulled {
  const e = ui.cinema.effects.find((f) => f.name === 'pull' && f.args[0] === b);
  if (!e) return null;
  const p = clamp01(since(ui, e) / 1.3);
  if (p >= 1) return 'gone';
  const v = vortexCentre(ui) ?? { x: stand.x, y: stand.y - h };
  const q = p * p;
  return {
    x: stand.x + (v.x - stand.x) * q,
    y: stand.y - h / 2 + (v.y - (stand.y - h / 2)) * q,
    rotation: q * 12,
    scale: 1 - q * 0.95,
  };
}

function vortexCentre(ui: Ui): { x: number; y: number } | null {
  const v = ui.cinema.effects.find((e) => e.name === 'vortex');
  return v ? { x: Number(v.args[0]), y: Number(v.args[1]) } : null;
}

// ---- Individual effects ----

function drawPlaced(ctx: CanvasRenderingContext2D, ui: Ui, e: Effect): void {
  const icon = ICONS[e.args[0]];
  const [x, y, size] = e.args.slice(1).map(Number);
  if (!icon) return;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.3, size * 0.45, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.translate(x, y);
  ctx.rotate(Math.PI / 2.3);
  icon(ctx, { x: -size / 2, y: -size / 2, w: size, h: size }, ui.time);
  ctx.restore();
}

/** A painted thing comes to life: it trembles and glows, then a spirit steps out of it. */
function drawAwaken(ctx: CanvasRenderingContext2D, ui: Ui, e: Effect, bg: HTMLImageElement | null): void {
  const hotspot = findHotspot(ui.chapter!, e.args[0]);
  if (!hotspot?.outline) return;
  const t = since(ui, e);
  const dx = Number(e.args[1]);
  const dy = Number(e.args[2]);
  const stone = cutout(hotspot, bg, false);
  const spirit = cutout(hotspot, bg, true);

  // The stone itself: trembling, then glowing.
  const stir = clamp01(t / 1.4);
  const jitter = t < 1.6 ? 1.6 * stir : 0;
  ctx.save();
  ctx.shadowColor = 'rgba(190,120,255,0.95)';
  ctx.shadowBlur = t < 1.4 ? 34 * stir : 12 + Math.sin(ui.time * 3) * 4;
  ctx.drawImage(stone.canvas, stone.x + Math.sin(ui.time * 70) * jitter, stone.y + Math.cos(ui.time * 53) * jitter * 0.5, stone.w, stone.h);
  ctx.restore();
  if (t < 1.4) return;

  // The spirit steps out and hovers.
  const p = easeInOut(clamp01((t - 1.4) / 2.2));
  const bob = t > 3.6 ? Math.sin(ui.time * 2) * 3 : 0;
  const scale = 1 + 0.12 * p;
  const w = spirit.w * scale;
  const hh = spirit.h * scale;
  const footX = spirit.x + spirit.w / 2 + dx * p;
  const footY = spirit.y + spirit.h + dy * p + bob;
  ctx.save();
  ctx.globalAlpha = Math.min(1, p * 2.5) * 0.95;
  ctx.shadowColor = 'rgba(200,140,255,1)';
  ctx.shadowBlur = 26 + Math.sin(ui.time * 4) * 6;
  ctx.drawImage(spirit.canvas, footX - w / 2, footY - hh, w, hh);
  ctx.restore();
}

interface Cut {
  canvas: HTMLCanvasElement;
  x: number;
  y: number;
  w: number;
  h: number;
}
const cuts = new Map<string, Cut>();

/** The hotspot's outline cut out of the painting (or a dark shape without one), optionally tinted spirit-purple. */
function cutout(h: Hotspot, bg: HTMLImageElement | null, spirit: boolean): Cut {
  const key = `${h.id}:${spirit}:${!!bg}`;
  const cached = cuts.get(key);
  if (cached) return cached;
  const pts = h.outline!;
  const xs = pts.filter((_, i) => i % 2 === 0);
  const ys = pts.filter((_, i) => i % 2 === 1);
  const x = Math.min(...xs) - 2;
  const y = Math.min(...ys) - 2;
  const w = Math.max(...xs) - x + 4;
  const hh = Math.max(...ys) - y + 4;
  const res = 2;
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(w * res);
  canvas.height = Math.ceil(hh * res);
  const c = canvas.getContext('2d')!;
  c.scale(res, res);
  c.translate(-x, -y);
  c.beginPath();
  for (let i = 0; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.closePath();
  c.clip();
  if (bg) c.drawImage(bg, 0, 0, width, height);
  else {
    c.fillStyle = '#6d6a66';
    c.fillRect(x, y, w, hh);
  }
  if (spirit) {
    c.globalCompositeOperation = 'source-atop';
    const g = c.createLinearGradient(0, y, 0, y + hh);
    g.addColorStop(0, 'rgba(60,20,90,0.55)');
    g.addColorStop(1, 'rgba(20,10,40,0.75)');
    c.fillStyle = g;
    c.fillRect(x, y, w, hh);
    c.globalCompositeOperation = 'lighter';
    c.fillStyle = 'rgba(90,40,140,0.35)';
    c.fillRect(x, y, w, hh);
  }
  const cut = { canvas, x, y, w, h: hh };
  cuts.set(key, cut);
  return cut;
}

/** Something painted (a teddy bear) slowly turns its head, eyes glowing. */
function drawTurnHead(ctx: CanvasRenderingContext2D, ui: Ui, e: Effect, bg: HTMLImageElement): void {
  const [x, y, r] = e.args.map(Number);
  const angle = 0.65 * easeOut(clamp01(since(ui, e) / 0.7));
  const sx = bg.naturalWidth / width;
  const sy = bg.naturalHeight / height;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(bg, (x - r) * sx, (y - r) * sy, 2 * r * sx, 2 * r * sy, -r, -r, 2 * r, 2 * r);
  ctx.restore();
  // Eyes.
  const glow = clamp01(since(ui, e) / 0.7);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = `rgba(255,60,40,${glow})`;
  ctx.shadowColor = 'rgba(255,40,20,1)';
  ctx.shadowBlur = 10;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(s * r * 0.28, -r * 0.08, Math.max(1.5, r * 0.09), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawVortex(ctx: CanvasRenderingContext2D, ui: Ui, e: Effect): void {
  const x = Number(e.args[0]);
  const y = Number(e.args[1]);
  const R = 115 * easeOut(clamp01(since(ui, e) / 1));
  if (R < 1) return;
  ctx.save();
  const core = ctx.createRadialGradient(x, y, 0, x, y, R);
  core.addColorStop(0, 'rgba(10,0,25,0.95)');
  core.addColorStop(0.55, 'rgba(60,20,110,0.6)');
  core.addColorStop(1, 'rgba(60,20,110,0)');
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  const arms = 6;
  for (let k = 0; k < arms; k++) {
    ctx.strokeStyle = k % 2 ? 'rgba(120,220,255,0.55)' : 'rgba(200,130,255,0.6)';
    ctx.lineWidth = 3 + (k % 3);
    ctx.beginPath();
    for (let s = 0.05; s <= 1; s += 0.03) {
      const a = (k / arms) * Math.PI * 2 + s * 5.5 - ui.time * 5;
      ctx.lineTo(x + Math.cos(a) * R * s, y + Math.sin(a) * R * s * 0.8);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/** One streak per vanished brother, shooting off in different directions. */
function drawStreaks(ctx: CanvasRenderingContext2D, ui: Ui, e: Effect): void {
  const v = vortexCentre(ui) ?? { x: width / 2, y: height / 2 };
  const gone = ui.cinema.effects.filter((f) => f.name === 'pull').map((f) => f.args[0] as BrotherId);
  const angles = [-2.4, -1.45, -0.55];
  const p = easeInOut(clamp01(since(ui, e) / 1.3));
  if (p >= 1) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  gone.forEach((b, i) => {
    const a = angles[i % angles.length];
    const head = 40 + p * 1100;
    const tail = Math.max(0, head - 220);
    const hx = v.x + Math.cos(a) * head;
    const hy = v.y + Math.sin(a) * head;
    const tx = v.x + Math.cos(a) * tail;
    const ty = v.y + Math.sin(a) * tail;
    const g = ctx.createLinearGradient(tx, ty, hx, hy);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(1, cast[b].colour);
    ctx.strokeStyle = g;
    ctx.shadowColor = cast[b].colour;
    ctx.shadowBlur = 18;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(hx, hy);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(hx, hy, 5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function findHotspot(chapter: Chapter, id: string): Hotspot | undefined {
  return Object.values(chapter.scenes)
    .flatMap((s) => s.hotspots)
    .find((h) => h.id === id);
}
