import { begin, ICONS, INK, PROPS } from '../props';
import type { Rect } from '../types';

/**
 * SPOILERS: drawings for Chapter 2's items and props, registered into the shared
 * PROPS and ICONS. Kept here, not in props.ts, because their names give things away.
 */


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

Object.assign(PROPS, { 'goodmanham-prop-2': (ctx: CanvasRenderingContext2D, r: Rect, t: number) => drawBoar(ctx, r, t), 'goodmanham-prop-1': (ctx: CanvasRenderingContext2D, r: Rect) => drawHalter(ctx, r) });
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
