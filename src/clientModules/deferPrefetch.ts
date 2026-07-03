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
 * Fix: queue the initial prefetch burst and release it only after `load` +
 * requestIdleCallback, in small batches, so the critical (LCP) resources win
 * the bandwidth first. Once activated, prefetch behaves normally, so instant
 * SPA navigation is preserved for anyone who scrolls before clicking. On
 * Save-Data / 2g we drop the eager prefetch entirely.
 *
 * Registered via `clientModules` in docusaurus.config.ts. This runs during app
 * bootstrap — before the first <Link> mounts and its observer can fire — so the
 * very first prefetch call is already intercepted.
 */
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

if (ExecutionEnvironment.canUseDOM) {
  const w = window as unknown as {
    docusaurus?: {prefetch: (routePath: string) => Promise<void> | void};
    requestIdleCallback?: (cb: () => void, opts?: {timeout: number}) => void;
    addEventListener: Window['addEventListener'];
  };

  const patch = (): boolean => {
    const dsx = w.docusaurus;
    if (!dsx || typeof dsx.prefetch !== 'function') return false;

    const original = dsx.prefetch.bind(dsx);
    const conn = (navigator as {connection?: {saveData?: boolean; effectiveType?: string}})
      .connection;

    // Data-saver or 2g: skip the eager route prefetch altogether.
    if (conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''))) {
      dsx.prefetch = () => Promise.resolve();
      return true;
    }

    let active = false;
    const queued = new Set<string>();

    dsx.prefetch = (routePath: string) => {
      if (active) return original(routePath);
      queued.add(routePath);
      return Promise.resolve();
    };

    const activate = () => {
      if (active) return;
      active = true;
      // Release queued routes in small idle-scheduled batches so they don't all
      // hit the network at once, then let subsequent on-viewport calls flow
      // straight through to the original prefetch.
      const routes = [...queued];
      queued.clear();
      let i = 0;
      const step = () => {
        const end = Math.min(i + 4, routes.length);
        for (; i < end; i++) original(routes[i]);
        if (i < routes.length) {
          if (typeof w.requestIdleCallback === 'function') {
            w.requestIdleCallback(step, {timeout: 500});
          } else {
            setTimeout(step, 200);
          }
        }
      };
      step();
    };

    const scheduleActivate = () => {
      if (typeof w.requestIdleCallback === 'function') {
        w.requestIdleCallback(activate, {timeout: 4000});
      } else {
        setTimeout(activate, 2000);
      }
    };

    if (document.readyState === 'complete') {
      scheduleActivate();
    } else {
      w.addEventListener('load', scheduleActivate, {once: true});
    }
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
