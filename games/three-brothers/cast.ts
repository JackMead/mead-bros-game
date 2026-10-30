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

/** An arm cut out of a painted figure so it can swing: outline and shoulder, in picture pixels. */
export interface Arm {
  outline: number[];
  pivot: [number, number];
}

export interface Sprite {
  file: string;
  /** How far down the picture (0 to 1) the head ends, so the head can move on its own. */
  neck: number;
  /** The same picture with his mouth open, swapped in at the head while he talks. */
  talk?: string;
  /** Arms as they appear on screen: left and right of the picture. */
  arms?: { left: Arm; right: Arm };
  /**
   * Painted poses, cycled while a stand's `pose` is set (e.g. "rant"). Each picture is
   * cut at the same scale as `file` (head to feet the same height), and `feetX` is
   * where his feet are, across the picture.
   */
  poses?: Record<string, { file: string; feetX: number }[]>;
  /** Other clothes a chapter can put him in (a stand's `outfit`): a whole painted figure each. */
  outfits?: Record<string, Sprite>;
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
  sprite?: Sprite;
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
    sprite: {
      file: 'rob.png',
      talk: 'rob-talk.png',
      neck: 0.2,
      poses: {
        rant: [
          { file: 'rob-rant-up.png', feetX: 102 },
          { file: 'rob-rant-wide.png', feetX: 183 },
          { file: 'rob-rant-jab.png', feetX: 124 },
        ],
      },
      arms: {
        left: { pivot: [19, 104], outline: [3, 105, 15, 92, 30, 92, 32, 110, 31, 140, 31, 175, 31, 215, 30, 262, 4, 262, 0, 215, 1, 140, 1, 120] },
        right: { pivot: [125, 104], outline: [141, 105, 129, 92, 114, 92, 112, 110, 113, 140, 113, 175, 113, 215, 114, 262, 140, 262, 144, 215, 143, 140, 143, 120] },
      },
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
      skin: '#ebbf98',
      hair: '#3f2a1c',
      hairStyle: 'mid',
      top: '#6e4256',
      legs: { colour: '#5e5a38', style: 'shorts' },
      shoes: '#38373a',
      build: 0.85,
      stubble: true,
    },
    sprite: {
      file: 'jack.png',
      talk: 'jack-talk.png',
      neck: 0.226,
      arms: {
        left: { pivot: [22, 104], outline: [8, 105, 18, 90, 28, 90, 30, 110, 31, 135, 32, 180, 32, 215, 30, 250, 5, 250, 4, 215, 8, 170, 9, 135] },
        right: { pivot: [106, 104], outline: [113, 105, 104, 90, 96, 90, 98, 110, 99, 135, 99, 180, 99, 215, 101, 250, 118, 250, 120, 215, 117, 170, 116, 135] },
      },
    },
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
    sprite: {
      file: 'phil.png',
      talk: 'phil-talk.png',
      neck: 0.222,
      outfits: { '1890': { file: 'phil-1890.png', talk: 'phil-1890-talk.png', neck: 0.222 } },
      arms: {
        left: { pivot: [17, 102], outline: [5, 105, 14, 88, 26, 88, 28, 110, 29, 135, 30, 180, 31, 215, 30, 245, 3, 245, 2, 215, 5, 170, 5, 135] },
        right: { pivot: [113, 102], outline: [125, 105, 116, 88, 104, 88, 101, 110, 100, 135, 99, 180, 99, 215, 100, 245, 127, 245, 128, 215, 124, 170, 124, 135] },
      },
    },
    height: 1.07,
    look: 'Phil. The youngest. Table tennis ace. Hands and feet permanently freezing.',
    fallback: [
      "Me: Nah. I'll stick to table tennis.",
      "Me: Nope. Can we go somewhere with a radiator?",
      "Me: If it was a ping-pong ball, maybe.",
    ],
  },
};
