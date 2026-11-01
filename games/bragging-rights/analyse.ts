import { config } from './config';
import type { Feedback, RunMode } from './daily';
import { enemyType, getKit } from './kits';
import type { RunCodeData } from './runcode';
import { newRun, step } from './sim';
import type { OutcomeKind } from './types';

/**
 * Turns run codes into facts: replays each run and measures it against the playtest
 * targets in docs/bragging-rights.md. Pure, so it runs in tests and in tools/report.ts.
 */

export interface StairsVisit {
  depth: number;
  oil: number;
  hearts: number;
  carried: number;
  choice: 'descend' | 'bank' | 'escaped' | 'none';
}

export interface RunReport {
  id: string;
  mode: RunMode;
  date: string;
  build: string;
  startedAt: number;
  outcome: OutcomeKind | null;
  score: number;
  carried: number;
  depth: number;
  turns: number;
  activeMin: number;
  stairs: StairsVisit[];
  ringUses: number;
  pagesFound: number;
  pagesUsed: number;
  /** Damage taken, by enemy name. */
  damageBy: Record<string, number>;
  /** Enemy name that landed the last hit, 'lamp' for lamp-out, null if alive. */
  endedBy: string | null;
  feedback: Feedback;
  /** False if an action in the code was refused, meaning the code doesn't match these rules. */
  valid: boolean;
}

export function analyseRun(code: RunCodeData): RunReport {
  const kit = getKit(code.kit);
  let state = newRun(code.seed, code.kit);
  const report: RunReport = {
    id: code.id, mode: code.mode, date: code.date, build: code.build, startedAt: code.startedAt,
    outcome: null, score: 0, carried: 0, depth: 1, turns: 0, activeMin: code.activeMs / 60000,
    stairs: [], ringUses: 0, pagesFound: 0, pagesUsed: 0, damageBy: {}, endedBy: null,
    feedback: code.feedback, valid: true,
  };
  let lastHitBy: string | null = null;

  for (const action of code.actions) {
    const names = new Map(state.floor.enemies.map((e) => [e.id, enemyType(kit, e.type).name]));
    const result = step(state, action);
    if (!result.ok) { report.valid = false; break; }

    if (state.phase === 'stairs') {
      const visit = report.stairs[report.stairs.length - 1];
      if (visit) visit.choice = action.type === 'descend' ? 'descend' : 'bank';
    }
    let attacker: string | null = null;
    for (const ev of result.events) {
      if (ev.type === 'spawn') names.set(ev.id, kit.hunter.name);
      if (ev.type === 'attack' && ev.by !== 'player') attacker = names.get(ev.by) ?? 'unknown';
      if (ev.type === 'playerHurt') {
        const by = attacker ?? 'unknown';
        report.damageBy[by] = (report.damageBy[by] ?? 0) + ev.amount;
        lastHitBy = by;
      }
      if (ev.type === 'ring') report.ringUses++;
      if (ev.type === 'pickup' && ev.kind === 'page') report.pagesFound++;
      if (ev.type === 'page') report.pagesUsed++;
      if (ev.type === 'stairs') {
        const p = result.state.player;
        report.stairs.push({
          depth: result.state.depth, oil: p.oil, hearts: p.hearts, carried: p.carried,
          choice: result.state.depth >= config.run.floors ? 'escaped' : 'none',
        });
      }
    }
    state = result.state;
  }

  report.depth = state.depth;
  report.turns = state.turn;
  report.carried = state.player.carried;
  if (state.outcome) {
    report.outcome = state.outcome.kind;
    report.score = state.outcome.score;
    if (state.outcome.kind === 'died') report.endedBy = lastHitBy;
    if (state.outcome.kind === 'lampOut') report.endedBy = 'lamp';
  }
  return report;
}

export interface Target {
  name: string;
  value: string;
  goal: string;
  met: boolean | null;
}

export interface Summary {
  runs: number;
  finished: number;
  invalid: number;
  targets: Target[];
  outcomes: Record<string, number>;
  bankFloors: Record<number, number>;
  endedBy: Record<string, number>;
  feel: Record<string, number>;
  trend: { firstHalf: number; secondHalf: number } | null;
}

const pct = (n: number) => `${Math.round(n * 100)}%`;
const count = (map: Record<string | number, number>, key: string | number) => { map[key] = (map[key] ?? 0) + 1; };

