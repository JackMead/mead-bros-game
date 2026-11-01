import ParWorker from './par.worker?worker&inline';
import type { ParRecord } from './daily';

/** Ask the background worker for a dungeon's par. One search at a time; repeats are shared. */
let worker: Worker | null = null;
const pending = new Map<number, Promise<ParRecord | null>>();

export function requestPar(seed: number, kit: string): Promise<ParRecord | null> {
  const existing = pending.get(seed);
  if (existing) return existing;
  const promise = new Promise<ParRecord | null>((resolve) => {
    try {
      worker ??= new ParWorker();
      const w = worker;
      const onMessage = (e: MessageEvent<{ seed: number; score: number; depth: number }>) => {
        if (e.data.seed !== seed) return;
        w.removeEventListener('message', onMessage);
        resolve({ score: e.data.score, depth: e.data.depth });
      };
      w.addEventListener('message', onMessage);
      w.addEventListener('error', () => resolve(null), { once: true });
      w.postMessage({ seed, kit });
    } catch {
      resolve(null); // No workers here: skip par rather than freeze the game.
    }
  });
  pending.set(seed, promise);
  return promise;
}
