import { config } from './config';
import { hashString } from './rng';
import { replay } from './sim';
import type { Action, OutcomeKind, RunState } from './types';

/**
 * Daily plays, stored on the phone. v0 is honour-system: seeds come from the UK date and
 * the play counter lives in local storage. v1 moves both to a server (see docs/bragging-rights.md).
 * Starting a run uses up a play straight away, so abandoning a bad run still counts.
 */

export interface RunRecord {
  slot: number;
  seed: number;
  actions: Action[];
  done: boolean;
  score: number;
  turns: number;
  depth: number;
  outcome: OutcomeKind | null;
}

export interface DayRecord {
  date: string;
  runs: RunRecord[];
}

export interface SaveData {
  version: 1;
  days: Record<string, DayRecord>;
  muted: boolean;
}

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const SLOT_NAMES = ['A', 'B', 'C'] as const;

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
  return { version: 1, days: {}, muted: false };
}

export function load(store: KeyValueStore): SaveData {
  try {
    const raw = store.getItem(config.storageKey);
    if (!raw) return emptySave();
    const data = JSON.parse(raw) as SaveData;
    if (data.version !== 1 || typeof data.days !== 'object') return emptySave();
    return { ...emptySave(), ...data };
  } catch {
    return emptySave();
  }
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

/** An unfinished run from any day, which must be finished before starting another. */
export function activeRun(save: SaveData): { date: string; run: RunRecord } | null {
  for (const d of Object.values(save.days)) {
    const run = d.runs.find((r) => !r.done);
    if (run) return { date: d.date, run };
  }
  return null;
}

export function playsLeft(save: SaveData, date: string): number {
  return config.run.playsPerDay - day(save, date).runs.length;
}

/** Use up today's next play and return its record. */
export function startRun(save: SaveData, date: string): RunRecord {
  if (activeRun(save)) throw new Error('Finish the current run first');
  if (playsLeft(save, date) <= 0) throw new Error('No plays left today');
  const d = day(save, date);
  const slot = d.runs.length;
  const run: RunRecord = {
    slot, seed: dailySeed(date, slot), actions: [], done: false,
    score: 0, turns: 0, depth: 1, outcome: null,
  };
  save.days[date] = { date, runs: [...d.runs, run] };
  return run;
}

/** Record an action that was applied, and copy the run's progress from the new state. */
export function recordAction(run: RunRecord, action: Action, state: RunState): void {
  run.actions.push(action);
  run.turns = state.turn;
  run.depth = state.depth;
  if (state.outcome) {
    run.done = true;
    run.score = state.outcome.score;
    run.outcome = state.outcome.kind;
  }
}

export function resume(run: RunRecord): RunState {
  return replay(run.seed, run.actions);
}

export function dayTotal(d: DayRecord): number {
  return d.runs.reduce((sum, r) => sum + (r.done ? r.score : 0), 0);
}

export interface Records {
  bestDay: { date: string; total: number } | null;
  bestRun: { date: string; slot: number; score: number; turns: number } | null;
  daysPlayed: number;
}

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

/** Drop the action logs of finished runs from other days to keep storage small. */
export function compact(save: SaveData, today: string): void {
  for (const d of Object.values(save.days)) {
    if (d.date === today) continue;
    for (const r of d.runs) if (r.done) r.actions = [];
  }
}
