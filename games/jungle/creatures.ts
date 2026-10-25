/** Animals: where they spawn and how they move. Pure logic: no Three.js, no DOM. */
import { spawnLizards, stepLizard, type TreeSource } from './climbers';
import { hash2, mulberry32 } from './noise';
import type { Tree } from './plants';
import type { Species } from './species';
import { headingOf, moveForward, turnTowards } from './steering';
import type { Terrain } from './terrain';

export { headingOf, turnTowards };

/** What an animal is doing. 'jump' is a leaping fish; 'leave' is a lizard heading down to change trees. */
export type Mode = 'idle' | 'walk' | 'flee' | 'jump' | 'leave';

export interface Creature {
  /** Index into the species list. */
  species: number;
  x: number;
  y: number;
  z: number;
  /** Facing in radians, same convention as the player: 0 faces -Z. */
  heading: number;
  /** Current ground (or air/water) speed in m/s. */
  speed: number;
  /** Vertical speed, used by leaping fish. */
  vy: number;
  mode: Mode;
  /** Seconds left in the current mode. */
  timer: number;
  /** Animation clock in radians: advances with strides, wingbeats or tail beats. */
  phase: number;
  /** 0 (head up) to 1 (head down grazing). */
  graze: number;
  /** Small per-animal colour variation, -1 to 1. */
  tint: number;
  /** Where it spawned; it won't wander too far from here. Flocks drift, so this moves for birds. */
  homeX: number;
  homeZ: number;
  /** Birds circle their flock's home. Angle, radius and angular speed (negative is clockwise). */
  orbit: number;
  orbitRadius: number;
  orbitSpeed: number;
  /** Direction a bird's flock drifts in, radians. */
  drift: number;
  /** Bird's place in the flock, or fish's swimming depth in offsetY. */
  offsetX: number;
  offsetY: number;
  offsetZ: number;
  /** Climbers: the tree it's on, or running to. */
  tree: Tree | null;
  /** Lizards: on the trunk, or running across the ground to `tree`. */
  onTrunk: boolean;
  /** Lizards: angle around the trunk (radians, from +X towards +Z), height up it, and the height it's heading for. */
  around: number;
  climb: number;
  goal: number;
  rng: () => number;
}

export interface CreatureSettings {
  chunkSize: number;
  waterLevel: number;
  /** Chunks around the player that have animals in them. */
  viewRadius: number;
  /** Multiplies every species' abundance. */
  abundance: number;
  /** How far grazers and fish stray from home before heading back. */
  leash: number;
  /** How high flocks fly above the ground or water. */
  birdAltitude: number;
  /** How fast flocks drift across the sky, m/s. */
  flockDrift: number;
  /** How high solo birds fly over clearings; they fly higher over thick jungle. */
  soloBirdAltitude: number;
  /** Chance per second that a fish leaps out of the water. */
  fishJumpChance: number;
  /** Furthest a climbing animal will go to reach another tree. */
  treeHop: number;
  gravity: number;
}

/** Keeps animals in the chunks around the player, spawning them as chunks come into range. */
export class Population {
  private readonly byChunk = new Map<string, Creature[]>();

  constructor(
    private readonly seed: number,
    private readonly terrain: Terrain,
    private readonly trees: TreeSource,
    readonly species: readonly Species[],
    private readonly settings: CreatureSettings,
  ) {}

  /** Spawns animals in newly in-range chunks and removes those whose chunk is out of range. */
  sync(px: number, pz: number): void {
    const { chunkSize, viewRadius: R } = this.settings;
    const pcx = Math.floor(px / chunkSize);
    const pcz = Math.floor(pz / chunkSize);
    for (const key of this.byChunk.keys()) {
      const [cx, cz] = key.split(',').map(Number) as [number, number];
      if (Math.abs(cx - pcx) > R + 1 || Math.abs(cz - pcz) > R + 1) this.byChunk.delete(key);
    }
    for (let dx = -R; dx <= R; dx++) {
      for (let dz = -R; dz <= R; dz++) {
        const key = `${pcx + dx},${pcz + dz}`;
        if (!this.byChunk.has(key)) this.byChunk.set(key, this.spawnChunk(pcx + dx, pcz + dz));
      }
    }
  }

  step(dt: number, player: { x: number; y: number; z: number }): void {
    for (const list of this.byChunk.values()) {
      for (const c of list) stepCreature(c, this.species[c.species]!, dt, player, this.terrain, this.settings, this.trees);
    }
  }

