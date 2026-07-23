// Custom service-worker code for @docusaurus/plugin-pwa.
//
// The plugin precaches the app shell (JS/CSS/HTML/fonts — see injectManifestConfig
// in docusaurus.config.ts). Since Docusaurus bakes page content into JS chunks,
// precaching the JS already makes all text content available offline. What we
// deliberately DON'T precache is the ~68MB of recipe photos.
//
// This module adds runtime caching (CacheFirst) for images. Combined with the
// background pre-warm of recipe hero photos (src/clientModules/pwaWarmImages.ts),
// every recipe ends up available offline WITH a photo, without a multi-megabyte
// download at install time.
//
// Sibling-variant fallback: photos are served via responsive srcset, so the
// exact variant a recipe page requests offline may differ from the small one we
// pre-warmed. When a request misses the cache AND the network is unavailable, we
// serve any cached variant of the SAME base image (e.g. the 640w we warmed in
// place of the 1280w the page asked for). This lets us pre-warm just one small
// variant per recipe yet still show a photo offline at any size.
//
// The default export runs inside the SW (bundled by webpack, so workbox imports
// resolve). It receives { offlineMode, debug }. With offlineModeActivationStrategies
// set to ['always'] in the config, offlineMode is true for every visitor.

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

export default function swCustom(params) {
  const {offlineMode, debug} = params;

  // Only wire up caching when offline mode is active. With ['always'] this is
  // every visitor; kept as a guard so other strategies still behave sanely.
  if (!offlineMode) {
    return;
  }

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
          // Room for every warmed recipe hero (~86) plus normal browsing.
          maxEntries: 500,
          maxAgeSeconds: 60 * 24 * 60 * 60, // 60 days
          purgeOnQuotaError: true,
        }),
        {
          // Called when the strategy fails (cache miss + network unavailable).
          // Serve any cached sibling variant of the same photo so recipes still
          // show an image offline regardless of the size requested.
          handlerDidError: async ({request}) => {
            const base = baseImageKey(new URL(request.url).pathname);
            const cache = await caches.open(IMAGE_CACHE);
            for (const cachedReq of await cache.keys()) {
              const p = new URL(cachedReq.url).pathname;
              if (baseImageKey(p) === base) {
                const hit = await cache.match(cachedReq);
                if (hit) {
                  return hit;
                }
              }
            }
            return undefined;
          },
        },
      ],
    }),
  );

  if (debug) {
    console.log('[PWA][swCustom]: image runtime cache + sibling fallback registered');
  }
}
