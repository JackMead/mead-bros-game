import { cast, type Appearance } from './cast';
import type { BrotherId } from './types';

/**
 * The brothers, drawn in code as cartoon characters from their `appearance` in
 * cast.ts. Drawing only. Painted art (art/rob.png etc.) replaces these when it exists.
 */

const INK = '#2b1e16';
const LINE = 2;

export interface Pose {
  /** Seconds since start, for blinking, breathing and talking. */
  time: number;
  talking: boolean;
  /** "rant": arm raised, mid-opinion. */
  pose?: string;
}

/** Each brother blinks and breathes out of step with the others. */
const phase: Record<BrotherId, number> = { rob: 0, jack: 1.3, phil: 2.6 };

/** Head size is the same for everyone; height comes from the body. */
export const HEAD_RADIUS = 18;

/** Full figure with feet centred on (fx, fy). */
export function drawBrother(ctx: CanvasRenderingContext2D, id: BrotherId, fx: number, fy: number, height: number, p: Pose): void {
  const a = cast[id].appearance;
  const t = p.time + phase[id];
  const breathe = Math.sin(t * 2.2) * 0.8;
  const R = HEAD_RADIUS;
  const b = a.build;
  const top = fy - height + breathe;
  const shoulderY = top + 2 * R + 3;
  const hipY = fy - height * 0.43;
  const sw = 15 * b; // half shoulder width
  const hw = 12.5 * b; // half hip width

  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.lineWidth = LINE;
  ctx.strokeStyle = INK;

  // Shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.ellipse(fx, fy, 22 * b, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  if (a.backpack) drawBackpack(ctx, a.backpack, fx, shoulderY, hipY, sw);

  drawLegs(ctx, a, fx, hipY, fy, b);

  // Torso.
  ctx.fillStyle = a.top;
  ctx.beginPath();
  ctx.moveTo(fx - sw, shoulderY + 3);
  ctx.quadraticCurveTo(fx - sw, shoulderY - 2, fx - sw + 6, shoulderY - 2);
  ctx.lineTo(fx + sw - 6, shoulderY - 2);
  ctx.quadraticCurveTo(fx + sw, shoulderY - 2, fx + sw, shoulderY + 3);
  ctx.lineTo(fx + hw, hipY + 4);
  ctx.lineTo(fx - hw, hipY + 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  if (a.backpack) {
    // Straps over the shoulders.
    ctx.strokeStyle = shade(a.backpack, -0.35);
    ctx.lineWidth = 4;
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(fx + s * (sw - 5), shoulderY - 1);
      ctx.lineTo(fx + s * (sw - 6), shoulderY + 22);
      ctx.stroke();
    }
    ctx.lineWidth = LINE;
    ctx.strokeStyle = INK;
  }

  // Arms.
  const handY = hipY + 8;
  drawArm(ctx, a, fx - sw + 1, shoulderY + 4, p.pose === 'rant' ? fx - sw - 14 : fx - sw - 4, p.pose === 'rant' ? shoulderY - 34 + Math.sin(t * 6) * 3 : handY, p.pose === 'rant');
  drawArm(ctx, a, fx + sw - 1, shoulderY + 4, fx + sw + 4, handY, false);

  drawHead(ctx, id, fx, top + R, R, p);
  ctx.restore();
}

