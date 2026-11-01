import { config } from './config';
import { DEFAULT_KIT } from './kits';
import { hashString } from './rng';
import { replay } from './sim';
import type { Action, OutcomeKind, RunState } from './types';

/**
 * Daily plays and playtest runs, stored on the phone. v0 is honour-system: seeds come from
 * the UK date and the play counter lives in local storage. v1 moves both to a server
 * (see docs/bragging-rights.md). Starting a run uses up a play straight away, so abandoning
 * a bad run still counts.
 */

export type RunMode = 'daily' | 'playtest';

/** The two taps after a run. */
export interface Feedback {
  /** Asked only when the run ended in death or lamp-out. */
  fault?: 'mine' | 'unfair';
  feel?: 'easy' | 'right' | 'hard';
}

export interface RunRecord {
  /** Unique and stable: `d-<date>-<slot>` for daily runs, `p-<start time>` for playtests. */
  id: string;
  mode: RunMode;
  /** UK date the run was started on. */
  date: string;
  slot: number;
  seed: number;
  kit: string;
  actions: Action[];
  done: boolean;
  score: number;
  turns: number;
  depth: number;
  outcome: OutcomeKind | null;
  startedAt: number;
  /** Time spent playing, ignoring breaks of over a minute between moves. */
  activeMs: number;
  lastActionAt: number;
  feedback: Feedback;
  /** Sent to the playtest collection. */
  submitted: boolean;
}

export interface DayRecord {
  date: string;
  runs: RunRecord[];
}

export interface SaveData {
  version: 1;
  days: Record<string, DayRecord>;
  /** Unlimited practice runs on random seeds. Development only: off once scores count (v1). */
  playtest: RunRecord[];
  /** Par found for each dungeon, keyed by `<build>:<seed>` (par changes when the rules do). */
  pars: Record<string, ParRecord>;
  muted: boolean;
}

export interface ParRecord {
  score: number;
  depth: number;
}

const PARS_KEEP = 60;

export function parKey(seed: number): string {
  return `${config.build}:${seed}`;
}

export function storePar(save: SaveData, seed: number, par: ParRecord): void {
  save.pars[parKey(seed)] = par;
  const keys = Object.keys(save.pars);
  for (const k of keys.slice(0, Math.max(0, keys.length - PARS_KEEP))) delete save.pars[k];
}

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const SLOT_NAMES = ['A', 'B', 'C'] as const;

/** Longest gap between moves that still counts as playing. */
const MAX_ACTIVE_GAP_MS = 60_000;
const PLAYTEST_KEEP = 30;

/** Today's date in the UK as YYYY-MM-DD. The day turns over at midnight UK time. */
export function ukDate(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now);
}

/** The shared seed for a day's dungeon A, B or C. */
export function dailySeed(date: string, slot: number): number {
  return hashString(`bragging-rights:${date}:${slot}`);
}

export function emptySave(): SaveData {
  return { version: 1, days: {}, playtest: [], pars: {}, muted: false };
}

export function load(store: KeyValueStore): SaveData {
  try {
    const raw = store.getItem(config.storageKey);
    if (!raw) return emptySave();
    const data = JSON.parse(raw) as Partial<SaveData>;
    if (data.version !== 1 || typeof data.days !== 'object' || !data.days) return emptySave();
    const save: SaveData = { ...emptySave(), ...data } as SaveData;
    // Fill in fields added after the first saves were written.
    for (const d of Object.values(save.days)) d.runs = d.runs.map((r) => normalise(r, 'daily', d.date));
    save.playtest = (save.playtest ?? []).map((r) => normalise(r, 'playtest', r.date ?? ''));
    save.pars = save.pars ?? {};
    return save;
  } catch {
    return emptySave();
  }
}

function normalise(r: Partial<RunRecord>, mode: RunMode, date: string): RunRecord {
  const slot = r.slot ?? 0;
  return {
    id: r.id ?? (mode === 'daily' ? `d-${date}-${slot}` : `p-${(r.startedAt ?? 0).toString(36)}`),
    mode, date, slot,
    seed: r.seed ?? 0,
    kit: r.kit ?? DEFAULT_KIT,
    actions: r.actions ?? [],
    done: r.done ?? false,
    score: r.score ?? 0,
    turns: r.turns ?? 0,
    depth: r.depth ?? 1,
    outcome: r.outcome ?? null,
    startedAt: r.startedAt ?? 0,
    activeMs: r.activeMs ?? 0,
    lastActionAt: r.lastActionAt ?? 0,
    feedback: r.feedback ?? {},
    // Runs finished before collection existed have nothing worth sending.
    submitted: r.submitted ?? r.startedAt === undefined,
  };
}

