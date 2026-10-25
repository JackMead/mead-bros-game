import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset paths, so the build works both at a custom subdomain root
  // and at https://<user>.github.io/mead-bros-game/.
  base: './',
});
