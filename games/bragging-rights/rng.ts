/** Deterministic integer randomness, identical in every browser and in Node. */

/** FNV-1a hash of a string to an unsigned 32-bit integer. */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Combine two integers into a well-mixed unsigned 32-bit seed. */
export function mix(a: number, b: number): number {
  let h = Math.imul((a ^ 0x9e3779b9) >>> 0, 0x85ebca6b) ^ b;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
}

/** Mulberry32. Small, fast and good enough for level generation. */
export class Rng {
  private s: number;

  constructor(seed: number) {
    this.s = seed >>> 0;
  }

  /** Unsigned 32-bit integer. */
  next(): number {
    this.s = (this.s + 0x6d2b79f5) >>> 0;
    let t = this.s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (t ^ (t >>> 14)) >>> 0;
  }

  /** Integer in [min, max], inclusive. */
  int(min: number, max: number): number {
    return min + (this.next() % (max - min + 1));
  }

  chance(p: number): boolean {
    return this.next() < p * 4294967296;
  }

  pick<T>(items: readonly T[]): T {
    return items[this.next() % items.length];
  }

  shuffle<T>(items: T[]): T[] {
    for (let i = items.length - 1; i > 0; i--) {
      const j = this.next() % (i + 1);
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }
}
