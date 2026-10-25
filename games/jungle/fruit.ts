/** Fruit dropping from fruit trees near the player. Pure logic: no Three.js, no DOM. */
import type { Tree } from './plants';
import type { Terrain } from './terrain';

export interface FallingFruit {
  /** The tree it fell from and which of its fruit it was. */
  tree: Tree;
  index: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  landed: boolean;
  /** Seconds since it landed. */
  age: number;
  /** Tumble angle while falling, in radians. */
  spin: number;
}

export interface FruitSettings {
  waterLevel: number;
  gravity: number;
  /** Fruit trees within this distance of the player can drop fruit. */
  radius: number;
  /** Chance per second that a given fruit tree drops a fruit. */
  dropChance: number;
  /** Seconds fallen fruit lies on the ground before it's gone. */
  lifetime: number;
  /** Most fruit on the ground at once. */
  maxFallen: number;
}

export class Orchard {
  readonly fallen: FallingFruit[] = [];
  /** Which fruit each tree has already dropped, so none falls twice. */
  private readonly dropped = new WeakMap<Tree, Set<number>>();

  constructor(
    private readonly treesNear: (x: number, z: number, radius: number) => Tree[],
    private readonly terrain: Terrain,
    private readonly settings: FruitSettings,
    private readonly rng: () => number,
  ) {}

  /** Advances falling fruit; returns any fruit that just fell, so the renderer can take them off their trees. */
  step(dt: number, player: { x: number; z: number }): FallingFruit[] {
    const s = this.settings;
    const dropped: FallingFruit[] = [];

    if (this.fallen.length < s.maxFallen) {
      for (const tree of this.treesNear(player.x, player.z, s.radius)) {
        if (this.fallen.length >= s.maxFallen) break;
        if (tree.fruit.length === 0 || this.rng() >= s.dropChance * dt) continue;
        const gone = this.dropped.get(tree) ?? new Set<number>();
        const left = tree.fruit.map((_, i) => i).filter((i) => !gone.has(i));
        if (left.length === 0) continue;
        const index = left[Math.floor(this.rng() * left.length)]!;
        gone.add(index);
        this.dropped.set(tree, gone);
        const f = tree.fruit[index]!;
        const fruit: FallingFruit = {
          tree, index, x: f.x, y: f.y, z: f.z,
          vx: (this.rng() - 0.5) * 0.8, vy: 0, vz: (this.rng() - 0.5) * 0.8,
          landed: false, age: 0, spin: 0,
        };
        this.fallen.push(fruit);
        dropped.push(fruit);
      }
    }

    for (let i = this.fallen.length - 1; i >= 0; i--) {
      const f = this.fallen[i]!;
      if (f.landed) {
        f.age += dt;
        if (f.age > s.lifetime) this.fallen.splice(i, 1);
        continue;
      }
      f.vy -= s.gravity * dt;
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      f.z += f.vz * dt;
      f.spin += dt * 6;
      // Fruit floats when it lands in water.
      const floor = Math.max(this.terrain.heightAt(f.x, f.z), s.waterLevel) + 0.2;
      if (f.y <= floor) {
        f.y = floor;
        if (f.vy < -3) {
          f.vy *= -0.3; // one small bounce
        } else {
          f.landed = true;
          f.vx = f.vy = f.vz = 0;
        }
      }
    }
    return dropped;
  }
}
