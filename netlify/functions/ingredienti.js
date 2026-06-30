'use strict';

/**
 * GET /.netlify/functions/ingredienti?q=miso[&limit=3]
 *
 * Restituisce le schede ingrediente complete (titolo, immagine, descrizione,
 * contenuto) dal knowledge base. A differenza di /search (Algolia, senza foto),
 * questo endpoint include sempre l'immagine quando presente.
 */

const knowledge = require('../../static/paginegiappe-knowledge.json');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function normalize(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[_-]+/g, ' ')
    .trim();
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  const params = event.queryStringParameters ?? {};
  const q = (params.q ?? '').trim();
  const limit = Math.min(parseInt(params.limit ?? '3', 10) || 3, 10);

  let results = knowledge.ingredienti;

  if (q) {
    const needle = normalize(q);
    results = results
      .map((ing) => {
        const title = normalize(ing.title);
        const inTitle = title.includes(needle);
        const inBody = normalize(`${ing.description ?? ''} ${ing.content ?? ''}`).includes(needle);
        return { ing, score: inTitle ? 2 : inBody ? 1 : 0 };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.ing);
  }

  results = results.slice(0, limit).map((ing) => ({
    title: ing.title,
    description: ing.description ?? '',
    url: ing.url,
    image: ing.image ?? null,
    content: ing.content ?? '',
  }));

  return {
    statusCode: 200,
    headers: {
      ...CORS,
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
    },
    body: JSON.stringify({ total: results.length, results, source: 'https://paginegiappe.it/ingredienti/' }),
  };
};
