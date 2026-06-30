'use strict';

/**
 * GET /.netlify/functions/search?q=karaage[&limit=5]
 *
 * Proxy verso Algolia Search per paginegiappe.it.
 * Usa le stesse credenziali già presenti in docusaurus.config.ts (search-only key pubblica).
 * Restituisce risultati strutturati con URL canoniche e breadcrumb per i LLM.
 */

const ALGOLIA_APP_ID = '9DWNYPKJD0';
const ALGOLIA_SEARCH_KEY = 'b31d01c5282cee1939baf74e884ce829';
const ALGOLIA_INDEX = 'ricettegiapponesi';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  const params = event.queryStringParameters ?? {};
  const q = (params.q ?? '').trim();

  if (!q) {
    return {
      statusCode: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Parametro "q" obbligatorio.' }),
    };
  }

  const hitsPerPage = Math.min(parseInt(params.limit ?? '10', 10) || 10, 20);

  const algoliaUrl = `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${ALGOLIA_INDEX}/query`;

  const algoliaRes = await fetch(algoliaUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Algolia-Application-Id': ALGOLIA_APP_ID,
      'X-Algolia-API-Key': ALGOLIA_SEARCH_KEY,
    },
    body: JSON.stringify({
      query: q,
      hitsPerPage,
      attributesToRetrieve: ['url', 'hierarchy', 'content', 'type'],
      attributesToHighlight: [],
      distinct: 1,
    }),
  });

  if (!algoliaRes.ok) {
    return {
      statusCode: 502,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Errore Algolia', status: algoliaRes.status }),
    };
  }

  const data = await algoliaRes.json();

  // Trasforma gli hit Algolia in un formato pulito per i LLM.
  // Deduplica per URL base (senza anchor #section) tenendo il primo hit per pagina.
  const seenUrls = new Set();
  const results = (data.hits ?? [])
    .map((hit) => {
      const h = hit.hierarchy ?? {};
      const baseUrl = (hit.url ?? '').split('#')[0];
      const title = h.lvl2 ?? h.lvl1 ?? h.lvl0 ?? '';
      const breadcrumb = [h.lvl0, h.lvl1]
        .filter(Boolean)
        .filter((v, i, a) => a.indexOf(v) === i)
        .join(' > ');
      return { title, breadcrumb, content: hit.content ?? null, url: baseUrl };
    })
    .filter(({ url }) => {
      if (!url || seenUrls.has(url)) return false;
      seenUrls.add(url);
      return true;
    });

  return {
    statusCode: 200,
    headers: {
      ...CORS,
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
    },
    body: JSON.stringify({
      query: q,
      total: results.length,
      results,
      source: 'https://paginegiappe.it',
    }),
  };
};
