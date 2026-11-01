import { config } from './config';
import { findPar } from './solver';

/** Finds a dungeon's par off the main thread, so the game stays smooth while it searches. */
const scope = self as unknown as {
  onmessage: ((e: MessageEvent<{ seed: number; kit: string }>) => void) | null;
  postMessage(message: unknown): void;
};

scope.onmessage = (e) => {
  const { seed, kit } = e.data;
  const par = findPar(seed, { beam: config.par.beam }, kit);
  scope.postMessage({ seed, score: par.score, depth: par.depth });
};
