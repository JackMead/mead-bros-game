/** Animals that live in the trees: lizards on the trunks. Pure logic: no Three.js, no DOM. */
import type { Creature, CreatureSettings } from './creatures';
import { trunkRadiusAt, type Tree } from './plants';
import type { Species } from './species';
import { headingOf, moveForward } from './steering';
import type { Terrain } from './terrain';

/** Where the trees are, so climbing animals can find them. */
export interface TreeSource {
  treesIn(cx: number, cz: number): readonly Tree[];
  treesNear(x: number, z: number, radius: number): Tree[];
}

/** Palms are too slender and bendy to live on; everything else will do. */
export function climbable(tree: Tree): boolean {
  return tree.kind !== 'palm';
}

/** Highest a lizard goes: below the crown, where the trunk is still bare. */
export function lizardCeiling(tree: Tree): number {
  return tree.height * 0.7;
}

/** Puts a lizard on the surface of its trunk, at its angle around and height up. */
export function placeOnTrunk(c: Creature): void {
  const tree = c.tree!;
  const r = trunkRadiusAt(tree, c.climb) + 0.05;
  c.x = tree.x + Math.cos(c.around) * r;
  c.z = tree.z + Math.sin(c.around) * r;
  c.y = tree.y + c.climb;
}

/**
 * Lizards bask on a trunk, scuttle up and down it, and dart up and round to the far side when the player
 * comes close. Now and then one climbs down and runs across the ground to a nearby tree.
 * On a trunk, `heading` is 0 when facing up and π when facing down.
 */
export function stepLizard(
  c: Creature,
  sp: Species,
  dt: number,
  player: { x: number; z: number },
  terrain: Terrain,
  trees: TreeSource,
  s: CreatureSettings,
): void {
  const tree = c.tree;
  if (!tree) return;

  if (!c.onTrunk) {
    // Running across the ground to the next tree.
    c.heading = headingOf(tree.x - c.x, tree.z - c.z);
    c.speed = sp.runSpeed;
    moveForward(c, dt);
    c.y = terrain.heightAt(c.x, c.z);
    c.phase += (c.speed * dt) / Math.max(0.05, sp.body.legLength) * 0.5;
    if (Math.hypot(tree.x - c.x, tree.z - c.z) < tree.baseRadius + 0.3) {
      c.onTrunk = true;
      c.around = Math.atan2(c.z - tree.z, c.x - tree.x);
      c.climb = 0.2;
      c.goal = 0.5 + c.rng() * (lizardCeiling(tree) - 0.5);
      c.mode = 'walk';
      placeOnTrunk(c);
    }
    return;
  }

  // Startled: head up the trunk and round to the side away from the player.
  const near = Math.hypot(player.x - tree.x, player.z - tree.z) < sp.fleeDistance;
  if (near && c.mode !== 'flee') {
    c.mode = 'flee';
    c.goal = lizardCeiling(tree);
  }
  if (c.mode === 'flee') {
    const hide = Math.atan2(tree.z - player.z, tree.x - player.x);
    let diff = (hide - c.around) % (Math.PI * 2);
    if (diff > Math.PI) diff -= Math.PI * 2;
    if (diff < -Math.PI) diff += Math.PI * 2;
    const r = trunkRadiusAt(tree, c.climb);
    const turn = (sp.runSpeed / Math.max(0.2, r)) * dt;
    c.around += Math.max(-turn, Math.min(turn, diff));
    if (!near && Math.abs(c.goal - c.climb) < 0.05) {
      c.mode = 'idle';
      c.timer = 3 + c.rng() * 4;
    }
  } else {
    c.timer -= dt;
    if (c.timer <= 0 && c.mode === 'idle') {
      const roll = c.rng();
      if (roll < 0.2) {
        c.mode = 'leave';
        c.goal = 0;
      } else {
        c.mode = 'walk';
        c.goal = 0.4 + c.rng() * (lizardCeiling(tree) - 0.4);
        c.around += (c.rng() - 0.5) * 1.5;
      }
    }
  }

  // Climb towards the goal height, facing the way it's going.
  const speed = c.mode === 'flee' ? sp.runSpeed : sp.walkSpeed;
  const diff = c.goal - c.climb;
  const step = Math.sign(diff) * Math.min(Math.abs(diff), speed * dt);
  c.climb += step;
  c.speed = Math.abs(step) / dt;
  if (step !== 0) c.heading = step > 0 ? 0 : Math.PI;
  c.phase += Math.abs(step) / Math.max(0.05, sp.body.legLength) * 0.5;

  if (Math.abs(c.goal - c.climb) < 1e-6 && c.mode !== 'flee') {
    if (c.mode === 'leave') hopOff(c, tree, trees, terrain, s);
    else if (c.mode === 'walk') {
      c.mode = 'idle';
      c.timer = 2 + c.rng() * 6;
    }
  }
  if (c.onTrunk) placeOnTrunk(c);
}

/** At the foot of the trunk: pick another tree nearby and run to it, or stay put if there isn't one. */
function hopOff(c: Creature, from: Tree, trees: TreeSource, terrain: Terrain, s: CreatureSettings): void {
  const options = trees.treesNear(from.x, from.z, s.treeHop).filter((t) => t !== from && climbable(t));
  c.mode = 'idle';
  c.timer = 1 + c.rng() * 3;
  if (options.length === 0) return;
  c.tree = options[Math.floor(c.rng() * options.length)]!;
  c.onTrunk = false;
  c.mode = 'walk';
  c.y = terrain.heightAt(c.x, c.z);
}

/** Puts a group of lizards on random trees in a chunk. */
export function spawnLizards(c: Creature[], trees: readonly Tree[], rng: () => number): void {
  const options = trees.filter(climbable);
  if (options.length === 0) {
    c.length = 0;
    return;
  }
  const tree = options[Math.floor(rng() * options.length)]!;
  for (const lizard of c) {
    lizard.tree = tree;
    lizard.onTrunk = true;
    lizard.around = rng() * Math.PI * 2;
    lizard.climb = 0.5 + rng() * (lizardCeiling(tree) - 0.5);
    lizard.goal = lizard.climb;
    lizard.heading = rng() < 0.5 ? 0 : Math.PI;
    placeOnTrunk(lizard);
  }
}
