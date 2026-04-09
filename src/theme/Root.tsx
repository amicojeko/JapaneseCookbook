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
      { rel: 'dns-prefetch', href: '//www.googletagmanager.com' },
      { rel: 'dns-prefetch', href: '//www.google-analytics.com' },
      { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
      { rel: 'dns-prefetch', href: '//fonts.gstatic.com' },
      // Preconnect to critical resources
      { rel: 'preconnect', href: '//www.googletagmanager.com' },
      { rel: 'preconnect', href: '//fonts.gstatic.com', crossorigin: 'anonymous' },
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
