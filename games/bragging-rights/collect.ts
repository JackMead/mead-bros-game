import type { RunRecord } from './daily';
import { runCode } from './runcode';

/**
 * Sends finished runs to the playtest log when the game runs as a Claude artifact with
 * shared storage. Anywhere else it quietly does nothing and the run code can be copied
 * by hand instead. Nothing in the game depends on this.
 */

interface Store {
  collection(path: string): { doc(id: string): { set(data: Record<string, unknown>): Promise<void> } };
}
interface Host {
  use?: (name: string) => Promise<unknown>;
}

let storePromise: Promise<Store | null> | null = null;

function store(): Promise<Store | null> {
  if (!storePromise) {
    const host = (window as unknown as { claude?: Host }).claude;
    storePromise = host?.use
      ? host.use('db').then((db) => (db as Store | null) ?? null).catch(() => null)
      : Promise.resolve(null);
  }
  return storePromise;
}

export async function canCollect(): Promise<boolean> {
  return (await store()) !== null;
}

/** Send one finished run. Resolves true once it is stored. */
export async function submitRun(run: RunRecord): Promise<boolean> {
  const db = await store();
  if (!db) return false;
  const body = {
    code: runCode(run), id: run.id, mode: run.mode, date: run.date, slot: run.slot,
    outcome: run.outcome, score: run.score, depth: run.depth, turns: run.turns,
    activeMs: run.activeMs, feedback: run.feedback, submittedAt: Date.now(),
  };
  try {
    await db.collection('runs').doc(run.id).set(JSON.parse(JSON.stringify(body)));
    return true;
  } catch {
    return false;
  }
}
