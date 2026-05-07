import React from 'react';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import type {DocCardDoc} from './DocCard';

const FALLBACK_SITE_URL = 'https://paginegiappe.it';

interface Props {
  /** I doc renderizzati nella card grid (stesso shape di DocCardGrid). */
  docs: DocCardDoc[];
  /** Nome opzionale dell'ItemList (es. "Ricette giapponesi alla griglia"). */
  name?: string;
}

/**
 * Inietta lo schema JSON-LD `ItemList` per pagine che renderizzano una
 * lista di doc come card (CategoryIndexPage, DocTagDocListPage). Aiuta
 * Google a capire che la pagina e' una rassegna e non un singolo articolo.
 */
export default function ItemListStructuredData({docs, name}: Props): React.ReactElement | null {
  const {siteConfig} = useDocusaurusContext();
  const siteUrl = (siteConfig.url || FALLBACK_SITE_URL).replace(/\/$/, '');
  if (!docs || docs.length === 0) return null;

  const itemListElement = docs.map((doc, idx) => {
    const url = doc.permalink.startsWith('http')
      ? doc.permalink
      : siteUrl + (doc.permalink.startsWith('/') ? doc.permalink : '/' + doc.permalink);
    return {
      '@type': 'ListItem',
      position: idx + 1,
      url,
      name: doc.title,
    };
  });

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: docs.length,
    itemListElement,
  };
  if (name) schema.name = name;

  return (
    <Head>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Head>
  );
}