/** Head and face centred on (cx, cy). Also used for the portraits. */
export function drawHead(ctx: CanvasRenderingContext2D, id: BrotherId, cx: number, cy: number, R: number, p: Pose): void {
  const a = cast[id].appearance;
  const t = p.time + phase[id];
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(1.5, (LINE * R) / HEAD_RADIUS);
  ctx.strokeStyle = INK;

  // Hair that falls behind the face.
  if (a.hairStyle !== 'short') {
    const long = a.hairStyle === 'shaggy' ? 0.75 : 0.6;
    ctx.fillStyle = a.hair;
    ctx.beginPath();
    ctx.roundRect(cx - R * 1.17, cy - R * 0.5, R * 2.34, R * (0.5 + long + 0.3), R * 0.5);
    ctx.fill();
    ctx.stroke();
  }

  // Ears and face.
  ctx.fillStyle = a.skin;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(cx + s * R * 0.98, cy + R * 0.1, R * 0.2, R * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.ellipse(cx, cy, R * 0.98, R * 1.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Stubble or beard.
  if (a.stubble) {
    ctx.fillStyle = withAlpha(a.hair, 0.28);
    ctx.beginPath();
    ctx.ellipse(cx, cy + R * 0.12, R * 0.92, R * 0.9, 0, Math.PI * 0.08, Math.PI * 0.92);
    ctx.quadraticCurveTo(cx, cy + R * 0.25, cx + R * 0.85, cy + R * 0.35);
    ctx.fill();
  }
  if (a.beard) {
    ctx.fillStyle = a.beard;
    ctx.beginPath();
    ctx.moveTo(cx - R * 0.97, cy + R * 0.05);
    ctx.quadraticCurveTo(cx - R * 0.9, cy + R * 1.35, cx, cy + R * 1.38);
    ctx.quadraticCurveTo(cx + R * 0.9, cy + R * 1.35, cx + R * 0.97, cy + R * 0.05);
    ctx.quadraticCurveTo(cx + R * 0.55, cy + R * 0.42, cx, cy + R * 0.3);
    ctx.quadraticCurveTo(cx - R * 0.55, cy + R * 0.42, cx - R * 0.97, cy + R * 0.05);
    ctx.fill();
    ctx.stroke();
  }

  // Hair on top.
  ctx.fillStyle = a.hair;
  ctx.beginPath();
  const fringe = a.hairStyle === 'short' ? -0.32 : a.hairStyle === 'mid' ? -0.22 : -0.15;
  ctx.moveTo(cx - R * 1.04, cy + R * (a.hairStyle === 'short' ? -0.1 : 0.15));
  ctx.bezierCurveTo(cx - R * 1.2, cy - R * 1.45, cx + R * 1.2, cy - R * 1.45, cx + R * 1.04, cy + R * (a.hairStyle === 'short' ? -0.1 : 0.15));
  // Fringe, a little ragged, sweeping across.
  const tufts = a.hairStyle === 'shaggy' ? 5 : 3;
  for (let i = tufts; i >= 0; i--) {
    const x = cx - R * 0.95 + (i / tufts) * R * 1.9;
    const dip = i % 2 === 0 ? 0 : a.hairStyle === 'shaggy' ? 0.16 : 0.1;
    ctx.lineTo(x, cy + R * (fringe + dip + (i / tufts) * 0.08));
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Eyes, blinking now and then.
  const blink = (t % 4.2) < 0.13;
  const eyeY = cy - R * 0.02;
  for (const s of [-1, 1]) {
    const ex = cx + s * R * 0.36;
    if (blink) {
      ctx.beginPath();
      ctx.moveTo(ex - R * 0.18, eyeY);
      ctx.lineTo(ex + R * 0.18, eyeY);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(ex, eyeY, R * 0.16, R * 0.21, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(ex + R * 0.03, eyeY + R * 0.04, R * 0.11, 0, Math.PI * 2);
      ctx.fill();
    }
    // Eyebrow.
    ctx.strokeStyle = shade(a.hair, -0.35);
    ctx.lineWidth *= 1.4;
    ctx.beginPath();
    ctx.moveTo(ex - R * 0.2, eyeY - R * 0.36 + (s > 0 ? 0 : 0.02 * R));
    ctx.lineTo(ex + R * 0.2, eyeY - R * 0.4);
    ctx.stroke();
    ctx.lineWidth /= 1.4;
    ctx.strokeStyle = INK;
  }

  if (a.glasses) {
    ctx.save();
    ctx.lineWidth *= 1.3;
    ctx.strokeStyle = '#151515';
    ctx.fillStyle = 'rgba(200,230,255,0.25)';
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.roundRect(cx + s * R * 0.38 - R * 0.3, eyeY - R * 0.25, R * 0.6, R * 0.48, R * 0.16);
      ctx.fill();
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(cx - R * 0.08, eyeY - R * 0.03);
    ctx.lineTo(cx + R * 0.08, eyeY - R * 0.03);
    ctx.stroke();
    ctx.restore();
  }

  // Nose.
  ctx.beginPath();
  ctx.moveTo(cx - R * 0.02, cy + R * 0.12);
  ctx.quadraticCurveTo(cx + R * 0.16, cy + R * 0.3, cx - R * 0.06, cy + R * 0.33);
  ctx.stroke();

  // Mouth: open and shut while talking, otherwise a small smile.
  const mouthY = cy + R * 0.6;
  const open = p.talking && Math.floor(t * 9) % 2 === 0;
  if (open) {
    ctx.fillStyle = '#7a2a22';
    ctx.beginPath();
    ctx.ellipse(cx, mouthY + R * 0.04, R * 0.2, R * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(cx - R * 0.24, mouthY - R * 0.02);
    ctx.quadraticCurveTo(cx, mouthY + R * 0.14, cx + R * 0.24, mouthY - R * 0.04);
    ctx.stroke();
  }
  ctx.restore();
}

function drawLegs(ctx: CanvasRenderingContext2D, a: Appearance, fx: number, hipY: number, fy: number, b: number): void {
  const w = 11 * b;
  for (const s of [-1, 1]) {
    const x = fx + s * (w / 2 + 1) - w / 2;
    if (a.legs.style === 'shorts') {
      const knee = hipY + (fy - hipY) * 0.48;
      ctx.fillStyle = a.skin;
      ctx.beginPath();
      ctx.roundRect(x + 1.5, knee - 2, w - 3, fy - knee - 1, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = a.legs.colour;
      ctx.beginPath();
      ctx.roundRect(x - 1, hipY, w + 2, knee - hipY + 2, 3);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillStyle = a.legs.colour;
      ctx.beginPath();
      ctx.roundRect(x, hipY, w, fy - hipY - 2, a.legs.style === 'joggers' ? 4 : 2);
      ctx.fill();
      ctx.stroke();
      if (a.legs.style === 'joggers') {
        // Elasticated cuffs.
        ctx.fillStyle = shade(a.legs.colour, -0.2);
        ctx.beginPath();
        ctx.roundRect(x, fy - 9, w, 5, 2);
        ctx.fill();
      }
    }
    // Shoe.
    ctx.fillStyle = a.shoes;
    ctx.beginPath();
    ctx.ellipse(x + w / 2 + s * 2, fy - 1, w * 0.75, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

function drawArm(ctx: CanvasRenderingContext2D, a: Appearance, sx: number, sy: number, hx: number, hy: number, pointing: boolean): void {
  // Sleeve, then forearm.
  const ex = sx + (hx - sx) * 0.4;
  const ey = sy + (hy - sy) * 0.4;
  ctx.lineWidth = 11;
  ctx.strokeStyle = INK;
  line(ctx, sx, sy, hx, hy);
  ctx.lineWidth = 7;
  ctx.strokeStyle = a.skin;
  line(ctx, ex, ey, hx, hy);
  ctx.strokeStyle = a.top;
  ctx.lineWidth = 9;
  line(ctx, sx, sy, ex, ey);
  ctx.lineWidth = LINE;
  ctx.strokeStyle = INK;
  ctx.fillStyle = a.skin;
  ctx.beginPath();
  ctx.arc(hx, hy, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  if (pointing) {
    ctx.lineWidth = 4;
    ctx.strokeStyle = INK;
    line(ctx, hx, hy - 3, hx + 1, hy - 11);
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = a.skin;
    line(ctx, hx, hy - 3, hx + 1, hy - 11);
    ctx.lineWidth = LINE;
    ctx.strokeStyle = INK;
  }
}

/** A yellow backpack with two pointy ears peeking over the shoulders. */
function drawBackpack(ctx: CanvasRenderingContext2D, colour: string, fx: number, shoulderY: number, hipY: number, sw: number): void {
  ctx.fillStyle = colour;
  for (const s of [-1, 1]) {
    // Ears, black-tipped.
    ctx.beginPath();
    ctx.moveTo(fx + s * 4, shoulderY + 2);
    ctx.lineTo(fx + s * 14, shoulderY - 20);
    ctx.lineTo(fx + s * 12, shoulderY + 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.moveTo(fx + s * 12.6, shoulderY - 14);
    ctx.lineTo(fx + s * 14, shoulderY - 20);
    ctx.lineTo(fx + s * 13.3, shoulderY - 13);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = colour;
  }
  ctx.beginPath();
  ctx.roundRect(fx - sw - 4, shoulderY + 2, (sw + 4) * 2, hipY - shoulderY - 2, 8);
  ctx.fill();
  ctx.stroke();
}

function line(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

/** Lighten (amount > 0) or darken (< 0) a #rrggbb colour. */
export function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.round(amount < 0 ? c * (1 + amount) : c + (255 - c) * amount);
  const r = f((n >> 16) & 255);
  const g = f((n >> 8) & 255);
  const bl = f(n & 255);
  return `rgb(${r}, ${g}, ${bl})`;
}

export function withAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
