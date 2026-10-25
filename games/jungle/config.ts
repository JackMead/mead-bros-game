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
    /** Limit on new chunks generated per tick, so walking doesn't stutter. */
    chunksPerTick: 2,
    waterLevel: -3,
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
    sky: 0xa9c9b4,
    fogNear: 20,
    fogFar: 135,
    underwater: 0x1f4d47,
    water: 0x3d6e5c,
  },
} as const;
