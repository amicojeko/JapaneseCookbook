import React from 'react';
import type {ReactNode} from 'react';
import Head from '@docusaurus/Head';

interface Props {
  children: ReactNode;
}

const SITE_URL = 'https://paginegiappe.it';

/**
 * Schema globale WebSite + SearchAction. Iniettato SSR cosi' Google lo
 * vede al crawl. Il SearchAction punta a /search?q=... (Algolia gestisce
 * la modal — il path e' fittizio ma semantically valido per il sitelinks
 * search box di Google).
 */
const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Pagine Giappe',
  alternateName: 'Le Ricette Giapponesi di Jeko',
  url: SITE_URL + '/',
  inLanguage: 'it-IT',
  potentialAction: {
    '@type': 'SearchAction',
    // Trailing slash perche' il sito usa trailingSlash: true (senza slash
    // Docusaurus ridireziona 301).
    target: {
      '@type': 'EntryPoint',
      urlTemplate: SITE_URL + '/search/?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

/**
 * Custom Root component: global WebSite schema.
 *
 * Note: we deliberately do NOT inject dns-prefetch hints for the analytics
 * domains. @docusaurus/plugin-google-gtag already emits a `preconnect` for both
 * www.googletagmanager.com and www.google-analytics.com (verified in the built
 * HTML), and a `preconnect` is a strict superset of `dns-prefetch` (it does the
 * DNS lookup plus the TCP + TLS handshake). Re-adding dns-prefetch to those two
 * origins was pure redundancy and pushed PSI past its "more than 4 preconnect
 * origins" budget (3 preconnect + 2 dns-prefetch = 5). Route prefetching is
 * handled separately by src/clientModules/deferPrefetch.ts.
 */
export default function Root({children}: Props): ReactNode {
  return (
    <>
      <Head>
        <script type="application/ld+json">{JSON.stringify(WEBSITE_SCHEMA)}</script>
      </Head>
      {children}
    </>
  );
}
