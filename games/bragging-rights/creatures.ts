import type { Behaviour, Pos } from './types';

/**
 * Creature drawings, one per behaviour so any kit's enemies read at a glance.
 * Drawing only. Sizes are fractions of the tile `t`, centred on (cx, cy).
 */

export interface CreatureLook {
  colour: string;
  /** Unit direction it faces (towards the player). */
  facing: Pos;
  /** 0 at rest, 1 when winding up a strike: the warning lives on the body, where your eye already is. */
  windup: number;
  /** Seconds, for idle motion. */
  time: number;
  /** Varies idle motion between creatures. */
  seed: number;
  flash: boolean;
}

const OUTLINE = 'rgba(12, 8, 6, 0.75)';

export function drawCreature(ctx: CanvasRenderingContext2D, behaviour: Behaviour, cx: number, cy: number, t: number, look: CreatureLook): void {
  const bob = Math.sin(look.time * 2.4 + look.seed) * t * 0.018;
  const lean = look.windup * t * 0.07;
  const fx = look.facing.x || 0;
  const fy = look.facing.y || 0;
  ctx.save();
  // Wind-up: a red glow underneath and a lean back away from the target.
  if (look.windup > 0) {
    const pulse = 0.55 + 0.45 * Math.sin(look.time * 9);
    const g = ctx.createRadialGradient(cx, cy + t * 0.18, 0, cx, cy + t * 0.18, t * 0.5);
    g.addColorStop(0, `rgba(255, 70, 45, ${0.55 * pulse})`);
    g.addColorStop(1, 'rgba(255, 70, 45, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(cx - t / 2, cy - t / 2, t, t);
  }
  ctx.translate(cx - fx * lean, cy - fy * lean + bob);
  const scale = 1 + look.windup * 0.06 * (0.6 + 0.4 * Math.sin(look.time * 9));
  ctx.scale(scale, scale);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(1.2, t * 0.03);
  ctx.strokeStyle = OUTLINE;
  const body = look.flash ? '#ffffff' : look.colour;
  const eyes = look.windup > 0 ? '#ff4a2e' : '#1a1210';
  switch (behaviour) {
    case 'melee': goblin(ctx, t, body, eyes, look); break;
    case 'archer': archer(ctx, t, body, eyes, look); break;
    case 'charger': wolf(ctx, t, body, eyes, look); break;
    case 'brute': troll(ctx, t, body, eyes, look); break;
    case 'hunter': wraith(ctx, t, body, look); break;
  }
  ctx.restore();
}

function shade(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number): void {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, -0.5, 0, Math.PI * 2);
  ctx.fill();
}

