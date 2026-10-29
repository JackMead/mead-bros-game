import { cast } from './cast';
import { BROTHERS, type BrotherId, type ByBrother, type Chapter, type Choice, type Rule } from './types';

/** Everything that changes during play. Plain data, so it can be saved, compared and replayed. */
export interface State {
  scene: string;
  active: BrotherId;
  inventory: Record<BrotherId, string[]>;
  flags: string[];
  /** Index into `chapter.rules` of a rule waiting for the player to pick a choice. */
  choosing: number | null;
  /** Cycles through each brother's fallback lines. */
  fallbackTurn: number;
  done: boolean;
}

export type Action =
  | { type: 'look'; target: string }
  | { type: 'use'; target: string }
  | { type: 'item'; item: string; target: string }
  | { type: 'switch'; brother: BrotherId }
  | { type: 'choose'; index: number };

export interface Line {
  /** Brother id, extra id, or null for narration. */
  speaker: string | null;
  text: string;
  /** A cinematic cue such as "pull rob" (see cues.ts) instead of words. */
  cue?: string;
}

export interface Result {
  state: State;
  lines: Line[];
  /** Labels to pick from when a rule offers choices. */
  choices: string[];
}

export function newGame(chapter: Chapter): State {
  const inventory = { rob: [], jack: [], phil: [] } as Record<BrotherId, string[]>;
  for (const b of BROTHERS) inventory[b] = [...(chapter.start.inventory?.[b] ?? [])];
  return {
    scene: chapter.start.scene,
    active: chapter.start.brother,
    inventory,
    flags: [...(chapter.start.flags ?? [])],
    choosing: null,
    fallbackTurn: 0,
    done: false,
  };
}

export function check(condition: string | undefined, state: State): boolean {
  if (!condition) return true;
  return condition
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => {
      const negate = token.startsWith('!');
      const t = negate ? token.slice(1) : token;
      const holds = t.startsWith('has:')
        ? state.inventory[state.active].includes(t.slice(4))
        : state.flags.includes(t);
      return holds !== negate;
    });
}

/** Hotspots in the current scene that exist right now. */
export function visibleHotspots(chapter: Chapter, state: State) {
  return chapter.scenes[state.scene].hotspots.filter((h) => check(h.if, state));
}

export function holder(state: State, item: string): BrotherId | null {
  return BROTHERS.find((b) => state.inventory[b].includes(item)) ?? null;
}

export function byBrother(text: ByBrother, who: BrotherId): string | undefined {
  return typeof text === 'string' ? text : (text[who] ?? text.any);
}

/** Choices of the pending rule whose conditions hold, with their index in the rule. */
export function openChoices(chapter: Chapter, state: State): { choice: Choice; index: number }[] {
  if (state.choosing === null) return [];
  const rule = chapter.rules[state.choosing];
  return (rule.choices ?? [])
    .map((choice, index) => ({ choice, index }))
    .filter(({ choice }) => check(choice.if, state));
}

/** Apply one player action. Pure: returns a new state and never touches the old one. */
export function act(chapter: Chapter, prev: State, action: Action): Result {
  const state = clone(prev);
  const lines: Line[] = [];
  const out = (texts: string[] | undefined) => lines.push(...parseLines(chapter, texts ?? [], state.active));

  if (state.done) return { state, lines, choices: [] };

  if (action.type === 'choose') {
    const open = openChoices(chapter, state);
    const picked = open[action.index];
    state.choosing = null;
    if (picked) {
      out([`Me: ${picked.choice.label}`]);
      out(picked.choice.say);
      run(state, picked.choice.do);
    }
    return finish(chapter, state, lines);
  }

  // Doing anything else walks away from an open conversation.
  state.choosing = null;

  if (action.type === 'switch') {
    if (chapter.brothers.includes(action.brother)) state.active = action.brother;
    return finish(chapter, state, lines);
  }

  const rule = findRule(chapter, state, action);
  if (rule) {
    out(rule.say);
    run(state, rule.do);
    if (rule.choices?.length) state.choosing = chapter.rules.indexOf(rule);
    return finish(chapter, state, lines);
  }

  // No rule: sensible defaults.
  if (action.type === 'look') {
    out([`Me: ${describe(chapter, state, action.target) ?? 'Nothing special.'}`]);
  } else if (
    action.type === 'item' &&
    action.target !== state.active &&
    chapter.brothers.includes(action.target as BrotherId)
  ) {
    // Hand an item to another brother.
    const to = action.target as BrotherId;
    move(state, action.item, to);
    out([`Me: Here, ${cast[to].name}, hang on to this.`]);
  } else if (
    action.type === 'use' &&
    action.target !== state.active &&
    chapter.brothers.includes(action.target as BrotherId)
  ) {
    // Talking to a brother who has nothing in particular to say: he answers in character.
    const other = action.target as BrotherId;
    const fallback = cast[other].fallback;
    lines.push(...parseLines(chapter, [fallback[state.fallbackTurn % fallback.length]], other));
    state.fallbackTurn++;
  } else {
    const fallback = cast[state.active].fallback;
    out([fallback[state.fallbackTurn % fallback.length]]);
    state.fallbackTurn++;
  }
  return finish(chapter, state, lines);
}

