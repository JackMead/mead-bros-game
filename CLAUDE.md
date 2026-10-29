# Notes for AI collaborators

This repo is a collection of small browser games written in TypeScript, bundled with Vite, each drawn on a `<canvas>`: 2D games use the canvas 2D API, 3D games use Three.js. The site root is a landing page linking to every game. Several people (and their AI assistants) work on it, so consistency matters more than cleverness.

## Commands

- `npm run dev`: dev server (landing page at `/`, games at `/games/<id>/`)
- `npm test`: Vitest unit tests
- `npm run typecheck`: `tsc --noEmit`
- `npm run build`: typecheck + production build

Run `npm run typecheck && npm test` before considering a change done.

## Layout

- `index.html` + `src/landing/`: the landing page. It lists games automatically from `games/*/meta.json`; don't hand-edit a list of games.
- `src/engine/`: shared, game-agnostic plumbing (loop, input). It must not import from `games/`.
- `games/<id>/`: one self-contained game per folder, with its own `index.html`, `meta.json`, `main.ts`, `config.ts` and logic. `vite.config.ts` discovers these folders automatically.
- Games may import from `src/engine/` but never from another game. Promote shared code into `src/engine/` instead.

## Adding a game

Copy `games/sandbox/` to `games/<id>/` (lowercase, dash-separated), then update `meta.json` (`title`, `description`, optional `status` such as `prototype`, `playable`, `archived`) and the page `<title>`. Keep the "← All games" link (`href="../../"`).

## Conventions

- Keep **update** (pure logic, no DOM/canvas/Three.js) separate from **render** (drawing only, no state changes), so logic is testable in Node.
- Put tunable numbers in the game's `config.ts`, not inline.
- The simulation uses a fixed timestep. Movement and timers multiply by `dt` (seconds).
- Coordinates: 2D games use game pixels with the origin top-left; 3D games use metres with Y up.
- Use relative URLs (`./`, `../../`) for links and assets. The site is served from a custom domain root and from `/mead-bros-game/` on github.io, so absolute paths break one or the other.
- Three.js is the one shared runtime dependency. No other new runtime dependencies without discussing it in the PR first. Dev dependencies are fine if justified.
- Add or update a `*.test.ts` next to the file when you change game logic.

## The Three Brothers of Yorkshire

`games/three-brothers/` is a story game the three of us write together, one chapter at a time. Before touching it, read `docs/three-brothers/README.md` (process), `story-bible.md` (continuity) and `rubric.md` (puzzle rules).

- **No spoilers outside the chapter files.** Never describe puzzle solutions in chat, commit messages, PR titles or PR descriptions. The person asking may be the chapter's author, who plays it blind.
- Chapters are data in `games/three-brothers/chapters/`; don't change the engine to write a chapter unless it truly can't express something.
- `npm test` checks every chapter is valid, finishable and has no dead ends. AI playtesting is described in `docs/three-brothers/playtesting.md`.

## Workflow

- Work on a branch; open a PR into `main` with a short description of what changed and how to try it.
- Keep PRs small and focused on one feature or fix.
- Record design decisions in `docs/` so the next person, human or AI, has the context. Per-game design notes can go in `docs/<game-id>.md`.
- Pushing to `main` deploys to https://game.meadbros.co.uk.
