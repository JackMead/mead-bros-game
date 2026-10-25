import * as THREE from 'three';
import { Input } from '../../src/engine/input';
import { startLoop } from '../../src/engine/loop';
import { ChunkManager, FallenFruitRenderer } from './chunks';
import { config } from './config';
import { CreatureRenderer } from './creatureMeshes';
import { creatureInView, Population } from './creatures';
import { Orchard } from './fruit';
import { mulberry32 } from './noise';
import { generateSpecies } from './species';
import { animateWaterfalls } from './waterfallMeshes';
import { isSwimming, stepPlayer, type PlayerState } from './movement';
import { fruitColour, PlantCache } from './plants';
import { createTerrain, findSpawn } from './terrain';

// --- World seed: from ?seed= so a world can be shared, otherwise random. ---
const seed = parseSeed(new URLSearchParams(location.search).get('seed')) ?? randomSeed();
history.replaceState(null, '', `?seed=${seed}`);
document.querySelector('#seed')!.textContent = String(seed);

const { world, player: pc, atmosphere, creatures: cc } = config;
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

scene.add(new THREE.HemisphereLight(atmosphere.ambientSky, atmosphere.ambientGround, atmosphere.ambientIntensity));
const sun = new THREE.DirectionalLight(atmosphere.sun, atmosphere.sunIntensity);
sun.position.set(60, 100, 30);
scene.add(sun);

// One big water plane that follows the player; terrain below it reads as rivers and lakes.
const waterSize = (world.viewRadius * 2 + 2) * world.chunkSize;
const water = new THREE.Mesh(
  new THREE.PlaneGeometry(waterSize, waterSize).rotateX(-Math.PI / 2),
  new THREE.MeshStandardMaterial({
    color: atmosphere.water,
    transparent: true,
    opacity: 0.85,
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

const plants = new PlantCache(seed, terrain, {
  ...config.vegetation,
  waterfalls: config.waterfalls,
  chunkSize: world.chunkSize,
  waterLevel: world.waterLevel,
});
const chunks = new ChunkManager(scene, terrain, plants, seed, fruitColour(seed));

// --- Fruit falling from the fruit trees ---
const orchard = new Orchard((x, z, r) => plants.treesNear(x, z, r), terrain, {
  ...config.fruit,
  waterLevel: world.waterLevel,
  gravity: pc.gravity,
}, mulberry32(seed));
const fallenFruit = new FallenFruitRenderer(scene, fruitColour(seed), config.fruit.maxFallen, config.fruit.lifetime);
chunks.update(player.x, player.z); // build the whole view distance before the first frame

// --- Animals: this world's own species ---
const species = generateSpecies(seed);
const animals = new Population(seed, terrain, species, {
  ...cc,
  chunkSize: world.chunkSize,
  waterLevel: world.waterLevel,
  gravity: pc.gravity,
});
const animalMeshes = new CreatureRenderer(scene, species, cc.maxPerSpecies);
const spotted = document.querySelector<HTMLElement>('#spotted')!;
const lookDir = new THREE.Vector3();
animals.sync(player.x, player.z);

// Dev-only handle for poking at the world from the console (stripped from production builds).
if (import.meta.env.DEV) Object.assign(window, { jungle: { player, renderer, scene, camera, terrain, chunks, plants, orchard, animals, species } });

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
    animals.sync(player.x, player.z);
    animals.step(dt, player);
    for (const f of orchard.step(dt, player)) chunks.hideFruit(f.tree, f.index);
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

    animalMeshes.update(animals.all());
    fallenFruit.update(orchard.fallen);
    animateWaterfalls(performance.now() / 1000, config.waterfalls.flowSpeed);
    camera.getWorldDirection(lookDir);
    const seen = creatureInView(animals.all(), species, camera.position, lookDir, cc.spotDistance);
    const label = seen ? species[seen.species]!.name : '';
    if (spotted.textContent !== label) spotted.textContent = label;
    spotted.hidden = !seen;

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
