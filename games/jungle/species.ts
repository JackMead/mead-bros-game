/** Procedurally invented animal species. Pure logic: no Three.js, no DOM. */
import { hash2, mulberry32 } from './noise';

export type Kind = 'grazer' | 'bird' | 'fish';

/** Body proportions in metres. Parts a kind doesn't have are 0. */
export interface BodyPlan {
  length: number;
  height: number;
  width: number;
  legLength: number;
  neckLength: number;
  headSize: number;
  tailLength: number;
  wingSpan: number;
  beakLength: number;
}

/** A colour as hue, saturation and lightness, each 0 to 1. */
export interface Hsl {
  h: number;
  s: number;
  l: number;
}

export interface Species {
  name: string;
  kind: Kind;
  body: BodyPlan;
  colour: Hsl;
  /** Legs, beak or fins. */
  accent: Hsl;
  /** Cruising speed in m/s (walking, gliding or swimming). */
  walkSpeed: number;
  /** Top speed when startled in m/s. */
  runSpeed: number;
  /** Gets startled when the player comes this close. 0 means never. */
  fleeDistance: number;
  groupSize: readonly [number, number];
  /** Average number of groups per chunk with suitable habitat. */
  abundance: number;
  /** Birds only: flies alone and low, rather than circling high in a flock. */
  solo: boolean;
}

type Range = readonly [number, number];

/** How a species is coloured. */
type Look = 'earthy' | 'parrot' | 'hornbill' | 'fish';

/** Body proportions are multiples of body length. */
interface Archetype {
  kind: Kind;
  look: Look;
  solo?: boolean;
  length: Range;
  height: Range;
  legs: Range;
  neck: Range;
  head: Range;
  tail: Range;
  wings: Range;
  beak: Range;
  runSpeed: Range;
  fleeDistance: Range;
  groupSize: readonly [number, number];
  abundance: number;
}

// Three grazers of clearly different sizes, so every world has something small and skittish,
// something tall and quick, and something big and slow. Then a flock bird, a solo bird and a fish.
const ARCHETYPES: readonly Archetype[] = [
  { kind: 'grazer', look: 'earthy', length: [0.35, 0.55], height: [0.45, 0.65], legs: [0.3, 0.5], neck: [0.05, 0.15],
    head: [0.35, 0.45], tail: [0.1, 0.5], wings: [0, 0], beak: [0, 0], runSpeed: [7, 9], fleeDistance: [12, 16],
    groupSize: [3, 6], abundance: 0.7 },
  { kind: 'grazer', look: 'earthy', length: [0.9, 1.3], height: [0.4, 0.55], legs: [0.7, 1.05], neck: [0.3, 0.6],
    head: [0.25, 0.32], tail: [0.1, 0.3], wings: [0, 0], beak: [0, 0], runSpeed: [8, 11], fleeDistance: [15, 22],
    groupSize: [2, 5], abundance: 0.45 },
  { kind: 'grazer', look: 'earthy', length: [1.6, 2.2], height: [0.5, 0.65], legs: [0.3, 0.45], neck: [0.1, 0.25],
    head: [0.25, 0.32], tail: [0.05, 0.2], wings: [0, 0], beak: [0, 0], runSpeed: [4.5, 6], fleeDistance: [6, 9],
    groupSize: [1, 2], abundance: 0.3 },
  { kind: 'bird', look: 'parrot', length: [0.35, 0.6], height: [0.3, 0.4], legs: [0, 0], neck: [0, 0],
    head: [0.35, 0.45], tail: [0.4, 0.8], wings: [2.2, 3], beak: [0.12, 0.2], runSpeed: [9, 13], fleeDistance: [0, 0],
    groupSize: [3, 7], abundance: 0.15 },
  // A big glider like a hornbill: dark, with an outsized bright beak and a long tail.
  { kind: 'bird', look: 'hornbill', solo: true, length: [0.6, 0.9], height: [0.28, 0.36], legs: [0, 0], neck: [0, 0],
    head: [0.3, 0.38], tail: [0.6, 1], wings: [2.6, 3.4], beak: [0.35, 0.5], runSpeed: [7, 10], fleeDistance: [0, 0],
    groupSize: [1, 1], abundance: 0.3 },
  { kind: 'fish', look: 'fish', length: [0.4, 0.9], height: [0.3, 0.45], legs: [0, 0], neck: [0, 0],
    head: [0, 0], tail: [0.3, 0.45], wings: [0, 0], beak: [0, 0], runSpeed: [4, 6], fleeDistance: [6, 8],
    groupSize: [2, 5], abundance: 1.5 },
];

