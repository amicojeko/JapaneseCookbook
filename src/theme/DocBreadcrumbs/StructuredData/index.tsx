import React, {type ReactNode} from 'react';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useSidebarBreadcrumbs} from '@docusaurus/plugin-content-docs/client';

export default function DocBreadcrumbsStructuredData(): ReactNode {
  const breadcrumbs = useSidebarBreadcrumbs();
  const {siteConfig} = useDocusaurusContext();

  if (!breadcrumbs) {
    return null;
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs
      .filter((breadcrumb) => breadcrumb.href)
      .map((breadcrumb, index) => {
        let url = `${siteConfig.url}${breadcrumb.href}`;
        if (!url.endsWith('/')) {
          url += '/';
        }
        return {
          '@type': 'ListItem',
          position: index + 1,
          name: breadcrumb.label,
          item: url,
        };
      }),
  };

  return (
    <Head>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Head>
  );
}
