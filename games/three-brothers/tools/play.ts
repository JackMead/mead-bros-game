/**
 * Play a chapter in the terminal, one command per call. Built for AI playtesters,
 * which run a shell command per move, but works for people too.
 *
 *   npm run play -- --session /tmp/run1.json --new             start (prints the intro)
 *   npm run play -- --session /tmp/run1.json "look at kiosk"    one move
 *   npm run play -- --session /tmp/run1.json --score            spoiler-free scorecard
 *
 * Add --chapter <id> to pick a chapter (default: the first). The session file just
 * stores the commands typed so far; the game state is rebuilt by replaying them.
 */
/// <reference types="node" />
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import type { State } from '../engine';
import type { Chapter } from '../types';

// Chapters are the solutions. If one fails to compile, the bundler's error would print
// its source, so load them here and say only what broke and where.
let loaded: typeof import('../chapters') & typeof import('../engine') & typeof import('../text');
try {
  loaded = { ...(await import('../chapters')), ...(await import('../engine')), ...(await import('../text')) };
} catch (e) {
  const err = e as { message?: string; loc?: { file?: string; line?: number; column?: number } };
  const where = err.loc ? ` at ${err.loc.file ?? '?'}:${err.loc.line ?? '?'}:${err.loc.column ?? '?'}` : '';
  console.error(`A chapter failed to load${where}: ${(err.message ?? String(e)).split('\n')[0].slice(0, 200)}`);
  process.exit(1);
}
const { chapters, newGame, intro, run } = loaded;

interface Session {
  chapter: string;
  commands: string[];
}

const args = process.argv.slice(2).filter((a: string) => a !== '--');
const flag = (name: string) => {
  const i = args.indexOf(name);
  if (i < 0) return undefined;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const has = (name: string) => {
  const i = args.indexOf(name);
  if (i >= 0) args.splice(i, 1);
  return i >= 0;
};

const sessionPath = flag('--session');
const chapterId = flag('--chapter');
const fresh = has('--new');
const score = has('--score');
const command = args.join(' ');

if (!sessionPath) {
  console.error('Usage: npm run play -- --session <file> [--chapter <id>] (--new | --score | "<command>")');
  process.exit(1);
}

let session: Session =
  !fresh && existsSync(sessionPath)
    ? JSON.parse(readFileSync(sessionPath, 'utf8'))
    : { chapter: chapterId ?? chapters[0].id, commands: [] };
const found = chapters.find((c) => c.id === session.chapter);
if (!found) {
  console.error(`No chapter "${session.chapter}". Chapters: ${chapters.map((c) => c.id).join(', ')}`);
  process.exit(1);
}
const chapter: Chapter = found;

// Rebuild the state, noting when each puzzle was solved.
let state: State = newGame(chapter);
const solvedAt = new Map<string, number>();
const note = (s: State, n: number) => {
  for (const p of chapter.puzzles) if (!solvedAt.has(p.id) && s.flags.includes(p.solved)) solvedAt.set(p.id, n);
};
session.commands.forEach((c, i) => {
  state = run(chapter, state, c).state;
  note(state, i + 1);
});

if (fresh) {
  writeFileSync(sessionPath, JSON.stringify(session, null, 2));
  console.log(intro(chapter, state));
} else if (score) {
  console.log(`Chapter: ${chapter.title} (${chapter.id})`);
  console.log(`Commands typed: ${session.commands.length}`);
  console.log(`Finished: ${state.done ? 'yes' : 'no'}`);
  for (const p of chapter.puzzles) {
    const at = solvedAt.get(p.id);
    console.log(`  ${p.label}: ${at ? `solved after ${at} commands` : 'not solved'}`);
  }
} else if (!command) {
  console.error('Give a command, e.g. "look". Type "help" for the list.');
  process.exit(1);
} else {
  const result = run(chapter, state, command);
  session = { ...session, commands: [...session.commands, command] };
  writeFileSync(sessionPath, JSON.stringify(session, null, 2));
  console.log(result.output);
}
