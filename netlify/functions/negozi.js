'use strict';

/**
 * GET /.netlify/functions/negozi[?region=Lombardia&city=Milano&online=true]
 *
 * Restituisce negozi orientali italiani dal knowledge base di paginegiappe.it.
 *
 * Parametri (tutti opzionali — senza parametri ritorna tutto):
 *   region  — filtra per regione italiana (es. "Lombardia")
 *   city    — filtra per città (es. "Milano")
 *   online  — "true" per includere solo negozi online (negozi_online)
 *   q       — ricerca testuale su nome, città, regione, note
 */

const knowledge = require('../../static/paginegiappe-knowledge.json');

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
  const regionFilter = (params.region ?? '').trim().toLowerCase();
  const cityFilter = (params.city ?? '').trim().toLowerCase();
  const onlineOnly = params.online === 'true';
  const q = (params.q ?? '').trim().toLowerCase();

  let negozi = onlineOnly ? [] : [...knowledge.negozi];
  let negoziOnline = [...knowledge.negozi_online];

  // Filtra negozi fisici
  if (!onlineOnly) {
    if (regionFilter) negozi = negozi.filter((n) => n.region?.toLowerCase().includes(regionFilter));
    if (cityFilter) negozi = negozi.filter((n) => n.city?.toLowerCase().includes(cityFilter));
    if (q) {
      negozi = negozi.filter((n) =>
        [n.name, n.city, n.region, n.address, n.note]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q),
      );
    }
  }

  // Filtra negozi online
  if (!regionFilter && !cityFilter) {
    if (q) {
      negoziOnline = negoziOnline.filter((n) =>
        [n.name, n.category, n.note].filter(Boolean).join(' ').toLowerCase().includes(q),
      );
    }
  } else {
    // Con filtri geografici, mostra solo online che hanno region/city corrispondente
    negoziOnline = negoziOnline.filter((n) => {
      if (regionFilter && n.region && !n.region.toLowerCase().includes(regionFilter)) return false;
      if (cityFilter && n.city && !n.city.toLowerCase().includes(cityFilter)) return false;
      return true;
    });
  }

  return {
    statusCode: 200,
    headers: {
      ...CORS,
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
    },
    body: JSON.stringify({
      total: negozi.length + negoziOnline.length,
      negozi,
      negozi_online: negoziOnline,
      source: 'https://paginegiappe.it/negozi_orientali/',
    }),
  };
};
