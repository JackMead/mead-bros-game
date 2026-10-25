/** Draws the animals. Each body part of each species is one InstancedMesh, so all animals cost a few dozen draw calls. */
import * as THREE from 'three';
import type { Creature } from './creatures';
import type { Hsl, Species } from './species';

const SRGB = THREE.SRGBColorSpace;

// Unit shapes, scaled per species. "Limb" shapes have their pivot at one end so they can swing.
const shape = {
  blob: new THREE.IcosahedronGeometry(0.5, 1),
  head: new THREE.IcosahedronGeometry(0.5, 0),
  limbDown: new THREE.BoxGeometry(1, 1, 1).translate(0, -0.5, 0),
  limbUp: new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0),
  wing: wingGeometry(),
  fin: new THREE.BoxGeometry(0.04, 1, 1).translate(0, 0, 0.5),
  beak: new THREE.ConeGeometry(0.5, 1, 4).rotateX(-Math.PI / 2).translate(0, 0, -0.5),
};

/** A flat wing 1 unit long along +X, broad at the root and swept back to a narrow tip. */
function wingGeometry(): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([
    0, 0, -0.5, // root, leading edge
    0, 0, 0.5, // root, trailing edge
    1, 0, 0.35, // tip, trailing edge
    0.9, 0, 0.05, // tip, leading edge
  ], 3));
  g.setIndex([0, 1, 2, 0, 2, 3]);
  g.computeVertexNormals();
  return g;
}

const material = new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.9, metalness: 0, side: THREE.DoubleSide });

/** Sets `out` to a part's transform relative to the animal, for copy `k` of that part. */
type Pose = (c: Creature, k: number, out: THREE.Matrix4) => void;

interface Part {
  mesh: THREE.InstancedMesh;
  copies: number;
  pose: Pose;
  accent: boolean;
}

const pos = new THREE.Vector3();
const rot = new THREE.Quaternion();
const scl = new THREE.Vector3();
const euler = new THREE.Euler();

/** Shorthand for out = translate(x, y, z) · rotate(euler rx, ry, rz in `order`) · scale(sx, sy, sz). */
function place(out: THREE.Matrix4, x: number, y: number, z: number, rx: number, ry: number, rz: number,
  sx: number, sy: number, sz: number, order: THREE.EulerOrder = 'XYZ'): THREE.Matrix4 {
  return out.compose(pos.set(x, y, z), rot.setFromEuler(euler.set(rx, ry, rz, order)), scl.set(sx, sy, sz));
}

export class CreatureRenderer {
  private readonly parts: Part[][];
  private readonly base = new THREE.Matrix4();
  private readonly local = new THREE.Matrix4();
  private readonly colour = new THREE.Color();

  constructor(
    scene: THREE.Scene,
    private readonly species: readonly Species[],
    private readonly capacity: number,
  ) {
    this.parts = species.map((sp) => {
      const parts = partsFor(sp).map(({ geometry, copies, pose, accent = false }) => {
        const mesh = new THREE.InstancedMesh(geometry, material, capacity * copies);
        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        mesh.frustumCulled = false; // animals move, so the bounds would go stale
        mesh.count = 0;
        scene.add(mesh);
        return { mesh, copies, pose, accent };
      });
      return parts;
    });
  }

  update(creatures: Iterable<Creature>): void {
    const counts = this.species.map(() => 0);
    for (const c of creatures) {
      const n = counts[c.species]!;
      if (n >= this.capacity) continue;
      counts[c.species] = n + 1;
      const sp = this.species[c.species]!;
      this.base.compose(pos.set(c.x, c.y, c.z), rot.setFromEuler(euler.set(...bodyTilt(c, sp), 'YXZ')), scl.set(1, 1, 1));

      for (const part of this.parts[c.species]!) {
        for (let k = 0; k < part.copies; k++) {
          part.pose(c, k, this.local);
          const i = n * part.copies + k;
          part.mesh.setMatrixAt(i, this.local.premultiply(this.base));
          part.mesh.setColorAt(i, tinted(this.colour, part.accent ? sp.accent : sp.colour, c.tint));
        }
      }
    }
    this.parts.forEach((parts, s) => {
      for (const { mesh, copies } of parts) {
        mesh.count = counts[s]! * copies;
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      }
    });
  }
}

function tinted(out: THREE.Color, c: Hsl, tint: number): THREE.Color {
  return out.setHSL(c.h, c.s, Math.min(0.9, Math.max(0.05, c.l + tint * 0.05)), SRGB);
}

/** Pitch, yaw and roll for the whole animal: fish wiggle and arc through leaps, birds bank into the turn. */
function bodyTilt(c: Creature, sp: Species): [number, number, number] {
  switch (sp.kind) {
    case 'fish':
      return [Math.atan2(c.vy, Math.max(1, c.speed)), c.heading + Math.sin(c.phase) * 0.12, 0];
    case 'bird':
      // Bank into the turn: orbitSpeed is how fast it's turning.
      return [0, c.heading, -Math.max(-0.5, Math.min(0.5, c.orbitSpeed * 0.9))];
    case 'grazer':
      return [0, c.heading, 0];
  }
}

