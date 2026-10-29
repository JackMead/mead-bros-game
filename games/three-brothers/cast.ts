import type { BrotherId } from './types';

export interface Appearance {
  skin: string;
  hair: string;
  hairStyle: 'short' | 'mid' | 'shaggy';
  top: string;
  /** Jeans, shorts (bare knees) or joggers. */
  legs: { colour: string; style: 'jeans' | 'shorts' | 'joggers' };
  shoes: string;
  /** 1 is average; below 1 is slighter. */
  build: number;
  stubble?: boolean;
  beard?: string;
  glasses?: boolean;
  backpack?: string;
}

export interface Brother {
  name: string;
  colour: string;
  /** How he's drawn until there's art (see characters.ts). He describes himself. */
  appearance: Appearance;
  /** Drawn height relative to an average brother. */
  height: number;
  look: string;
  /** Said, in turn, when nothing else happens. Personality lives here. */
  fallback: string[];
}

/**
 * The three brothers, shared by every chapter. Each brother owns his own entry:
 * change your lines here, not in someone else's chapter.
 * See docs/three-brothers/story-bible.md.
 */
export const cast: Record<BrotherId, Brother> = {
  rob: {
    name: 'Rob',
    colour: '#e8a33d',
    appearance: {
      skin: '#f2c9a5',
      hair: '#9a6b42',
      hairStyle: 'short',
      top: '#26262b',
      legs: { colour: '#3d5f92', style: 'jeans' },
      shoes: '#3a2b22',
      build: 1.05,
    },
    height: 1.18,
    look: 'Rob. The eldest and the tallest. He has brought his soapbox. He always brings his soapbox.',
    fallback: [
      "Me: That's typical, that is. Don't get me started.",
      "Me: I've got opinions about that, but now's not the time.",
      "Me: No. And I'll tell you exactly why... actually, later.",
    ],
  },
  jack: {
    name: 'Jack',
    colour: '#5fb3d9',
    appearance: {
      skin: '#eec29d',
      hair: '#4a2f1f',
      hairStyle: 'mid',
      top: '#3c97b4',
      legs: { colour: '#b39a6c', style: 'shorts' },
      shoes: '#e9e4da',
      build: 0.85,
      stubble: true,
    },
    height: 1,
    look: 'Jack. Does sums for fun. Vegetarian, and will mention it.',
    fallback: [
      "Me: The odds of that working are roughly zero. I've checked.",
      "Me: That doesn't add up.",
      "Me: No. Show your working, Jack. Fine: no.",
    ],
  },
  phil: {
    name: 'Phil',
    colour: '#8bc46a',
    appearance: {
      skin: '#f0c6a2',
      hair: '#ad8752',
      hairStyle: 'shaggy',
      top: '#5f9e4c',
      legs: { colour: '#7c7f88', style: 'joggers' },
      shoes: '#2f3a52',
      build: 1,
      beard: '#9a7546',
      glasses: true,
      backpack: '#f2cc2f',
    },
    height: 1,
    look: 'Phil. The youngest. Table tennis ace. Hands and feet permanently freezing.',
    fallback: [
      "Me: Nah. I'll stick to table tennis.",
      "Me: Nope. Can we go somewhere with a radiator?",
      "Me: If it was a ping-pong ball, maybe.",
    ],
  },
};
