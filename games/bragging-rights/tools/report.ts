/**
 * Playtest report: replay run codes and measure them against the targets.
 *   npm run bragging:report -- runs.json
 * The path can be a folder of saved run documents (read recursively), or any file
 * containing run codes: JSON, or plain text with one code per line.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { analyseRun, formatSummary, summarise } from '../analyse';
import { parseRunCode } from '../runcode';

const path = process.argv.at(-1)!;
const readAll = (p: string): string => statSync(p).isDirectory()
  ? readdirSync(p).map((f) => readAll(join(p, f))).join('\n')
  : readFileSync(p, 'utf8');
const text = readAll(path);
const codes = (text.match(/BR1\.[A-Za-z0-9_-]+/g) ?? []);
const unique = [...new Map(codes.map((c) => { const d = parseRunCode(c); return [d.id, d]; })).values()];
const build = process.env.BUILD;
const runs = build ? unique.filter((d) => d.build === build) : unique;
const reports = runs.map(analyseRun);
console.log(formatSummary(summarise(reports), reports));
