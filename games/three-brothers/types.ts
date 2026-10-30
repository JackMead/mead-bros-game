/**
 * The chapter format. A chapter is plain data: scenes, things to tap, items,
 * and rules saying what happens when. The engine (`engine.ts`) plays any chapter;
 * nobody should need to touch the engine to write one.
 *
 * Small text "scripts" keep chapters short enough to edit from a phone:
 *
 * - Conditions (`if`): space-separated tokens, all must hold.
 *     `flag`        the flag is set
 *     `!flag`       the flag is not set
 *     `has:item`    the brother being played holds the item
 *     `!has:item`   ...doesn't hold it
 * - Effects (`do`): run in order.
 *     `set:flag` / `clear:flag`
 *     `give:item`        to the brother being played
 *     `give:item>phil`   to a named brother
 *     `take:item`        remove it from whoever holds it
 *     `goto:scene`
 * - Lines (`say`, `intro`, `ending`): `"Speaker: text"`. `Me:` is the brother
 *   being played; a line with no known speaker is narration. A line in square
 *   brackets, like `"[shake 1]"`, is a cinematic cue (see cues.ts).
 */

export type BrotherId = 'rob' | 'jack' | 'phil';

/** Age order, eldest first. */
export const BROTHERS: readonly BrotherId[] = ['rob', 'jack', 'phil'];

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Text that can differ by who's looking. `any` is the fallback. */
export type ByBrother = string | ({ any?: string } & Partial<Record<BrotherId, string>>);

export interface ItemDef {
  name: string;
  look: ByBrother;
  /** A built-in icon from `props.ts` (e.g. "tea"), until there's an `item-<id>.png` in art/. */
  icon?: string;
}

export interface Hotspot {
  id: string;
  name: string;
  /** Game pixels on the 960x540 scene. */
  rect: Rect;
  look: ByBrother;
  /** Only present while this condition holds. */
  if?: string;
  /**
   * Picture of this thing in `art/`, drawn over the background. Only needed for things
   * that come and go (a dog that leaves, a box that gets placed); fixed scenery is
   * part of the background painting.
   */
  sprite?: string;
  /**
   * A built-in drawing from `props.ts` (e.g. "dog", "chalkboard"), drawn over the
   * background. Used for things that move or come and go, and for lettering on signs
   * (painted backgrounds leave signs blank).
   */
  prop?: string;
  /** Lines of lettering for sign and board props. */
  text?: string[];
  /**
   * Outline of the painted thing, as x, y pairs in game pixels, for cinematic
   * cues that lift it out of the painting (e.g. "[awaken statue 50 40]").
   */
  outline?: number[];
  /** Placeholder drawing until there's art. */
  colour?: string;
  shape?: 'rect' | 'ellipse';
}

/** Where a brother stands. The first entry whose `if` holds wins. */
export interface Stand {
  x: number;
  y: number;
  if?: string;
  /** A pose from `characters.ts`, e.g. "rant". */
  pose?: string;
}

export interface Scene {
  name: string;
  description: string;
  /** File name in `art/`. Until it exists, the placeholder colours are drawn. */
  background?: string;
  placeholder: { top: string; bottom: string };
  hotspots: Hotspot[];
  stand: Partial<Record<BrotherId, Stand[]>>;
}

export interface Choice {
  label: string;
  if?: string;
  say?: string[];
  do?: string[];
}

/**
 * What happens when the player does something. The first matching rule wins,
 * so put specific rules above general ones.
 *
 * - `{ on: 'kiosk' }`                  tap the kiosk
 * - `{ on: 'phil', item: 'tea' }`      use the tea on Phil (giving it to him)
 * - `{ on: '*', item: 'soapbox' }`     use the soapbox on anything
 * - `{ look: 'board', by: 'jack' }`    Jack looks at the board
 */
export interface Rule {
  on?: string;
  look?: string;
  item?: string;
  by?: BrotherId;
  if?: string;
  say?: string[];
  do?: string[];
  choices?: Choice[];
}

export interface Character {
  name: string;
  colour: string;
  /** Where their speech appears on screen (above their head), in game pixels. */
  at?: { x: number; y: number };
}

/** A puzzle, as tracked by the solvability check and playtest scorecards. */
export interface PuzzleDef {
  id: string;
  /** Spoiler-free label, e.g. "Puzzle 1". Shown on public scorecards. */
  label: string;
  /** Flag set when it's solved. */
  solved: string;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  author: string;
  /** e.g. "Present day". */
  era: string;
  /** e.g. "Mother Shipton's Cave, Knaresborough". */
  place: string;
  /** Who can be played. */
  brothers: BrotherId[];
  /** Still being built (art, fixes): the title screen puts a sticker on it. */
  inDevelopment?: boolean;
  start: {
    scene: string;
    brother: BrotherId;
    inventory?: Partial<Record<BrotherId, string[]>>;
    flags?: string[];
  };
  /** Non-brother speakers, keyed by the name used in lines (lowercase). */
  extras?: Record<string, Character>;
  intro: string[];
  items: Record<string, ItemDef>;
  scenes: Record<string, Scene>;
  rules: Rule[];
  puzzles: PuzzleDef[];
  /** Condition that finishes the chapter. */
  goal: string;
  ending: string[];
}
