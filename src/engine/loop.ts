export interface LoopOptions {
  /** Fixed simulation step in seconds. */
  step: number;
  update: (dt: number) => void;
  render: () => void;
}

/**
 * Fixed-timestep game loop: the simulation always advances in equal steps,
 * so gameplay behaves the same regardless of the display's frame rate.
 * Returns a function that stops the loop.
 */
export function startLoop({ step, update, render }: LoopOptions): () => void {
  let last = performance.now();
  let acc = 0;
  let rafId = 0;
  const maxFrame = 0.25; // avoid a "spiral of death" after a tab is backgrounded

  const frame = (now: number) => {
    acc += Math.min((now - last) / 1000, maxFrame);
    last = now;
    while (acc >= step) {
      update(step);
      acc -= step;
    }
    render();
    rafId = requestAnimationFrame(frame);
  };

  rafId = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(rafId);
}
