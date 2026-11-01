import { config } from './config';
import type { Fx } from './fx';
import { alignedDir } from './grid';
import type { FloorKit } from './kit';
import { enemyType } from './kits';
import { PAGES } from './pages';
import { windingUp } from './sim';
import type { Behaviour, Enemy, Pos, RunState } from './types';

/** Drawing only: reads the game state and the visual effects, changes neither. */

export interface Layout {
  tile: number;
  ox: number;
  oy: number;
  width: number;
  height: number;
}

export interface View {
  state: RunState;
  kit: FloorKit;
  fx: Fx;
  layout: Layout;
  /** Squares to highlight while aiming a page. */
  targets: Pos[] | null;
  /** Enemy being inspected. */
  inspect: number | null;
}

export function computeLayout(width: number, height: number, cols: number, rows: number): Layout {
  const tile = Math.max(8, Math.floor(Math.min(width / cols, height / rows)));
  return { tile, width, height, ox: Math.floor((width - tile * cols) / 2), oy: Math.floor((height - tile * rows) / 2) };
}

/** The grid square under a point in canvas CSS pixels, or null. */
export function squareAt(layout: Layout, state: RunState, x: number, y: number): Pos | null {
  const sx = Math.floor((x - layout.ox) / layout.tile);
  const sy = Math.floor((y - layout.oy) / layout.tile);
  if (sx < 0 || sy < 0 || sx >= state.floor.width || sy >= state.floor.height) return null;
  return { x: sx, y: sy };
}

