# Jungle

A first-person walk through an endless, procedurally generated jungle.

## How the world is made

- **Seed:** every world comes from a number in the URL (`?seed=1234`). Same seed, same world, so worlds can be shared by link. Press **N** in game for a new one.
- **Terrain** (`terrain.ts`): layered simplex noise makes the hills. A second noise field carves rivers where it crosses zero, and low ground below the water level becomes lakes. On high ground the rivers cut narrow, steep gorges.
- **Density:** a third noise field decides where the jungle is thick and where there are clearings.
- **Chunks** (`chunks.ts`): the world is cut into 48 m squares, drawn around the player as they walk and thrown away behind them. Each kind of plant is one instanced mesh per chunk to keep it fast.
- **Plants** (`plants.ts`): where every plant goes is pure logic, seeded by the chunk's coordinates, so revisiting a place shows the same trees. `PlantCache` keeps recent layouts so the renderer and the animals share them.
  - Broadleaf trees inland, palms near water, ferns and bushes in dense areas, flower patches, rocks, and bamboo clumps on damp ground.
  - **Fruit trees:** short, round-crowned, hung with fruit. Each world has its own fruit colour.
  - **Emergents:** rare giants (26–36 m) towering over the canopy, with flat umbrella crowns and buttress roots.
- **Falling fruit** (`fruit.ts`): fruit trees near the player now and then drop a fruit. It tumbles down, bounces once and lies on the ground (or floats) for a while. It grows back when its chunk is rebuilt.
- **Waterfalls** (`waterfalls.ts`, `waterfallMeshes.ts`): each chunk tries a few spots and keeps the steepest slope that runs straight down into open water. The fall follows the steepest way down, drawn as a ribbon of sliding streaks, lined with rocks, with foam at the bottom. All water is at one level, so a waterfall is a stream tumbling off a hillside into a river or lake. Falls into narrow gorges are skipped because you'd never see them, and plants are kept off the fall.

## Animals

- **Species** (`species.ts`): every world invents its own eight species from the seed: three grazers (one small and skittish, one tall and quick, one big and slow), a flock bird, a solo bird, a fish, a lizard and a monkey. Each gets a made-up name, body proportions, colours, speeds and how easily it's startled, all picked at random within ranges for its kind.
- **Spawning** (`creatures.ts`): like plants, animals are seeded per chunk, so the same place has the same animals. They only exist within `creatures.viewRadius` chunks of the player; further out they'd be lost in the fog anyway.
- **Behaviour:**
  - Grazers wander, stop to graze and run from the player, but never step into water.
  - Fish do the same underwater and now and then leap out.
  - Flock birds (parrot-like) circle high above the trees, and each flock slowly drifts across the sky.
  - Solo birds (hornbill-like) wander alone on curving paths, low over clearings and water and higher over thick jungle, gliding more than flapping.
  - Lizards (`climbers.ts`) live on tree trunks: they bask, scuttle up and down, dart up and round to the far side when the player comes close, and sometimes run across to another tree.
  - Monkeys (`climbers.ts`) hang by one arm under the canopy and swing branch to branch, tree to tree, along a dipping arc. They swing away from the player.
- **Drawing** (`creatureMeshes.ts`): animals are built from a few simple shapes (body, head, limbs, wings, fins). Each part of each species is one instanced mesh, posed every frame, so all the animals together cost a few dozen draw calls.
- **Spotting:** look at an animal and its species name appears under the crosshair.

Known gaps: animals walk through tree trunks, the name shows even when an animal is hidden behind foliage, and grazers ignore fallen fruit.

## Ideas to try next

- Grazers and monkeys eating fallen fruit
- Day/night cycle, or rain
- Sounds: birds, insects, running water
- Collectables, or a field guide of the species you have spotted
- Ruins or temples hidden in the jungle
- A minimap or compass
