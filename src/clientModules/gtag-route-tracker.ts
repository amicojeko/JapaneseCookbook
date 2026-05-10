// SPA route change tracking for the deferred gtag bootstrap.
//
// Replaces the route-update behaviour of @docusaurus/plugin-google-gtag,
// which we removed in favour of an inline deferred loader in
// `docusaurus.config.ts` (headTags, production only). On the very first
// pageview the inline `gtag('config', …)` snapshots the entry URL, so this
// module only handles subsequent client-side navigations.
//
// The tracking ID is duplicated in the inline bootstrap — keep them in
// sync if it ever changes.
const TRACKING_ID = 'G-YZDG2VN7ZG';

type Location = { pathname: string; search: string };

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function onRouteDidUpdate({
  location,
  previousLocation,
}: {
  location: Location;
  previousLocation: Location | null;
}): void {
  // Initial mount: the inline bootstrap already queued the entry pageview.
  if (!previousLocation) return;
  // Hash-only changes (anchor jumps) don't count as pageviews.
  if (
    previousLocation.pathname === location.pathname &&
    previousLocation.search === location.search
  ) {
    return;
  }
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }
  // Defer to the next tick so we don't block the route handler — same trick
  // the original @docusaurus/plugin-google-gtag uses. This keeps the
  // navigation click out of the long-task accounting and is what gives us the
  // INP win on internal nav.
  setTimeout(() => {
    window.gtag!('config', TRACKING_ID, {
      page_path: location.pathname + location.search,
    });
  }, 0);
}
