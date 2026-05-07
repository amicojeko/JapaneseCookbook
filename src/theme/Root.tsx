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
 * Custom Root component: performance prefetch + global WebSite schema.
 */
export default function Root({children}: Props): ReactNode {
  React.useEffect(() => {
    // Aggiungi prefetch per CDN e servizi third-party
    const head = document.head;

    const links = [
      // Prefetch domains we know will be used
      // (Google Fonts hints are emitted SSR via `headTags` in docusaurus.config.ts.)
      { rel: 'dns-prefetch', href: '//www.googletagmanager.com' },
      { rel: 'dns-prefetch', href: '//www.google-analytics.com' },
      // Preconnect to critical resources
      { rel: 'preconnect', href: '//www.googletagmanager.com' },
    ];

    links.forEach(({rel, href}) => {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      head.appendChild(link);
    });

  }, []);

  return (
    <>
      <Head>
        <script type="application/ld+json">{JSON.stringify(WEBSITE_SCHEMA)}</script>
      </Head>
      {children}
    </>
  );
}
