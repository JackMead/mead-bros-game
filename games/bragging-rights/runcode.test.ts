import { describe, expect, it } from 'vitest';
import { analyseRun, formatSummary, summarise } from './analyse';
import { botAction } from './bot';
import { emptySave, recordAction, resume, startPlaytest, startRun } from './daily';
import { decodeActions, encodeActions, parseRunCode, runCode } from './runcode';
import { step } from './sim';
import type { Action } from './types';

function playOut(run: ReturnType<typeof startRun>) {
  let state = resume(run);
  let t = run.startedAt;
  while (state.phase !== 'over') {
    const action = botAction(state);
    state = step(state, action).state;
    recordAction(run, action, state, (t += 4000));
  }
  return state;
}

describe('run codes', () => {
  it('round-trips every kind of action', () => {
    const actions: Action[] = [
      { type: 'move', dx: -1, dy: -1 }, { type: 'move', dx: 1, dy: 1 }, { type: 'move', dx: 0, dy: 1 },
      { type: 'wait' }, { type: 'ring' }, { type: 'page', slot: 1, x: 6, y: 8 }, { type: 'bank' }, { type: 'descend' },
    ];
    expect(decodeActions(encodeActions(actions))).toEqual(actions);
  });

  it('a code rebuilds the exact run, feedback included', () => {
    const save = emptySave();
    const run = startRun(save, '2026-11-01', 1_000);
    const final = playOut(run);
    run.feedback = { fault: 'mine', feel: 'hard' };
    const code = runCode(run);
    expect(code).toMatch(/^BR1\.[A-Za-z0-9_-]+$/);
    const data = parseRunCode(code);
    expect(data).toMatchObject({ id: run.id, mode: 'daily', seed: run.seed, feedback: run.feedback, activeMs: run.activeMs });
    const report = analyseRun(data);
    expect(report.valid).toBe(true);
    expect(report.score).toBe(final.outcome!.score);
    expect(report.turns).toBe(final.turn);
  });

  it('rejects things that are not run codes', () => {
    expect(() => parseRunCode('hello')).toThrow();
  });
});

describe('playtest analysis', () => {
  it('summarises runs against the targets', () => {
    const save = emptySave();
    const reports = Array.from({ length: 8 }, (_, i) => {
      const run = startPlaytest(save, 500 + i, 10_000 * (i + 1));
      playOut(run);
      run.feedback = { fault: i % 2 ? 'mine' : 'unfair', feel: 'right' };
      return analyseRun(parseRunCode(runCode(run)));
    });
    expect(reports.every((r) => r.valid)).toBe(true);
    for (const r of reports) {
      if (r.outcome === 'died') expect(r.endedBy).not.toBeNull();
      if (r.outcome === 'lampOut') expect(r.endedBy).toBe('lamp');
      for (const v of r.stairs) expect(['descend', 'bank', 'escaped']).toContain(v.choice);
    }
    const s = summarise(reports);
    expect(s.finished).toBe(8);
    expect(s.targets.map((t) => t.name)).toContain('Deaths feel fair');
    expect(formatSummary(s, reports)).toContain('finished runs');
  });

  it('flags a code that no longer matches the rules', () => {
    const save = emptySave();
    const run = startPlaytest(save, 77, 1);
    run.actions = [{ type: 'bank' }]; // not allowed mid-floor
    expect(analyseRun(parseRunCode(runCode(run))).valid).toBe(false);
  });
});
