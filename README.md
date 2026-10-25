# Mead Bros Games

Browser games we're building together, with help from AI. Live at **https://game.meadbros.co.uk**.

The site is a landing page that links to each game. Every game is its own small experiment in `games/`, so we can try several ideas side by side.

## Getting started

You need [Node.js](https://nodejs.org/) 20 or newer.

```bash
npm install
npm run dev
```

Open the URL it prints (usually http://localhost:5173) to see the landing page, and click through to a game. Pages reload automatically when you save a file.

## Commands

| Command             | What it does                                     |
| ------------------- | ------------------------------------------------ |
| `npm run dev`       | Start the dev server with hot reload             |
| `npm test`          | Run the tests                                    |
| `npm run typecheck` | Check types without building                     |
| `npm run build`     | Type-check and produce a static build in `dist/` |

## How the code is laid out

```
index.html             Landing page
src/
  landing/             Landing page script and styles
  engine/              Shared plumbing any game can use: game loop, input
games/
  sandbox/             One folder per game
    index.html         The game's page (served at /games/sandbox/)
    meta.json          Title, description and status shown on the landing page
    main.ts            Boots the game
    config.ts          Tunable numbers for this game
    world.ts           Game state, update rules and drawing
    world.test.ts      Tests for the game logic
public/CNAME           Custom domain for GitHub Pages
```

## Adding a new game

1. Copy `games/sandbox/` to `games/<your-game-id>/` (lowercase, dashes, e.g. `space-race`).
2. Edit its `meta.json` and the `<title>` in its `index.html`.
3. Run `npm run dev`. The new game appears on the landing page automatically.

Games can import from `src/engine/` but shouldn't import from each other. If two games need the same thing, move it into `src/engine/`.

## Deployment

Every push to `main` builds the site and publishes it to GitHub Pages via `.github/workflows/deploy.yml`. The repo's **Settings → Pages → Source** must be set to **GitHub Actions**. The domain `game.meadbros.co.uk` is a CNAME record at GoDaddy pointing to `jackmead.github.io`.

## Working together

- Make changes on a branch and open a pull request into `main`.
- CI runs type-checking, tests and a build on every PR.
- If you're working with an AI assistant, point it at [`CLAUDE.md`](./CLAUDE.md). It explains the conventions.
- Ideas, decisions and game designs live in [`docs/`](./docs).
