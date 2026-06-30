'use strict';

/**
 * GET /.netlify/functions/negozi
 *
 * Parametri (tutti opzionali):
 *   region     — filtra per regione italiana (es. "Lombardia")
 *   city       — filtra per città (es. "Milano")
 *   online     — "true" per includere solo negozi online
 *   discount   — "true" per includere solo negozi con codici sconto
 *   q          — ricerca testuale su nome, città, regione, note
 *   lat + lng  — coordinate GPS dell'utente
 *   radius_km  — raggio di ricerca in km (default 20, richiede lat+lng)
 */

const knowledge = require('../../static/paginegiappe-knowledge.json');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const DISCOUNT_RE = /codice|sconto|promo|jeko/i;

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  const params = event.queryStringParameters ?? {};
  const regionFilter = (params.region ?? '').trim().toLowerCase();
  const cityFilter = (params.city ?? '').trim().toLowerCase();
  const onlineOnly = params.online === 'true';
  const discountOnly = params.discount === 'true';
  const q = (params.q ?? '').trim().toLowerCase();
  const userLat = params.lat ? parseFloat(params.lat) : null;
  const userLng = params.lng ? parseFloat(params.lng) : null;
  const radiusKm = params.radius_km ? parseFloat(params.radius_km) : 20;
  const hasGeo = userLat !== null && userLng !== null && !isNaN(userLat) && !isNaN(userLng);

  let negozi = onlineOnly ? [] : [...knowledge.negozi];
  let negoziOnline = [...knowledge.negozi_online];

  // ── Filtra negozi fisici ──────────────────────────────────────────────────
  if (!onlineOnly) {
    if (regionFilter) negozi = negozi.filter((n) => n.region?.toLowerCase().includes(regionFilter));
    if (cityFilter) negozi = negozi.filter((n) => n.city?.toLowerCase().includes(cityFilter));
    if (discountOnly) negozi = negozi.filter((n) => n.note && DISCOUNT_RE.test(n.note));
    if (q) {
      negozi = negozi.filter((n) =>
        [n.name, n.city, n.region, n.address, n.note]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q),
      );
    }

    // Geolocalizzazione: filtra per raggio e aggiungi distance_km
    if (hasGeo) {
      negozi = negozi
        .map((n) => ({
          ...n,
          distance_km: n.lat && n.lng ? Math.round(haversineKm(userLat, userLng, n.lat, n.lng) * 10) / 10 : null,
        }))
        .filter((n) => n.distance_km !== null && n.distance_km <= radiusKm)
        .sort((a, b) => a.distance_km - b.distance_km);
    }
  }

  // ── Filtra negozi online ──────────────────────────────────────────────────
  if (discountOnly) negoziOnline = negoziOnline.filter((n) => n.note && DISCOUNT_RE.test(n.note));

  if (!regionFilter && !cityFilter && !hasGeo) {
    if (q) {
      negoziOnline = negoziOnline.filter((n) =>
        [n.name, n.category, n.note].filter(Boolean).join(' ').toLowerCase().includes(q),
      );
    }
  } else if (!hasGeo) {
    // Con filtri geografici senza GPS, mostra solo online con region/city corrispondente
    negoziOnline = negoziOnline.filter((n) => {
      if (regionFilter && n.region && !n.region.toLowerCase().includes(regionFilter)) return false;
      if (cityFilter && n.city && !n.city.toLowerCase().includes(cityFilter)) return false;
      return true;
    });
  }
  // Con GPS attivo: negozi_online non hanno coordinate → li includi sempre (sono online, non dipendono da posizione)

  return {
    statusCode: 200,
    headers: {
      ...CORS,
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
    },
    body: JSON.stringify({
      total: negozi.length + negoziOnline.length,
      ...(hasGeo ? { search_center: { lat: userLat, lng: userLng }, radius_km: radiusKm } : {}),
      negozi,
      negozi_online: negoziOnline,
      source: 'https://paginegiappe.it/negozi_orientali/',
    }),
  };
};
