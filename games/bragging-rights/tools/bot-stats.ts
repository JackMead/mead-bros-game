/**
 * Balance check: let the simple bot play many seeds and print how its runs went.
 *   npx vite-node games/bragging-rights/tools/bot-stats.ts -- 500
 */
import { botRun } from '../bot';
import { newRun } from '../sim';

const runs = Number(process.argv.at(-1)) || 300;
const depths = new Map<number, number>();
const outcomes = new Map<string, number>();
let score = 0;
let turns = 0;
for (let seed = 1; seed <= runs; seed++) {
  const { state } = botRun(newRun(seed * 2654435761));
  depths.set(state.depth, (depths.get(state.depth) ?? 0) + 1);
  outcomes.set(state.outcome!.kind, (outcomes.get(state.outcome!.kind) ?? 0) + 1);
  score += state.outcome!.score;
  turns += state.turn;
}
console.log(`runs ${runs}, mean score ${(score / runs).toFixed(1)}, mean turns ${(turns / runs).toFixed(0)}`);
console.log('outcomes', Object.fromEntries(outcomes));
console.log('final depth', Object.fromEntries([...depths].sort((a, b) => a[0] - b[0])));
