import type { PageKind } from './types';

export interface PageInfo {
  name: string;
  help: string;
  glyph: string;
}

export const PAGES: Record<PageKind, PageInfo> = {
  shove: { name: 'Shove', glyph: '⇥', help: 'Push a neighbouring enemy two squares and daze it. Walls hurt it; chasms swallow it.' },
  swap: { name: 'Swap', glyph: '⇄', help: 'Trade places with an enemy up to 4 squares away. Its attack still lands where it was aimed.' },
  ward: { name: 'Ward', glyph: '▣', help: 'Raise a wall on a neighbouring empty square. Blocks arrows and charges.' },
  blink: { name: 'Blink', glyph: '✦', help: 'Jump to an empty square up to 3 squares away.' },
};