  private soloAltitude(x: number, z: number): number {
    return soloBirdHeight(this.terrain, x, z, this.settings);
  }

  *all(): IterableIterator<Creature> {
    for (const list of this.byChunk.values()) yield* list;
  }

  /** Every animal in one chunk, the same each time for a given seed. */
  spawnChunk(cx: number, cz: number): Creature[] {
    const { chunkSize: S, waterLevel: W } = this.settings;
    const rng = mulberry32(hash2(cx, cz, this.seed ^ 0x2545f491));
    const out: Creature[] = [];

    this.species.forEach((sp, index) => {
      const groups = Math.floor(sp.abundance * this.settings.abundance + rng());
      for (let g = 0; g < groups; g++) {
        if (sp.kind === 'lizard') {
          const [min, max] = sp.groupSize;
          const lizards = Array.from({ length: min + Math.floor(rng() * (max - min + 1)) }, () => spawnOne(index, 0, 0, rng));
          spawnLizards(lizards, this.trees.treesIn(cx, cz), rng);
          for (const c of lizards) {
            c.homeX = c.x;
            c.homeZ = c.z;
          }
          out.push(...lizards);
          continue;
        }
        // Look for a spot this species can live in.
        let x = 0;
        let z = 0;
        let found = false;
        for (let attempt = 0; attempt < 8 && !found; attempt++) {
          x = (cx + rng()) * S;
          z = (cz + rng()) * S;
          found = suits(sp, this.terrain.heightAt(x, z), W);
        }
        if (!found) continue;

        const [min, max] = sp.groupSize;
        const size = min + Math.floor(rng() * (max - min + 1));
        const flock = sp.kind === 'bird' && !sp.solo
          ? { radius: 15 + rng() * 30, speed: (rng() < 0.5 ? -1 : 1) * (0.25 + rng() * 0.2), angle: rng() * Math.PI * 2, drift: rng() * Math.PI * 2 }
          : null;
        for (let k = 0; k < size; k++) {
          const c = spawnOne(index, x, z, rng);
          if (flock) {
            c.orbit = flock.angle;
            c.orbitRadius = flock.radius;
            c.orbitSpeed = flock.speed;
            c.drift = flock.drift;
            c.offsetX = (rng() - 0.5) * 8;
            c.offsetY = (rng() - 0.5) * 4;
            c.offsetZ = (rng() - 0.5) * 8;
            c.x = x + Math.cos(c.orbit) * c.orbitRadius + c.offsetX;
            c.z = z + Math.sin(c.orbit) * c.orbitRadius + c.offsetZ;
            c.y = Math.max(this.terrain.heightAt(c.x, c.z), W) + this.settings.birdAltitude + c.offsetY;
            out.push(c);
            continue;
          }
          if (sp.solo) {
            c.y = this.soloAltitude(x, z);
            c.timer = 0;
            out.push(c);
            continue;
          }
          // Spread the group out a little, keeping each animal in its habitat.
          const sx = x + (rng() - 0.5) * 6;
          const sz = z + (rng() - 0.5) * 6;
          if (suits(sp, this.terrain.heightAt(sx, sz), W)) {
            c.x = sx;
            c.z = sz;
          }
          const ground = this.terrain.heightAt(c.x, c.z);
          if (sp.kind === 'fish') {
            c.offsetY = 0.4 + rng() * 1.2;
            c.y = Math.max(ground + 0.3, W - c.offsetY);
          } else {
            c.y = ground;
          }
          out.push(c);
        }
      }
    });
    return out;
  }
}

/** Whether ground at this height is somewhere the species can be. */
export function suits(sp: Species, ground: number, waterLevel: number): boolean {
  switch (sp.kind) {
    case 'grazer':
      return ground > waterLevel + 0.8;
    case 'fish':
      return ground < waterLevel - 1.5;
    case 'bird':
      return true;
    case 'lizard':
      return ground > waterLevel + 0.5;
  }
}

