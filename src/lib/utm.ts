/**
 * UTM tagging for outbound links to shop websites.
 *
 * Lets the shops (and us) see how much traffic arrives from paginegiappe.it
 * and from which page. Applied to the shop-site links on /negozi_orientali/online/,
 * on the region pages and in the map popups — NOT to Google Maps links
 * (Maps ignores UTM params).
 */

export const UTM_SOURCE = 'paginegiappe.it';
export const UTM_MEDIUM = 'referral';

type UtmOptions = {
  /** utm_campaign — which surface the link lives on. */
  campaign: string;
  /** utm_content — usually the shop id, to tell single links apart. */
  content?: string;
};

/**
 * Returns `url` with utm_source / utm_medium / utm_campaign appended.
 *
 * No-ops (returns the input untouched) when the URL is empty, isn't an
 * absolute http(s) URL, or already carries a `utm_source` — so a partner link
 * that already has its own tagging is never overwritten.
 */
export function withUtm(url: string | undefined, opts: UtmOptions): string | undefined {
  if (!url) return url;

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return url;
    if (parsed.searchParams.has('utm_source')) return url;

    parsed.searchParams.set('utm_source', UTM_SOURCE);
    parsed.searchParams.set('utm_medium', UTM_MEDIUM);
    parsed.searchParams.set('utm_campaign', opts.campaign);
    if (opts.content) parsed.searchParams.set('utm_content', opts.content);

    return parsed.toString();
  } catch {
    // Relative or malformed URL — leave it alone.
    return url;
  }
}
