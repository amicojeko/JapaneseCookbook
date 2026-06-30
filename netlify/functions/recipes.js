'use strict';

/**
 * GET /.netlify/functions/recipes
 *
 * Parametri (tutti opzionali — senza parametri ritorna tutte le ricette):
 *   q          — ricerca testuale (titolo, descrizione, tags)
 *   ingredient — filtra ricette che contengono questo ingrediente
 *   category   — filtra per categoria (Fritti, Zuppe, Riso, Noodles…)
 *   servings   — numero di persone; aggiunge servings_note con moltiplicatore
 *   limit      — max risultati (default 10, max 30)
 */

const knowledge = require('../../static/paginegiappe-knowledge.json');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/** Estrae il numero di persone da stringhe tipo "2 persone", "4", "per 3". */
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

/** Normalizza: minuscolo, no accenti, _ e - → spazio. */
function norm(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[_-]+/g, ' ')
    .trim();
}

/**
 * Match morfologico tra due termini: combaciano se uno contiene l'altro,
 * oppure se condividono un prefisso di almeno 4 caratteri. Gestisce le
 * declinazioni italiane senza un dizionario: "vegana"/"vegane"/"vegano" → "vegan",
 * "vegetariana" → "vegetarian", "marinati" → "marinato", ecc.
 */
function looseMatch(a, b) {
  a = norm(a);
  b = norm(b);
  if (!a || !b) return false;
  if (a.includes(b) || b.includes(a)) return true;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i >= 4;
}

// Sinonimi stagionali → tag canonico (le forme sostantivo/aggettivo italiane
// divergono troppo presto per il match morfologico, es. "estate" vs "estivo").
const SEASON_SYNONYMS = {
  estate: 'estivo', estiva: 'estivo', estive: 'estivo', estivi: 'estivo', estivo: 'estivo', summer: 'estivo',
  inverno: 'invernale', invernale: 'invernale', invernali: 'invernale', winter: 'invernale',
  primavera: 'primaverile', primaverile: 'primaverile', primaverili: 'primaverile', spring: 'primaverile',
  autunno: 'autunnale', autunnale: 'autunnale', autunnali: 'autunnale', autumn: 'autunnale', fall: 'autunnale',
};

/** Riconduce un termine al suo tag stagionale canonico, se applicabile. */
function canon(term) {
  return SEASON_SYNONYMS[norm(term)] ?? term;
}

/** Il recipe ha un tag che combacia (morfologicamente) col termine. */
function matchesTag(recipe, term) {
  const c = canon(term);
  return (recipe.tags ?? []).some((t) => looseMatch(t, c));
}

function matchesIngredient(recipe, ingredient) {
  const needle = norm(ingredient);
  const inIngredients = recipe.ingredients.some((ing) => norm(ing).includes(needle));
  return inIngredients || matchesTag(recipe, ingredient);
}

/** Ogni token deve comparire nel titolo/descrizione/categoria o combaciare con un tag. */
function matchesQuery(recipe, tokens) {
  const text = norm([recipe.title, recipe.description, recipe.category].filter(Boolean).join(' '));
  return tokens.every((t) => text.includes(norm(t)) || matchesTag(recipe, t));
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  const params = event.queryStringParameters ?? {};
  const q = (params.q ?? '').trim();
  const ingredient = (params.ingredient ?? '').trim();
  const tag = (params.tag ?? '').trim();
  const category = (params.category ?? '').trim().toLowerCase();
  const servings = params.servings ? parseInt(params.servings, 10) : null;
  const limit = Math.min(parseInt(params.limit ?? '10', 10) || 10, 30);

  const tokens = q ? q.toLowerCase().split(/\s+/).filter(Boolean) : [];

  let results = knowledge.ricette.filter((r) => {
    if (tokens.length && !matchesQuery(r, tokens)) return false;
    if (ingredient && !matchesIngredient(r, ingredient)) return false;
    if (tag && !matchesTag(r, tag)) return false;
    if (category && r.category?.toLowerCase() !== category) return false;
    return true;
  });

  // Rilevanza: match nel titolo prima, con bonus per match esatto / iniziale.
  if (tokens.length) {
    const qLower = q.toLowerCase();
    const score = (r) => {
      const title = r.title.toLowerCase();
      let s = tokens.filter((t) => title.includes(t)).length; // # token nel titolo
      if (title === qLower) s += 100; // titolo identico alla query (es. "Dashi")
      else if (title.startsWith(qLower)) s += 50; // titolo inizia con la query
      return s;
    };
    results.sort((a, b) => score(b) - score(a) || a.title.length - b.title.length);
  }

  const totalMatches = results.length;

  results = results.slice(0, limit).map((r) => ({
    title: r.title,
    description: r.description,
    url: r.url,
    image: r.image,
    category: r.category,
    tags: r.tags,
    recipeYield: r.recipeYield ?? null,
    ingredients: r.ingredients,
    instructions: r.instructions,
    ...(servings ? { servings_note: servingsNote(r, servings) } : {}),
  }));

  return {
    statusCode: 200,
    headers: {
      ...CORS,
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
    },
    body: JSON.stringify({ total: totalMatches, returned: results.length, servings: servings ?? null, results }),
  };
};
