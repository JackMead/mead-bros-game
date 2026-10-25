# Notes for AI collaborators

This is a small browser game written in TypeScript, bundled with Vite, drawn on a single `<canvas>` with the 2D API. Several people (and their AI assistants) work on it, so consistency matters more than cleverness.

## Commands

- `npm run dev` — dev server
- `npm test` — Vitest unit tests
- `npm run typecheck` — `tsc --noEmit`
- `npm run build` — typecheck + production build

Run `npm run typecheck && npm test` before considering a change done.

## Structure and conventions

- `src/engine/` is generic plumbing (loop, input). It must not import from `src/game/`.
- `src/game/` is game-specific. Keep **update** (pure logic, no DOM/canvas) separate from **render** (drawing only, no state changes). This keeps logic testable in Node.
- Put tunable numbers in `src/config.ts`, not inline.
- The simulation uses a fixed timestep (`config.fixedStep`). Movement and timers should multiply by `dt` (seconds).
- Coordinates are in game pixels (`config.width` × `config.height`), origin top-left.
- No new runtime dependencies without discussing it in the PR first. Dev dependencies are fine if justified.
- Add or update a test in `*.test.ts` next to the file when you change game logic.

## Workflow

- Work on a branch; open a PR into `main` with a short description of what changed and how to try it.
- Keep PRs small and focused on one feature or fix.
- Record design decisions in `docs/` (e.g. `docs/design.md`) so the next person — human or AI — has the context.
