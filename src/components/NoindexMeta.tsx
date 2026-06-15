import React, {type ReactNode} from 'react';
import Head from '@docusaurus/Head';

// Emits <meta name="robots" content="noindex, follow"> for the current page.
// "follow" keeps the page's outbound links crawlable (so link equity still
// flows to the real content) while telling Google not to index the page
// itself. Used by the blog/search utility-page swizzle wrappers in
// src/theme/ to keep thin tag/author/archive/pagination/search routes out of
// the index — they're also dropped from sitemap.xml (see docusaurus.config.ts).
export default function NoindexMeta(): ReactNode {
  return (
    <Head>
      <meta name="robots" content="noindex, follow" />
    </Head>
  );
}
