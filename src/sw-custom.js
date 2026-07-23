// Custom service-worker code for @docusaurus/plugin-pwa.
//
// The plugin precaches the app shell (JS/CSS/HTML/fonts — see injectManifestConfig
// in docusaurus.config.ts). Since Docusaurus bakes page content into JS chunks,
// precaching the JS already makes all text content available offline for installed
// users. What we deliberately DON'T precache is the ~68MB of recipe photos.
//
// This module adds runtime caching (CacheFirst) for images, so photos on pages
// an installed user actually visits get cached — without a multi-megabyte
// download at install time.
//
// The default export runs inside the SW (bundled by webpack, so workbox imports
// resolve). It receives { offlineMode, debug }. We only wire up caching when
// offlineMode is active — same gate the plugin uses for its precache, so regular
// browser-tab visitors get no surprise storage usage.

import {registerRoute} from 'workbox-routing';
import {CacheFirst} from 'workbox-strategies';
import {ExpirationPlugin} from 'workbox-expiration';
import {CacheableResponsePlugin} from 'workbox-cacheable-response';

export default function swCustom(params) {
  const {offlineMode, debug} = params;

  // Only cache when offline mode is active (app installed / standalone /
  // ?offlineMode=true). Mirrors the plugin's precache gating.
  if (!offlineMode) {
    return;
  }

  // Runtime-cache same-origin images (recipe photos etc.) CacheFirst.
  registerRoute(
    ({request, url}) =>
      url.origin === self.location.origin &&
      (request.destination === 'image' ||
        /\.(?:png|jpe?g|webp|avif|gif)$/i.test(url.pathname)),
    new CacheFirst({
      cacheName: 'pg-images-v1',
      plugins: [
        // Cache opaque (0) and OK (200) responses.
        new CacheableResponsePlugin({statuses: [0, 200]}),
        new ExpirationPlugin({
          maxEntries: 300,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          // Evict the whole image cache if the browser hits its storage quota,
          // rather than letting the SW error out.
          purgeOnQuotaError: true,
        }),
      ],
    }),
  );

  if (debug) {
    console.log('[PWA][swCustom]: image runtime cache registered');
  }
}
