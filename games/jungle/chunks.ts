import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { config } from './config';
import type { FallingFruit } from './fruit';
import type { Obstacle } from './movement';
import { hash2 } from './noise';
import type { PlantCache, SmallKind, Tree } from './plants';
import type { Hsl } from './species';
import type { Terrain } from './terrain';

const SIZE = config.world.chunkSize;
const WATER = config.world.waterLevel;
const SRGB = THREE.SRGBColorSpace;

// Shared by every chunk and never disposed. Each is shaped so y=0 sits on the ground.
const geometry = {
  // Trunks taper to 0.58 of their base radius at the top, matching plants.ts.
  trunk: new THREE.CylinderGeometry(0.58, 1, 1, 6).translate(0, 0.5, 0),
  canopy: new THREE.IcosahedronGeometry(1, 0),
  palmTrunk: new THREE.CylinderGeometry(0.58, 1, 1, 5).translate(0, 0.5, 0),
  frond: new THREE.ConeGeometry(1, 0.6, 7, 1, true).translate(0, -0.3, 0),
  buttress: wedgeGeometry(),
  fruit: new THREE.IcosahedronGeometry(0.26, 0),
  fern: fernGeometry(7),
  bush: new THREE.IcosahedronGeometry(1, 0),
  flower: new THREE.IcosahedronGeometry(0.15, 0),
  rock: new THREE.DodecahedronGeometry(1, 0),
  bamboo: new THREE.CylinderGeometry(1, 1, 1, 5).translate(0, 0.5, 0),
};

const material = {
  ground: new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1, metalness: 0 }),
  solid: new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.95, metalness: 0 }),
  foliage: new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.85, metalness: 0, side: THREE.DoubleSide }),
  fruit: new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.5, metalness: 0 }),
};

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

/** A thin triangular fin, 1 long (+X), 1 tall and 1 thick: a buttress root. */
function wedgeGeometry(): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([
    0, 0, -0.5, 1, 0, -0.5, 0, 1, -0.5,
    0, 0, 0.5, 1, 0, 0.5, 0, 1, 0.5,
  ], 3));
  g.setIndex([0, 2, 1, 3, 4, 5, 1, 2, 5, 1, 5, 4, 0, 3, 5, 0, 5, 2, 0, 1, 4, 0, 4, 3]);
  g.computeVertexNormals();
  return g;
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
  ground: THREE.BufferGeometry;
  instanced: THREE.InstancedMesh[];
  /** Where each fruit tree's fruit starts in `fruitMesh`, so fallen fruit can be hidden. */
  fruitSlots: Map<Tree, number>;
  fruitMesh: THREE.InstancedMesh | null;
}

const HIDDEN = new THREE.Matrix4().makeScale(0, 0, 0);

/** Draws square chunks of jungle around the player and unloads ones that are far away. */
export class ChunkManager {
  private readonly chunks = new Map<string, Chunk>();

