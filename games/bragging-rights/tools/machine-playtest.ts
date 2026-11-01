/**
 * Machine playtest: human-like players (limited lookahead, different styles) play many
 * dungeons, and the runs are measured against the same targets as real playtests.
 *
 *   npm run bragging:machine -- [--runs 40] [--horizon 1,2,3] [--personas careful,balanced,greedy]
 *                              [--par] [--set player.oil=130 --set player.hearts=3]
 *
 * --set changes a config number for this run only, to try tuning ideas before a human plays them.
 * --par also searches each dungeon for its best haul and reports scores as a share of par.
 */
import { analyseRun, type RunReport } from '../analyse';
import { config } from '../config';
import { mix } from '../rng';
import { PERSONAS, findPar, playRun } from '../solver';

const args = process.argv.slice(2);
const opt = (name: string, fallback: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const runs = Number(opt('runs', '40'));
const horizons = opt('horizon', '1,2,3').split(',').map(Number);
const personas = opt('personas', 'careful,balanced,greedy').split(',');
const withPar = args.includes('--par');

// Apply --set overrides to the live config (tooling only).
args.forEach((a, i) => {
  if (a !== '--set') return;
  const [path, value] = args[i + 1].split('=');
  const keys = path.split('.');
  let obj = config as unknown as Record<string, unknown>;
  for (const k of keys.slice(0, -1)) obj = obj[k] as Record<string, unknown>;
  obj[keys.at(-1)!] = value === 'true' ? true : value === 'false' ? false : Number.isNaN(Number(value)) ? value : Number(value);
  console.log(`set ${path} = ${value}`);
});

const seeds = Array.from({ length: runs }, (_, i) => mix(0xb2a6, i + 1));
const pars = new Map<number, number>();
if (withPar) {
  const t = performance.now();
  for (const seed of seeds) pars.set(seed, findPar(seed, { beam: 30 }).score);
  console.log(`par searched for ${runs} dungeons in ${((performance.now() - t) / 1000).toFixed(0)}s, mean ${(mean([...pars.values()])).toFixed(1)}`);
}

function mean(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}
const pct = (n: number) => `${Math.round(n * 100)}%`;

console.log(`\n${runs} dungeons per player, build ${config.build}\n`);
console.log('player            escaped  banked  died  lamp   mean◆  %par  bank floors     ring  pages  turns   hits  ended by');
for (const name of personas) {
  for (const horizon of horizons) {
    const reports: RunReport[] = seeds.map((seed, i) => {
      const run = playRun(seed, PERSONAS[name], { horizon, beam: 12 });
      return analyseRun({
        id: `m-${name}-${horizon}-${i}`, mode: 'playtest', date: '', slot: 0, seed, kit: run.state.kitId,
        actions: run.actions, feedback: {}, startedAt: i, activeMs: 0, build: config.build,
      });
    });
    const by = (k: string) => reports.filter((r) => r.outcome === k).length / reports.length;
    const bankFloors: Record<number, number> = {};
    for (const r of reports) if (r.outcome === 'banked') bankFloors[r.depth] = (bankFloors[r.depth] ?? 0) + 1;
    const ended: Record<string, number> = {};
    for (const r of reports) if (r.endedBy) ended[r.endedBy] = (ended[r.endedBy] ?? 0) + 1;
    const found = reports.reduce((n, r) => n + r.pagesFound, 0);
    const used = reports.reduce((n, r) => n + r.pagesUsed, 0);
    const parShare = withPar ? mean(reports.map((r) => r.score / Math.max(1, pars.get(seedsById(r.id))!))) : NaN;
    console.log([
      `${name} h${horizon}`.padEnd(16),
      pct(by('escaped')).padStart(8), pct(by('banked')).padStart(7), pct(by('died')).padStart(5), pct(by('lampOut')).padStart(5),
      mean(reports.map((r) => r.score)).toFixed(1).padStart(7),
      (withPar ? pct(parShare) : '-').padStart(5),
      ' ' + (Object.entries(bankFloors).map(([f, n]) => `${f}:${n}`).join(' ') || '-').padEnd(15),
      pct(reports.filter((r) => r.ringUses > 0).length / reports.length).padStart(5),
      (found ? pct(used / found) : '-').padStart(6),
      mean(reports.map((r) => r.turns)).toFixed(0).padStart(6),
      mean(reports.map((r) => Object.values(r.damageBy).reduce((a, b) => a + b, 0))).toFixed(1).padStart(6),
      ' ' + Object.entries(ended).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(', '),
    ].join(' '));
  }
}

function seedsById(id: string): number {
  return seeds[Number(id.split('-').at(-1))];
}

const oilAt: Record<number, number[]> = {};
console.log(`\nMean oil left at each staircase (balanced, deepest horizon):`);
for (const [i, seed] of seeds.entries()) {
  const run = playRun(seed, PERSONAS.balanced, { horizon: horizons.at(-1)!, beam: 12 });
  if (i >= 15) break;
  for (const s of run.stops) (oilAt[s.depth] ??= []).push(s.oil);
}
console.log(Object.entries(oilAt).map(([d, xs]) => `F${d}: ${mean(xs).toFixed(0)}`).join('  '));
