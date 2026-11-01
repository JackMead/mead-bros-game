/**
 * Build the playtest version as one self-contained HTML file (scripts and styles inlined),
 * for publishing as a Claude artifact. Playtest mode is switched on.
 *   npm run bragging:single   ->   dist/bragging-rights-playtest.html
 * The output is page content without <html>/<head>/<body>: the artifact host adds those.
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const game = fileURLToPath(new URL('..', import.meta.url));
const repo = fileURLToPath(new URL('../../..', import.meta.url));
const tmp = `${repo}dist/.single`;

process.env.VITE_PLAYTEST = '1';
await build({
  root: game, base: './', publicDir: false, logLevel: 'warn', configFile: false,
  build: {
    outDir: tmp, emptyOutDir: true, assetsInlineLimit: 1e9, cssCodeSplit: false, modulePreload: false,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});

const html = readFileSync(`${tmp}/index.html`, 'utf8');
const assets = readdirSync(`${tmp}/assets`);
const read = (ext) => readFileSync(`${tmp}/assets/${assets.find((a) => a.endsWith(ext))}`, 'utf8');
const js = read('.js').replace(/<\/script/g, '<\\/script');
const body = html.slice(html.indexOf('<body>') + 6, html.indexOf('</body>'))
  .replace(/<script[^>]*src=[^>]*><\/script>/g, '')
  .replace(/\s*<a class="back"[^>]*>[^<]*<\/a>/, ''); // no landing page to go back to

const page = `<title>Bragging Rights</title>
<meta name="theme-color" content="#14110f">
<style>${read('.css')}
:root { color-scheme: dark; background: #14110f; }
</style>
${body.trim()}
<script type="module">${js}</script>
`;
mkdirSync(`${repo}dist`, { recursive: true });
writeFileSync(`${repo}dist/bragging-rights-playtest.html`, page);
console.log(`dist/bragging-rights-playtest.html (${Math.round(page.length / 1024)} KB)`);