/** Invents this world's animals: three grazers, two birds and a fish. Same seed, same species. */
export function generateSpecies(seed: number): Species[] {
  const rng = mulberry32(hash2(seed, 0x5bec1e5, 0x1a7e));
  const pick = ([min, max]: Range) => min + rng() * (max - min);
  const names = new Set<string>();

  return ARCHETYPES.map((a) => {
    let name = speciesName(rng);
    while (names.has(name)) name = speciesName(rng);
    names.add(name);

    const length = pick(a.length);
    const height = length * pick(a.height);
    const body: BodyPlan = {
      length,
      height,
      width: height * (a.kind === 'fish' ? 0.45 : 0.85),
      legLength: length * pick(a.legs),
      neckLength: length * pick(a.neck),
      headSize: length * pick(a.head),
      tailLength: length * pick(a.tail),
      wingSpan: length * pick(a.wings),
      beakLength: length * pick(a.beak),
    };

    const { colour, accent } = palette(a.look, rng);
    return {
      name,
      kind: a.kind,
      body,
      colour,
      accent,
      walkSpeed: a.kind === 'bird' ? pick(a.runSpeed) * 0.7 : 0.6 + length * 0.5,
      runSpeed: pick(a.runSpeed),
      fleeDistance: pick(a.fleeDistance),
      groupSize: a.groupSize,
      abundance: a.abundance,
      solo: a.solo ?? false,
    };
  });
}

function palette(look: Look, rng: () => number): { colour: Hsl; accent: Hsl } {
  switch (look) {
    case 'earthy': {
      // Earthy browns, tans and greys so they blend into the forest floor.
      const colour = { h: 0.03 + rng() * 0.1, s: 0.15 + rng() * 0.4, l: 0.22 + rng() * 0.25 };
      return { colour, accent: { h: colour.h, s: colour.s * 0.8, l: colour.l * 0.55 } };
    }
    case 'parrot': {
      // Bright like a parrot, with a contrasting beak.
      const colour = { h: rng(), s: 0.7 + rng() * 0.2, l: 0.42 + rng() * 0.12 };
      return { colour, accent: { h: 0.1 + rng() * 0.05, s: 0.9, l: 0.55 } };
    }
    case 'hornbill': {
      // Nearly black, maybe tinged with a colour, and a vivid red, orange or yellow beak.
      const colour = { h: rng(), s: rng() * 0.3, l: 0.1 + rng() * 0.1 };
      return { colour, accent: { h: 0.01 + rng() * 0.13, s: 0.9, l: 0.5 } };
    }
    case 'fish': {
      const hues = [0.06, 0.12, 0.55, 0.58];
      const colour = { h: hues[Math.floor(rng() * hues.length)]!, s: 0.45 + rng() * 0.4, l: 0.45 + rng() * 0.15 };
      return { colour, accent: { h: colour.h + 0.03, s: colour.s, l: colour.l * 0.7 } };
    }
  }
}

const ONSETS = ['b', 'd', 'g', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'z', 'ch', 'th'];
const VOWELS = ['a', 'e', 'i', 'o', 'u', 'a', 'o'];
const ENDINGS = ['', '', 'n', 'r', 'x', 'sh'];

/** A made-up two- or three-syllable name, e.g. "Tamoru". */
export function speciesName(rng: () => number): string {
  const choose = (list: readonly string[]) => list[Math.floor(rng() * list.length)]!;
  const syllables = 2 + Math.floor(rng() * 2);
  let name = '';
  for (let i = 0; i < syllables; i++) name += choose(ONSETS) + choose(VOWELS);
  name += choose(ENDINGS);
  return name[0]!.toUpperCase() + name.slice(1);
}
