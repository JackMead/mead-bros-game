/** Global tunables. Keep magic numbers here rather than scattered through the code. */
export const config = {
  /** Logical size in game pixels; scaled to fit the screen. 16:9 for phones and desktops alike. */
  width: 960,
  height: 540,
  /** The scene sits above the bottom bar (brothers and inventory). Hotspots must stay above it. */
  sceneHeight: 456,
  /** Seconds per simulation tick (60 updates per second). */
  fixedStep: 1 / 60,
  /** Hold this long on a touch screen to look instead of use. */
  longPressSeconds: 0.45,
  /** How long a tapped thing's name stays on screen. */
  labelSeconds: 1.6,
  /** Brother figures, in game pixels. Rob is taller (see cast.ts). */
  figure: { width: 46, height: 128 },
  /** Fade from black when a chapter opens. */
  fadeSeconds: 0.6,
  /** Speech over a character's head wraps at this width. */
  speechWidth: 420,
  bar: { portrait: 70, slot: 64, gap: 8 },
  /** The solvability check gives up after this many states (a sign the chapter is far too big). */
  maxSolverStates: 200_000,
  colours: {
    bar: '#1b1712',
    panel: 'rgba(16, 12, 8, 0.88)',
    text: '#f3ead8',
    narration: '#c9bfae',
    highlight: '#f4c542',
    lookMode: '#7fc8f8',
  },
  font: '"Trebuchet MS", "Segoe UI", system-ui, sans-serif',
} as const;