export function summarise(reports: RunReport[]): Summary {
  const done = reports.filter((r) => r.valid && r.outcome);
  const s: Summary = {
    runs: reports.length, finished: done.length, invalid: reports.filter((r) => !r.valid).length,
    targets: [], outcomes: {}, bankFloors: {}, endedBy: {}, feel: {}, trend: null,
  };
  for (const r of done) {
    count(s.outcomes, r.outcome!);
    if (r.outcome === 'banked' || r.outcome === 'escaped') count(s.bankFloors, r.depth);
    if (r.endedBy) count(s.endedBy, r.endedBy);
    if (r.feedback.feel) count(s.feel, r.feedback.feel);
  }

  const deaths = done.filter((r) => (r.outcome === 'died' || r.outcome === 'lampOut') && r.feedback.fault);
  const mine = deaths.filter((r) => r.feedback.fault === 'mine').length;
  s.targets.push({
    name: 'Deaths feel fair', goal: '≥ 80% "my fault"',
    value: deaths.length ? `${pct(mine / deaths.length)} of ${deaths.length}` : 'no answers yet',
    met: deaths.length ? mine / deaths.length >= 0.8 : null,
  });

  const minutes = done.map((r) => r.activeMin).sort((a, b) => a - b);
  const median = minutes.length ? minutes[Math.floor(minutes.length / 2)] : 0;
  s.targets.push({
    name: 'Run length', goal: 'median 5 to 10 minutes',
    value: minutes.length ? `${median.toFixed(1)} min` : 'no runs', met: minutes.length ? median >= 5 && median <= 10 : null,
  });

  const banked = done.filter((r) => r.outcome === 'banked' || r.outcome === 'escaped');
  const floors = new Set(banked.map((r) => r.depth));
  s.targets.push({
    name: 'Bank decision is real', goal: 'banks spread over 3+ different floors',
    value: banked.length ? `${banked.length} banked across ${floors.size} floor${floors.size === 1 ? '' : 's'}` : 'no banks yet',
    met: banked.length >= 3 ? floors.size >= 3 : null,
  });

  const ringRuns = done.filter((r) => r.ringUses > 0).length;
  const ringShare = done.length ? ringRuns / done.length : 0;
  s.targets.push({
    name: 'Ring is tempting', goal: 'used in some runs, not all (20% to 80%)',
    value: done.length ? `${pct(ringShare)} of runs` : 'no runs', met: done.length >= 5 ? ringShare >= 0.2 && ringShare <= 0.8 : null,
  });

  const found = done.reduce((n, r) => n + r.pagesFound, 0);
  const used = done.reduce((n, r) => n + r.pagesUsed, 0);
  s.targets.push({
    name: 'Pages get used', goal: '≥ 70% used before they crumble',
    value: found ? `${used} of ${found} (${pct(used / found)})` : 'none found', met: found >= 5 ? used / found >= 0.7 : null,
  });

  const ordered = [...done].sort((a, b) => a.startedAt - b.startedAt);
  if (ordered.length >= 6) {
    const half = Math.floor(ordered.length / 2);
    const mean = (rs: RunReport[]) => rs.reduce((n, r) => n + r.score, 0) / rs.length;
    s.trend = { firstHalf: mean(ordered.slice(0, half)), secondHalf: mean(ordered.slice(half)) };
    s.targets.push({
      name: 'Skill shows', goal: 'scores rise over the window',
      value: `${s.trend.firstHalf.toFixed(1)} → ${s.trend.secondHalf.toFixed(1)} mean score`,
      met: s.trend.secondHalf > s.trend.firstHalf,
    });
  }
  return s;
}

/** Plain-text report for a chat reply. */
export function formatSummary(s: Summary, reports: RunReport[]): string {
  const lines: string[] = [];
  lines.push(`${s.finished} finished runs (${s.runs} codes${s.invalid ? `, ${s.invalid} didn't replay` : ''})`);
  lines.push('');
  for (const t of s.targets) {
    const mark = t.met === null ? '…' : t.met ? '✓' : '✗';
    lines.push(`${mark} ${t.name}: ${t.value}  (goal: ${t.goal})`);
  }
  const fmt = (m: Record<string | number, number>) => Object.entries(m).map(([k, v]) => `${k} ${v}`).join(', ') || 'none';
  lines.push('');
  lines.push(`Outcomes: ${fmt(s.outcomes)}`);
  lines.push(`Banked on floor: ${fmt(s.bankFloors)}`);
  lines.push(`Ended by: ${fmt(s.endedBy)}`);
  lines.push(`Felt: ${fmt(s.feel)}`);
  lines.push('');
  for (const r of [...reports].sort((a, b) => a.startedAt - b.startedAt)) {
    const stairs = r.stairs.map((v) => `F${v.depth}:${v.oil}oil/${v.hearts}♥/${v.carried}◆→${v.choice[0]}`).join(' ');
    lines.push(`${r.id} ${r.outcome ?? 'unfinished'} ◆${r.score}/${r.carried} floor ${r.depth} ${r.turns}t ${r.activeMin.toFixed(1)}m ring×${r.ringUses} pages ${r.pagesUsed}/${r.pagesFound}${r.endedBy ? ` ended by ${r.endedBy}` : ''} | ${stairs}`);
  }
  return lines.join('\n');
}
