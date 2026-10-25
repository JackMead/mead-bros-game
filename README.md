# Mead Bros Game

A browser game we're building together, with help from AI.

Right now it's a yellow square you can move around with **WASD** or the **arrow keys**. Everything else is up for grabs.

## Getting started

You need [Node.js](https://nodejs.org/) 20 or newer.

```bash
npm install
npm run dev
```

Then open the URL it prints (usually http://localhost:5173). The page reloads automatically when you save a file.

## Commands

| Command             | What it does                                   |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Start the dev server with hot reload           |
| `npm test`          | Run the tests                                  |
| `npm run typecheck` | Check types without building                   |
| `npm run build`     | Type-check and produce a static build in `dist/` |

## How the code is laid out

```
src/
  main.ts          Boots the game: canvas, input, loop
  config.ts        Tunable numbers (sizes, speeds, colours)
  engine/          Reusable plumbing — game loop, input
  game/            The actual game: state, update rules, drawing
```

Game logic (`update`) is kept separate from drawing (`render`) so it can be tested without a browser.

## Deployment

Every push to `main` builds the game and publishes it to GitHub Pages (see `.github/workflows/deploy.yml`). A custom domain is set under **Settings → Pages** in the repo, with a matching CNAME record at the DNS provider.

## Working together

- Make changes on a branch and open a pull request into `main`.
- CI runs type-checking, tests and a build on every PR.
- If you're working with an AI assistant, point it at [`CLAUDE.md`](./CLAUDE.md) — it explains the conventions.
- Ideas, decisions and the game design live in [`docs/`](./docs).
