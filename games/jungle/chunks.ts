import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { config } from './config';
import type { Obstacle } from './movement';
import { hash2, mulberry32 } from './noise';
import type { Terrain } from './terrain';

const SIZE = config.world.chunkSize;
const WATER = config.world.waterLevel;
const UP = new THREE.Vector3(0, 1, 0);
const SRGB = THREE.SRGBColorSpace;

// Shared by every chunk and never disposed. Each is shaped so y=0 sits on the ground.
const geometry = {
  trunk: new THREE.CylinderGeometry(0.35, 0.6, 1, 6).translate(0, 0.5, 0),
  canopy: new THREE.IcosahedronGeometry(1, 0),
  palmTrunk: new THREE.CylinderGeometry(0.16, 0.28, 1, 5).translate(0, 0.5, 0),
  frond: new THREE.ConeGeometry(1, 0.6, 7, 1, true).translate(0, -0.3, 0),
  fern: fernGeometry(7),
  bush: new THREE.IcosahedronGeometry(1, 0),
  flower: new THREE.IcosahedronGeometry(0.15, 0),
  rock: new THREE.DodecahedronGeometry(1, 0),
};

const material = {
  ground: new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1, metalness: 0 }),
  solid: new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.95, metalness: 0 }),
  foliage: new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.85, metalness: 0, side: THREE.DoubleSide }),
};

const FLOWER_HUES = [0.0, 0.95, 0.08, 0.8, 0.13];

/** A rosette of long leaves arching out from the centre, about 1 m across. */
function fernGeometry(leaves: number): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < leaves; i++) {
    // A diamond-shaped leaf lying along +Z, tipped up so it arches outwards.
    const leaf = new THREE.BufferGeometry();
    leaf.setAttribute('position', new THREE.Float32BufferAttribute(
      [0, 0, 0, 0.14, 0.05, 0.45, 0, 0, 1, -0.14, 0.05, 0.45], 3));
    leaf.setIndex([0, 1, 2, 0, 2, 3]);
    leaf.rotateX(-0.55 - (i % 2) * 0.35);
    leaf.rotateY((i / leaves) * Math.PI * 2);
    parts.push(leaf);
  }
  const merged = mergeGeometries(parts)!;
  merged.computeVertexNormals();
  return merged;
}

/** Collects many copies of one shape, then turns them into a single InstancedMesh (one draw call). */
class InstanceBatch {
  private readonly matrices: THREE.Matrix4[] = [];
  private readonly colors: THREE.Color[] = [];

  constructor(
    private readonly shape: THREE.BufferGeometry,
    private readonly surface: THREE.Material,
  ) {}

  add(position: THREE.Vector3, rotation: THREE.Quaternion, scale: THREE.Vector3, color: THREE.Color): void {
    this.matrices.push(new THREE.Matrix4().compose(position, rotation, scale));
    this.colors.push(color.clone());
  }

  toMesh(): THREE.InstancedMesh | null {
    if (this.matrices.length === 0) return null;
    const mesh = new THREE.InstancedMesh(this.shape, this.surface, this.matrices.length);
    this.matrices.forEach((m, i) => {
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, this.colors[i]!);
    });
    mesh.computeBoundingSphere();
    return mesh;
  }
}

interface Chunk {
  cx: number;
  cz: number;
  group: THREE.Group;
  obstacles: Obstacle[];
  ground: THREE.BufferGeometry;
  instanced: THREE.InstancedMesh[];
}

/** Generates square chunks of jungle around the player and unloads ones that are far away. */
export class ChunkManager {
  private readonly chunks = new Map<string, Chunk>();

  constructor(
    private readonly scene: THREE.Scene,
    private readonly terrain: Terrain,
    private readonly seed: number,
  ) {}

  update(x: number, z: number, maxBuilds = Infinity): void {
    const pcx = Math.floor(x / SIZE);
    const pcz = Math.floor(z / SIZE);
    const R = config.world.viewRadius;

    // Unload one ring further out than we load, so walking along a border doesn't thrash.
    for (const [key, chunk] of this.chunks) {
      if (Math.abs(chunk.cx - pcx) > R + 1 || Math.abs(chunk.cz - pcz) > R + 1) {
        this.unload(chunk);
        this.chunks.delete(key);
      }
    }

    const missing: { cx: number; cz: number; d: number }[] = [];
    for (let dx = -R; dx <= R; dx++) {
      for (let dz = -R; dz <= R; dz++) {
        if (!this.chunks.has(chunkKey(pcx + dx, pcz + dz))) {
          missing.push({ cx: pcx + dx, cz: pcz + dz, d: dx * dx + dz * dz });
        }
      }
    }
    missing.sort((a, b) => a.d - b.d);
    for (const { cx, cz } of missing.slice(0, maxBuilds)) {
      const chunk = this.build(cx, cz);
      this.chunks.set(chunkKey(cx, cz), chunk);
      this.scene.add(chunk.group);
    }
  }

