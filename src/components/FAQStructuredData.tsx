import React from 'react';
import Head from '@docusaurus/Head';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import {FAQ_DATA, type FaqItem} from '@site/src/data/faq-data';

/**
 * Inietta lo schema JSON-LD `FAQPage` sulle pagine che hanno una sezione
 * "Domande frequenti..." nel body markdown. Le Q/A sono estratte dal
 * prebuild script generate-faq-data.js — il componente legge solo dal
 * mapping pre-calcolato in FAQ_DATA.
 */
export default function FAQStructuredData(): React.ReactElement | null {
  const {metadata} = useDoc();
  const items: FaqItem[] | undefined = FAQ_DATA[metadata.id];
  if (!items || items.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: it.a,
      },
    })),
  };

  return (
    <Head>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Head>
  );
}
