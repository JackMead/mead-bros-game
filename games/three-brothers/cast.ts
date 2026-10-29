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
  /**
   * Painted figure in art/ (cut from docs/three-brothers/reference/brothers.webp).
   * `neck` is how far down the picture (0 to 1) the head ends, so the head can
   * move separately when he talks.
   */
  sprite?: { file: string; neck: number };
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
      skin: '#efc39c',
      hair: '#8a5c36',
      hairStyle: 'short',
      top: '#24201e',
      legs: { colour: '#36578a', style: 'jeans' },
      shoes: '#2b3554',
      build: 1.05,
    },
    sprite: { file: 'rob.png', neck: 0.2 },
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
      skin: '#ebbf98',
      hair: '#3f2a1c',
      hairStyle: 'mid',
      top: '#6e4256',
      legs: { colour: '#5e5a38', style: 'shorts' },
      shoes: '#38373a',
      build: 0.85,
      stubble: true,
    },
    sprite: { file: 'jack.png', neck: 0.226 },
    height: 1.09,
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
      skin: '#eebf98',
      hair: '#a87a3c',
      hairStyle: 'shaggy',
      top: '#4b6d63',
      legs: { colour: '#77736f', style: 'joggers' },
      shoes: '#ebe6d8',
      build: 1,
      beard: '#8c5f30',
      glasses: true,
      backpack: '#f2cc2f',
    },
    sprite: { file: 'phil.png', neck: 0.222 },
    height: 1.07,
    look: 'Phil. The youngest. Table tennis ace. Hands and feet permanently freezing.',
    fallback: [
      "Me: Nah. I'll stick to table tennis.",
      "Me: Nope. Can we go somewhere with a radiator?",
      "Me: If it was a ping-pong ball, maybe.",
    ],
  },
};
