import { cast } from './cast';
import {
  act,
  newGame,
  openChoices,
  speakerInfo,
  visibleHotspots,
  type Action,
  type Line,
  type State,
} from './engine';
import type { Chapter } from './types';

/**
 * A text-adventure front end on the same engine, for AI playtesters (and anyone
 * without a screen handy). Pure: takes a state and a command, returns a new state
 * and what to print.
 *
 * Commands: look, look at <thing>, use <thing>, use <item> on <thing>,
 * give <item> to <brother>, play as <brother>, inventory, choose <n>, help.
 */
export const HELP = [
  'Commands:',
  '  look                      describe where you are',
  '  look at <thing>           examine a thing, a brother or an item',
  '  use <thing>               tap / interact / talk to it',
  '  use <item> on <thing>     use an item you hold on something',
  '  give <item> to <brother>  same as "use <item> on <brother>"',
  '  play as <brother>         switch to Rob, Jack or Phil',
  '  inventory                 what you are carrying',
  '  choose <n>                pick an option in a conversation',
].join('\n');

export function intro(chapter: Chapter, state: State): string {
  return [
    `${chapter.title} (${chapter.era}, ${chapter.place})`,
    '',
    ...chapter.intro.filter((l) => !l.startsWith('Tap ')),
    '',
    lookAround(chapter, state),
  ].join('\n');
}

export function lookAround(chapter: Chapter, state: State): string {
  const scene = chapter.scenes[state.scene];
  const things = visibleHotspots(chapter, state).map((h) => h.name);
  const others = chapter.brothers.filter((b) => b !== state.active).map((b) => cast[b].name);
  return [
    `== ${scene.name} ==`,
    scene.description,
    `You can see: ${things.join(', ')}.`,
    `You are playing as ${cast[state.active].name}.${others.length ? ` Also here: ${others.join(' and ')}.` : ''}`,
    inventory(chapter, state),
  ].join('\n');
}

export function inventory(chapter: Chapter, state: State): string {
  const items = state.inventory[state.active].map((i) => chapter.items[i].name);
  return `${cast[state.active].name} is carrying: ${items.length ? items.join(', ') : 'nothing'}.`;
}

export function formatLines(chapter: Chapter, lines: Line[]): string[] {
  return lines.map((l) => {
    const who = speakerInfo(chapter, l.speaker);
    return who ? `${who.name}: "${l.text}"` : l.text;
  });
}

export function run(chapter: Chapter, state: State, input: string): { state: State; output: string } {
  const parsed = parse(chapter, state, input.trim());
  if (typeof parsed === 'string') return { state, output: parsed };
  const result = act(chapter, state, parsed);
  const out = formatLines(chapter, result.lines);
  if (parsed.type === 'switch') out.push(`You are now playing as ${cast[result.state.active].name}.`, inventory(chapter, result.state));
  if (result.choices.length) out.push(...result.choices.map((c, i) => `  ${i + 1}) ${c}`), '(type "choose <n>")');
  if (result.state.done) out.push('', '*** CHAPTER COMPLETE ***');
  return { state: result.state, output: out.join('\n') };
}

/** Turn a typed command into an engine action, or return text to print instead. */
function parse(chapter: Chapter, state: State, input: string): Action | string {
  const s = input.toLowerCase().replace(/[.!?]+$/, '').replace(/\s+/g, ' ');
  if (!s || s === 'help' || s === '?') return HELP;
  if (state.done) return 'The chapter is over.';
  if (['look', 'look around', 'l'].includes(s)) return lookAround(chapter, state);
  if (['inventory', 'inv', 'i'].includes(s)) return inventory(chapter, state);

  let m = /^(?:choose|pick|option|say) (\d+)$/.exec(s) ?? /^(\d+)$/.exec(s);
  if (m) {
    const n = Number(m[1]) - 1;
    if (state.choosing === null) return 'Nobody is waiting for an answer.';
    if (!openChoices(chapter, state)[n]) return 'There is no option with that number.';
    return { type: 'choose', index: n };
  }

  m = /^(?:play as|switch to|switch|be|become) (.+)$/.exec(s);
  if (m) {
    const b = chapter.brothers.find((id) => id === m![1] || cast[id].name.toLowerCase() === m![1]);
    return b ? { type: 'switch', brother: b } : `You can play as ${chapter.brothers.map((id) => cast[id].name).join(', ')}.`;
  }

  m = /^(?:look at|look|examine|x|inspect|read) (.+)$/.exec(s);
  if (m) {
    const t = resolve(chapter, state, m[1]);
    return t ? { type: 'look', target: t } : notHere(m[1]);
  }

  m = /^(?:use|give|put|show|offer|feed) (.+?) (?:on|to|with|in|into|at) (.+)$/.exec(s);
  if (m) {
    const item = resolveItem(chapter, state, m[1]);
    if (!item) return `${cast[state.active].name} isn't carrying "${m[1]}".`;
    const t = resolve(chapter, state, m[2]);
    return t ? { type: 'item', item, target: t } : notHere(m[2]);
  }

  m = /^(?:use|tap|talk to|talk|speak to|open|take|pick up|push|pull|touch|press|interact with) (.+)$/.exec(s);
  if (m) {
    const t = resolve(chapter, state, m[1]);
    return t ? { type: 'use', target: t } : notHere(m[1]);
  }
  return 'I don\'t understand that. Type "help" for commands.';
}

function notHere(name: string): string {
  return `There's no "${name}" here.`;
}

const norm = (s: string) => s.toLowerCase().replace(/^(the|a|an) /, '').replace(/['’]s\b/g, '').trim();

function matches(query: string, id: string, name: string): boolean {
  const q = norm(query);
  const n = norm(name);
  return q === id || q === n || n.split(' ').includes(q) || (q.length > 3 && n.includes(q));
}

function resolveItem(chapter: Chapter, state: State, query: string): string | undefined {
  return state.inventory[state.active].find((id) => matches(query, id, chapter.items[id].name));
}

function resolve(chapter: Chapter, state: State, query: string): string | undefined {
  const q = norm(query);
  if (['me', 'myself', 'self'].includes(q)) return state.active;
  return (
    resolveItem(chapter, state, query) ??
    chapter.brothers.find((b) => matches(query, b, cast[b].name)) ??
    visibleHotspots(chapter, state).find((h) => matches(query, h.id, h.name))?.id
  );
}

/** Re-create a state by replaying commands from the start. */
export function replay(chapter: Chapter, commands: string[]): State {
  return commands.reduce((s, c) => run(chapter, s, c).state, newGame(chapter));
}
