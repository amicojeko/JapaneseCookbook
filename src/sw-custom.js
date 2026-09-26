// Custom service-worker code for @docusaurus/plugin-pwa.
//
// The plugin precaches the app shell (JS/CSS/HTML/fonts) AND — via
// additionalManifestEntries in docusaurus.config.ts — one small (~640w) hero
// photo per recipe. So at install time every recipe is cached WITH its text
// and a photo, without pulling the full ~68MB of image variants.
//
// All of this happens ONLY in the installed app: offlineModeActivationStrategies
// is ['standalone'], so a regular browser visit (mobile or desktop) registers
// the SW with offlineMode=false → empty precache list, no image cache, nothing
// downloaded in the background.
//
// This module does three things:
//
// 1. clients.claim() on activate. The Docusaurus PWA service worker does NOT
//    call clients.claim(), which means the very page that triggered the install
//    stays UNCONTROLLED until a manual reload — so offline navigation fails in
//    that first session (and often on the first launch of an installed app).
//    Claiming fixes it: the SW controls the page as soon as it activates.
//
// 2. Runtime caching (CacheFirst) for images actually browsed, plus a
//    sibling-variant offline fallback: photos use responsive srcset, so the
//    variant a recipe page requests offline (e.g. 1280w on a retina phone) may
//    differ from the precached 640w. On a cache miss with no network, we serve
//    any cached variant of the SAME photo from ANY cache (the precache included)
//    so the recipe still shows an image at any size offline.
//
// 3. Download progress for the app's first launch. The precache (all HTML pages +
//    JS chunks + recipe photos, ~900 files) is fetched one entry at a time during
//    the SW `install` event — silently, by default. We hook the precache
//    strategy (same bundled workbox-precaching module as the plugin's) to count
//    finished entries and broadcast { done, total } to every open window
//    — uncontrolled ones included, since on first launch nothing controls the
//    page yet. src/components/OfflineSplash renders it as a splash screen.
//
// Runs inside the SW (bundled by webpack, so workbox imports resolve). Receives
// { offlineMode, debug }; offlineMode is true only in standalone display mode.

import {PrecacheStrategy} from 'workbox-precaching';
import {registerRoute} from 'workbox-routing';
import {CacheFirst} from 'workbox-strategies';
import {ExpirationPlugin} from 'workbox-expiration';
import {CacheableResponsePlugin} from 'workbox-cacheable-response';

const IMAGE_CACHE = 'pg-images-v1';

// Strip the responsive `-<width>w` suffix and the extension so every variant
// (and the master) of one photo collapses to the same base key.
//   /img/ricette/foo-640w.webp  -> /img/ricette/foo
//   /img/ricette/foo.jpg        -> /img/ricette/foo
function baseImageKey(pathname) {
  return pathname
    .replace(/-\d+w(?=\.[a-z0-9]+$)/i, '')
    .replace(/\.[a-z0-9]+$/i, '');
}

// Message types shared with src/components/OfflineSplash.
const MSG_PROGRESS = 'PG_OFFLINE_PROGRESS';
const MSG_DONE = 'PG_OFFLINE_DONE';
const MSG_ERROR = 'PG_OFFLINE_ERROR';
const PROGRESS_THROTTLE_MS = 150;

async function broadcast(message) {
  const windows = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  });
  for (const client of windows) {
    client.postMessage(message);
  }
}

