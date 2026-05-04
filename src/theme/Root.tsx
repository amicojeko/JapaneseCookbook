import React from 'react';
import type {ReactNode} from 'react';

interface Props {
  children: ReactNode;
}

/**
 * Custom Root component to add performance optimizations to head
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

    links.forEach(({rel, href, crossorigin}) => {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      if (crossorigin) {
        link.setAttribute('crossorigin', crossorigin);
      }
      head.appendChild(link);
    });

  }, []);

  return <>{children}</>;
}