interface PartSpec {
  geometry: THREE.BufferGeometry;
  copies: number;
  pose: Pose;
  accent?: boolean;
}

function partsFor(sp: Species): PartSpec[] {
  const b = sp.body;
  switch (sp.kind) {
    case 'grazer': {
      const legW = Math.max(0.04, b.length * 0.08);
      const bodyY = b.legLength + b.height * 0.45;
      // Neck leans forward, and right down to the ground when grazing.
      const neckAngle = (c: Creature) => -0.6 - c.graze * 1.6;
      const neckBase = { y: bodyY + b.height * 0.15, z: -b.length * 0.38 };
      const legAt = [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const;
      return [
        { geometry: shape.blob, copies: 1, pose: (c, _, out) => {
          const bob = Math.abs(Math.sin(c.phase)) * Math.min(1, c.speed) * b.height * 0.06;
          place(out, 0, bodyY + bob, 0, 0, 0, 0, b.width, b.height, b.length);
        } },
        { geometry: shape.limbUp, copies: 1, pose: (c, _, out) =>
          place(out, 0, neckBase.y, neckBase.z, neckAngle(c), 0, 0, b.height * 0.35, b.neckLength + b.height * 0.3, b.height * 0.35) },
        { geometry: shape.head, copies: 1, pose: (c, _, out) => {
          const a = neckAngle(c);
          const reach = b.neckLength + b.height * 0.3;
          const y = neckBase.y + Math.cos(a) * reach;
          const z = neckBase.z + Math.sin(a) * reach;
          // Snout points forward, tipping down towards the ground as the neck lowers.
          place(out, 0, Math.max(y, b.headSize * 0.4), z, (a + 0.6) * 0.8, 0, 0, b.headSize * 0.8, b.headSize * 0.8, b.headSize * 1.3);
        } },
        { geometry: shape.limbDown, copies: 4, accent: true, pose: (c, k, out) => {
          const [side, end] = legAt[k]!;
          // Diagonal pairs swing together, like a trot.
          const swing = Math.sin(c.phase + (side === end ? 0 : Math.PI)) * Math.min(0.7, c.speed * 0.2);
          place(out, side * b.width * 0.3, b.legLength + b.height * 0.1, end * b.length * 0.3, swing, 0, 0, legW, b.legLength + b.height * 0.1, legW);
        } },
        { geometry: shape.limbUp, copies: 1, pose: (c, _, out) =>
          place(out, 0, bodyY + b.height * 0.2, b.length * 0.45, 2.2, 0, Math.sin(c.phase * 2) * 0.3, b.height * 0.12, b.tailLength, b.height * 0.12) },
      ];
    }
    case 'bird': {
      const half = b.wingSpan / 2;
      // Flap for a while, then glide with wings slightly raised. Solo birds glide much more.
      const flapShare = sp.solo ? 0.6 : -0.3;
      const flap = (c: Creature) => (Math.sin(c.phase * 0.08) > flapShare ? Math.sin(c.phase) * 0.7 : 0.15);
      return [
        { geometry: shape.blob, copies: 1, pose: (_c, _, out) => place(out, 0, 0, 0, 0, 0, 0, b.width, b.height, b.length) },
        { geometry: shape.head, copies: 1, pose: (_c, _, out) =>
          place(out, 0, b.height * 0.25, -b.length * 0.5, 0, 0, 0, b.headSize, b.headSize, b.headSize) },
        { geometry: shape.beak, copies: 1, accent: true, pose: (_c, _, out) =>
          place(out, 0, b.height * 0.2, -b.length * 0.5 - b.headSize * 0.4, 0, 0, 0, b.headSize * 0.45, b.headSize * 0.5, b.beakLength) },
        { geometry: shape.wing, copies: 2, pose: (c, k, out) => {
          const a = flap(c);
          // Wing 1 is the mirror image of wing 0: turned to point along -X, flapping the other way.
          place(out, 0, b.height * 0.1, -b.length * 0.05, 0, k * Math.PI, k ? -a : a, half, 1, b.length * 0.7, 'ZYX');
        } },
        { geometry: shape.wing, copies: 1, pose: (_c, _, out) =>
          place(out, 0, 0, b.length * 0.4, 0, -Math.PI / 2, 0, b.tailLength, 1, b.width * 0.8, 'ZYX') },
      ];
    }
    case 'fish':
      return [
        { geometry: shape.blob, copies: 1, pose: (_c, _, out) => place(out, 0, 0, 0, 0, 0, 0, b.width, b.height, b.length) },
        { geometry: shape.fin, copies: 1, accent: true, pose: (c, _, out) =>
          place(out, 0, 0, b.length * 0.42, 0, Math.sin(c.phase + 1) * 0.5, 0, 1, b.height * 0.9, b.tailLength) },
        { geometry: shape.fin, copies: 1, accent: true, pose: (_c, _, out) =>
          place(out, 0, b.height * 0.4, -b.length * 0.1, -0.5, 0, 0, 1, b.height * 0.4, b.length * 0.35) },
      ];
  }
}