// The plugin's PrecacheController is private to its sw.js and binds
// `install` in its constructor, so it can't be patched. Its PrecacheStrategy,
// though, runs through the prototype `handleAll()` once per precache entry
// during install — that's our per-file hook. The total comes from the
// controller, reachable via the PrecacheCacheKeyPlugin Workbox always puts in
// the strategy's plugins (`_precacheController`: private field, but
// workbox-precaching is pinned by the lockfile).
function reportPrecacheProgress() {
  const originalHandleAll = PrecacheStrategy.prototype.handleAll;
  const installs = new WeakMap(); // install event → progress state

  PrecacheStrategy.prototype.handleAll = function handleAll(options) {
    const result = originalHandleAll.call(this, options);
    const event = options && options.event;
    if (!event || event.type !== 'install') {
      return result;
    }

    let state = installs.get(event);
    if (!state) {
      const controller = this.plugins
        .map((p) => p._precacheController)
        .find(Boolean);
      state = {
        total: controller ? controller.getURLsToCacheKeys().size : 0,
        done: 0,
        lastSent: 0,
        failed: false,
      };
      installs.set(event, state);
      // First OFFLINE install = the precache is still empty (checked before the
      // first network fetch lands; browser visits leave an EMPTY precache cache
      // behind, so caches.has() alone isn't enough). Take over
      // right away: on Android the browser's non-offline worker may already be
      // active, and we don't want the installed app stuck behind the "Nuova
      // versione" popup on its very first launch. Later updates (cache already
      // there) keep the normal waiting + popup flow.
      event.waitUntil(
        caches
          .open(this.cacheName)
          .then((cache) => cache.keys())
          .then((keys) => (keys.length === 0 ? self.skipWaiting() : undefined)),
      );
    }
    if (state.total === 0) {
      return result;
    }

    // result = [responseDone, handlerDone]; handlerDone settles once the entry
    // is in the cache (fetched now, or already there from an earlier attempt).
    const {total} = state;
    const report = result[1].then(
      async () => {
        state.done += 1;
        const now = Date.now();
        if (state.done === total) {
          await broadcast({type: MSG_PROGRESS, done: total, total});
          await broadcast({type: MSG_DONE, total});
        } else if (now - state.lastSent >= PROGRESS_THROTTLE_MS) {
          state.lastSent = now;
          await broadcast({type: MSG_PROGRESS, done: state.done, total});
        }
      },
      async () => {
        if (!state.failed) {
          state.failed = true;
          await broadcast({type: MSG_ERROR, done: state.done, total});
        }
      },
    );
    // Keep the SW alive until the message is posted. Legal here: the install
    // event is still pending on the precache loop that called us.
    event.waitUntil(report);
    return result;
  };
}

// Offline fallback: find any already-cached variant of the same photo, in any
// cache (runtime image cache OR the Workbox precache where recipe heroes live).
async function findSiblingVariant(requestUrl) {
  const base = baseImageKey(new URL(requestUrl).pathname);
  for (const cacheName of await caches.keys()) {
    const cache = await caches.open(cacheName);
    for (const cachedReq of await cache.keys()) {
      if (baseImageKey(new URL(cachedReq.url).pathname) === base) {
        const hit = await cache.match(cachedReq);
        if (hit) {
          return hit;
        }
      }
    }
  }
  return undefined;
}

export default function swCustom(params) {
  const {offlineMode, debug} = params;

  // (3) Must be patched before the plugin's 'install' listener fires.
  reportPrecacheProgress();

  // (1) Take control of the current page as soon as we activate, so offline
  // works WITHOUT a manual reload. Registered unconditionally.
  self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
  });

  if (!offlineMode) {
    return;
  }

  // (2) Runtime image cache + cross-cache sibling fallback.
  const isSameOriginImage = ({request, url}) =>
    url.origin === self.location.origin &&
    (request.destination === 'image' ||
      /\.(?:png|jpe?g|webp|avif|gif)$/i.test(url.pathname));

  registerRoute(
    isSameOriginImage,
    new CacheFirst({
      cacheName: IMAGE_CACHE,
      plugins: [
        new CacheableResponsePlugin({statuses: [0, 200]}),
        new ExpirationPlugin({
          maxEntries: 500,
          maxAgeSeconds: 60 * 24 * 60 * 60, // 60 days
          purgeOnQuotaError: true,
        }),
        {
          // Fired when the strategy fails (cache miss + network unavailable).
          handlerDidError: async ({request}) => findSiblingVariant(request.url),
        },
      ],
    }),
  );

  if (debug) {
    console.log('[PWA][swCustom]: clients.claim + image cache + sibling fallback registered');
  }
}
