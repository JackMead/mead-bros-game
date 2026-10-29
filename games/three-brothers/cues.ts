/**
 * Cinematic cues: lines in `intro`, `ending` or `say` written in square brackets,
 * e.g. "[shake 1]" or "[pull rob]". They play in order with the dialogue; the text
 * version of the game skips them. What each one looks like is drawn in `cinema.ts`.
 *
 * Arguments are space-separated. A cue holds up the next line for `seconds`.
 */
export interface CueDef {
  /** What the arguments are, for docs and error messages. */
  usage: string;
  /** Number of arguments. */
  arity: number;
  /** How long it holds up the next line. */
  seconds: (args: string[]) => number;
}

export const CUES: Record<string, CueDef> = {
  wait: { usage: 'wait <seconds>', arity: 1, seconds: (a) => Number(a[0]) },
  shake: { usage: 'shake <seconds>: shake the screen (carries on under the next line)', arity: 1, seconds: () => 0 },
  flash: { usage: 'flash: white flash', arity: 0, seconds: () => 0.6 },
  freeze: { usage: 'freeze: animated scenery (water, animals) stops dead', arity: 0, seconds: () => 0 },
  awaken: {
    usage: 'awaken <hotspot> <dx> <dy>: a glowing spirit steps out of a hotspot with an `outline`, moving dx, dy',
    arity: 3,
    seconds: () => 3.6,
  },
  'turn-head': { usage: 'turn-head <x> <y> <radius>: something painted turns its head, eyes glowing', arity: 3, seconds: () => 0.4 },
  vortex: { usage: 'vortex <x> <y>: a time vortex opens', arity: 2, seconds: () => 1.2 },
  pull: { usage: 'pull <brother>: a brother is sucked into the vortex', arity: 1, seconds: () => 1.3 },
  streaks: { usage: 'streaks: one streak of light per vanished brother shoots off from the vortex', arity: 0, seconds: () => 1.5 },
  place: { usage: 'place <icon> <x> <y> <size>: leave an item icon lying in the scene', arity: 4, seconds: () => 0 },
  clear: { usage: 'clear: end the effects (vortex, spirit, frozen time); vanished brothers stay gone', arity: 0, seconds: () => 0 },
};

/** "[pull rob]" -> { name: "pull", args: ["rob"] }, or null if the text isn't a cue. */
export function parseCue(text: string): { name: string; args: string[] } | null {
  const m = /^\[([a-z-]+)((?: [^\]\s]+)*)\]$/.exec(text.trim());
  if (!m) return null;
  return { name: m[1], args: m[2].trim() ? m[2].trim().split(/\s+/) : [] };
}
