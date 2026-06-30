'use strict';

/**
 * GET /.netlify/functions/suggest?type=menu|reading|blog
 *
 * Parametri:
 *   type     — "menu" | "reading" | "blog" (obbligatorio)
 *   servings — numero di persone (solo per type=menu, default 2)
 *   occasion — "pranzo" | "cena" | "aperitivo" (opzionale, per type=menu)
 *   topic    — argomento di ricerca (solo per type=blog, es. "storia", "sake")
 */

const knowledge = require('../../static/paginegiappe-knowledge.json');

const ALGOLIA_APP_ID = '9DWNYPKJD0';
const ALGOLIA_SEARCH_KEY = 'b31d01c5282cee1939baf74e884ce829';
const ALGOLIA_INDEX = 'ricettegiapponesi';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Struttura di un menu completo: [categoria_principale, categorie_contorno]
const MENU_STRUCTURE = {
  cena: [
    { role: 'antipasto', categories: ['Antipasti'] },
    { role: 'primo', categories: ['Noodles', 'Riso', 'Zuppe'] },
    { role: 'secondo', categories: ['Fritti', 'Griglia', 'Pesce', 'Stufati'] },
    { role: 'contorno', categories: ['Contorni', 'Marinati'] },
  ],
  pranzo: [
    { role: 'piatto principale', categories: ['Riso', 'Noodles', 'Fritti', 'Griglia'] },
    { role: 'contorno', categories: ['Contorni', 'Marinati', 'Antipasti'] },
  ],
  aperitivo: [
    { role: 'stuzzichino', categories: ['Antipasti'] },
    { role: 'stuzzichino', categories: ['Fritti'] },
    { role: 'stuzzichino', categories: ['Sushi'] },
  ],
};

function parseYield(yieldStr) {
  if (!yieldStr) return null;
  const m = yieldStr.match(/\d+/);
  return m ? parseInt(m[0], 10) : null;
}

function servingsNote(recipe, servings) {
  const base = parseYield(recipe.recipeYield ?? null);
  if (!base || base === servings) return null;
  const mult = (servings / base).toFixed(2).replace(/\.?0+$/, '');
  return `Le dosi indicate sono per ${base} ${base === 1 ? 'persona' : 'persone'}. Per ${servings} persone moltiplica ogni ingrediente × ${mult}.`;
}

/** Seleziona una ricetta casuale (con seed basato su ora) da una lista di categorie. */
function pickRecipe(categories, exclude = new Set()) {
  const candidates = knowledge.ricette.filter(
    (r) => categories.includes(r.category) && r.ingredients.length > 0 && !exclude.has(r.url),
  );
  if (!candidates.length) return null;
  // Seed giornaliero per risultati stabili nella stessa giornata ma variabili nel tempo
  const seed = Math.floor(Date.now() / 86400000) + categories[0].charCodeAt(0);
  return candidates[seed % candidates.length];
}

function buildMenu(occasion, servings) {
  const structure = MENU_STRUCTURE[occasion] ?? MENU_STRUCTURE.cena;
  const usedUrls = new Set();
  const courses = [];

  for (const course of structure) {
    const recipe = pickRecipe(course.categories, usedUrls);
    if (!recipe) continue;
    usedUrls.add(recipe.url);
    courses.push({
      role: course.role,
      title: recipe.title,
      description: recipe.description,
      url: recipe.url,
      image: recipe.image,
      category: recipe.category,
      recipeYield: recipe.recipeYield ?? null,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      ...(servings ? { servings_note: servingsNote(recipe, servings) } : {}),
    });
  }
  return courses;
}

async function suggestBlog(topic) {
  const url = `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${ALGOLIA_INDEX}/query`;
  let data;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Algolia-Application-Id': ALGOLIA_APP_ID,
        'X-Algolia-API-Key': ALGOLIA_SEARCH_KEY,
      },
      body: JSON.stringify({ query: topic, hitsPerPage: 8, attributesToRetrieve: ['url', 'hierarchy', 'content'], attributesToHighlight: [], distinct: 1 }),
    });
    if (!res.ok) return [];
    data = await res.json();
  } catch {
    return [];
  }
  const seenUrls = new Set();
  return (data.hits ?? [])
    .map((h) => ({ title: h.hierarchy?.lvl1 ?? h.hierarchy?.lvl0 ?? '', url: (h.url ?? '').split('#')[0], content: h.content ?? null }))
    .filter(({ url }) => { if (!url || seenUrls.has(url)) return false; seenUrls.add(url); return true; })
    .filter(({ url }) => url.includes('/blog/'))
    .slice(0, 5);
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  const params = event.queryStringParameters ?? {};
  const type = (params.type ?? '').trim();

  if (!['menu', 'reading', 'blog'].includes(type)) {
    return {
      statusCode: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Parametro "type" obbligatorio: menu | reading | blog' }),
    };
  }

  const headers = { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' };

  // ── MENU ─────────────────────────────────────────────────────────────────
  if (type === 'menu') {
    const servings = params.servings ? parseInt(params.servings, 10) : 2;
    const occasion = ['pranzo', 'cena', 'aperitivo'].includes(params.occasion) ? params.occasion : 'cena';
    const courses = buildMenu(occasion, servings);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        type: 'menu',
        occasion,
        servings,
        courses,
        note: 'Per la lista della spesa: aggrega gli ingredienti di tutti i piatti, eliminando i duplicati. Per il piano di preparazione: inizia dai piatti con cotture più lunghe (brodi, stufati, marinature) e finisci con i fritti.',
      }),
    };
  }

  // ── READING ───────────────────────────────────────────────────────────────
  if (type === 'reading') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        type: 'reading',
        libri: knowledge.libri.map((l) => ({ title: l.title, description: l.description, url: l.url, content: l.content })),
        video: knowledge.video.map((v) => ({ title: v.title, description: v.description, url: v.url, content: v.content })),
        source: 'https://paginegiappe.it',
      }),
    };
  }

  // ── BLOG ─────────────────────────────────────────────────────────────────
  if (type === 'blog') {
    const topic = (params.topic ?? '').trim();
    const results = topic
      ? await suggestBlog(topic)
      : knowledge.blog.slice(0, 8).map((b) => ({ title: b.title, url: b.url, description: b.description }));
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ type: 'blog', topic: topic || null, results, source: 'https://paginegiappe.it/blog/' }),
    };
  }
};
