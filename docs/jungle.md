# Jungle

A first-person walk through an endless, procedurally generated jungle.

## How the world is made

- **Seed:** every world comes from a number in the URL (`?seed=1234`). Same seed, same world, so worlds can be shared by link. Press **N** in game for a new one.
- **Terrain** (`terrain.ts`): layered simplex noise makes the hills. A second noise field carves rivers where it crosses zero, and low ground below the water level becomes lakes.
- **Density:** a third noise field decides where the jungle is thick and where there are clearings.
- **Chunks** (`chunks.ts`): the world is cut into 48 m squares, generated around the player as they walk and thrown away behind them. Each chunk's plants come from a random generator seeded by the chunk's coordinates, so revisiting a place shows the same trees.
- **Plants:** broadleaf trees inland, palms near water, ferns and bushes in dense areas, plus flower patches and rocks. Each kind is drawn as one instanced mesh per chunk to keep it fast.

## Ideas to try next

- Day/night cycle, or rain
- Sounds: birds, insects, running water
- Animals or collectables to find
- Ruins or temples hidden in the jungle
- A minimap or compass
