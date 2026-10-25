# Jungle

A first-person walk through an endless, procedurally generated jungle.

## How the world is made

- **Seed:** every world comes from a number in the URL (`?seed=1234`). Same seed, same world, so worlds can be shared by link. Press **N** in game for a new one.
- **Terrain** (`terrain.ts`): layered simplex noise makes the hills. A second noise field carves rivers where it crosses zero, and low ground below the water level becomes lakes.
- **Density:** a third noise field decides where the jungle is thick and where there are clearings.
- **Chunks** (`chunks.ts`): the world is cut into 48 m squares, generated around the player as they walk and thrown away behind them. Each chunk's plants come from a random generator seeded by the chunk's coordinates, so revisiting a place shows the same trees.
- **Plants:** broadleaf trees inland, palms near water, ferns and bushes in dense areas, plus flower patches and rocks. Each kind is drawn as one instanced mesh per chunk to keep it fast.

## Animals

- **Species** (`species.ts`): every world invents its own five species from the seed: three grazers (one small and skittish, one tall and quick, one big and slow), a bird and a fish. Each gets a made-up name, body proportions, colours, speeds and how easily it's startled, all picked at random within ranges for its kind.
- **Spawning** (`creatures.ts`): like plants, animals are seeded per chunk, so the same place has the same animals. They only exist within `creatures.viewRadius` chunks of the player; further out they'd be lost in the fog anyway.
- **Behaviour:** grazers wander, stop to graze and run from the player, but never step into water. Fish do the same underwater and now and then leap out. Birds circle in flocks high above the trees, and each flock slowly drifts across the sky.
- **Drawing** (`creatureMeshes.ts`): animals are built from a few simple shapes (body, head, legs, wings, fins). Each part of each species is one instanced mesh, posed every frame, so all the animals together cost about 25 draw calls.
- **Spotting:** look at an animal and its species name appears under the crosshair.

Known gaps: animals walk through tree trunks, and the name shows even when an animal is hidden behind foliage.

## Ideas to try next

- Day/night cycle, or rain
- Sounds: birds, insects, running water
- Collectables, or a field guide of the species you have spotted
- Ruins or temples hidden in the jungle
- A minimap or compass
