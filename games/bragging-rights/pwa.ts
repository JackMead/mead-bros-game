/**
 * Installable web app. The manifest, service worker and icons live in
 * public/games/bragging-rights/ so they are served unchanged next to this page.
 */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('./sw.js', { scope: './' });
      // Hand the worker everything this page has already loaded, so it works offline next time.
      const urls = [location.href, ...performance.getEntriesByType('resource').map((r) => r.name)]
        .filter((u) => u.startsWith(location.origin));
      const worker = reg.active ?? reg.waiting ?? reg.installing;
      const send = () => (reg.active ?? worker)?.postMessage({ type: 'cache', urls });
      if (reg.active) send();
      else worker?.addEventListener('statechange', () => { if (reg.active) send(); });
    } catch {
      // No offline support; the game still works online.
    }
  });
}
