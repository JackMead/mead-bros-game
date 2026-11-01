import { config } from './config';
import type { Feedback, RunMode, RunRecord } from './daily';
import type { Action } from './types';

/**
 * A run code is a whole run in one pasteable string: seed, every action and the post-run
 * answers. Because the rules are deterministic, replaying it rebuilds the run exactly.
 * Used for playtest analysis now and, in v1, for the server to check scores.
 */

const PREFIX = 'BR1.';

/** Moves laid out like a phone keypad: 7 8 9 / 4 5 6 / 1 2 3, with 5 for wait. */
const MOVE_CHARS: Record<string, string> = {
  '-1,-1': '7', '0,-1': '8', '1,-1': '9', '-1,0': '4', '1,0': '6', '-1,1': '1', '0,1': '2', '1,1': '3',
};
const CHAR_MOVES = Object.fromEntries(Object.entries(MOVE_CHARS).map(([k, v]) => [v, k.split(',').map(Number)]));

export function encodeActions(actions: readonly Action[]): string {
  return actions.map((a) => {
    switch (a.type) {
      case 'move': return MOVE_CHARS[`${a.dx},${a.dy}`];
      case 'wait': return '5';
      case 'ring': return 'r';
      case 'bank': return 'b';
      case 'descend': return 'd';
      case 'page': return `p${a.slot}${a.x.toString(36)}${a.y.toString(36)}`;
    }
  }).join('');
}

export function decodeActions(s: string): Action[] {
  const out: Action[] = [];
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (CHAR_MOVES[c]) out.push({ type: 'move', dx: CHAR_MOVES[c][0], dy: CHAR_MOVES[c][1] });
    else if (c === '5') out.push({ type: 'wait' });
    else if (c === 'r') out.push({ type: 'ring' });
    else if (c === 'b') out.push({ type: 'bank' });
    else if (c === 'd') out.push({ type: 'descend' });
    else if (c === 'p') {
      out.push({ type: 'page', slot: Number(s[i + 1]), x: parseInt(s[i + 2], 36), y: parseInt(s[i + 3], 36) });
      i += 3;
    } else throw new Error(`Bad run code action '${c}' at ${i}`);
  }
  return out;
}

export interface RunCodeData {
  id: string;
  mode: RunMode;
  date: string;
  slot: number;
  seed: number;
  kit: string;
  actions: Action[];
  feedback: Feedback;
  startedAt: number;
  activeMs: number;
  /** Game version the run was played on, so runs from different builds aren't mixed up. */
  build: string;
}

export function runCode(r: RunRecord): string {
  const body = {
    id: r.id, m: r.mode, d: r.date, s: r.slot, seed: r.seed, k: r.kit,
    a: encodeActions(r.actions), f: r.feedback, t0: r.startedAt, ms: r.activeMs, b: config.build,
  };
  return PREFIX + toBase64Url(JSON.stringify(body));
}

export function parseRunCode(code: string): RunCodeData {
  const trimmed = code.trim();
  if (!trimmed.startsWith(PREFIX)) throw new Error('Not a Bragging Rights run code');
  const b = JSON.parse(fromBase64Url(trimmed.slice(PREFIX.length)));
  return {
    id: b.id, mode: b.m, date: b.d, slot: b.s, seed: b.seed, kit: b.k, actions: decodeActions(b.a),
    feedback: b.f ?? {}, startedAt: b.t0, activeMs: b.ms, build: b.b,
  };
}

function toBase64Url(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (const byte of bytes) bin += String.fromCharCode(byte);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s: string): string {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}