function eyePair(ctx: CanvasRenderingContext2D, t: number, x: number, y: number, gap: number, colour: string, glow: boolean): void {
  ctx.save();
  if (glow) { ctx.shadowColor = colour; ctx.shadowBlur = t * 0.15; }
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.arc(x - gap, y, Math.max(1.3, t * 0.032), 0, Math.PI * 2);
  ctx.arc(x + gap, y, Math.max(1.3, t * 0.032), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function goblin(ctx: CanvasRenderingContext2D, t: number, body: string, eyes: string, look: CreatureLook): void {
  const side = look.facing.x < 0 ? -1 : 1;
  // Blade, raised when winding up.
  const raise = look.windup;
  ctx.strokeStyle = '#d8d4cc';
  ctx.lineWidth = Math.max(1.5, t * 0.045);
  ctx.beginPath();
  ctx.moveTo(side * t * 0.2, t * 0.1);
  ctx.lineTo(side * t * (0.34 - raise * 0.06), t * (-0.02 - raise * 0.2));
  ctx.stroke();
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = Math.max(1.2, t * 0.03);
  ctx.fillStyle = body;
  // Hunched body.
  ctx.beginPath();
  ctx.ellipse(0, t * 0.14, t * 0.2, t * 0.18, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // Ears.
  ctx.beginPath();
  ctx.moveTo(-t * 0.1, -t * 0.16); ctx.lineTo(-t * 0.34, -t * 0.26); ctx.lineTo(-t * 0.12, -t * 0.06);
  ctx.moveTo(t * 0.1, -t * 0.16); ctx.lineTo(t * 0.34, -t * 0.26); ctx.lineTo(t * 0.12, -t * 0.06);
  ctx.fill(); ctx.stroke();
  // Head.
  ctx.beginPath();
  ctx.arc(0, -t * 0.1, t * 0.15, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  shade(ctx, -t * 0.05, -t * 0.16, t * 0.06, t * 0.035);
  eyePair(ctx, t, look.facing.x * t * 0.03, -t * 0.1, t * 0.055, eyes, look.windup > 0);
}

function archer(ctx: CanvasRenderingContext2D, t: number, body: string, eyes: string, look: CreatureLook): void {
  const a = Math.atan2(look.facing.y || 0.0001, look.facing.x || 0.0001);
  // Hooded cloak.
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(0, -t * 0.32);
  ctx.quadraticCurveTo(t * 0.26, -t * 0.1, t * 0.22, t * 0.32);
  ctx.lineTo(-t * 0.22, t * 0.32);
  ctx.quadraticCurveTo(-t * 0.26, -t * 0.1, 0, -t * 0.32);
  ctx.fill(); ctx.stroke();
  shade(ctx, -t * 0.08, -t * 0.12, t * 0.05, t * 0.1);
  // Face in the hood.
  ctx.fillStyle = 'rgba(15, 10, 8, 0.85)';
  ctx.beginPath();
  ctx.ellipse(0, -t * 0.1, t * 0.1, t * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  eyePair(ctx, t, look.facing.x * t * 0.02, -t * 0.1, t * 0.04, look.windup > 0 ? eyes : '#e8d9a8', look.windup > 0);
  // Bow, held towards the target; drawn back when winding up.
  ctx.save();
  ctx.rotate(a);
  ctx.strokeStyle = '#6b4a2a';
  ctx.lineWidth = Math.max(1.5, t * 0.04);
  ctx.beginPath();
  ctx.arc(t * 0.1, 0, t * 0.26, -1.15, 1.15);
  ctx.stroke();
  const pull = look.windup * t * 0.14;
  const tipX = t * 0.1 + Math.cos(1.15) * t * 0.26;
  const tipY = Math.sin(1.15) * t * 0.26;
  ctx.strokeStyle = '#efe6d2';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(tipX, -tipY); ctx.lineTo(tipX - pull, 0); ctx.lineTo(tipX, tipY);
  ctx.stroke();
  if (look.windup > 0) {
    ctx.strokeStyle = '#ffd2b8';
    ctx.lineWidth = Math.max(1.2, t * 0.025);
    ctx.beginPath();
    ctx.moveTo(tipX - pull, 0); ctx.lineTo(t * 0.42, 0);
    ctx.stroke();
  }
  ctx.restore();
}

function wolf(ctx: CanvasRenderingContext2D, t: number, body: string, eyes: string, look: CreatureLook): void {
  const f = look.facing.x < 0 ? -1 : 1;
  const crouch = look.windup * t * 0.06;
  ctx.save();
  ctx.scale(f, 1);
  ctx.fillStyle = body;
  // Legs.
  ctx.strokeStyle = body;
  ctx.lineWidth = Math.max(2, t * 0.06);
  for (const x of [-0.18, -0.08, 0.1, 0.19]) {
    ctx.beginPath();
    ctx.moveTo(x * t, t * 0.1 + crouch);
    ctx.lineTo(x * t + (x > 0 ? 0.02 : -0.02) * t, t * 0.3);
    ctx.stroke();
  }
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = Math.max(1.2, t * 0.03);
  // Tail.
  ctx.beginPath();
  ctx.moveTo(-t * 0.24, t * 0.02 + crouch);
  ctx.quadraticCurveTo(-t * 0.42, -t * 0.08, -t * 0.38, -t * 0.18 + crouch);
  ctx.stroke();
  // Body.
  ctx.beginPath();
  ctx.ellipse(0, t * 0.04 + crouch, t * 0.26, t * 0.13, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // Head, snout and ear.
  ctx.beginPath();
  ctx.arc(t * 0.24, -t * 0.08 + crouch, t * 0.11, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(t * 0.3, -t * 0.12 + crouch); ctx.lineTo(t * 0.44, -t * 0.03 + crouch); ctx.lineTo(t * 0.3, t * 0.0 + crouch);
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(t * 0.17, -t * 0.15 + crouch); ctx.lineTo(t * 0.2, -t * 0.3 + crouch); ctx.lineTo(t * 0.27, -t * 0.17 + crouch);
  ctx.fill(); ctx.stroke();
  shade(ctx, -t * 0.05, -t * 0.02 + crouch, t * 0.12, t * 0.04);
  ctx.restore();
  ctx.save();
  if (look.windup > 0) { ctx.shadowColor = eyes; ctx.shadowBlur = t * 0.15; }
  ctx.fillStyle = eyes;
  ctx.beginPath();
  ctx.arc(f * t * 0.27, -t * 0.1 + crouch, Math.max(1.3, t * 0.03), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function troll(ctx: CanvasRenderingContext2D, t: number, body: string, eyes: string, look: CreatureLook): void {
  const side = look.facing.x < 0 ? -1 : 1;
  const raise = look.windup;
  // Club arm, raised overhead when winding up.
  ctx.save();
  ctx.translate(side * t * 0.28, -t * 0.02);
  ctx.rotate(side * (0.5 - raise * 1.6));
  ctx.fillStyle = '#5a4532';
  ctx.beginPath();
  ctx.moveTo(-t * 0.04, 0);
  ctx.lineTo(-t * 0.08, -t * 0.34);
  ctx.quadraticCurveTo(0, -t * 0.46, t * 0.08, -t * 0.34);
  ctx.lineTo(t * 0.04, 0);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = body;
  // Hulking body.
  ctx.beginPath();
  ctx.ellipse(0, t * 0.08, t * 0.32, t * 0.3, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  shade(ctx, -t * 0.12, -t * 0.06, t * 0.1, t * 0.06);
  // Small head sunk into the shoulders.
  ctx.beginPath();
  ctx.arc(0, -t * 0.2, t * 0.12, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  eyePair(ctx, t, look.facing.x * t * 0.02, -t * 0.2, t * 0.045, eyes, look.windup > 0);
  // Other fist.
  ctx.beginPath();
  ctx.arc(-side * t * 0.3, t * 0.2, t * 0.08, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
}

function wraith(ctx: CanvasRenderingContext2D, t: number, body: string, look: CreatureLook): void {
  const sway = Math.sin(look.time * 3 + look.seed) * t * 0.03;
  ctx.fillStyle = body;
  ctx.globalAlpha *= 0.85;
  ctx.beginPath();
  ctx.moveTo(0, -t * 0.34);
  ctx.quadraticCurveTo(t * 0.3, -t * 0.28, t * 0.24 + sway, t * 0.18);
  for (let i = 0; i <= 5; i++) {
    const x = t * 0.24 - (i * t * 0.48) / 5 + sway * (1 - i / 5);
    ctx.lineTo(x, t * (i % 2 ? 0.22 : 0.34));
  }
  ctx.quadraticCurveTo(-t * 0.3, -t * 0.28, 0, -t * 0.34);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(10, 8, 20, 0.8)';
  ctx.beginPath();
  ctx.ellipse(0, -t * 0.1, t * 0.12, t * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();
  eyePair(ctx, t, 0, -t * 0.1, t * 0.045, look.windup > 0 ? '#ff4a2e' : '#d9d2ff', true);
}

/** The player: a hooded traveller carrying the lamp. */
export function drawTraveller(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number, opts: { flash: boolean; ghost: boolean; time: number }): void {
  ctx.save();
  ctx.translate(cx, cy + Math.sin(opts.time * 2) * t * 0.012);
  if (opts.ghost) ctx.globalAlpha *= 0.5;
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(1.5, t * 0.035);
  ctx.strokeStyle = '#1d140e';
  // Cloak.
  ctx.fillStyle = opts.flash ? '#ff7a66' : '#d9c5a0';
  ctx.beginPath();
  ctx.moveTo(0, -t * 0.32);
  ctx.quadraticCurveTo(t * 0.27, -t * 0.12, t * 0.22, t * 0.32);
  ctx.lineTo(-t * 0.22, t * 0.32);
  ctx.quadraticCurveTo(-t * 0.27, -t * 0.12, 0, -t * 0.32);
  ctx.fill(); ctx.stroke();
  // Hood shadow and face.
  ctx.fillStyle = '#3a2a1e';
  ctx.beginPath();
  ctx.ellipse(0, -t * 0.1, t * 0.11, t * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f0dcc0';
  ctx.beginPath();
  ctx.arc(-t * 0.035, -t * 0.09, Math.max(1.2, t * 0.022), 0, Math.PI * 2);
  ctx.arc(t * 0.035, -t * 0.09, Math.max(1.2, t * 0.022), 0, Math.PI * 2);
  ctx.fill();
  // Lamp on a short pole.
  ctx.strokeStyle = '#3a2a1e';
  ctx.beginPath();
  ctx.moveTo(t * 0.16, t * 0.12); ctx.lineTo(t * 0.3, -t * 0.14);
  ctx.stroke();
  ctx.fillStyle = '#ffcf7a';
  ctx.shadowColor = 'rgba(255, 190, 90, 1)';
  ctx.shadowBlur = t * 0.35;
  ctx.beginPath();
  ctx.arc(t * 0.3, -t * 0.06, t * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
