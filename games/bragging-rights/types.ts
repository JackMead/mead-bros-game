/** Shared game-state types. Everything here is plain JSON so runs can be saved and replayed. */

export interface Pos {
  x: number;
  y: number;
}

export type Tile = 'floor' | 'wall' | 'chasm';

/** The behaviour menu. A floor kit picks enemies by giving each one of these. */
export type Behaviour = 'melee' | 'archer' | 'brute' | 'charger' | 'hunter';

export type PageKind = 'shove' | 'swap' | 'ward' | 'blink';

export type Intent =
  | { type: 'none' }
  | { type: 'move' }
  | { type: 'stunned' }
  /** Hits every square listed next turn. */
  | { type: 'attack'; squares: Pos[]; damage: number }
  /** Rushes along the squares in order next turn, stopping at the first obstacle. */
  | { type: 'charge'; squares: Pos[]; damage: number };

export interface Enemy {
  id: number;
  /** Id of an enemy type in the floor kit. */
  type: string;
  pos: Pos;
  hp: number;
  intent: Intent;
  /** Turns this enemy has existed; slow enemies use it to move every other turn. */
  tick: number;
  /** Extra enemy turns it stays dazed after the current one. */
  daze?: number;
}

export type ItemKind = 'relic' | 'oil' | 'page' | 'ring';

export interface Item {
  kind: ItemKind;
  pos: Pos;
  /** Relic worth or oil amount. */
  value: number;
  page?: PageKind;
}

export interface Floor {
  depth: number;
  width: number;
  height: number;
  /** Row-major, `y * width + x`. */
  tiles: Tile[];
  start: Pos;
  stairs: Pos;
  items: Item[];
  enemies: Enemy[];
}

export interface Player {
  pos: Pos;
  hearts: number;
  maxHearts: number;
  oil: number;
  maxOil: number;
  /** Relic value carried but not yet banked. */
  carried: number;
  pages: (PageKind | null)[];
  hasRing: boolean;
  /** Times the ring has been used this run. Each use adds a hunter now and on every later floor. */
  corruption: number;
  /** Enemy turns of invisibility left. */
  invisible: number;
}

export type Phase = 'play' | 'stairs' | 'over';

export type OutcomeKind = 'banked' | 'escaped' | 'died' | 'lampOut';

export interface Outcome {
  kind: OutcomeKind;
  /** Relics carried when the run ended. */
  carried: number;
  /** Relics banked: the run's score. */
  score: number;
}

export interface RunState {
  seed: number;
  kitId: string;
  depth: number;
  floor: Floor;
  player: Player;
  phase: Phase;
  /** Player actions taken in play (the tie-break). */
  turn: number;
  nextId: number;
  outcome: Outcome | null;
}

export type Action =
  | { type: 'move'; dx: number; dy: number }
  | { type: 'wait' }
  | { type: 'page'; slot: number; x: number; y: number }
  | { type: 'ring' }
  | { type: 'bank' }
  | { type: 'descend' };

/** What happened during a step, for the renderer's animations and sounds. Never read by the logic. */
export type GameEvent =
  | { type: 'playerMove'; from: Pos; to: Pos }
  | { type: 'enemyMove'; id: number; from: Pos; to: Pos }
  | { type: 'attack'; by: 'player' | number; at: Pos }
  | { type: 'playerHurt'; amount: number }
  | { type: 'enemyHurt'; id: number; amount: number }
  | { type: 'kill'; id: number; type_: string; pos: Pos }
  | { type: 'fall'; id: number; type_: string; pos: Pos }
  | { type: 'pickup'; kind: ItemKind; value: number; pos: Pos }
  | { type: 'page'; kind: PageKind; at: Pos }
  | { type: 'ring' }
  | { type: 'spawn'; id: number; pos: Pos }
  | { type: 'smash'; pos: Pos }
  | { type: 'stairs'; healed: number }
  | { type: 'descend'; depth: number }
  | { type: 'over'; outcome: Outcome };

export interface StepResult {
  ok: boolean;
  state: RunState;
  events: GameEvent[];
}
