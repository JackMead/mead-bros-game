import { shade } from './characters';
import type { Rect } from './types';

/**
 * Built-in drawings for things that move, come and go, or carry lettering.
 * A hotspot uses one with `prop: "<name>"`; an item with `icon: "<name>"`.
 * Drawing only. Add new ones here and list them in PROPS / ICONS.
 */

const INK = '#2b1e16';
const CHALK = '"Chalkboard SE", "Comic Sans MS", "Marker Felt", cursive';
const PAINT = '"Trebuchet MS", "Arial Black", sans-serif';

/** Looks up a picture in art/ by file name (null until it has loaded, or if there isn't one). */
export type ArtLookup = (file: string) => HTMLImageElement | null;

/**
 * `painted` is true over a painted background, where signs only need their lettering.
 * `art` lets a prop use a painted picture when there is one.
 */
type Draw = (ctx: CanvasRenderingContext2D, r: Rect, time: number, text: string[], painted: boolean, art: ArtLookup) => void;

export const PROPS: Record<string, Draw> = {
  dog: drawDog,
  soapbox: (ctx, r) => drawCrate(ctx, r),
  chalkboard: drawChalkboard,
  sign: drawSign,
  water: drawWater,
  newspaper: (ctx, r) => drawNewspaper(ctx, r),
};

export const ICONS: Record<string, (ctx: CanvasRenderingContext2D, r: Rect, time: number) => void> = {
  soapbox: (ctx, r) => drawCrate(ctx, inset(r, 0.18, 0.28)),
  phone: drawPhone,
  wallet: drawWallet,
  tea: drawTea,
  pie: drawPie,
  cards: drawCards,
  bat: drawBat,
  coin: drawCoin,
  kipper: drawKipper,
  float: drawFloat,
  'card-red': (ctx, r, t) => drawCard(ctx, r, t, '#d9534f', false),
  'card-blue': (ctx, r, t) => drawCard(ctx, r, t, '#5b8fd9', false),
  'card-purple': (ctx, r, t) => drawCard(ctx, r, t, '#9b6ad9', false),
  'card-gold': (ctx, r, t) => drawCard(ctx, r, t, '#e8c040', true),
  penny: (ctx, r) => drawCoppers(ctx, r, 1),
  tuppence: (ctx, r) => drawCoppers(ctx, r, 2),
  suit: drawSuit,
  newspaper: drawNewspaper,
};

function begin(ctx: CanvasRenderingContext2D, width = 2): void {
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.lineWidth = width;
  ctx.strokeStyle = INK;
}

