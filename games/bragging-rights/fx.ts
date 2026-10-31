import { config } from './config';
import type { Behaviour, GameEvent, Pos, RunState } from './types';

/**
 * Visual-only state: where pieces are drawn mid-slide, particles, flashes and shake.
 * It reacts to the simulation's events but never feeds back into the game.
 */

interface Particle { x: number; y: number; vx: number; vy: number; life: number; max: number; colour: string; size: number }
interface Ghost { x: number; y: number; colour: string; behaviour: Behaviour; life: number; fall: boolean }
interface Floater { x: number; y: number; text: string; colour: string; life: number }
interface Bump { dx: number; dy: number; life: number }

export interface Look {
  colour(type: string): string;
  behaviour(type: string): Behaviour;
}

const BUMP_TIME = 0.16;
const FLASH_TIME = 0.14;

export class Fx {
  time = 0;
  shake = 0;
  hurt = 0;
  readonly pos = new Map<string, Pos>();
  readonly bumps = new Map<string, Bump>();
  readonly flashes = new Map<string, number>();
  particles: Particle[] = [];
  ghosts: Ghost[] = [];
  floaters: Floater[] = [];
  /** Small deterministic noise source so effects don't need Math.random. */
  private n = 1;

  snap(state: RunState): void {
    this.pos.clear();
    this.bumps.clear();
    this.flashes.clear();
    this.ghosts = [];
    this.pos.set('p', { ...state.player.pos });
    for (const e of state.floor.enemies) this.pos.set(`e${e.id}`, { ...e.pos });
  }

  apply(events: GameEvent[], state: RunState, look: Look): void {
    for (const ev of events) {
      switch (ev.type) {
        case 'attack': {
          const key = ev.by === 'player' ? 'p' : `e${ev.by}`;
          const from = this.pos.get(key);
          if (from) {
            const dx = Math.sign(ev.at.x - from.x);
            const dy = Math.sign(ev.at.y - from.y);
            this.bumps.set(key, { dx, dy, life: BUMP_TIME });
          }
          break;
        }
        case 'playerHurt':
          this.shake = 0.35;
          this.hurt = 0.45;
          this.flashes.set('p', FLASH_TIME * 2);
          this.burst(state.player.pos, '#ff6a50', 10, 2.2);
          break;
        case 'enemyHurt': {
          this.flashes.set(`e${ev.id}`, FLASH_TIME);
          const p = this.pos.get(`e${ev.id}`);
          if (p) this.burst(p, '#ffffff', 5, 1.5);
          break;
        }
        case 'kill':
        case 'fall': {
          const p = this.pos.get(`e${ev.id}`) ?? ev.pos;
          this.ghosts.push({ x: p.x, y: p.y, colour: look.colour(ev.type_), behaviour: look.behaviour(ev.type_), life: 1, fall: ev.type === 'fall' });
          if (ev.type === 'kill') this.burst(p, look.colour(ev.type_), 16, 3);
          this.pos.delete(`e${ev.id}`);
          this.shake = Math.max(this.shake, 0.12);
          break;
        }
        case 'pickup': {
          const text = ev.kind === 'relic' ? `+${ev.value}` : ev.kind === 'oil' ? `+${ev.value} oil` : ev.kind === 'ring' ? 'A ring…' : 'Page';
          const colour = ev.kind === 'relic' ? '#ffd76a' : ev.kind === 'oil' ? '#ffb060' : '#e9dfc4';
          this.floaters.push({ x: ev.pos.x, y: ev.pos.y, text, colour, life: 1 });
          this.burst(ev.pos, colour, 10, 1.8);
          break;
        }
        case 'page':
          this.burst(ev.at, '#8fc8ff', 14, 2.4);
          break;
        case 'ring':
          this.burst(state.player.pos, '#c7b8ff', 24, 2.8);
          break;
        case 'spawn':
          this.pos.set(`e${ev.id}`, { ...ev.pos });
          this.burst(ev.pos, '#b9b2e6', 18, 2);
          break;
        case 'smash':
          this.burst(ev.pos, '#9a8c7c', 18, 3);
          this.shake = Math.max(this.shake, 0.25);
          break;
        case 'stairs':
          this.burst(state.player.pos, '#ffe9a8', 20, 2.5);
          break;
        case 'descend':
          this.snap(state);
          break;
        default:
          break;
      }
    }
  }

  update(dt: number, state: RunState): void {
    this.time += dt;
    this.shake = Math.max(0, this.shake - dt);
    this.hurt = Math.max(0, this.hurt - dt);
    const k = Math.min(1, dt * config.ui.moveLerp);
    const follow = (key: string, target: Pos) => {
      const p = this.pos.get(key);
      if (!p) { this.pos.set(key, { ...target }); return; }
      p.x += (target.x - p.x) * k;
      p.y += (target.y - p.y) * k;
    };
    follow('p', state.player.pos);
    for (const e of state.floor.enemies) follow(`e${e.id}`, e.pos);

    for (const [key, b] of this.bumps) {
      b.life -= dt;
      if (b.life <= 0) this.bumps.delete(key);
    }
    for (const [key, t] of this.flashes) {
      if (t - dt <= 0) this.flashes.delete(key);
      else this.flashes.set(key, t - dt);
    }
    for (const p of this.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.9;
      p.vy = p.vy * 0.9 + 1.2 * dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const g of this.ghosts) g.life -= dt * 2.2;
    this.ghosts = this.ghosts.filter((g) => g.life > 0);
    for (const f of this.floaters) { f.life -= dt * 0.9; f.y -= dt * 0.8; }
    this.floaters = this.floaters.filter((f) => f.life > 0);
  }

  /** Bump offset in squares for a piece mid-attack. */
  offset(key: string): Pos {
    const b = this.bumps.get(key);
    if (!b) return { x: 0, y: 0 };
    const t = b.life / BUMP_TIME;
    const amount = Math.sin(t * Math.PI) * 0.28;
    return { x: b.dx * amount, y: b.dy * amount };
  }

  private rand(): number {
    this.n = (this.n * 16807) % 2147483647;
    return this.n / 2147483647;
  }

  private burst(at: Pos, colour: string, count: number, speed: number): void {
    for (let i = 0; i < count; i++) {
      const a = this.rand() * Math.PI * 2;
      const v = speed * (0.4 + this.rand() * 0.8);
      const max = 0.35 + this.rand() * 0.35;
      this.particles.push({
        x: at.x + 0.5, y: at.y + 0.5, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.6,
        life: max, max, colour, size: 0.05 + this.rand() * 0.06,
      });
    }
  }
}