function spawnOne(species: number, x: number, z: number, rng: () => number): Creature {
  return {
    species, x, y: 0, z,
    heading: rng() * Math.PI * 2,
    speed: 0,
    vy: 0,
    mode: 'idle',
    timer: rng() * 3,
    phase: rng() * Math.PI * 2,
    graze: 0,
    tint: rng() * 2 - 1,
    homeX: x,
    homeZ: z,
    orbit: rng() * Math.PI * 2,
    orbitRadius: 0,
    orbitSpeed: 0,
    drift: 0,
    offsetX: 0,
    offsetY: 0,
    offsetZ: 0,
    tree: null,
    onTrunk: false,
    around: 0,
    climb: 0,
    goal: 0,
    rng: mulberry32(Math.floor(rng() * 4294967296)),
  };
}

export function stepCreature(
  c: Creature,
  sp: Species,
  dt: number,
  player: { x: number; y: number; z: number },
  terrain: Terrain,
  s: CreatureSettings,
  trees: TreeSource,
): void {
  if (sp.kind === 'lizard') stepLizard(c, sp, dt, player, terrain, trees, s);
  else if (sp.kind === 'bird' && sp.solo) stepSoloBird(c, sp, dt, terrain, s);
  else if (sp.kind === 'bird') stepBird(c, sp, dt, terrain, s);
  else stepWalker(c, sp, dt, player, terrain, s);
}

/** Grazers and fish: wander around home, pause, and flee from the player. */
function stepWalker(
  c: Creature,
  sp: Species,
  dt: number,
  player: { x: number; y: number; z: number },
  terrain: Terrain,
  s: CreatureSettings,
): void {
  const fish = sp.kind === 'fish';
  const W = s.waterLevel;

  if (c.mode === 'jump') {
    c.vy -= s.gravity * dt;
    c.y += c.vy * dt;
    moveForward(c, dt);
    c.phase += dt * 20;
    if (c.vy < 0 && c.y < W - c.offsetY) {
      c.mode = 'walk';
      c.vy = 0;
      c.timer = 1 + c.rng() * 2;
    }
    return;
  }

  // Startled? Turn away from the player and run. Fish only notice someone in or right by the water.
  const dx = c.x - player.x;
  const dz = c.z - player.z;
  const dist = Math.hypot(dx, dz);
  const noticed = dist < sp.fleeDistance && (!fish || player.y < W + 1.5);
  if (noticed) {
    if (c.mode !== 'flee') c.timer = 2 + c.rng() * 2;
    c.mode = 'flee';
    c.heading = turnTowards(c.heading, headingOf(dx, dz), 8 * dt);
  }

  c.timer -= dt;
  if (c.timer <= 0) {
    const fromHomeX = c.x - c.homeX;
    const fromHomeZ = c.z - c.homeZ;
    if (Math.hypot(fromHomeX, fromHomeZ) > s.leash) {
      c.mode = 'walk';
      c.heading = headingOf(-fromHomeX, -fromHomeZ);
      c.timer = 3 + c.rng() * 3;
    } else if (c.mode !== 'idle' && c.rng() < 0.5) {
      c.mode = 'idle';
      c.timer = 2 + c.rng() * 5;
    } else {
      c.mode = 'walk';
      c.heading += (c.rng() - 0.5) * 2;
      c.timer = 2 + c.rng() * 4;
    }
  }

  const target = c.mode === 'flee' ? sp.runSpeed : c.mode === 'walk' ? sp.walkSpeed : 0;
  c.speed += (target - c.speed) * Math.min(1, dt * 4);

  // Step forward, but never out of the habitat: turn aside instead.
  const oldX = c.x;
  const oldZ = c.z;
  moveForward(c, dt);
  if (!suits(sp, terrain.heightAt(c.x, c.z), W)) {
    c.x = oldX;
    c.z = oldZ;
    c.heading += (c.mode === 'flee' ? 1.5 : 2.5) * (c.rng() < 0.5 ? -1 : 1);
  }

  const ground = terrain.heightAt(c.x, c.z);
  if (fish) {
    c.y += (Math.max(ground + 0.3, W - c.offsetY) - c.y) * Math.min(1, dt * 2);
    c.phase += dt * (4 + c.speed * 4);
    if (c.mode === 'walk' && c.rng() < s.fishJumpChance * dt) {
      // Fast enough to clear the surface by half a metre or more, however deep it's swimming.
      const peak = W + 0.5 + c.rng() * 0.8;
      c.mode = 'jump';
      c.vy = Math.sqrt(2 * s.gravity * Math.max(0.5, peak - c.y));
      c.speed = sp.runSpeed;
    }
  } else {
    c.y = ground;
    c.phase += (c.speed * dt) / Math.max(0.15, sp.body.legLength);
    c.graze += ((c.mode === 'idle' ? 1 : 0) - c.graze) * Math.min(1, dt * 2);
  }
}

