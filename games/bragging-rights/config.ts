/** Global tunables. Keep magic numbers here rather than scattered through the code. */
export const config = {
  grid: { width: 7, height: 9 },
  run: {
    floors: 8,
    playsPerDay: 3,
    /** Share of carried relics kept when a run ends in death or lamp-out. */
    deathKeepShare: 0.25,
  },
  player: {
    hearts: 5,
    oil: 110,
    oilPerTurn: 1,
    attack: 1,
    pageSlots: 2,
    /** Hearts regained on reaching the stairs. */
    heartsPerFloor: 1,
  },
  ring: {
    invisibleTurns: 3,
    maxHuntersPerFloor: 3,
  },
  pages: {
    shoveDistance: 2,
    swapRange: 4,
    blinkRange: 3,
  },
  ranges: {
    archer: 5,
    charger: 6,
  },
  gen: {
    attempts: 60,
    /** Enemies never start within this many squares of the player. */
    safeRadius: 3,
    minReachableShare: 0.6,
    budget: { base: 1.5, perDepth: 1.25 },
    maxEnemies: 8,
    relics: { base: 2, perDepth: 1 / 3 },
    oil: { chance: 0.6, value: 12 },
    pages: { chance: 0.9, extraChance: 0.35 },
  },
  ui: {
    holdMs: 350,
    /** How quickly pieces slide to their new square (higher is snappier). */
    moveLerp: 20,
    maxDarkness: 0.5,
  },
  storageKey: 'bragging-rights:v1',
  /** Par search width: wider finds better lines but takes longer (about 3s on a laptop at 30). */
  par: { beam: 30 },
  /** Bump when rules or numbers change, so playtest runs from different builds aren't mixed up. */
  build: 'v0.3',
  /**
   * Rules chosen by machine playtest (see docs). Defaults are the rules as played;
   * the others stay switchable so they can be compared again later.
   */
  experiments: {
    /** How melee enemies strike: the square you're on, a 'lunge' through it, or every square in 'reach'. */
    melee: 'square' as 'square' | 'lunge' | 'reach',
    /** Stepping out of reach of an enemy that is about to strike you gives it a free hit. On since v0.3. */
    disengage: true as boolean,
  },
} as const;
