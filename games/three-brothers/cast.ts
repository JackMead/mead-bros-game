import type { BrotherId } from './types';

export interface Brother {
  name: string;
  colour: string;
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
    height: 1,
    look: 'Phil. The youngest. Table tennis ace. Hands and feet permanently freezing.',
    fallback: [
      "Me: I'd rather not. My hands are like ice.",
      "Me: Nope. Can we go somewhere with a radiator?",
      "Me: If it was a ping-pong ball, maybe.",
    ],
  },
};
