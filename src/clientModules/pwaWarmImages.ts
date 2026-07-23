// Background pre-warm of recipe hero photos so every recipe is available offline
// WITH a photo, without opening each one first.
//
// After the page settles, we fetch a small list of recipe hero image URLs
// (static/pwa-precache-images.json, one ~640w WebP per recipe) and load them at
// low priority. Each load goes through the service worker's CacheFirst image
// route (src/sw-custom.js) and lands in the `pg-images-v1` cache. The SW's
// sibling-variant fallback then covers whatever size the recipe page requests
// offline.
//
// Politeness: skipped when offline, on Save-Data, or on slow connections, and
// throttled to at most once per 24h (fetching already-cached images is cheap,
// but we avoid firing dozens of requests on every page view).

const LIST_URL = '/pwa-precache-images.json';
const THROTTLE_KEY = 'pg:pwaWarm:ts';
const THROTTLE_MS = 24 * 60 * 60 * 1000; // 24h
const CONCURRENCY = 4;

function shouldSkip(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return true;
  }
  if (!('serviceWorker' in navigator)) {
    return true;
  }
  if (navigator.onLine === false) {
    return true;
  }
  // Respect Save-Data and slow/metered connections.
  const conn = (navigator as any).connection;
  if (conn) {
    if (conn.saveData) {
      return true;
    }
    if (typeof conn.effectiveType === 'string' && /(^|-)2g$/.test(conn.effectiveType)) {
      return true;
    }
  }
  // Throttle.
  try {
    const last = Number(window.localStorage.getItem(THROTTLE_KEY) || '0');
    if (Date.now() - last < THROTTLE_MS) {
      return true;
    }
  } catch {
    // localStorage unavailable (private mode etc.) — proceed without throttle.
  }
  return false;
}

async function warmAll(urls: string[]): Promise<void> {
  let i = 0;
  async function worker(): Promise<void> {
    while (i < urls.length) {
      const url = urls[i++];
      try {
        // Low-priority fetch; response is cached by the SW image route.
        await fetch(url, {priority: 'low'} as RequestInit);
      } catch {
        // Ignore individual failures; best-effort warming.
      }
    }
  }
  await Promise.all(Array.from({length: CONCURRENCY}, worker));
}

function run(): void {
  if (shouldSkip()) {
    return;
  }
  const start = async () => {
    try {
      await navigator.serviceWorker.ready;
      const res = await fetch(LIST_URL);
      if (!res.ok) {
        return;
      }
      const urls: string[] = await res.json();
      if (!Array.isArray(urls) || urls.length === 0) {
        return;
      }
      await warmAll(urls);
      try {
        window.localStorage.setItem(THROTTLE_KEY, String(Date.now()));
      } catch {
        /* ignore */
      }
    } catch {
      /* best-effort; ignore */
    }
  };

  // Defer to idle so we never compete with the page's own loading.
  const ric = (window as any).requestIdleCallback as
    | ((cb: () => void, opts?: {timeout: number}) => void)
    | undefined;
  if (ric) {
    ric(() => start(), {timeout: 8000});
  } else {
    window.setTimeout(start, 4000);
  }
}

// Docusaurus client module: runs once after the app mounts in the browser.
export function onRouteDidUpdate(): void {
  // Guard so it only runs once per page load, not on every SPA navigation.
  if ((window as any).__pgPwaWarmStarted) {
    return;
  }
  (window as any).__pgPwaWarmStarted = true;
  run();
}
