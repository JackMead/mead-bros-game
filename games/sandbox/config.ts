/** Global tunables. Keep magic numbers here rather than scattered through the code. */
export const config = {
  width: 640,
  height: 360,
  /** Seconds per simulation tick (60 updates per second). */
  fixedStep: 1 / 60,
  player: {
    size: 16,
    speed: 160, // pixels per second
    color: '#f4c542',
  },
  background: '#1d2433',
} as const;
