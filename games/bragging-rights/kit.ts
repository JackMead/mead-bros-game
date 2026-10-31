import type { Behaviour, PageKind } from './types';

/**
 * A floor kit is everything that makes a floor feel like its book.
 * It's data: the generator builds a fresh layout from it for every seed.
 * See docs/bragging-rights.md.
 */
export interface FloorKit {
  id: string;
  /** Shown in game. */
  title: string;
  /** The book that inspired it. Never shown in game. */
  inspiredBy: string;
  palette: Palette;
  /** Share of squares that start as wall, before connectivity fixes. */
  wallDensity: number;
  chasmDensity: number;
  chasmPerDepth: number;
  enemies: EnemyType[];
  /** Spawned by the ring. */
  hunter: EnemyType;
  pages: PageKind[];
  /** One-line flavour shown when you arrive on a floor. */
  arrivals: string[];
}

export interface EnemyType {
  id: string;
  name: string;
  behaviour: Behaviour;
  hp: number;
  damage: number;
  /** Difficulty points this enemy uses from a floor's budget. */
  cost: number;
  /** Relative chance of being picked. */
  weight: number;
  minDepth: number;
  colour: string;
  /** Shown when the player holds the enemy. */
  blurb: string;
}

export interface Palette {
  background: string;
  floor: string;
  floorAlt: string;
  wall: string;
  wallTop: string;
  chasm: string;
  light: string;
}

export const BEHAVIOUR_HELP: Record<Behaviour, string> = {
  melee: 'Walks towards you and strikes the square you are on.',
  archer: 'Shoots along a straight line when you share a row, column or diagonal. Hits anything in the way.',
  brute: 'Slow: moves every other turn. Smashes through walls and hits every square around it.',
  charger: 'Charges in a straight line when lined up with you, then needs a turn to recover. Falls into chasms.',
  hunter: 'Drifts through walls and always knows where you are, even when you are unseen.',
};
