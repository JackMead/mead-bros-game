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

/** `painted` is true over a painted background, where signs only need their lettering. */
type Draw = (ctx: CanvasRenderingContext2D, r: Rect, time: number, text: string[], painted: boolean) => void;

export const PROPS: Record<string, Draw> = {
  dog: drawDog,
  soapbox: (ctx, r) => drawCrate(ctx, r),
  chalkboard: drawChalkboard,
  sign: drawSign,
  water: drawWater,
};

export const ICONS: Record<string, (ctx: CanvasRenderingContext2D, r: Rect, time: number) => void> = {
  soapbox: (ctx, r) => drawCrate(ctx, inset(r, 0.18, 0.28)),
  phone: drawPhone,
  wallet: drawWallet,
  tea: drawTea,
  pie: drawPie,
};

function begin(ctx: CanvasRenderingContext2D, width = 2): void {
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.lineWidth = width;
  ctx.strokeStyle = INK;
}

/** A sitting Labrador, looking right, tail going. Fills its rect, feet on the bottom edge. */
function drawDog(ctx: CanvasRenderingContext2D, r: Rect, time: number): void {
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
function drawWater(ctx: CanvasRenderingContext2D, r: Rect, time: number): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(r.x, r.y, r.w, r.h);
  ctx.clip();
  ctx.strokeStyle = 'rgba(225,245,255,0.45)';
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