export function persist(store: KeyValueStore, save: SaveData): void {
  try {
    store.setItem(config.storageKey, JSON.stringify(save));
  } catch {
    // Storage full or blocked: the run carries on, it just won't survive a reload.
  }
}

export function day(save: SaveData, date: string): DayRecord {
  return save.days[date] ?? { date, runs: [] };
}

/** Every run on this phone, daily and playtest. */
export function allRuns(save: SaveData): RunRecord[] {
  return [...Object.values(save.days).flatMap((d) => d.runs), ...save.playtest];
}

/** An unfinished run, which must be finished before starting another. */
export function activeRun(save: SaveData): RunRecord | null {
  return allRuns(save).find((r) => !r.done) ?? null;
}

export function playsLeft(save: SaveData, date: string): number {
  return config.run.playsPerDay - day(save, date).runs.length;
}

function newRecord(fields: Pick<RunRecord, 'id' | 'mode' | 'date' | 'slot' | 'seed'>, now: number): RunRecord {
  return {
    ...fields, kit: DEFAULT_KIT, actions: [], done: false, score: 0, turns: 0, depth: 1, outcome: null,
    startedAt: now, activeMs: 0, lastActionAt: now, feedback: {}, submitted: false,
  };
}

/** Use up today's next play and return its record. */
export function startRun(save: SaveData, date: string, now = Date.now()): RunRecord {
  if (activeRun(save)) throw new Error('Finish the current run first');
  if (playsLeft(save, date) <= 0) throw new Error('No plays left today');
  const d = day(save, date);
  const slot = d.runs.length;
  const run = newRecord({ id: `d-${date}-${slot}`, mode: 'daily', date, slot, seed: dailySeed(date, slot) }, now);
  save.days[date] = { date, runs: [...d.runs, run] };
  return run;
}

/** Start an unlimited practice run on the given (random) seed. */
export function startPlaytest(save: SaveData, seed: number, now = Date.now()): RunRecord {
  if (activeRun(save)) throw new Error('Finish the current run first');
  const run = newRecord({ id: `p-${now.toString(36)}`, mode: 'playtest', date: ukDate(new Date(now)), slot: 0, seed: seed >>> 0 }, now);
  save.playtest.push(run);
  return run;
}

/** Record an action that was applied, and copy the run's progress from the new state. */
export function recordAction(run: RunRecord, action: Action, state: RunState, now = Date.now()): void {
  run.actions.push(action);
  run.activeMs += Math.max(0, Math.min(now - run.lastActionAt, MAX_ACTIVE_GAP_MS));
  run.lastActionAt = now;
  run.turns = state.turn;
  run.depth = state.depth;
  if (state.outcome) {
    run.done = true;
    run.score = state.outcome.score;
    run.outcome = state.outcome.kind;
  }
}

export function resume(run: RunRecord): RunState {
  return replay(run.seed, run.actions, run.kit);
}

export function dayTotal(d: DayRecord): number {
  return d.runs.reduce((sum, r) => sum + (r.done ? r.score : 0), 0);
}

export interface Records {
  bestDay: { date: string; total: number } | null;
  bestRun: { date: string; slot: number; score: number; turns: number } | null;
  daysPlayed: number;
}

/** Records count daily runs only: playtests never touch them. */
export function records(save: SaveData): Records {
  const out: Records = { bestDay: null, bestRun: null, daysPlayed: 0 };
  for (const d of Object.values(save.days)) {
    if (d.runs.length === 0) continue;
    out.daysPlayed++;
    const total = dayTotal(d);
    if (!out.bestDay || total > out.bestDay.total) out.bestDay = { date: d.date, total };
    for (const r of d.runs) {
      if (!r.done) continue;
      const better = !out.bestRun || r.score > out.bestRun.score
        || (r.score === out.bestRun.score && r.turns < out.bestRun.turns);
      if (better) out.bestRun = { date: d.date, slot: r.slot, score: r.score, turns: r.turns };
    }
  }
  return out;
}

/**
 * Keep storage small: drop action logs of finished, submitted daily runs from other days,
 * and keep only the most recent playtests.
 */
export function compact(save: SaveData, today: string): void {
  for (const d of Object.values(save.days)) {
    if (d.date === today) continue;
    for (const r of d.runs) if (r.done && r.submitted) r.actions = [];
  }
  const keep = save.playtest.filter((r) => !r.done || !r.submitted);
  const finished = save.playtest.filter((r) => r.done && r.submitted).slice(-PLAYTEST_KEEP);
  save.playtest = [...finished, ...keep].sort((a, b) => a.startedAt - b.startedAt);
}
