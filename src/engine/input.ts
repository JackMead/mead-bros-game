/** Tracks which keys are currently held, keyed by `KeyboardEvent.code` (e.g. "KeyW", "ArrowLeft"). */
export class Input {
  private held = new Set<string>();

  constructor(target: Window) {
    target.addEventListener('keydown', (e) => this.held.add(e.code));
    target.addEventListener('keyup', (e) => this.held.delete(e.code));
    target.addEventListener('blur', () => this.held.clear());
  }

  isDown(...codes: string[]): boolean {
    return codes.some((c) => this.held.has(c));
  }

  /** -1, 0 or 1 on each axis from WASD / arrow keys. */
  axis(): { x: number; y: number } {
    const x = Number(this.isDown('KeyD', 'ArrowRight')) - Number(this.isDown('KeyA', 'ArrowLeft'));
    const y = Number(this.isDown('KeyS', 'ArrowDown')) - Number(this.isDown('KeyW', 'ArrowUp'));
    return { x, y };
  }
}
