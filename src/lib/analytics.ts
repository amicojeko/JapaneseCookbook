/**
 * Thin wrapper around GA4 gtag. gtag.js is loaded only in production builds
 * (see docusaurus.config.ts), so in dev — or before the script binds — we fall
 * back to a console.debug so event wiring can be verified locally without GA.
 *
 * If the P1 defer-gtag setup is in place, events pushed here still buffer in
 * dataLayer and get replayed when gtag.js loads — no special handling needed.
 */
type EventParams = Record<string, string | number | boolean | undefined>;

type GtagWindow = Window & {
  gtag?: (...args: unknown[]) => void;
};

export function gtagEvent(name: string, params: EventParams = {}): void {
  if (typeof window === 'undefined') return;

  const gtag = (window as GtagWindow).gtag;
  if (typeof gtag === 'function') {
    gtag('event', name, params);
    return;
  }

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('[gtagEvent]', name, params);
  }
}
