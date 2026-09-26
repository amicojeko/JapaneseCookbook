/**
 * Defer Docusaurus's route prefetching until the page is idle.
 *
 * Docusaurus's <Link> prefetches every internal link that scrolls into the
 * viewport: IntersectionObserver → window.docusaurus.prefetch → a burst of
 * <link rel="prefetch"> for each route's JS + data chunks. On a dense hub page
 * like the home (~40 links → ~180 prefetch requests) that burst fires during
 * the initial load and, on slow mobile 4G, competes with the LCP resources for
 * bandwidth — it regressed home LCP from 7.0s to 9.1s in PSI (3 Jul 2026).
 *
 * Fix: disable viewport-driven route prefetch. Replaying the initial queue — or
 * re-enabling it before a hidden mobile menu becomes visible — downloads and
 * parses many route chunks just as the user starts interacting. Docusaurus
 * still loads the requested route normally on navigation; we only remove the
 * speculative work that was producing avoidable mobile long tasks. We also
 * pause hover/touch preload briefly while the mobile navbar opens: otherwise
 * the panel can appear under the pointer and preload many newly visible links
 * during the menu interaction itself.
 *
 * Registered via `clientModules` in docusaurus.config.ts. This runs during app
 * bootstrap — before the first <Link> mounts and its observer can fire — so the
 * very first prefetch call is already intercepted.
 */
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

if (ExecutionEnvironment.canUseDOM) {
  type Prefetch = (routePath: string) => Promise<void> | void;
  const w = window as unknown as {
    docusaurus?: {prefetch: Prefetch; preload: Prefetch};
    requestIdleCallback?: (cb: () => void, opts?: {timeout: number}) => void;
    addEventListener: Window['addEventListener'];
  };

  const patch = (): boolean => {
    const dsx = w.docusaurus;
    if (!dsx || typeof dsx.prefetch !== 'function') return false;

    // `window.docusaurus` is a frozen object (Object.freeze in Docusaurus's
    // clientEntry), so we can't mutate `.prefetch` in place — a strict-mode
    // assignment throws. The `window` property itself is writable, though, and
    // <Link> reads `window.docusaurus.prefetch` fresh on every call, so we swap
    // in a new frozen object that keeps `preload` and overrides `prefetch`.
    let suspendPreloadUntil = 0;
    const originalPreload = dsx.preload.bind(dsx);
    const guardedPreload: Prefetch = (routePath) => {
      if (performance.now() < suspendPreloadUntil) return Promise.resolve();
      return originalPreload(routePath);
    };

    document.addEventListener(
      'click',
      (event) => {
        const target = event.target as HTMLElement | null;
        if (target?.closest('.navbar__toggle')) {
          suspendPreloadUntil = performance.now() + 600;
        }
      },
      true,
    );

    w.docusaurus = Object.freeze({
      ...dsx,
      prefetch: () => Promise.resolve(),
      preload: guardedPreload,
    });
    return true;
  };

  // window.docusaurus may not exist yet when this module runs; retry on the next
  // frames until it does — still well before the first <Link> intersects.
  if (!patch()) {
    let tries = 0;
    const retry = () => {
      if (patch() || ++tries > 60) return;
      requestAnimationFrame(retry);
    };
    requestAnimationFrame(retry);
  }
}