/** What the brother being played sees when he looks at a hotspot, brother or item. */
export function describe(chapter: Chapter, state: State, target: string): string | undefined {
  const hotspot = visibleHotspots(chapter, state).find((h) => h.id === target);
  if (hotspot) return byBrother(hotspot.look, state.active);
  if (target in cast) return cast[target as BrotherId].look;
  const item = chapter.items[target];
  if (item) return byBrother(item.look, state.active);
  return undefined;
}

/** True when an action makes sense in this state: its target is here and its item is held. */
export function isValid(chapter: Chapter, state: State, action: Action): boolean {
  if (action.type === 'choose') return state.choosing !== null;
  if (action.type === 'switch') return chapter.brothers.includes(action.brother);
  const inv = state.inventory[state.active];
  const targetHere =
    visibleHotspots(chapter, state).some((h) => h.id === action.target) ||
    chapter.brothers.includes(action.target as BrotherId) ||
    inv.includes(action.target);
  if (action.type === 'item') return inv.includes(action.item) && action.item !== action.target && targetHere;
  return targetHere;
}

function findRule(chapter: Chapter, state: State, action: Action): Rule | undefined {
  return chapter.rules.find((r) => {
    if (r.by && r.by !== state.active) return false;
    if (!check(r.if, state)) return false;
    if (action.type === 'look') return r.look === action.target;
    if (action.type === 'use') return r.on === action.target && !r.item;
    if (action.type === 'item') return r.item === action.item && (r.on === action.target || r.on === '*');
    return false;
  });
}

function finish(chapter: Chapter, state: State, lines: Line[]): Result {
  const choices = openChoices(chapter, state).map((c) => c.choice.label);
  if (!state.done && check(chapter.goal, state)) {
    state.done = true;
    state.choosing = null;
    lines.push(...parseLines(chapter, chapter.ending, state.active));
    return { state, lines, choices: [] };
  }
  return { state, lines, choices };
}

function run(state: State, effects: string[] | undefined): void {
  for (const effect of effects ?? []) {
    const [verb, arg = ''] = splitOnce(effect, ':');
    if (verb === 'set') {
      if (!state.flags.includes(arg)) state.flags.push(arg);
    } else if (verb === 'clear') {
      state.flags = state.flags.filter((f) => f !== arg);
    } else if (verb === 'give') {
      const [item, to] = splitOnce(arg, '>');
      move(state, item, (to as BrotherId) || state.active);
    } else if (verb === 'take') {
      for (const b of BROTHERS) state.inventory[b] = state.inventory[b].filter((i) => i !== arg);
    } else if (verb === 'goto') {
      state.scene = arg;
    } else {
      throw new Error(`Unknown effect "${effect}"`);
    }
  }
}

/** Put an item in a brother's pockets, taking it from whoever had it. */
function move(state: State, item: string, to: BrotherId): void {
  for (const b of BROTHERS) state.inventory[b] = state.inventory[b].filter((i) => i !== item);
  state.inventory[to].push(item);
}

export function parseLines(chapter: Chapter, texts: string[], active: BrotherId): Line[] {
  return texts.map((raw) => {
    if (/^\[.*\]$/.test(raw.trim())) return { speaker: null, text: '', cue: raw.trim().slice(1, -1) };
    const [head, rest] = splitOnce(raw, ': ');
    if (rest !== undefined) {
      const key = head.trim().toLowerCase();
      if (key === 'me') return { speaker: active, text: rest };
      if (key in cast || chapter.extras?.[key]) return { speaker: key, text: rest };
    }
    return { speaker: null, text: raw };
  });
}

/** Display name and colour for a line's speaker. */
export function speakerInfo(chapter: Chapter, speaker: string | null): { name: string; colour: string } | null {
  if (!speaker) return null;
  return cast[speaker as BrotherId] ?? chapter.extras?.[speaker] ?? null;
}

function splitOnce(s: string, sep: string): [string, string | undefined] {
  const i = s.indexOf(sep);
  return i < 0 ? [s, undefined] : [s.slice(0, i), s.slice(i + sep.length)];
}

function clone(s: State): State {
  return {
    ...s,
    inventory: { rob: [...s.inventory.rob], jack: [...s.inventory.jack], phil: [...s.inventory.phil] },
    flags: [...s.flags],
  };
}