/** Birds circle their flock's home, which drifts slowly across the sky. */
function stepBird(c: Creature, sp: Species, dt: number, terrain: Terrain, s: CreatureSettings): void {
  // Every bird in a flock shares its home, orbit and drift, so the flock stays together.
  c.homeX += Math.cos(c.drift) * s.flockDrift * dt;
  c.homeZ += Math.sin(c.drift) * s.flockDrift * dt;
  c.orbit += c.orbitSpeed * dt;

  const nextX = c.homeX + Math.cos(c.orbit) * c.orbitRadius + c.offsetX;
  const nextZ = c.homeZ + Math.sin(c.orbit) * c.orbitRadius + c.offsetZ;
  const vx = (nextX - c.x) / dt;
  const vz = (nextZ - c.z) / dt;
  c.x = nextX;
  c.z = nextZ;
  c.speed = Math.hypot(vx, vz);
  if (c.speed > 0.01) c.heading = headingOf(vx, vz);

  const below = Math.max(terrain.heightAt(c.x, c.z), s.waterLevel);
  const targetY = below + s.birdAltitude + c.offsetY;
  c.y += (targetY - c.y) * Math.min(1, dt * 0.8);
  c.phase += dt * (sp.runSpeed + 4);
  c.mode = 'walk';
}

/** Where a solo bird likes to fly: low over clearings and water, higher over thick jungle to clear the trees. */
export function soloBirdHeight(terrain: Terrain, x: number, z: number, s: CreatureSettings): number {
  return Math.max(terrain.heightAt(x, z), s.waterLevel) + s.soloBirdAltitude * (1 + 1.4 * terrain.densityAt(x, z));
}

/**
 * Solo birds wander, curving one way then the other, and turn back if they stray too far from home.
 * `orbitSpeed` is the current turn rate in radians per second.
 */
function stepSoloBird(c: Creature, sp: Species, dt: number, terrain: Terrain, s: CreatureSettings): void {
  c.timer -= dt;
  if (c.timer <= 0) {
    c.timer = 2 + c.rng() * 4;
    const fromHomeX = c.x - c.homeX;
    const fromHomeZ = c.z - c.homeZ;
    const home = headingOf(-fromHomeX, -fromHomeZ);
    const away = Math.hypot(fromHomeX, fromHomeZ) > s.leash * 3;
    // Far from home: bank towards it. Otherwise pick a new gentle curve.
    const wanted = away ? turnTowards(c.heading, home, 1) - c.heading : (c.rng() - 0.5) * 2;
    c.orbitSpeed = Math.max(-0.6, Math.min(0.6, wanted));
  }
  c.heading += c.orbitSpeed * dt;
  c.speed = sp.walkSpeed;
  moveForward(c, dt);
  c.y += (soloBirdHeight(terrain, c.x, c.z, s) - c.y) * Math.min(1, dt * 0.8);
  c.phase += dt * (sp.runSpeed + 4);
  c.mode = 'walk';
}


/**
 * The nearest animal close to the middle of the view, if any: what the player is looking at.
 * `dir` must be a unit vector.
 */
export function creatureInView(
  creatures: Iterable<Creature>,
  species: readonly Species[],
  eye: { x: number; y: number; z: number },
  dir: { x: number; y: number; z: number },
  maxDistance: number,
): Creature | null {
  let best: Creature | null = null;
  let bestDist = Infinity;
  for (const c of creatures) {
    const sp = species[c.species]!;
    const reach = sp.kind === 'bird' ? maxDistance * 2 : maxDistance;
    const vx = c.x - eye.x;
    const vy = c.y + sp.body.legLength + sp.body.height / 2 - eye.y;
    const vz = c.z - eye.z;
    const dist = Math.hypot(vx, vy, vz);
    if (dist > reach || dist >= bestDist || dist < 0.01) continue;
    // How far off-centre it is, compared with how big it looks from here.
    const along = (vx * dir.x + vy * dir.y + vz * dir.z) / dist;
    const size = Math.max(sp.body.length, sp.body.wingSpan) * 0.7 + 0.3;
    if (along > Math.cos(Math.atan(size / dist) + 0.02)) {
      best = c;
      bestDist = dist;
    }
  }
  return best;
}