  /** Tree trunks and rocks in the player's chunk and its neighbours. */
  obstaclesNear(x: number, z: number): Obstacle[] {
    const pcx = Math.floor(x / SIZE);
    const pcz = Math.floor(z / SIZE);
    const out: Obstacle[] = [];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const chunk = this.chunks.get(chunkKey(pcx + dx, pcz + dz));
        if (chunk) out.push(...chunk.obstacles);
      }
    }
    return out;
  }

  private unload(chunk: Chunk): void {
    this.scene.remove(chunk.group);
    chunk.ground.dispose();
    for (const mesh of chunk.instanced) mesh.dispose();
  }

  private build(cx: number, cz: number): Chunk {
    const x0 = cx * SIZE;
    const z0 = cz * SIZE;
    const group = new THREE.Group();

    const ground = this.buildGround(x0, z0);
    const groundMesh = new THREE.Mesh(ground, material.ground);
    groundMesh.position.set(x0 + SIZE / 2, 0, z0 + SIZE / 2);
    group.add(groundMesh);

    const { instanced, obstacles } = this.buildVegetation(cx, cz, x0, z0);
    for (const mesh of instanced) group.add(mesh);

    return { cx, cz, group, obstacles, ground, instanced };
  }

  private buildGround(x0: number, z0: number): THREE.BufferGeometry {
    const seg = config.world.chunkSegments;
    const g = new THREE.PlaneGeometry(SIZE, SIZE, seg, seg);
    g.rotateX(-Math.PI / 2);
    const pos = g.getAttribute('position');
    const colors = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const wx = x0 + SIZE / 2 + pos.getX(i);
      const wz = z0 + SIZE / 2 + pos.getZ(i);
      const h = this.terrain.heightAt(wx, wz);
      pos.setY(i, h);
      // Per-vertex jitter breaks up the flat colour. Hashed from world position so chunk edges match.
      const jitter = hash2(Math.round(wx), Math.round(wz), this.seed) / 4294967296 - 0.5;
      groundColor(c, h, this.terrain.densityAt(wx, wz), jitter);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    g.computeBoundingSphere();
    return g;
  }

  private buildVegetation(cx: number, cz: number, x0: number, z0: number) {
    const rng = mulberry32(hash2(cx, cz, this.seed));
    const t = this.terrain;
    const obstacles: Obstacle[] = [];

    const trunks = new InstanceBatch(geometry.trunk, material.solid);
    const canopy = new InstanceBatch(geometry.canopy, material.foliage);
    const palmTrunks = new InstanceBatch(geometry.palmTrunk, material.solid);
    const fronds = new InstanceBatch(geometry.frond, material.foliage);
    const ferns = new InstanceBatch(geometry.fern, material.foliage);
    const bushes = new InstanceBatch(geometry.bush, material.foliage);
    const flowers = new InstanceBatch(geometry.flower, material.solid);
    const rocks = new InstanceBatch(geometry.rock, material.solid);

    const p = new THREE.Vector3();
    const top = new THREE.Vector3();
    const s = new THREE.Vector3();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const col = new THREE.Color();
    const spin = () => q.setFromAxisAngle(UP, rng() * Math.PI * 2);

    // Trees: broadleaf giants inland, palms along the water.
    for (let i = 0; i < config.vegetation.treeAttempts; i++) {
      const x = x0 + rng() * SIZE;
      const z = z0 + rng() * SIZE;
      const h = t.heightAt(x, z);
      const d = t.densityAt(x, z);
      const roll = rng();
      if (h < WATER + 0.3) continue;
      const nearWater = h < WATER + 3;

      if (!nearWater && roll < 0.08 + 0.32 * d) {
        const height = 8 + rng() * 12;
        const girth = 0.7 + rng() * 0.7;
        trunks.add(p.set(x, h - 0.3, z), spin(), s.set(girth, height, girth),
          col.setHSL(0.07 + rng() * 0.03, 0.35, 0.22 + rng() * 0.08, SRGB));
        // Canopy blobs pile up from about three quarters of the way up the trunk, so the crown
        // reads as a full, lumpy mass rather than a flat cap on a pole.
        const blobs = 4 + Math.floor(rng() * 4);
        const spread = 2 + height * 0.15;
        for (let b = 0; b < blobs; b++) {
          const r = 2.2 + rng() * 2.6;
          const lift = 0.72 + 0.28 * (b / (blobs - 1));
          canopy.add(
            p.set(x + (rng() - 0.5) * spread * 2, h + height * lift + (rng() - 0.5) * 1.5, z + (rng() - 0.5) * spread * 2),
            spin(),
            s.set(r, r * (0.6 + rng() * 0.3), r),
            col.setHSL(0.22 + rng() * 0.1, 0.5 + rng() * 0.25, 0.2 + rng() * 0.14, SRGB),
          );
        }
        obstacles.push({ x, z, r: 0.6 * girth });
      } else if (roll > 1 - (nearWater ? 0.25 : 0.05)) {
        const height = 5 + rng() * 5;
        const tilt = q.setFromEuler(e.set((rng() - 0.5) * 0.5, 0, (rng() - 0.5) * 0.5));
        p.set(x, h - 0.2, z);
        top.set(0, height, 0).applyQuaternion(tilt).add(p);
        palmTrunks.add(p, tilt, s.set(1, height, 1), col.setHSL(0.09, 0.3, 0.35 + rng() * 0.1, SRGB));
        const size = 2.4 + rng();
        fronds.add(top, spin(), s.set(size, 1 + rng() * 0.4, size),
          col.setHSL(0.2 + rng() * 0.08, 0.6, 0.26 + rng() * 0.1, SRGB));
        obstacles.push({ x, z, r: 0.35 });
      }
    }

    // Undergrowth: ferns and bushes where it's dense, the odd flower patch and rock.
    for (let i = 0; i < config.vegetation.undergrowthAttempts; i++) {
      const x = x0 + rng() * SIZE;
      const z = z0 + rng() * SIZE;
      const h = t.heightAt(x, z);
      const d = t.densityAt(x, z);
      const roll = rng();
      if (h < WATER + 0.2) continue;

      if (roll < 0.25 + 0.45 * d) {
        if (rng() < 0.55) {
          ferns.add(p.set(x, h - 0.1, z), spin(), s.setScalar(0.8 + rng() * 1.6),
            col.setHSL(0.23 + rng() * 0.08, 0.6, 0.26 + rng() * 0.14, SRGB));
        } else {
          const r = 0.7 + rng() * 1.3;
          bushes.add(p.set(x, h + 0.2, z), spin(), s.set(r, r * 0.7, r),
            col.setHSL(0.24 + rng() * 0.1, 0.55, 0.18 + rng() * 0.12, SRGB));
        }
      } else if (roll > 0.97) {
        const hue = FLOWER_HUES[Math.floor(rng() * FLOWER_HUES.length)]!;
        const count = 3 + Math.floor(rng() * 4);
        for (let k = 0; k < count; k++) {
          const fx = x + (rng() - 0.5) * 2;
          const fz = z + (rng() - 0.5) * 2;
          flowers.add(p.set(fx, t.heightAt(fx, fz) + 0.3 + rng() * 0.5, fz), spin(), s.setScalar(0.8 + rng() * 0.6),
            col.setHSL(hue, 0.85, 0.55, SRGB));
        }
      } else if (roll > 0.955) {
        const r = 0.5 + rng() * 1.5;
        rocks.add(p.set(x, h + r * 0.2, z), spin(), s.set(r, r * 0.7, r),
          col.setHSL(0.2, 0.08, 0.3 + rng() * 0.12, SRGB));
        if (r > 1) obstacles.push({ x, z, r: r * 0.8 });
      }
    }

    const instanced = [trunks, canopy, palmTrunks, fronds, ferns, bushes, flowers, rocks]
      .map((b) => b.toMesh())
      .filter((m): m is THREE.InstancedMesh => m !== null);
    return { instanced, obstacles };
  }
}

function chunkKey(cx: number, cz: number): string {
  return `${cx},${cz}`;
}

/** `jitter` is a small random offset in [-0.5, 0.5) for variety. */
function groundColor(out: THREE.Color, height: number, density: number, jitter: number): THREE.Color {
  if (height < WATER + 0.6) return out.setRGB(0.45 + 0.06 * jitter, 0.36, 0.22, SRGB); // muddy banks
  const t = Math.min(1, (height - WATER) / 25);
  // Darker, damper, browner floor under thick jungle; brighter green in clearings and on high ground.
  const j = 0.08 * jitter;
  return out.setRGB(
    0.2 + 0.08 * t + 0.08 * density + j,
    0.36 + 0.1 * t - 0.12 * density + j,
    0.1 + 0.03 * t,
    SRGB,
  );
}
