import type { EnemyType, FloorKit } from '../kit';
import { longRoad } from './longRoad';

const KITS: Record<string, FloorKit> = {
  [longRoad.id]: longRoad,
};

export const DEFAULT_KIT = longRoad.id;

export function getKit(id: string): FloorKit {
  const kit = KITS[id];
  if (!kit) throw new Error(`Unknown floor kit: ${id}`);
  return kit;
}

export function allKits(): FloorKit[] {
  return Object.values(KITS);
}

export function enemyType(kit: FloorKit, id: string): EnemyType {
  if (id === kit.hunter.id) return kit.hunter;
  const t = kit.enemies.find((e) => e.id === id);
  if (!t) throw new Error(`Unknown enemy type ${id} in kit ${kit.id}`);
  return t;
}
