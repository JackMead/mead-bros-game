import { describe, expect, it } from 'vitest';
import { botAction } from './bot';
import { config } from './config';
import {
  activeRun, compact, dailySeed, day, dayTotal, emptySave, load, persist, playsLeft,
  recordAction, records, resume, startPlaytest, startRun, ukDate,
} from './daily';
import { step } from './sim';

function memoryStore() {
  const map = new Map<string, string>();
  return { getItem: (k: string) => map.get(k) ?? null, setItem: (k: string, v: string) => void map.set(k, v) };
}

function playOut(save: ReturnType<typeof emptySave>, date: string) {
  const run = startRun(save, date);
  let state = resume(run);
  while (state.phase !== 'over') {
    const action = botAction(state);
    state = step(state, action).state;
    recordAction(run, action, state);
  }
  return run;
}

describe('daily', () => {
  it('uses the UK date, which turns over at UK midnight', () => {
    expect(ukDate(new Date('2026-07-01T22:30:00Z'))).toBe('2026-07-01'); // 23:30 BST
    expect(ukDate(new Date('2026-07-01T23:30:00Z'))).toBe('2026-07-02'); // 00:30 BST
    expect(ukDate(new Date('2026-12-01T23:30:00Z'))).toBe('2026-12-01'); // 23:30 GMT
  });

  it('gives everyone the same three different seeds each day', () => {
    expect(dailySeed('2026-11-01', 0)).toBe(dailySeed('2026-11-01', 0));
    const seeds = new Set([0, 1, 2].map((s) => dailySeed('2026-11-01', s)));
    expect(seeds.size).toBe(3);
    expect(dailySeed('2026-11-02', 0)).not.toBe(dailySeed('2026-11-01', 0));
  });

  it('starting a run uses a play immediately, and plays run out', () => {
    const save = emptySave();
    const date = '2026-11-01';
    const first = startRun(save, date);
    expect(playsLeft(save, date)).toBe(config.run.playsPerDay - 1);
    expect(() => startRun(save, date)).toThrow(); // must finish the active run first
    expect(activeRun(save)).toBe(first);
    first.done = true;
    startRun(save, date).done = true;
    startRun(save, date).done = true;
    expect(playsLeft(save, date)).toBe(0);
    expect(() => startRun(save, date)).toThrow();
    expect(day(save, date).runs.map((r) => r.slot)).toEqual([0, 1, 2]);
  });

  it('resumes a run exactly from its saved actions, across a reload', () => {
    const store = memoryStore();
    const save = emptySave();
    const run = startRun(save, '2026-11-01');
    let state = resume(run);
    for (let i = 0; i < 15 && state.phase !== 'over'; i++) {
      const action = botAction(state);
      state = step(state, action).state;
      recordAction(run, action, state);
    }
    persist(store, save);
    const reloaded = activeRun(load(store));
    expect(resume(reloaded!)).toEqual(state);
  });

  it('totals all three runs and tracks records', () => {
    const save = emptySave();
    const date = '2026-11-01';
    const runs = [playOut(save, date), playOut(save, date), playOut(save, date)];
    expect(runs.every((r) => r.done)).toBe(true);
    expect(dayTotal(day(save, date))).toBe(runs.reduce((s, r) => s + r.score, 0));
    const rec = records(save);
    expect(rec.daysPlayed).toBe(1);
    expect(rec.bestDay?.total).toBe(dayTotal(day(save, date)));
    expect(rec.bestRun?.score).toBe(Math.max(...runs.map((r) => r.score)));
  });

  it('compacting keeps scores but drops old action logs once sent', () => {
    const save = emptySave();
    const run = playOut(save, '2026-11-01');
    compact(save, '2026-11-02');
    expect(run.actions.length).toBeGreaterThan(0); // not sent yet: keep it
    run.submitted = true;
    compact(save, '2026-11-02');
    expect(run.actions).toEqual([]);
    expect(dayTotal(day(save, '2026-11-01'))).toBe(run.score);
  });

  it('survives corrupt storage', () => {
    const store = memoryStore();
    store.setItem(config.storageKey, '{not json');
    expect(load(store)).toEqual(emptySave());
  });

  it('playtest runs are unlimited and never touch daily plays or records', () => {
    const save = emptySave();
    const date = '2026-11-01';
    for (let i = 0; i < 5; i++) {
      const r = startPlaytest(save, 1000 + i, 1_700_000_000_000 + i);
      expect(() => startRun(save, date)).toThrow(); // still one run at a time
      r.done = true;
      r.score = 50;
    }
    expect(save.playtest).toHaveLength(5);
    expect(playsLeft(save, date)).toBe(config.run.playsPerDay);
    expect(records(save).bestRun).toBeNull();
  });

  it('counts active time, ignoring long breaks', () => {
    const save = emptySave();
    const run = startRun(save, '2026-11-01', 0);
    let state = resume(run);
    const times = [5_000, 10_000, 10_000 + 3_600_000, 10_000 + 3_605_000];
    for (const t of times) {
      const action = botAction(state);
      state = step(state, action).state;
      recordAction(run, action, state, t);
    }
    expect(run.activeMs).toBe(5_000 + 5_000 + 60_000 + 5_000);
  });

  it('upgrades saves from before run ids existed', () => {
    const store = memoryStore();
    store.setItem(config.storageKey, JSON.stringify({
      version: 1, muted: false,
      days: { '2026-10-31': { date: '2026-10-31', runs: [{ slot: 1, seed: 5, actions: [], done: true, score: 3, turns: 9, depth: 2, outcome: 'banked' }] } },
    }));
    const save = load(store);
    const run = day(save, '2026-10-31').runs[0];
    expect(run.id).toBe('d-2026-10-31-1');
    expect(run.mode).toBe('daily');
    expect(run.submitted).toBe(true);
    expect(save.playtest).toEqual([]);
  });
});
