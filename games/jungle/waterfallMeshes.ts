/** Draws waterfalls: a ribbon of streaky water down the slope, foam where it meets the river, rocks along its edges. */
import * as THREE from 'three';
import type { Terrain } from './terrain';
import type { Waterfall } from './waterfalls';

const SRGB = THREE.SRGBColorSpace;
/** The streak texture repeats every this many metres down the fall. */
const STREAK_LENGTH = 4;

/** Vertical white streaks on transparent blue, tiling top to bottom. */
function streakTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'rgba(150, 205, 215, 0.75)';
  ctx.fillRect(0, 0, 64, 256);
  // Deterministic streaks so every waterfall looks the same on every load.
  let r = 7;
  const rand = () => ((r = (r * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 40; i++) {
    const x = rand() * 64;
    const y = rand() * 256;
    const len = 40 + rand() * 120;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.35 + rand() * 0.5})`;
    // Draw twice, one texture-height apart, so streaks wrap seamlessly.
    ctx.fillRect(x, y, 1.5 + rand() * 3, len);
    ctx.fillRect(x, y - 256, 1.5 + rand() * 3, len);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = SRGB;
  return texture;
}

const streaks = streakTexture();
const waterMaterial = new THREE.MeshStandardMaterial({
  map: streaks,
  transparent: true,
  roughness: 0.2,
  metalness: 0,
  emissive: new THREE.Color(0x2a4a4a),
  side: THREE.DoubleSide,
  depthWrite: false,
});
const foamMaterial = new THREE.MeshStandardMaterial({ color: 0xf2fbfb, flatShading: true, roughness: 0.6, transparent: true, opacity: 0.9 });
const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x55574d, flatShading: true, roughness: 0.95 });
const foamShape = new THREE.IcosahedronGeometry(1, 0);
const rockShape = new THREE.DodecahedronGeometry(1, 0);

/** Slides the streaks down every waterfall. Call once a frame with the time in seconds. */
export function animateWaterfalls(seconds: number, speed: number): void {
  streaks.offset.y = -((seconds * speed) / STREAK_LENGTH) % 1;
}

/** Builds one waterfall. Its geometries are its own: dispose them with `disposeWaterfall`. */
export function buildWaterfallMesh(w: Waterfall, terrain: Terrain, waterLevel: number): THREE.Group {
  const group = new THREE.Group();
  const n = w.path.length;
  const positions: number[] = [];
  const uvs: number[] = [];
  const index: number[] = [];
  let along = 0;

  for (let i = 0; i < n; i++) {
    const p = w.path[i]!;
    const next = w.path[Math.min(i + 1, n - 1)]!;
    const prev = w.path[Math.max(i - 1, 0)]!;
    // Sideways is across the direction of flow.
    let dx = next.x - prev.x;
    let dz = next.z - prev.z;
    const len = Math.hypot(dx, dz) || 1;
    dx /= len;
    dz /= len;
    const half = (w.topWidth + (w.bottomWidth - w.topWidth) * (i / (n - 1))) / 2;
    const lx = p.x - dz * half;
    const lz = p.z + dx * half;
    const rx = p.x + dz * half;
    const rz = p.z - dx * half;
    // Float just above the highest ground across the fall, and never below the river surface.
    const y = Math.max(p.y, terrain.heightAt(lx, lz), terrain.heightAt(rx, rz), waterLevel - 0.1) + 0.25;
    if (i > 0) {
      const q = w.path[i - 1]!;
      along += Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z);
    }
    positions.push(lx, y, lz, rx, y, rz);
    uvs.push(0, along / STREAK_LENGTH, 1, along / STREAK_LENGTH);
    if (i > 0) {
      const a = (i - 1) * 2;
      index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }

  const ribbon = new THREE.BufferGeometry();
  ribbon.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  ribbon.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  ribbon.setIndex(index);
  ribbon.computeVertexNormals();
  group.add(new THREE.Mesh(ribbon, waterMaterial));

  // Foam where the fall hits the water, and rocks lining the edges. Placed with a fixed pattern
  // from the path so the same waterfall always looks the same.
  const bottom = w.path[n - 1]!;
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const foam = new THREE.InstancedMesh(foamShape, foamMaterial, 7);
  for (let k = 0; k < 7; k++) {
    const a = k * 2.4;
    const r = k === 0 ? 0 : w.bottomWidth * (0.3 + (k % 3) * 0.25);
    const size = w.bottomWidth * (0.35 + ((k * 37) % 10) / 40);
    m.compose(new THREE.Vector3(bottom.x + Math.cos(a) * r, waterLevel + 0.05, bottom.z + Math.sin(a) * r),
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), a), new THREE.Vector3(size, size * 0.35, size));
    foam.setMatrixAt(k, m);
  }
  group.add(foam);

  const rockCount = Math.min(16, Math.floor(n / 2) * 2);
  const rocks = new THREE.InstancedMesh(rockShape, rockMaterial, rockCount);
  for (let k = 0; k < rockCount; k++) {
    const i = Math.floor((k / rockCount) * (n - 1));
    const p = w.path[i]!;
    const next = w.path[Math.min(i + 1, n - 1)]!;
    const dx = next.x - p.x;
    const dz = next.z - p.z;
    const len = Math.hypot(dx, dz) || 1;
    const side = k % 2 ? 1 : -1;
    const half = (w.topWidth + (w.bottomWidth - w.topWidth) * (i / (n - 1))) / 2 + 0.6;
    const x = p.x + (dz / len) * half * side;
    const z = p.z - (dx / len) * half * side;
    const size = 0.6 + ((k * 53) % 10) / 12;
    m.compose(new THREE.Vector3(x, Math.max(terrain.heightAt(x, z), waterLevel) + size * 0.2, z),
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), k), new THREE.Vector3(size, size * 0.75, size));
    rocks.setMatrixAt(k, m);
  }
  group.add(rocks);
  return group;
}

export function disposeWaterfall(group: THREE.Group): void {
  for (const child of group.children) {
    if (child instanceof THREE.InstancedMesh) child.dispose();
    else if (child instanceof THREE.Mesh) child.geometry.dispose();
  }
}