  constructor(
    private readonly scene: THREE.Scene,
    private readonly terrain: Terrain,
    private readonly plants: PlantCache,
    private readonly seed: number,
    private readonly fruit: Hsl,
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
      for (let dz = -1; dz <= 1; dz++) out.push(...this.plants.get(pcx + dx, pcz + dz).obstacles);
    }
    return out;
  }

  /** Takes a fruit off its tree once it has fallen. It grows back when the chunk is next built. */
  hideFruit(tree: Tree, index: number): void {
    const chunk = this.chunks.get(chunkKey(Math.floor(tree.x / SIZE), Math.floor(tree.z / SIZE)));
    const start = chunk?.fruitSlots.get(tree);
    if (!chunk?.fruitMesh || start === undefined) return;
    chunk.fruitMesh.setMatrixAt(start + index, HIDDEN);
    chunk.fruitMesh.instanceMatrix.needsUpdate = true;
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

    const { instanced, fruitMesh, fruitSlots } = this.buildVegetation(cx, cz);
    for (const mesh of instanced) group.add(mesh);

    return { cx, cz, group, ground, instanced, fruitMesh, fruitSlots };
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

  private buildVegetation(cx: number, cz: number) {
    const layout = this.plants.get(cx, cz);

    const trunks = new InstanceBatch(geometry.trunk, material.solid);
    const buttresses = new InstanceBatch(geometry.buttress, material.solid);
    const canopy = new InstanceBatch(geometry.canopy, material.foliage);
    const fruit = new InstanceBatch(geometry.fruit, material.fruit);
    const fruitSlots = new Map<Tree, number>();
    let fruitCount = 0;
    const palmTrunks = new InstanceBatch(geometry.palmTrunk, material.solid);
    const fronds = new InstanceBatch(geometry.frond, material.foliage);
    const small: Record<SmallKind, InstanceBatch> = {
      fern: new InstanceBatch(geometry.fern, material.foliage),
      bush: new InstanceBatch(geometry.bush, material.foliage),
      flower: new InstanceBatch(geometry.flower, material.solid),
      rock: new InstanceBatch(geometry.rock, material.solid),
      bamboo: new InstanceBatch(geometry.bamboo, material.foliage),
    };

    const p = new THREE.Vector3();
    const s = new THREE.Vector3();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const col = new THREE.Color();
    const colour = (c: Hsl) => col.setHSL(c.h, c.s, c.l, SRGB);
    const spin = (turn: number) => q.setFromEuler(e.set(0, turn, 0));

    for (const tr of layout.trees) {
      if (tr.kind === 'palm') {
        const r = tr.baseRadius;
        palmTrunks.add(p.set(tr.x, tr.y, tr.z), q.setFromEuler(e.set(tr.tiltX, 0, tr.tiltZ)), s.set(r, tr.height, r), colour(tr.bark));
        const b = tr.crown[0]!;
        fronds.add(p.set(b.x, b.y, b.z), spin(b.turn), s.set(b.r, b.r * b.squash, b.r), colour(b.colour));
        continue;
      }
      const r = tr.baseRadius;
      trunks.add(p.set(tr.x, tr.y - 0.3, tr.z), spin(tr.turn), s.set(r, tr.height, r), colour(tr.bark));
      for (let k = 0; k < tr.buttresses; k++) {
        const len = tr.baseRadius * (2.2 + (k % 2) * 0.8);
        buttresses.add(p.set(tr.x, tr.y - 0.3, tr.z), spin(tr.turn + (k / tr.buttresses) * Math.PI * 2),
          s.set(len, 2 + (k % 3) * 0.7, 0.25), colour(tr.bark));
      }
      for (const b of tr.crown) {
        canopy.add(p.set(b.x, b.y, b.z), spin(b.turn), s.set(b.r, b.r * b.squash, b.r), colour(b.colour));
      }
      if (tr.fruit.length > 0) fruitSlots.set(tr, fruitCount);
      fruitCount += tr.fruit.length;
      for (const f of tr.fruit) fruit.add(p.set(f.x, f.y, f.z), spin(0), s.setScalar(1), colour(this.fruit));
    }

    for (const sp of layout.small) {
      switch (sp.kind) {
        case 'bamboo':
          small.bamboo.add(p.set(sp.x, sp.y, sp.z), q.setFromEuler(e.set(sp.tiltX, sp.turn, sp.tiltZ)),
            s.set(sp.scale, sp.tall, sp.scale), colour(sp.colour));
          break;
        case 'bush':
        case 'rock':
          small[sp.kind].add(p.set(sp.x, sp.y, sp.z), spin(sp.turn), s.set(sp.scale, sp.scale * sp.tall, sp.scale), colour(sp.colour));
          break;
        default:
          small[sp.kind].add(p.set(sp.x, sp.y, sp.z), spin(sp.turn), s.setScalar(sp.scale), colour(sp.colour));
      }
    }

    const fruitMesh = fruit.toMesh();
    const instanced = [trunks, buttresses, canopy, palmTrunks, fronds, ...Object.values(small)]
      .map((b) => b.toMesh())
      .concat(fruitMesh)
      .filter((m): m is THREE.InstancedMesh => m !== null);
    return { instanced, fruitMesh, fruitSlots };
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

/** Fruit that has fallen from the trees, all drawn as one InstancedMesh. */
export class FallenFruitRenderer {
  private readonly mesh: THREE.InstancedMesh;
  private readonly m = new THREE.Matrix4();
  private readonly p = new THREE.Vector3();
  private readonly q = new THREE.Quaternion();
  private readonly e = new THREE.Euler();
  private readonly s = new THREE.Vector3();

  constructor(scene: THREE.Scene, colour: Hsl, capacity: number, private readonly lifetime: number) {
    this.mesh = new THREE.InstancedMesh(geometry.fruit, material.fruit, capacity);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false; // fruit moves, so the bounds would go stale
    const c = new THREE.Color().setHSL(colour.h, colour.s, colour.l, SRGB);
    for (let i = 0; i < capacity; i++) this.mesh.setColorAt(i, c);
    this.mesh.count = 0;
    scene.add(this.mesh);
  }

  update(fruit: readonly FallingFruit[]): void {
    const n = Math.min(fruit.length, this.mesh.instanceMatrix.count);
    for (let i = 0; i < n; i++) {
      const f = fruit[i]!;
      // Shrink away over the last second before it's gone.
      const size = Math.max(0, Math.min(1, this.lifetime - f.age));
      this.m.compose(this.p.set(f.x, f.y, f.z), this.q.setFromEuler(this.e.set(f.spin, f.spin * 0.7, 0)), this.s.setScalar(size));
      this.mesh.setMatrixAt(i, this.m);
    }
    this.mesh.count = n;
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
