/** Animals that live in the trees: lizards on the trunks and monkeys in the canopy. Pure logic: no Three.js, no DOM. */
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

export interface Point {
  x: number;
  y: number;
  z: number;
}

/** Lowest a branch can be above the tree's base for a monkey to hang from it without its feet touching the ground. */
const MIN_BRANCH_HEIGHT = 3.5;

/** Places a monkey can hang from: just under each lump of a tree's crown, if it's high enough. */
export function branchesOf(tree: Tree): Point[] {
  return tree.crown
    .map((b) => ({ x: b.x, y: b.y - b.r * b.squash * 0.7, z: b.z }))
    .filter((p) => p.y - tree.y >= MIN_BRANCH_HEIGHT);
}

/** Branches a monkey hanging at `hand` could swing to next. */
function reachable(hand: Point, trees: TreeSource, s: CreatureSettings): { tree: Tree; branch: Point }[] {
  const out: { tree: Tree; branch: Point }[] = [];
  for (const tree of trees.treesNear(hand.x, hand.z, s.treeHop + 5)) {
    if (!climbable(tree)) continue;
    for (const branch of branchesOf(tree)) {
      const across = Math.hypot(branch.x - hand.x, branch.z - hand.z);
      if (across > 1.5 && across < s.treeHop && Math.abs(branch.y - hand.y) < 5) out.push({ tree, branch });
    }
  }
  return out;
}

/** Where a monkey's hand is partway through a swing: along a dipping arc from one branch to the next. */
export function swingPoint(from: Point, to: Point, p: number): Point {
  const across = Math.hypot(to.x - from.x, to.z - from.z);
  const sag = Math.min(2, across * 0.3) * Math.sin(Math.PI * p);
  return {
    x: from.x + (to.x - from.x) * p,
    y: from.y + (to.y - from.y) * p - sag,
    z: from.z + (to.z - from.z) * p,
  };
}

/**
 * Monkeys hang from branches under the canopy and swing from branch to branch, tree to tree.
 * When the player comes close they swing away, fast. (x, y, z) is the hand they're hanging by.
 */
export function stepMonkey(
  c: Creature,
  sp: Species,
  dt: number,
  player: { x: number; z: number },
  trees: TreeSource,
  s: CreatureSettings,
): void {
  if (!c.from) return;
  const near = Math.hypot(player.x - c.x, player.z - c.z) < sp.fleeDistance;

  if (c.to) {
    const across = Math.max(1, Math.hypot(c.to.x - c.from.x, c.to.z - c.from.z));
    const speed = c.mode === 'flee' ? sp.runSpeed : sp.walkSpeed;
    c.swing = Math.min(1, c.swing + (speed * dt) / across);
    Object.assign(c, swingPoint(c.from, c.to, c.swing));
    c.speed = speed;
    if (c.swing >= 1) {
      c.from = c.to;
      c.to = null;
      c.swing = 0;
      c.mode = 'idle';
      c.timer = near ? 0 : 2 + c.rng() * 6;
    }
  } else {
    c.speed = 0;
    c.timer -= dt;
    if (near || c.timer <= 0) startSwing(c, near, player, trees, s);
  }
  c.phase += dt * (c.to ? 6 : 1.5);
}

function startSwing(c: Creature, fleeing: boolean, player: { x: number; z: number }, trees: TreeSource, s: CreatureSettings): void {
  const options = reachable(c.from!, trees, s);
  if (options.length === 0) {
    c.timer = 3;
    return;
  }
  // Fleeing: the branch furthest from the player. Strayed too far: the one nearest home. Otherwise any.
  const farFromHome = Math.hypot(c.x - c.homeX, c.z - c.homeZ) > s.leash;
  let next = options[Math.floor(c.rng() * options.length)]!;
  if (fleeing || farFromHome) {
    const cost = (o: { branch: Point }) => fleeing
      ? -Math.hypot(o.branch.x - player.x, o.branch.z - player.z)
      : Math.hypot(o.branch.x - c.homeX, o.branch.z - c.homeZ);
    for (const o of options) if (cost(o) < cost(next)) next = o;
  }
  c.to = next.branch;
  c.tree = next.tree;
  c.swing = 0;
  c.mode = fleeing ? 'flee' : 'walk';
  c.heading = headingOf(c.to.x - c.from!.x, c.to.z - c.from!.z);
}

/** Hangs a troop of monkeys from branches around a random tree in a chunk. */
export function spawnMonkeys(troop: Creature[], chunkTrees: readonly Tree[], trees: TreeSource, s: CreatureSettings, rng: () => number): void {
  const hangable = (t: Tree) => climbable(t) && branchesOf(t).length > 0;
  const options = chunkTrees.filter(hangable);
  if (options.length === 0) {
    troop.length = 0;
    return;
  }
  const home = options[Math.floor(rng() * options.length)]!;
  const nearby = trees.treesNear(home.x, home.z, s.treeHop).filter(hangable);
  for (const m of troop) {
    const tree = nearby[Math.floor(rng() * nearby.length)] ?? home;
    const branches = branchesOf(tree);
    const branch = branches[Math.floor(rng() * branches.length)]!;
    m.tree = tree;
    m.from = branch;
    m.to = null;
    m.swing = 0;
    m.timer = rng() * 4;
    Object.assign(m, branch);
    m.homeX = home.x;
    m.homeZ = home.z;
  }
}
