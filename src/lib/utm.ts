/**
 * UTM tagging for outbound links to shop websites.
 *
 * I link ai negozi hanno `rel="noopener noreferrer"`, quindi l'header
 * `Referer` non viene inviato: senza questi parametri il negozio vede i
 * nostri click come traffico diretto. source + medium sono il minimo che
 * rende il traffico attribuibile a paginegiappe.it nel loro analytics.
 *
 * Applicato ai link verso il sito del negozio (pagina online, pagine regione,
 * popup della mappa) — NON ai link Google Maps, che ignorano gli UTM.
 */

export const UTM_SOURCE = 'paginegiappe.it';
export const UTM_MEDIUM = 'referral';

/**
 * Returns `url` with utm_source / utm_medium appended.
 *
 * No-ops (returns the input untouched) when the URL is empty, isn't an
 * absolute http(s) URL, or already carries a `utm_source` — so a partner link
 * that already has its own tagging is never overwritten.
 */
export function withUtm(url: string | undefined): string | undefined {
  if (!url) return url;

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return url;
    if (parsed.searchParams.has('utm_source')) return url;

    parsed.searchParams.set('utm_source', UTM_SOURCE);
    parsed.searchParams.set('utm_medium', UTM_MEDIUM);

    return parsed.toString();
  } catch {
    // Relative or malformed URL — leave it alone.
    return url;
  }
}