export function render(ctx: CanvasRenderingContext2D, light: CanvasRenderingContext2D, view: View, dpr: number): void {
  const { state, kit, fx, layout } = view;
  const { tile: t } = layout;
  const pal = kit.palette;

  ctx.save();
  ctx.fillStyle = pal.background;
  ctx.fillRect(0, 0, layout.width, layout.height);

  const shake = fx.shake > 0 ? fx.shake * t * 0.18 : 0;
  ctx.translate(layout.ox + Math.sin(fx.time * 91) * shake, layout.oy + Math.cos(fx.time * 77) * shake);

  drawTiles(ctx, view);
  drawStairs(ctx, view);
  drawLight(ctx, light, view, dpr);
  drawItems(ctx, view);
  drawTelegraphs(ctx, view);
  drawReach(ctx, view);
  if (view.targets) drawTargets(ctx, view.targets, t, fx.time);
  for (const g of fx.ghosts) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, g.life);
    const scale = g.fall ? g.life : 1 + (1 - g.life) * 0.4;
    drawEnemyShape(ctx, g.behaviour, g.colour, (g.x + 0.5) * t, (g.y + 0.5) * t, t * scale, false, { x: 0, y: 1 });
    ctx.restore();
  }
  for (const e of state.floor.enemies) drawEnemy(ctx, view, e);
  drawPlayer(ctx, view);
  drawParticles(ctx, view);
  ctx.restore();

  if (fx.hurt > 0) {
    const g = ctx.createRadialGradient(layout.width / 2, layout.height / 2, layout.width * 0.3, layout.width / 2, layout.height / 2, layout.width * 0.8);
    g.addColorStop(0, 'rgba(200, 30, 20, 0)');
    g.addColorStop(1, `rgba(200, 30, 20, ${fx.hurt * 0.8})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, layout.width, layout.height);
  }
}

function drawTiles(ctx: CanvasRenderingContext2D, { state, kit, layout }: View): void {
  const f = state.floor;
  const t = layout.tile;
  const pal = kit.palette;
  for (let y = 0; y < f.height; y++) {
    for (let x = 0; x < f.width; x++) {
      const tile = f.tiles[y * f.width + x];
      const px = x * t;
      const py = y * t;
      if (tile === 'floor') {
        ctx.fillStyle = (x + y) % 2 ? pal.floor : pal.floorAlt;
        ctx.fillRect(px, py, t, t);
        // A couple of fixed specks per square so the floor isn't flat.
        const h = (x * 73856093) ^ (y * 19349663) ^ (f.depth * 83492791);
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fillRect(px + (Math.abs(h) % 7) / 8 * t, py + (Math.abs(h >> 3) % 7) / 8 * t, t * 0.06, t * 0.06);
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(px + (Math.abs(h >> 6) % 7) / 8 * t, py + (Math.abs(h >> 9) % 7) / 8 * t, t * 0.05, t * 0.05);
      } else if (tile === 'chasm') {
        ctx.fillStyle = pal.chasm;
        ctx.fillRect(px, py, t, t);
        if (y === 0 || f.tiles[(y - 1) * f.width + x] !== 'chasm') {
          ctx.fillStyle = 'rgba(80, 64, 52, 0.55)';
          ctx.fillRect(px, py, t, t * 0.16);
        }
      }
    }
  }
  // Walls second so their shadows fall on the floor below.
  for (let y = 0; y < f.height; y++) {
    for (let x = 0; x < f.width; x++) {
      if (f.tiles[y * f.width + x] !== 'wall') continue;
      const px = x * t;
      const py = y * t;
      if (y + 1 < f.height && f.tiles[(y + 1) * f.width + x] !== 'wall') {
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(px, py + t, t, t * 0.16);
      }
      ctx.fillStyle = pal.wall;
      ctx.fillRect(px, py, t, t);
      ctx.fillStyle = pal.wallTop;
      ctx.fillRect(px + 1, py + 1, t - 2, t * 0.7);
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
      ctx.fillRect(px + 1, py + 1, t - 2, t * 0.08);
    }
  }
}

function drawStairs(ctx: CanvasRenderingContext2D, { state, kit, layout, fx }: View): void {
  const t = layout.tile;
  const { x, y } = state.floor.stairs;
  const px = x * t;
  const py = y * t;
  ctx.fillStyle = '#0b0908';
  ctx.fillRect(px + t * 0.06, py + t * 0.06, t * 0.88, t * 0.88);
  for (let i = 0; i < 4; i++) {
    const inset = t * (0.1 + i * 0.1);
    ctx.fillStyle = `rgba(${kit.palette.light}, ${0.35 - i * 0.07})`;
    ctx.fillRect(px + inset, py + t * (0.18 + i * 0.17), t - inset * 2, t * 0.09);
  }
  ctx.fillStyle = `rgba(${kit.palette.light}, ${0.12 + 0.08 * Math.sin(fx.time * 2.5)})`;
  ctx.fillRect(px, py, t, t);
}

function drawLight(ctx: CanvasRenderingContext2D, light: CanvasRenderingContext2D, view: View, dpr: number): void {
  const { state, fx, layout, kit } = view;
  const t = layout.tile;
  const p = fx.pos.get('p') ?? state.player.pos;
  const oil = state.player.oil / state.player.maxOil;
  const low = oil < 0.2 ? (0.2 - oil) * 5 : 0;
  const flicker = 0.04 * Math.sin(fx.time * 13) + 0.03 * Math.sin(fx.time * 7.3) + low * 0.12 * Math.sin(fx.time * 31);
  const radius = t * (2.6 + 2.8 * oil) * (1 + flicker);
  const cx = (p.x + 0.5) * t;
  const cy = (p.y + 0.5) * t;
  const w = state.floor.width * t;
  const h = state.floor.height * t;

  // Darkness everywhere except a soft hole around the lamp. Kept partial so nothing is hidden.
  const lc = light.canvas;
  light.setTransform(1, 0, 0, 1, 0, 0);
  light.clearRect(0, 0, lc.width, lc.height);
  light.setTransform(dpr, 0, 0, dpr, 0, 0);
  light.globalCompositeOperation = 'source-over';
  light.fillStyle = `rgba(4, 3, 8, ${config.ui.maxDarkness * (0.75 + 0.25 * (1 - oil))})`;
  light.fillRect(0, 0, w, h);
  light.globalCompositeOperation = 'destination-out';
  const hole = light.createRadialGradient(cx, cy, t * 0.8, cx, cy, radius);
  hole.addColorStop(0, 'rgba(0,0,0,1)');
  hole.addColorStop(1, 'rgba(0,0,0,0)');
  light.fillStyle = hole;
  light.fillRect(0, 0, w, h);
  light.globalCompositeOperation = 'source-over';
  ctx.drawImage(lc, 0, 0, lc.width, lc.height, 0, 0, lc.width / dpr, lc.height / dpr);

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.9);
  glow.addColorStop(0, `rgba(${kit.palette.light}, ${0.16 + flicker})`);
  glow.addColorStop(1, `rgba(${kit.palette.light}, 0)`);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function drawItems(ctx: CanvasRenderingContext2D, { state, layout, fx }: View): void {
  const t = layout.tile;
  state.floor.items.forEach((item, i) => {
    const cx = (item.pos.x + 0.5) * t;
    const cy = (item.pos.y + 0.5) * t + Math.sin(fx.time * 3 + i) * t * 0.03;
    ctx.save();
    switch (item.kind) {
      case 'relic': {
        const r = t * 0.2;
        ctx.shadowColor = 'rgba(255, 210, 100, 0.8)';
        ctx.shadowBlur = t * 0.25;
        ctx.fillStyle = '#e8c35a';
        ctx.beginPath();
        ctx.moveTo(cx, cy - r);
        ctx.lineTo(cx + r * 0.8, cy);
        ctx.lineTo(cx, cy + r);
        ctx.lineTo(cx - r * 0.8, cy);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff3c4';
        ctx.beginPath();
        ctx.moveTo(cx, cy - r);
        ctx.lineTo(cx + r * 0.8, cy);
        ctx.lineTo(cx, cy);
        ctx.closePath();
        ctx.fill();
        text(ctx, String(item.value), cx + t * 0.3, cy + t * 0.3, t * 0.24, '#ffe79a');
        break;
      }
      case 'oil': {
        const r = t * 0.14;
        ctx.fillStyle = '#f0a040';
        ctx.shadowColor = 'rgba(255, 160, 60, 0.8)';
        ctx.shadowBlur = t * 0.2;
        ctx.beginPath();
        ctx.arc(cx, cy + r * 0.4, r, 0, Math.PI * 2);
        ctx.moveTo(cx - r * 0.85, cy + r * 0.1);
        ctx.lineTo(cx, cy - r * 1.6);
        ctx.lineTo(cx + r * 0.85, cy + r * 0.1);
        ctx.fill();
        break;
      }
      case 'page': {
        const w = t * 0.38;
        const h = t * 0.46;
        ctx.fillStyle = '#e9dfc4';
        ctx.shadowColor = 'rgba(160, 200, 255, 0.7)';
        ctx.shadowBlur = t * 0.2;
        ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#b9ab8a';
        ctx.beginPath();
        ctx.moveTo(cx + w / 2 - t * 0.1, cy - h / 2);
        ctx.lineTo(cx + w / 2, cy - h / 2 + t * 0.1);
        ctx.lineTo(cx + w / 2 - t * 0.1, cy - h / 2 + t * 0.1);
        ctx.fill();
        if (item.page) text(ctx, PAGES[item.page].glyph, cx, cy + t * 0.02, t * 0.26, '#5a4630');
        break;
      }
      case 'ring': {
        ctx.strokeStyle = '#f2c94c';
        ctx.lineWidth = t * 0.07;
        ctx.shadowColor = 'rgba(255, 220, 120, 1)';
        ctx.shadowBlur = t * (0.25 + 0.15 * Math.sin(fx.time * 4));
        ctx.beginPath();
        ctx.arc(cx, cy, t * 0.15, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }
    }
    ctx.restore();
  });
}

function drawTelegraphs(ctx: CanvasRenderingContext2D, { state, layout, fx }: View): void {
  const t = layout.tile;
  const pulse = 0.5 + 0.5 * Math.sin(fx.time * 6);
  for (const e of state.floor.enemies) {
    const intent = e.intent;
    if (intent.type !== 'attack' && intent.type !== 'charge') continue;
    for (const sq of intent.squares) {
      ctx.fillStyle = `rgba(235, 70, 55, ${0.2 + 0.1 * pulse})`;
      ctx.fillRect(sq.x * t + 1, sq.y * t + 1, t - 2, t - 2);
      ctx.strokeStyle = 'rgba(255, 120, 95, 0.85)';
      ctx.lineWidth = Math.max(1.5, t * 0.035);
      ctx.strokeRect(sq.x * t + 3, sq.y * t + 3, t - 6, t - 6);
    }
    if (intent.type === 'charge' && intent.squares.length > 0) {
      const dir = alignedDir(e.pos, intent.squares[0])!;
      ctx.fillStyle = 'rgba(255, 150, 120, 0.9)';
      for (const sq of intent.squares) chevron(ctx, (sq.x + 0.5) * t, (sq.y + 0.5) * t, dir, t * 0.16);
    }
  }
}

/** Dashed outline around each enemy winding up next to you: leave it and you take a hit. */
function drawReach(ctx: CanvasRenderingContext2D, { state, layout, fx }: View): void {
  const t = layout.tile;
  const f = state.floor;
  for (const e of windingUp(state)) {
    const x0 = Math.max(0, e.pos.x - 1);
    const y0 = Math.max(0, e.pos.y - 1);
    const x1 = Math.min(f.width - 1, e.pos.x + 1);
    const y1 = Math.min(f.height - 1, e.pos.y + 1);
    ctx.save();
    ctx.setLineDash([t * 0.12, t * 0.08]);
    ctx.lineDashOffset = -fx.time * t * 0.4;
    ctx.strokeStyle = 'rgba(255, 176, 92, 0.95)';
    ctx.lineWidth = Math.max(2, t * 0.045);
    ctx.strokeRect(x0 * t + 2, y0 * t + 2, (x1 - x0 + 1) * t - 4, (y1 - y0 + 1) * t - 4);
    ctx.restore();
  }
}

function drawTargets(ctx: CanvasRenderingContext2D, targets: Pos[], t: number, time: number): void {
  for (const sq of targets) {
    ctx.fillStyle = `rgba(120, 190, 255, ${0.18 + 0.1 * Math.sin(time * 5)})`;
    ctx.fillRect(sq.x * t + 1, sq.y * t + 1, t - 2, t - 2);
    ctx.strokeStyle = 'rgba(150, 210, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.strokeRect(sq.x * t + 3, sq.y * t + 3, t - 6, t - 6);
  }
}

function drawEnemy(ctx: CanvasRenderingContext2D, view: View, e: Enemy): void {
  const { state, kit, fx, layout } = view;
  const t = layout.tile;
  const type = enemyType(kit, e.type);
  const p = fx.pos.get(`e${e.id}`) ?? e.pos;
  const off = fx.offset(`e${e.id}`);
  const cx = (p.x + 0.5 + off.x) * t;
  const cy = (p.y + 0.5 + off.y) * t;
  const facing = { x: Math.sign(state.player.pos.x - e.pos.x), y: Math.sign(state.player.pos.y - e.pos.y) };
  const flash = fx.flashes.has(`e${e.id}`);

  ctx.save();
  if (type.behaviour === 'hunter') ctx.globalAlpha = 0.7 + 0.15 * Math.sin(fx.time * 3 + e.id);
  const size = type.behaviour === 'brute' ? t * 1.15 : t;
  drawEnemyShape(ctx, type.behaviour, flash ? '#ffffff' : type.colour, cx, cy, size, true, facing);
  ctx.restore();

  if (view.inspect === e.id) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, t * 0.44, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (type.hp > 1) {
    for (let i = 0; i < type.hp; i++) {
      ctx.fillStyle = i < e.hp ? '#f4eadb' : 'rgba(244, 234, 219, 0.2)';
      ctx.beginPath();
      ctx.arc(cx + (i - (type.hp - 1) / 2) * t * 0.13, cy + t * 0.38, t * 0.045, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const badge = e.intent.type === 'stunned' ? 'z' : e.intent.type === 'none' ? '?' : '';
  if (badge) text(ctx, badge, cx + t * 0.3, cy - t * 0.3, t * 0.26, '#d9e4ff');
}

/** One silhouette per behaviour, so a new kit's enemies read at a glance. */
function drawEnemyShape(
  ctx: CanvasRenderingContext2D, behaviour: Behaviour, colour: string,
  cx: number, cy: number, t: number, eyes: boolean, facing: Pos,
): void {
  const r = t * 0.3;
  ctx.fillStyle = colour;
  ctx.strokeStyle = 'rgba(0,0,0,0.45)';
  ctx.lineWidth = Math.max(1, t * 0.03);
  ctx.beginPath();
  switch (behaviour) {
    case 'melee':
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + r * 0.95, cy + r * 0.8);
      ctx.lineTo(cx - r * 0.95, cy + r * 0.8);
      ctx.closePath();
      break;
    case 'archer':
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + r * 0.75, cy);
      ctx.lineTo(cx, cy + r);
      ctx.lineTo(cx - r * 0.75, cy);
      ctx.closePath();
      break;
    case 'brute':
      roundRect(ctx, cx - r, cy - r * 0.9, r * 2, r * 1.8, r * 0.45);
      break;
    case 'charger': {
      const a = Math.atan2(facing.y || 0.0001, facing.x || 0.0001);
      for (let i = 0; i < 3; i++) {
        const ang = a + (i === 0 ? 0 : i === 1 ? 2.4 : -2.4);
        const rr = i === 0 ? r * 1.15 : r;
        const px = cx + Math.cos(ang) * rr;
        const py = cy + Math.sin(ang) * rr;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.lineTo(cx - Math.cos(a) * r * 0.35, cy - Math.sin(a) * r * 0.35);
      ctx.closePath();
      break;
    }
    case 'hunter':
      ctx.arc(cx, cy - r * 0.15, r * 0.8, Math.PI, 0);
      for (let i = 0; i <= 4; i++) {
        const px = cx + r * 0.8 - (i * r * 1.6) / 4;
        ctx.lineTo(px, cy + r * (i % 2 ? 0.55 : 0.85));
      }
      ctx.closePath();
      break;
  }
  ctx.fill();
  ctx.stroke();
  if (behaviour === 'archer') {
    ctx.strokeStyle = 'rgba(40, 28, 10, 0.8)';
    ctx.lineWidth = Math.max(1, t * 0.04);
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.45, -1.2, 1.2);
    ctx.stroke();
  }
  if (eyes) {
    const ex = facing.x * r * 0.15;
    const ey = facing.y * r * 0.1;
    ctx.fillStyle = '#151010';
    ctx.beginPath();
    ctx.arc(cx - r * 0.25 + ex, cy + ey, Math.max(1.2, t * 0.035), 0, Math.PI * 2);
    ctx.arc(cx + r * 0.25 + ex, cy + ey, Math.max(1.2, t * 0.035), 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlayer(ctx: CanvasRenderingContext2D, { state, fx, layout }: View): void {
  const t = layout.tile;
  const p = fx.pos.get('p') ?? state.player.pos;
  const off = fx.offset('p');
  const cx = (p.x + 0.5 + off.x) * t;
  const cy = (p.y + 0.5 + off.y) * t;
  const r = t * 0.28;
  ctx.save();
  if (state.player.invisible > 0) {
    ctx.globalAlpha = 0.45;
    ctx.setLineDash([t * 0.06, t * 0.06]);
    ctx.strokeStyle = '#c7b8ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.35, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.fillStyle = fx.flashes.has('p') ? '#ff7a66' : '#f2e6d0';
  ctx.strokeStyle = '#2a2018';
  ctx.lineWidth = Math.max(1.5, t * 0.04);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // The lamp.
  ctx.fillStyle = '#ffcf7a';
  ctx.shadowColor = 'rgba(255, 190, 90, 1)';
  ctx.shadowBlur = t * 0.3;
  ctx.beginPath();
  ctx.arc(cx + r * 0.75, cy - r * 0.55, r * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawParticles(ctx: CanvasRenderingContext2D, { fx, layout }: View): void {
  const t = layout.tile;
  for (const p of fx.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.colour;
    const s = p.size * t;
    ctx.fillRect(p.x * t - s / 2, p.y * t - s / 2, s, s);
  }
  ctx.globalAlpha = 1;
  for (const f of fx.floaters) {
    ctx.globalAlpha = Math.min(1, f.life * 2);
    text(ctx, f.text, (f.x + 0.5) * t, (f.y + 0.2) * t, t * 0.32, f.colour);
  }
  ctx.globalAlpha = 1;
}

function chevron(ctx: CanvasRenderingContext2D, cx: number, cy: number, dir: Pos, s: number): void {
  const a = Math.atan2(dir.y, dir.x);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(a);
  ctx.beginPath();
  ctx.moveTo(s, 0);
  ctx.lineTo(-s * 0.6, -s);
  ctx.lineTo(-s * 0.1, 0);
  ctx.lineTo(-s * 0.6, s);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, size: number, colour: string): void {
  ctx.font = `700 ${Math.round(size)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = Math.max(2, size * 0.18);
  ctx.strokeStyle = 'rgba(0,0,0,0.75)';
  ctx.strokeText(s, x, y);
  ctx.fillStyle = colour;
  ctx.fillText(s, x, y);
}
