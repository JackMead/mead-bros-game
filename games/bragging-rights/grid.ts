import type { Floor, Pos, Tile } from './types';

/** The 8 directions, clockwise from north. Order matters: it breaks ties deterministically. */
export const DIRS: readonly Pos[] = [
  { x: 0, y: -1 },
  { x: 1, y: -1 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
  { x: -1, y: 1 },
  { x: -1, y: 0 },
  { x: -1, y: -1 },
];

export const add = (a: Pos, b: Pos): Pos => ({ x: a.x + b.x, y: a.y + b.y });
export const same = (a: Pos, b: Pos): boolean => a.x === b.x && a.y === b.y;

/** Chebyshev distance: the number of 8-way steps between two squares. */
export const dist = (a: Pos, b: Pos): number => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));

export function inBounds(f: Floor, p: Pos): boolean {
  return p.x >= 0 && p.y >= 0 && p.x < f.width && p.y < f.height;
}

export function tileAt(f: Floor, p: Pos): Tile {
  return inBounds(f, p) ? f.tiles[p.y * f.width + p.x] : 'wall';
}

export function setTile(f: Floor, p: Pos, t: Tile): void {
  f.tiles[p.y * f.width + p.x] = t;
}

/** Unit direction from `a` to `b` if they share a row, column or diagonal; otherwise null. */
export function alignedDir(a: Pos, b: Pos): Pos | null {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (dx === 0 && dy === 0) return null;
  if (dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy)) return null;
  return { x: Math.sign(dx), y: Math.sign(dy) };
}

/** Steps from `from` to every square, moving 8-way through squares where `open` is true. -1 if unreachable. */
export function distances(f: Floor, from: Pos, open: (p: Pos) => boolean): number[] {
  const out = new Array<number>(f.width * f.height).fill(-1);
  out[from.y * f.width + from.x] = 0;
  const queue: Pos[] = [from];
  for (let i = 0; i < queue.length; i++) {
    const p = queue[i];
    const d = out[p.y * f.width + p.x];
    for (const dir of DIRS) {
      const n = add(p, dir);
      if (!inBounds(f, n) || out[n.y * f.width + n.x] !== -1 || !open(n)) continue;
      out[n.y * f.width + n.x] = d + 1;
      queue.push(n);
    }
  }
  return out;
}
