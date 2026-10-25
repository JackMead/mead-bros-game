import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));

// Each folder in games/ with an index.html becomes its own page at /games/<id>/.
const games = readdirSync(resolve(root, 'games')).filter((id) =>
  existsSync(resolve(root, 'games', id, 'index.html')),
);

export default defineConfig({
  // Relative asset paths, so the build works at game.meadbros.co.uk
  // and at https://jackmead.github.io/mead-bros-game/.
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        ...Object.fromEntries(games.map((id) => [id, resolve(root, 'games', id, 'index.html')])),
      },
    },
  },
});
