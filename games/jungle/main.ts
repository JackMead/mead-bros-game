import * as THREE from 'three';
import { Input } from '../../src/engine/input';
import { startLoop } from '../../src/engine/loop';
import { ChunkManager } from './chunks';
import { config } from './config';
import { isSwimming, stepPlayer, type PlayerState } from './movement';
import { createTerrain, findSpawn } from './terrain';

// --- World seed: from ?seed= so a world can be shared, otherwise random. ---
const seed = parseSeed(new URLSearchParams(location.search).get('seed')) ?? randomSeed();
history.replaceState(null, '', `?seed=${seed}`);
document.querySelector('#seed')!.textContent = String(seed);

const { world, player: pc, atmosphere } = config;
const terrain = createTerrain(seed, world.waterLevel);

// --- Renderer, scene, camera ---
const container = document.querySelector<HTMLElement>('#app')!;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.append(renderer.domElement);

const scene = new THREE.Scene();
const skyColor = new THREE.Color(atmosphere.sky);
const underwaterColor = new THREE.Color(atmosphere.underwater);
scene.background = skyColor.clone();
const fog = new THREE.Fog(atmosphere.sky, atmosphere.fogNear, atmosphere.fogFar);
scene.fog = fog;

const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 400);
camera.rotation.order = 'YXZ';

scene.add(new THREE.HemisphereLight(0xdff2ff, 0x2a3a14, 1.4));
const sun = new THREE.DirectionalLight(0xfff0d0, 1.8);
sun.position.set(60, 100, 30);
scene.add(sun);

// One big water plane that follows the player; terrain below it reads as rivers and lakes.
const waterSize = (world.viewRadius * 2 + 2) * world.chunkSize;
const water = new THREE.Mesh(
  new THREE.PlaneGeometry(waterSize, waterSize).rotateX(-Math.PI / 2),
  new THREE.MeshStandardMaterial({
    color: atmosphere.water,
    transparent: true,
    opacity: 0.8,
    roughness: 0.15,
    metalness: 0.1,
    side: THREE.DoubleSide,
  }),
);
water.position.y = world.waterLevel;
scene.add(water);

function resize(): void {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

// --- Player ---
const spawn = findSpawn(terrain, world.waterLevel);
const player: PlayerState = {
  x: spawn.x,
  y: terrain.heightAt(spawn.x, spawn.z),
  z: spawn.z,
  vy: 0,
  yaw: 0,
  pitch: 0,
  onGround: true,
};
const moveSettings = { ...pc, waterLevel: world.waterLevel };

const chunks = new ChunkManager(scene, terrain, seed);
chunks.update(player.x, player.z); // build the whole view distance before the first frame

// --- Controls: click to capture the mouse, Esc to release ---
const input = new Input(window);
const overlay = document.querySelector<HTMLElement>('#overlay')!;
const isLocked = () => document.pointerLockElement === renderer.domElement;
let lookX = 0;
let lookY = 0;

overlay.addEventListener('click', () => renderer.domElement.requestPointerLock());
renderer.domElement.addEventListener('click', () => renderer.domElement.requestPointerLock());
document.addEventListener('pointerlockchange', () => {
  overlay.hidden = isLocked();
});
document.addEventListener('mousemove', (e) => {
  if (!isLocked()) return;
  lookX += e.movementX;
  lookY += e.movementY;
});
window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyN' && isLocked()) location.search = `?seed=${randomSeed()}`;
});

// --- Loop ---
startLoop({
  step: config.fixedStep,
  update(dt) {
    player.yaw -= lookX * pc.lookSensitivity;
    player.pitch = clamp(player.pitch - lookY * pc.lookSensitivity, -1.5, 1.5);
    lookX = 0;
    lookY = 0;

    const axis = isLocked() ? input.axis() : { x: 0, y: 0 };
    stepPlayer(
      player,
      {
        forward: -axis.y,
        right: axis.x,
        sprint: input.isDown('ShiftLeft', 'ShiftRight'),
        jump: isLocked() && input.isDown('Space'),
      },
      dt,
      terrain.heightAt,
      chunks.obstaclesNear(player.x, player.z),
      moveSettings,
    );
    chunks.update(player.x, player.z, world.chunksPerTick);
  },
  render() {
    camera.position.set(player.x, player.y + pc.eyeHeight, player.z);
    camera.rotation.set(player.pitch, player.yaw, 0);
    water.position.x = player.x;
    water.position.z = player.z;

    const underwater = camera.position.y < world.waterLevel;
    fog.color.copy(underwater ? underwaterColor : skyColor);
    fog.near = underwater ? 0 : atmosphere.fogNear;
    fog.far = underwater ? 14 : atmosphere.fogFar;
    (scene.background as THREE.Color).copy(fog.color);
    document.body.classList.toggle('swimming', isSwimming(player, world.waterLevel));

    renderer.render(scene, camera);
  },
});

function parseSeed(value: string | null): number | null {
  if (value === null) return null;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

function randomSeed(): number {
  return Math.floor(Math.random() * 1_000_000);
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
