/** First-person movement and collision. Pure logic: no Three.js, no DOM. */

export interface PlayerState {
  /** Feet position. */
  x: number;
  y: number;
  z: number;
  /** Vertical velocity, metres per second. */
  vy: number;
  /** Turn left/right in radians. 0 faces -Z. */
  yaw: number;
  /** Look up/down in radians. */
  pitch: number;
  onGround: boolean;
}

export interface MoveInput {
  /** -1 (back) to 1 (forward). */
  forward: number;
  /** -1 (left) to 1 (right). */
  right: number;
  sprint: boolean;
  jump: boolean;
}

/** A solid vertical cylinder, e.g. a tree trunk. */
export interface Obstacle {
  x: number;
  z: number;
  r: number;
}

export interface MoveSettings {
  walkSpeed: number;
  sprintSpeed: number;
  swimFactor: number;
  jumpSpeed: number;
  gravity: number;
  radius: number;
  waterLevel: number;
}

export function isSwimming(p: PlayerState, waterLevel: number): boolean {
  return p.y < waterLevel - 0.6;
}

export function stepPlayer(
  p: PlayerState,
  input: MoveInput,
  dt: number,
  groundAt: (x: number, z: number) => number,
  obstacles: readonly Obstacle[],
  s: MoveSettings,
): void {
  let f = input.forward;
  let r = input.right;
  const len = Math.hypot(f, r);
  if (len > 1) {
    f /= len;
    r /= len;
  }

  const swimming = isSwimming(p, s.waterLevel);
  const speed = (input.sprint ? s.sprintSpeed : s.walkSpeed) * (swimming ? s.swimFactor : 1);
  const sin = Math.sin(p.yaw);
  const cos = Math.cos(p.yaw);
  // Forward is (-sin, -cos) and right is (cos, -sin) on the XZ plane.
  p.x += (-sin * f + cos * r) * speed * dt;
  p.z += (-cos * f - sin * r) * speed * dt;
  pushOutOfObstacles(p, s.radius, obstacles);

  if (input.jump && (p.onGround || swimming)) {
    p.vy = swimming ? s.jumpSpeed * 0.6 : s.jumpSpeed;
    p.onGround = false;
  }
  const wasGrounded = p.onGround;

  p.vy -= s.gravity * dt;
  p.y += p.vy * dt;

  const ground = groundAt(p.x, p.z);
  // Snap to the ground when landing, or when walking downhill so we don't bounce off slopes.
  if (p.y <= ground || (wasGrounded && p.vy <= 0 && p.y - ground < 0.6)) {
    p.y = ground;
    p.vy = 0;
    p.onGround = true;
  } else {
    p.onGround = false;
  }
}

export function pushOutOfObstacles(p: { x: number; z: number }, radius: number, obstacles: readonly Obstacle[]): void {
  for (const o of obstacles) {
    const dx = p.x - o.x;
    const dz = p.z - o.z;
    const min = o.r + radius;
    const d2 = dx * dx + dz * dz;
    if (d2 >= min * min) continue;
    const d = Math.sqrt(d2);
    if (d < 1e-6) {
      p.x = o.x + min;
    } else {
      p.x = o.x + (dx / d) * min;
      p.z = o.z + (dz / d) * min;
    }
  }
}