/** A sitting Labrador, looking right, tail going. Fills its rect, feet on the bottom edge. */
function drawDog(ctx: CanvasRenderingContext2D, r: Rect, time: number, _t: string[], _p: boolean, art: ArtLookup): void {
  const img = art('dog.png');
  if (img) return drawPuppet(ctx, img, DOG, r, time);
  const fur = '#d8a65a';
  const s = r.h / 90;
  const x = r.x + r.w * 0.42;
  const y = r.y + r.h;
  ctx.save();
  begin(ctx);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(x, y, 34 * s, 5 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail, wagging.
  const wag = Math.sin(time * 9) * 0.5;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 8 * s;
  ctx.beginPath();
  ctx.moveTo(x - 22 * s, y - 8 * s);
  ctx.quadraticCurveTo(x - 40 * s, y - 12 * s, x - 42 * s + wag * 10 * s, y - 28 * s);
  ctx.stroke();
  ctx.strokeStyle = fur;
  ctx.lineWidth = 5 * s;
  ctx.stroke();
  begin(ctx);

  ctx.fillStyle = fur;
  // Haunch and body.
  ctx.beginPath();
  ctx.ellipse(x - 10 * s, y - 20 * s, 22 * s, 20 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 18 * s, y - 34 * s);
  ctx.quadraticCurveTo(x + 2 * s, y - 70 * s, x + 18 * s, y - 52 * s);
  ctx.lineTo(x + 16 * s, y - 2 * s);
  ctx.lineTo(x - 4 * s, y - 2 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Front legs and paws.
  for (const dx of [2, 13]) {
    ctx.beginPath();
    ctx.roundRect(x + dx * s - 4 * s, y - 30 * s, 8 * s, 29 * s, 3 * s);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(x + dx * s + 1 * s, y - 2 * s, 6 * s, 3.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  // Head, looking towards the kiosk (right).
  const hx = x + 18 * s;
  const hy = y - 64 * s + Math.sin(time * 1.5) * 1 * s;
  ctx.beginPath();
  ctx.ellipse(hx, hy, 15 * s, 13 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(hx + 4 * s, hy - 2 * s, 18 * s, 12 * s, 6 * s);
  ctx.fill();
  ctx.stroke();
  // Nose, eye, ear.
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.ellipse(hx + 21 * s, hy + 1 * s, 3.5 * s, 3 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(hx + 5 * s, hy - 5 * s, 2.2 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = shade(fur, -0.25);
  ctx.beginPath();
  ctx.ellipse(hx - 7 * s, hy + 2 * s, 6 * s, 11 * s, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // A little drool.
  if (Math.sin(time * 0.8) > 0.2) {
    ctx.fillStyle = 'rgba(200,230,255,0.85)';
    ctx.beginPath();
    ctx.ellipse(hx + 14 * s, hy + 13 * s, 1.6 * s, 3.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawCrate(ctx: CanvasRenderingContext2D, r: Rect): void {
  ctx.save();
  begin(ctx);
  ctx.fillStyle = '#b07d45';
  ctx.beginPath();
  ctx.roundRect(r.x, r.y, r.w, r.h, 3);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = 'rgba(43,30,22,0.55)';
  ctx.lineWidth = 1.2;
  for (let i = 1; i < 3; i++) {
    const y = r.y + (r.h * i) / 3;
    ctx.beginPath();
    ctx.moveTo(r.x + 2, y);
    ctx.lineTo(r.x + r.w - 2, y);
    ctx.stroke();
  }
  ctx.fillStyle = '#5a3418';
  ctx.font = `bold ${Math.round(r.h * 0.42)}px Impact, "Arial Black", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SOAP', r.x + r.w / 2, r.y + r.h / 2 + 1);
  ctx.restore();
}

/** Chalk lettering on a board. Over a painted background, only the lettering is drawn. */
function drawChalkboard(ctx: CanvasRenderingContext2D, r: Rect, _t: number, text: string[], painted: boolean): void {
  ctx.save();
  begin(ctx, 3);
  if (painted) {
    lettering(ctx, r, text, 'rgba(245,245,235,0.92)', CHALK);
    ctx.restore();
    return;
  }
  ctx.fillStyle = '#2d3a33';
  ctx.beginPath();
  ctx.roundRect(r.x, r.y, r.w, r.h, 4);
  ctx.fill();
  ctx.strokeStyle = '#7a5530';
  ctx.stroke();
  lettering(ctx, r, text, 'rgba(245,245,235,0.92)', CHALK);
  ctx.restore();
}

function drawSign(ctx: CanvasRenderingContext2D, r: Rect, _t: number, text: string[], painted: boolean): void {
  ctx.save();
  begin(ctx, 3);
  if (painted) {
    lettering(ctx, r, text, '#7a2b1c', PAINT);
    ctx.restore();
    return;
  }
  ctx.fillStyle = '#6b4a2b';
  ctx.fillRect(r.x + r.w / 2 - 4, r.y + r.h * 0.8, 8, r.h * 0.5);
  ctx.fillStyle = '#e6c890';
  ctx.beginPath();
  ctx.roundRect(r.x, r.y, r.w, r.h * 0.85, 6);
  ctx.fill();
  ctx.stroke();
  lettering(ctx, { ...r, h: r.h * 0.85 }, text, '#7a2b1c', PAINT);
  ctx.restore();
}

/** Glints running down a waterfall. Drawn over whatever's there. */
function drawWater(ctx: CanvasRenderingContext2D, r: Rect, time: number, _text: string[], painted: boolean): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(r.x, r.y, r.w, r.h);
  ctx.clip();
  ctx.strokeStyle = painted ? 'rgba(235,250,255,0.5)' : 'rgba(225,245,255,0.45)';
  ctx.lineCap = 'round';
  ctx.lineWidth = 1.5;
  const streams = Math.round(r.w / 14);
  for (let i = 0; i < streams; i++) {
    const x = r.x + ((i + 0.5) / streams) * r.w + Math.sin(i * 7.3) * 4;
    const speed = 60 + ((i * 37) % 40);
    const y = r.y + (((time * speed + i * 53) % (r.h + 40)) - 20);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + 14 + (i % 3) * 5);
    ctx.stroke();
  }
  ctx.restore();
}

function lettering(ctx: CanvasRenderingContext2D, r: Rect, text: string[], colour: string, font: string): void {
  if (!text.length) return;
  const size = Math.min(r.h / (text.length * 1.25 + 0.4), 22);
  ctx.fillStyle = colour;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  text.forEach((line, i) => {
    let s = size;
    ctx.font = `bold ${s}px ${font}`;
    while (ctx.measureText(line).width > r.w - 10 && s > 7) {
      s -= 0.5;
      ctx.font = `bold ${s}px ${font}`;
    }
    ctx.fillText(line, r.x + r.w / 2, r.y + r.h / 2 + (i - (text.length - 1) / 2) * size * 1.25);
  });
}

// ---- Item icons ----

function inset(r: Rect, fx: number, fy: number): Rect {
  return { x: r.x + r.w * fx, y: r.y + r.h * fy, w: r.w * (1 - 2 * fx), h: r.h * (1 - 2 * fy) };
}

function drawPhone(ctx: CanvasRenderingContext2D, r: Rect): void {
  const p = inset(r, 0.32, 0.16);
  ctx.save();
  begin(ctx);
  ctx.fillStyle = '#30343c';
  ctx.beginPath();
  ctx.roundRect(p.x, p.y, p.w, p.h, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#7fc8f8';
  ctx.beginPath();
  ctx.roundRect(p.x + 3, p.y + 5, p.w - 6, p.h - 10, 2);
  ctx.fill();
  ctx.restore();
}

function drawWallet(ctx: CanvasRenderingContext2D, r: Rect): void {
  const p = inset(r, 0.16, 0.28);
  ctx.save();
  begin(ctx);
  ctx.fillStyle = '#7a4a2a';
  ctx.beginPath();
  ctx.roundRect(p.x, p.y, p.w, p.h, 5);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#e8c040';
  ctx.beginPath();
  ctx.arc(p.x + p.w * 0.72, p.y + p.h * 0.5, p.h * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawTea(ctx: CanvasRenderingContext2D, r: Rect, time: number): void {
  const p = inset(r, 0.26, 0.3);
  ctx.save();
  begin(ctx);
  // Steam.
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  for (const dx of [0.35, 0.65]) {
    const sx = p.x + p.w * dx;
    ctx.beginPath();
    ctx.moveTo(sx, p.y - 2);
    ctx.quadraticCurveTo(sx + Math.sin(time * 3 + dx * 9) * 4, p.y - 8, sx, p.y - 14);
    ctx.stroke();
  }
  begin(ctx);
  ctx.fillStyle = '#f2efe8';
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x + p.w, p.y);
  ctx.lineTo(p.x + p.w * 0.85, p.y + p.h);
  ctx.lineTo(p.x + p.w * 0.15, p.y + p.h);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#9b5a2c';
  ctx.fillRect(p.x + 3, p.y + 2, p.w - 6, 4);
  ctx.restore();
}

function drawPie(ctx: CanvasRenderingContext2D, r: Rect): void {
  const p = inset(r, 0.2, 0.3);
  ctx.save();
  begin(ctx);
  ctx.fillStyle = '#c98a3e';
  ctx.beginPath();
  ctx.roundRect(p.x, p.y, p.w, p.h, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#e0a85a';
  ctx.beginPath();
  ctx.ellipse(p.x + p.w / 2, p.y + 3, p.w / 2 - 1, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/** A fanned hand of trading cards, the front one shiny. */
function drawCards(ctx: CanvasRenderingContext2D, r: Rect, time: number): void {
  const p = inset(r, 0.3, 0.22);
  const cx = p.x + p.w / 2;
  const cy = p.y + p.h;
  ctx.save();
  begin(ctx);
  ['#d9534f', '#5b8fd9', '#9b6ad9', '#e8c040'].forEach((colour, i) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((i - 1.5) * 0.28);
    ctx.fillStyle = '#f3ead8';
    ctx.beginPath();
    ctx.roundRect(-p.w / 2, -p.h, p.w, p.h, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = colour;
    ctx.fillRect(-p.w / 2 + 3, -p.h + 3, p.w - 6, p.h * 0.5);
    if (i === 3) {
      ctx.fillStyle = `rgba(255,255,255,${0.25 + 0.25 * Math.sin(time * 3)})`;
      ctx.fillRect(-p.w / 2 + 3, -p.h + 3, p.w - 6, p.h * 0.5);
    }
    ctx.restore();
  });
  ctx.restore();
}

/** One trading card, picture in its colour; a shiny one shimmers. */
function drawCard(ctx: CanvasRenderingContext2D, r: Rect, time: number, colour: string, shiny: boolean): void {
  const p = inset(r, 0.3, 0.18);
  ctx.save();
  begin(ctx);
  ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
  ctx.rotate(-0.12);
  ctx.fillStyle = '#f3ead8';
  ctx.beginPath();
  ctx.roundRect(-p.w / 2, -p.h / 2, p.w, p.h, 3);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = colour;
  ctx.fillRect(-p.w / 2 + 3, -p.h / 2 + 3, p.w - 6, p.h * 0.55);
  if (shiny) {
    ctx.fillStyle = `rgba(255,255,255,${0.25 + 0.3 * Math.sin(time * 3)})`;
    ctx.fillRect(-p.w / 2 + 3, -p.h / 2 + 3, p.w - 6, p.h * 0.55);
  }
  ctx.restore();
}

/** One or two big copper pennies. */
function drawCoppers(ctx: CanvasRenderingContext2D, r: Rect, count: number): void {
  const rad = Math.min(r.w, r.h) * 0.24;
  ctx.save();
  begin(ctx);
  for (let i = 0; i < count; i++) {
    const x = r.x + r.w / 2 + (count === 2 ? (i ? 7 : -7) : 0);
    const y = r.y + r.h / 2 + (count === 2 ? (i ? 5 : -5) : 0);
    ctx.fillStyle = '#b8733a';
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#7a4a22';
    ctx.beginPath();
    ctx.arc(x, y, rad * 0.7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = INK;
  }
  ctx.restore();
}

/** A folded brown tweed jacket. */
function drawSuit(ctx: CanvasRenderingContext2D, r: Rect): void {
  const p = inset(r, 0.2, 0.18);
  ctx.save();
  begin(ctx);
  ctx.fillStyle = '#7a5a3a';
  ctx.beginPath();
  ctx.moveTo(p.x, p.y + p.h * 0.15);
  ctx.lineTo(p.x + p.w * 0.35, p.y);
  ctx.lineTo(p.x + p.w * 0.5, p.y + p.h * 0.45);
  ctx.lineTo(p.x + p.w * 0.65, p.y);
  ctx.lineTo(p.x + p.w, p.y + p.h * 0.15);
  ctx.lineTo(p.x + p.w, p.y + p.h);
  ctx.lineTo(p.x, p.y + p.h);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#f3ead8';
  ctx.beginPath();
  ctx.moveTo(p.x + p.w * 0.38, p.y + p.h * 0.04);
  ctx.lineTo(p.x + p.w * 0.5, p.y + p.h * 0.4);
  ctx.lineTo(p.x + p.w * 0.62, p.y + p.h * 0.04);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** A folded newspaper. */
function drawNewspaper(ctx: CanvasRenderingContext2D, r: Rect): void {
  const p = inset(r, 0.16, 0.24);
  ctx.save();
  begin(ctx);
  ctx.fillStyle = '#e8e2d0';
  ctx.fillRect(p.x, p.y, p.w, p.h);
  ctx.strokeRect(p.x, p.y, p.w, p.h);
  ctx.fillStyle = '#8a8478';
  ctx.fillRect(p.x + 4, p.y + 4, p.w - 8, 4);
  for (let i = 0; i < 3; i++) ctx.fillRect(p.x + 4, p.y + 12 + i * 5, p.w * 0.4, 2);
  for (let i = 0; i < 3; i++) ctx.fillRect(p.x + p.w * 0.55, p.y + 12 + i * 5, p.w * 0.35, 2);
  ctx.restore();
}

/** A table tennis bat: red rubber, wooden handle. */
function drawBat(ctx: CanvasRenderingContext2D, r: Rect): void {
  const p = inset(r, 0.18, 0.14);
  ctx.save();
  begin(ctx);
  ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
  ctx.rotate(-0.6);
  ctx.fillStyle = '#c8935a';
  ctx.beginPath();
  ctx.roundRect(-4, p.h * 0.1, 8, p.h * 0.42, 3);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#c0392b';
  ctx.beginPath();
  ctx.ellipse(0, -p.h * 0.12, p.w * 0.34, p.h * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/** A big silver coin. */
function drawCoin(ctx: CanvasRenderingContext2D, r: Rect): void {
  const x = r.x + r.w / 2;
  const y = r.y + r.h / 2;
  const rad = Math.min(r.w, r.h) * 0.3;
  ctx.save();
  begin(ctx);
  ctx.fillStyle = '#c9ccd1';
  ctx.beginPath();
  ctx.arc(x, y, rad, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#8e9299';
  ctx.beginPath();
  ctx.arc(x, y, rad * 0.72, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/** A golden smoked fish, looking at you. */
function drawKipper(ctx: CanvasRenderingContext2D, r: Rect): void {
  const p = inset(r, 0.14, 0.32);
  const cy = p.y + p.h / 2;
  ctx.save();
  begin(ctx);
  ctx.fillStyle = '#c98a3e';
  ctx.beginPath();
  ctx.moveTo(p.x + p.w, cy - p.h / 2);
  ctx.lineTo(p.x + p.w * 0.8, cy);
  ctx.lineTo(p.x + p.w, cy + p.h / 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(p.x + p.w * 0.42, cy, p.w * 0.4, p.h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(p.x + p.w * 0.16, cy - 2, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** A small round cork float. */
function drawFloat(ctx: CanvasRenderingContext2D, r: Rect): void {
  const x = r.x + r.w / 2;
  const y = r.y + r.h / 2;
  const rad = Math.min(r.w, r.h) * 0.22;
  ctx.save();
  begin(ctx);
  ctx.fillStyle = '#c49a6c';
  ctx.beginPath();
  ctx.arc(x, y, rad, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#8a6a44';
  for (const [dx, dy] of [[-0.3, -0.2], [0.25, 0.1], [-0.05, 0.4], [0.1, -0.45]]) {
    ctx.beginPath();
    ctx.arc(x + dx * rad, y + dy * rad, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ---- Painted puppets ----

/** A painted picture with pieces that move: each cut out along an outline and turned about a pivot (picture pixels). */
interface PuppetPart {
  outline: number[];
  pivot: [number, number];
  /** Angle in radians at a given time. */
  angle: (t: number) => number;
}

interface Puppet {
  parts: PuppetPart[];
  /** Extra drawing on top, in picture pixels (e.g. a drip of drool). */
  extra?: (ctx: CanvasRenderingContext2D, t: number) => void;
}

/** art/dog.png: tail wags, head pants and looks about, a drop of drool now and then. */
const DOG: Puppet = {
  parts: [
    {
      outline: [0, 222, 44, 216, 84, 227, 95, 246, 86, 264, 44, 269, 0, 247],
      pivot: [89, 246],
      angle: (t) => Math.sin(t * 9) * 0.32,
    },
    {
      outline: [166, 7, 209, 0, 247, 17, 276, 27, 275, 43, 266, 72, 243, 78, 207, 72, 183, 67, 167, 49],
      pivot: [204, 80],
      angle: (t) => Math.sin(t * 1.3) * 0.04 + Math.sin(t * 7) * 0.015,
    },
  ],
  extra: (ctx, t) => {
    const phase = (t * 0.6) % 1;
    if (phase > 0.55) return;
    ctx.fillStyle = 'rgba(210,235,255,0.9)';
    ctx.beginPath();
    ctx.ellipse(258, 78 + phase * 30, 2.5, 4 + phase * 4, 0, 0, Math.PI * 2);
    ctx.fill();
  },
};

const puppetCuts = new Map<string, { body: HTMLCanvasElement; parts: HTMLCanvasElement[] }>();

function cutPuppet(img: HTMLImageElement, puppet: Puppet) {
  const cached = puppetCuts.get(img.src);
  if (cached) return cached;
  const make = (draw: (c: CanvasRenderingContext2D) => void) => {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    draw(canvas.getContext('2d')!);
    return canvas;
  };
  const shape = (c: CanvasRenderingContext2D, pts: number[], grow = true) => {
    c.lineWidth = grow ? 4 : 0.01;
    c.lineJoin = 'round';
    c.beginPath();
    for (let i = 0; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
    c.closePath();
    c.fill();
    c.stroke();
  };
  const cut = {
    body: make((c) => {
      c.drawImage(img, 0, 0);
      c.globalCompositeOperation = 'destination-out';
      puppet.parts.forEach((p) => shape(c, p.outline, false));
    }),
    parts: puppet.parts.map((p) => {
      const mask = make((c) => shape(c, p.outline));
      return make((c) => {
        c.drawImage(img, 0, 0);
        c.globalCompositeOperation = 'destination-in';
        c.drawImage(mask, 0, 0);
      });
    }),
  };
  puppetCuts.set(img.src, cut);
  return cut;
}

/** Draw a puppet standing on the bottom of its rect, centred, sized to the rect's height. */
function drawPuppet(ctx: CanvasRenderingContext2D, img: HTMLImageElement, puppet: Puppet, r: Rect, time: number): void {
  const cut = cutPuppet(img, puppet);
  const s = r.h / img.naturalHeight;
  const breathe = 1 + Math.sin(time * 2.6) * 0.012;
  const x = r.x + r.w / 2 - (img.naturalWidth * s) / 2;
  const y = r.y + r.h;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(r.x + r.w / 2, y, img.naturalWidth * s * 0.4, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Picture space, feet on the ground, breathing upwards.
  ctx.translate(x, y);
  ctx.scale(s, s * breathe);
  ctx.translate(0, -img.naturalHeight);
  ctx.drawImage(cut.body, 0, 0);
  puppet.parts.forEach((p, i) => {
    ctx.save();
    ctx.translate(p.pivot[0], p.pivot[1]);
    ctx.rotate(p.angle(time));
    ctx.drawImage(cut.parts[i], -p.pivot[0], -p.pivot[1]);
    ctx.restore();
  });
  puppet.extra?.(ctx, time);
  ctx.restore();
}

// ---- Chapter 2 items and props ----

/** Fill and outline whatever path the callback draws, in one colour. */
function blob(ctx: CanvasRenderingContext2D, fill: string, path: () => void, width = 2): void {
  begin(ctx, width);
  ctx.fillStyle = fill;
  ctx.beginPath();
  path();
  ctx.fill();
  ctx.stroke();
}

/** Draw in a 100x100 box centred in the slot, so icons can be written with simple numbers. */
function inBox(ctx: CanvasRenderingContext2D, r: Rect, draw: () => void): void {
  const s = Math.min(r.w, r.h) / 100;
  ctx.save();
  ctx.translate(r.x + (r.w - 100 * s) / 2, r.y + (r.h - 100 * s) / 2);
  ctx.scale(s, s);
  draw();
  ctx.restore();
}

function drawCarabiner(ctx: CanvasRenderingContext2D, r: Rect): void {
  inBox(ctx, r, () => {
    begin(ctx, 9);
    ctx.strokeStyle = INK;
    ctx.beginPath();
    ctx.ellipse(50, 50, 22, 32, 0.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#9b5fc0';
    ctx.stroke();
    begin(ctx, 4);
    ctx.strokeStyle = '#c9c9d0';
    ctx.beginPath();
    ctx.moveTo(63, 28);
    ctx.lineTo(70, 56);
    ctx.stroke();
  });
}

function bottle(ctx: CanvasRenderingContext2D, r: Rect, liquid: string | null, level: number): void {
  inBox(ctx, r, () => {
    const body = () => {
      ctx.roundRect(34, 30, 32, 58, 8);
    };
    if (liquid) {
      ctx.save();
      ctx.beginPath();
      body();
      ctx.clip();
      ctx.fillStyle = liquid;
      ctx.fillRect(30, 88 - 58 * level, 40, 58 * level);
      ctx.restore();
    }
    begin(ctx, 3);
    ctx.fillStyle = 'rgba(210,235,255,0.25)';
    ctx.beginPath();
    body();
    ctx.fill();
    ctx.stroke();
    blob(ctx, '#3a6ea8', () => ctx.roundRect(38, 14, 24, 16, 4));
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(41, 38);
    ctx.lineTo(41, 78);
    ctx.stroke();
  });
}

function drawPhoto(ctx: CanvasRenderingContext2D, r: Rect): void {
  inBox(ctx, r, () => {
    blob(ctx, '#f3ead8', () => ctx.rect(20, 24, 60, 52));
    blob(ctx, '#7fb0d0', () => ctx.rect(26, 30, 48, 40), 1);
    blob(ctx, '#d8a07a', () => ctx.arc(50, 46, 8, 0, Math.PI * 2), 1.5);
    blob(ctx, '#1a1a1a', () => {
      ctx.ellipse(38, 64, 8, 5, 0, 0, Math.PI * 2);
    }, 1);
    blob(ctx, '#1a1a1a', () => {
      ctx.ellipse(62, 64, 8, 5, 0, 0, Math.PI * 2);
    }, 1);
  });
}

function drawBarley(ctx: CanvasRenderingContext2D, r: Rect): void {
  inBox(ctx, r, () => {
    blob(ctx, '#5f8a3a', () => ctx.ellipse(50, 60, 34, 20, -0.2, 0, Math.PI * 2));
    for (let i = 0; i < 9; i++) {
      blob(ctx, '#e0c060', () => ctx.ellipse(32 + (i % 3) * 13, 50 + Math.floor(i / 3) * 8, 5, 3, 0.5, 0, Math.PI * 2), 1);
    }
  });
}

function drawMeat(ctx: CanvasRenderingContext2D, r: Rect): void {
  inBox(ctx, r, () => {
    blob(ctx, '#e8e0cc', () => ctx.roundRect(18, 40, 64, 34, 6));
    blob(ctx, '#a0522d', () => ctx.ellipse(50, 50, 22, 12, 0, 0, Math.PI * 2));
    ctx.strokeStyle = '#f0c8a0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(36, 48);
    ctx.lineTo(62, 46);
    ctx.stroke();
  });
}

function drawLot(ctx: CanvasRenderingContext2D, r: Rect): void {
  inBox(ctx, r, () => {
    blob(ctx, '#efe6cf', () => ctx.roundRect(36, 18, 28, 64, 8));
    begin(ctx, 4);
    ctx.beginPath();
    ctx.moveTo(50, 30);
    ctx.lineTo(50, 70);
    ctx.moveTo(50, 40);
    ctx.lineTo(60, 32);
    ctx.moveTo(50, 40);
    ctx.lineTo(40, 32);
    ctx.stroke();
  });
}

function stick(ctx: CanvasRenderingContext2D, r: Rect, time: number, burning: boolean): void {
  inBox(ctx, r, () => {
    begin(ctx, 3);
    ctx.save();
    ctx.translate(50, 54);
    ctx.rotate(-0.6);
    ctx.fillStyle = '#7a5530';
    ctx.beginPath();
    ctx.roundRect(-6, -10, 12, 46, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#2a2020';
    ctx.beginPath();
    ctx.roundRect(-6, -14, 12, 12, 4);
    ctx.fill();
    ctx.stroke();
    if (burning) {
      const f = Math.sin(time * 12) * 3;
      ctx.fillStyle = '#f08020';
      ctx.beginPath();
      ctx.moveTo(-9, -12);
      ctx.quadraticCurveTo(-4, -40 - f, 0, -46 - f);
      ctx.quadraticCurveTo(6, -36 + f, 9, -12);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffd040';
      ctx.beginPath();
      ctx.moveTo(-4, -12);
      ctx.quadraticCurveTo(0, -30 - f, 4, -12);
      ctx.fill();
    }
    ctx.restore();
  });
}

function spearParts(ctx: CanvasRenderingContext2D, r: Rect, head: boolean, shaft: boolean, wrap: string | null, wobble = 0): void {
  inBox(ctx, r, () => {
    ctx.save();
    ctx.translate(50, 50);
    ctx.rotate(-0.78);
    if (shaft) blob(ctx, '#c8a46a', () => ctx.roundRect(-44, -4, 70, 8, 3));
    if (head) {
      ctx.save();
      ctx.translate(shaft ? 26 : 0, 0);
      ctx.rotate(wobble);
      blob(ctx, '#8a8c90', () => {
        ctx.moveTo(0, -5);
        ctx.lineTo(10, -5);
        ctx.quadraticCurveTo(28, -14, 40, 0);
        ctx.quadraticCurveTo(28, 14, 10, 5);
        ctx.lineTo(0, 5);
        ctx.closePath();
      });
      ctx.restore();
    }
    if (wrap) {
      ctx.strokeStyle = wrap;
      ctx.lineWidth = 3;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(18 + i * 4, -7);
        ctx.lineTo(22 + i * 4, 7);
        ctx.stroke();
      }
    }
    ctx.restore();
  });
}

function strap(ctx: CanvasRenderingContext2D, r: Rect, wet: boolean): void {
  inBox(ctx, r, () => {
    begin(ctx, 3);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 12;
    ctx.beginPath();
    if (wet) {
      ctx.moveTo(20, 30);
      ctx.bezierCurveTo(70, 10, 20, 60, 70, 50);
      ctx.bezierCurveTo(90, 46, 60, 90, 40, 80);
    } else {
      ctx.moveTo(18, 70);
      ctx.lineTo(82, 30);
    }
    ctx.stroke();
    ctx.strokeStyle = wet ? '#6a4020' : '#c89a60';
    ctx.lineWidth = 8;
    ctx.stroke();
    if (wet) {
      ctx.fillStyle = '#7fc8f8';
      for (const [x, y] of [[30, 40], [64, 62], [48, 88]]) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
}

function drawCharm(ctx: CanvasRenderingContext2D, r: Rect): void {
  inBox(ctx, r, () => {
    begin(ctx, 2);
    ctx.strokeStyle = '#8a6a40';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(35, 14);
    ctx.lineTo(50, 40);
    ctx.lineTo(65, 14);
    ctx.stroke();
    blob(ctx, '#efe6cf', () => {
      ctx.ellipse(50, 62, 10, 24, 0, 0, Math.PI * 2);
    });
    begin(ctx, 2);
    ctx.beginPath();
    ctx.moveTo(46, 54);
    ctx.lineTo(54, 62);
    ctx.lineTo(46, 70);
    ctx.stroke();
  });
}

function drawHorseHead(ctx: CanvasRenderingContext2D, r: Rect): void {
  inBox(ctx, r, () => {
    blob(ctx, '#b0aca4', () => {
      ctx.moveTo(40, 20);
      ctx.lineTo(48, 8);
      ctx.lineTo(54, 22);
      ctx.quadraticCurveTo(78, 40, 76, 74);
      ctx.quadraticCurveTo(70, 90, 58, 84);
      ctx.lineTo(44, 60);
      ctx.quadraticCurveTo(30, 50, 40, 20);
      ctx.closePath();
    });
    blob(ctx, '#2b1e16', () => ctx.arc(56, 40, 3, 0, Math.PI * 2), 1);
    blob(ctx, '#c89a60', () => ctx.rect(46, 52, 30, 6), 1.5);
  });
}

/** A whole boar on the spit, turning slowly over the coals. Fills its rect. */
function drawBoar(ctx: CanvasRenderingContext2D, r: Rect, time: number): void {
  const turn = Math.sin(time * 0.8) * 0.05;
  const cx = r.x + r.w * 0.48;
  const cy = r.y + r.h * 0.22;
  const w = r.w * 0.34;
  const h = r.h * 0.2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(turn);
  // Tucked legs.
  for (const lx of [-0.5, -0.2, 0.25, 0.55]) blob(ctx, '#6e3412', () => ctx.roundRect(lx * w - 4, h * 0.5, 8, h * 0.7, 3), 1.5);
  // Body, roasted dark at the edges, golden on top.
  const g = ctx.createRadialGradient(-w * 0.1, -h * 0.4, 2, 0, 0, w);
  g.addColorStop(0, '#e0a050');
  g.addColorStop(0.6, '#a85a24');
  g.addColorStop(1, '#5e2a0e');
  begin(ctx, 2);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Head and snout, facing left.
  blob(ctx, '#8a4418', () => ctx.ellipse(-w * 1.05, h * 0.05, w * 0.32, h * 0.62, -0.15, 0, Math.PI * 2));
  blob(ctx, '#b06a3a', () => ctx.ellipse(-w * 1.36, h * 0.2, w * 0.1, h * 0.3, 0, 0, Math.PI * 2), 1.5);
  blob(ctx, '#5e2a0e', () => {
    ctx.moveTo(-w * 1.0, -h * 0.45);
    ctx.lineTo(-w * 0.86, -h * 1.0);
    ctx.lineTo(-w * 0.78, -h * 0.4);
    ctx.closePath();
  }, 1.5);
  // A shine.
  ctx.fillStyle = 'rgba(255,230,170,0.45)';
  ctx.beginPath();
  ctx.ellipse(-w * 0.15, -h * 0.45, w * 0.45, h * 0.18, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Dripping fat.
  const drip = (time * 0.9) % 1;
  ctx.fillStyle = 'rgba(255,200,90,0.85)';
  ctx.beginPath();
  ctx.arc(cx + w * 0.2, cy + h + drip * r.h * 0.45, 2, 0, Math.PI * 2);
  ctx.fill();
}

/** An old rawhide halter hanging on a peg. Fills its rect. */
function drawHalter(ctx: CanvasRenderingContext2D, r: Rect): void {
  ctx.save();
  begin(ctx, 2);
  ctx.fillStyle = '#5a3a20';
  ctx.fillRect(r.x + r.w / 2 - 3, r.y, 6, 6);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(r.x + r.w / 2, r.y + r.h * 0.55, r.w * 0.35, r.h * 0.4, 0, 0, Math.PI * 2);
  ctx.moveTo(r.x + r.w / 2, r.y + 4);
  ctx.lineTo(r.x + r.w / 2, r.y + r.h * 0.15);
  ctx.stroke();
  ctx.strokeStyle = '#c89a60';
  ctx.lineWidth = 3.5;
  ctx.stroke();
  ctx.restore();
}

Object.assign(PROPS, { boar: (ctx: CanvasRenderingContext2D, r: Rect, t: number) => drawBoar(ctx, r, t), halter: (ctx: CanvasRenderingContext2D, r: Rect) => drawHalter(ctx, r) });
Object.assign(ICONS, {
  carabiner: drawCarabiner,
  'bottle-half': (ctx: CanvasRenderingContext2D, r: Rect) => bottle(ctx, r, 'rgba(120,180,230,0.7)', 0.5),
  'bottle-empty': (ctx: CanvasRenderingContext2D, r: Rect) => bottle(ctx, r, null, 0),
  'bottle-mead': (ctx: CanvasRenderingContext2D, r: Rect) => bottle(ctx, r, '#e0a020', 0.9),
  photo: drawPhoto,
  barley: drawBarley,
  meat: drawMeat,
  lot: drawLot,
  torch: (ctx: CanvasRenderingContext2D, r: Rect, t: number) => stick(ctx, r, t, true),
  stick: (ctx: CanvasRenderingContext2D, r: Rect, t: number) => stick(ctx, r, t, false),
  spearhead: (ctx: CanvasRenderingContext2D, r: Rect) => spearParts(ctx, r, true, false, null),
  bar: (ctx: CanvasRenderingContext2D, r: Rect) => spearParts(ctx, r, false, true, null),
  'spear-loose': (ctx: CanvasRenderingContext2D, r: Rect, t: number) => spearParts(ctx, r, true, true, null, Math.sin(t * 6) * 0.15),
  'spear-bound': (ctx: CanvasRenderingContext2D, r: Rect, t: number) => spearParts(ctx, r, true, true, '#6a4020', Math.sin(t * 6) * 0.05),
  spear: (ctx: CanvasRenderingContext2D, r: Rect) => spearParts(ctx, r, true, true, '#5a3a20'),
  strap: (ctx: CanvasRenderingContext2D, r: Rect) => strap(ctx, r, false),
  'strap-wet': (ctx: CanvasRenderingContext2D, r: Rect) => strap(ctx, r, true),
  charm: drawCharm,
  horse: drawHorseHead,
});
