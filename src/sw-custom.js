// Custom service-worker code for @docusaurus/plugin-pwa.
//
// The plugin precaches the app shell (JS/CSS/HTML/fonts) AND — via
// additionalManifestEntries in docusaurus.config.ts — one small (~640w) hero
// photo per recipe. So at install time every recipe is cached WITH its text
// and a photo, without pulling the full ~68MB of image variants.
//
// This module does two things:
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
// Runs inside the SW (bundled by webpack, so workbox imports resolve). Receives
// { offlineMode, debug }. With offlineModeActivationStrategies: ['always'],
// offlineMode is true for every visitor.

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
