import type { PageKind } from './types';

export interface PageInfo {
  name: string;
  help: string;
  glyph: string;
}

export const PAGES: Record<PageKind, PageInfo> = {
  shove: { name: 'Shove', glyph: '⇥', help: 'Push a neighbouring enemy three squares and daze it for 2 turns. Slamming into a wall or another enemy does 2 damage; chasms swallow it.' },
  swap: { name: 'Swap', glyph: '⇄', help: 'Trade places with an enemy up to 4 squares away. Its attack still lands where it was aimed.' },
  ward: { name: 'Ward', glyph: '▣', help: 'Raise a wall on a neighbouring empty square and daze every enemy next to you for 2 turns. Blocks arrows and charges.' },
  blink: { name: 'Blink', glyph: '✦', help: 'Jump to an empty square up to 4 squares away. Telegraphed attacks hit where you were.' },
};
