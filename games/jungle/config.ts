/** Tunables for the jungle. Distances are in metres, times in seconds. */
export const config = {
  fixedStep: 1 / 60,
  world: {
    /** Width of one square terrain chunk. */
    chunkSize: 48,
    /** Grid resolution of each chunk's ground mesh. */
    chunkSegments: 24,
    /** How many chunks to keep loaded in each direction around the player. */
    viewRadius: 3,
    /** Limit on new chunks generated per tick, so walking doesn't stutter. A chunk takes a few ms to build. */
    chunksPerTick: 1,
    waterLevel: -3,
  },
  vegetation: {
    /** Random spots tried per chunk for a tree; density noise decides how many succeed. */
    treeAttempts: 70,
    /** Random spots tried per chunk for ferns, bushes, flowers and rocks. */
    undergrowthAttempts: 240,
    /** Share of ordinary broadleaf trees that bear fruit instead. */
    fruitTreeShare: 0.25,
  },
  waterfalls: {
    /** Spots tried per chunk; the steepest good one becomes the chunk's waterfall. */
    attempts: 12,
    /** Shortest drop worth calling a waterfall, in metres. */
    minDrop: 8,
    /** Gentlest average slope (drop over distance) that still counts. Higher means fewer, steeper falls. */
    minSteepness: 1,
    /** Longest a fall can be, measured along the ground. */
    maxLength: 30,
    /** Open water needed in front of a fall, so it isn't hidden in a narrow gorge. */
    minPool: 8,
    /** How fast the water streaks slide down, m/s. */
    flowSpeed: 6,
  },
  fruit: {
    /** Fruit trees within this distance of the player can drop fruit. */
    radius: 40,
    /** Chance per second that a given fruit tree drops a fruit. */
    dropChance: 0.04,
    /** Seconds fallen fruit lies on the ground before it's gone. */
    lifetime: 40,
    /** Most fruit on the ground at once. */
    maxFallen: 60,
  },
  creatures: {
    /** Chunks around the player with animals in. Fewer than world.viewRadius: far ones are lost in the fog. */
    viewRadius: 2,
    /** Multiplies every species' abundance. */
    abundance: 1,
    /** Most animals of one species drawn at once. */
    maxPerSpecies: 300,
    /** How far grazers and fish stray from where they spawned before heading back. */
    leash: 25,
    /** How high flocks fly above the ground or water. Trees reach about 20 m. */
    birdAltitude: 28,
    /** How fast flocks drift across the sky, m/s. */
    flockDrift: 1.5,
    /** How high solo birds fly over clearings; over thick jungle they go up to 2.4 times higher. */
    soloBirdAltitude: 9,
    /** Chance per second that a fish leaps out of the water. */
    fishJumpChance: 0.04,
    /** How close an animal must be to show its name when you look at it. Birds count from twice as far. */
    spotDistance: 30,
  },
  player: {
    eyeHeight: 1.7,
    radius: 0.4,
    walkSpeed: 6,
    sprintSpeed: 11,
    swimFactor: 0.5,
    jumpSpeed: 7,
    gravity: 22,
    /** Radians of turn per pixel of mouse movement. */
    lookSensitivity: 0.0022,
  },
  atmosphere: {
    /** Warm, humid haze. Also the fog colour, so distant trees fade into it. */
    sky: 0xc2d9b0,
    fogNear: 25,
    fogFar: 140,
    underwater: 0x1f4d47,
    water: 0x2e7466,
    /** Hemisphere light: sky colour from above, bounced forest-floor colour from below. */
    ambientSky: 0xeef7d8,
    ambientGround: 0x3b4a1a,
    ambientIntensity: 1.3,
    sun: 0xffe3b3,
    sunIntensity: 2.6,
  },
} as const;
