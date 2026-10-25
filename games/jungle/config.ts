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
