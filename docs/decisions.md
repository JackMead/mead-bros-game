# Decisions log

Project-wide decisions. Per-game design notes go in `docs/<game-id>.md`.

| Date       | Decision | Why |
| ---------- | -------- | --- |
| 2026-10-25 | Browser games in TypeScript + Vite, 2D canvas | Runs anywhere, no engine install, easy to iterate on with AI |
| 2026-10-25 | Host on GitHub Pages at game.meadbros.co.uk | Free, deploys on every push to `main` |
| 2026-10-25 | Landing page + one folder per game in `games/` | Lets us experiment with several games at once |
| 2026-10-25 | Three.js for 3D games (first used by `games/jungle`) | Mature, well documented, and AI assistants know it well; 2D games can keep using the plain canvas |
| 2026-10-29 | `three-brothers`: chapters are data, run by one shared engine | Each brother writes a chapter's story from his phone; nobody edits the engine to add content |
| 2026-10-29 | `three-brothers`: authors write the story, Claude writes the puzzles to a shared rubric | Everyone, the author included, can play every chapter blind |
| 2026-10-29 | `three-brothers`: automatic solvability check plus AI playtester profiles | Catch broken or unfair puzzles before a brother plays them; the rubric learns from each round |
| 2026-10-29 | `vite-node` and `@types/node` as dev dependencies | Run and typecheck the text-mode playtest tool |
