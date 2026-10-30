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
