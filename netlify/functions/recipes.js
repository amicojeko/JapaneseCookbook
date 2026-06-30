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

/** Normalizza per il match ingredienti: minuscolo, no accenti, _ e - → spazio. */
function normalizeIng(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[_-]+/g, ' ')
    .trim();
}

function matchesIngredient(recipe, ingredient) {
  const needle = normalizeIng(ingredient);
  // Cerca sia nella lista ingredienti estesa che nei tag canonici (es. "shoyu", "potato_starch")
  const inIngredients = recipe.ingredients.some((ing) => normalizeIng(ing).includes(needle));
  const inTags = (recipe.tags ?? []).some((t) => normalizeIng(t).includes(needle));
  return inIngredients || inTags;
}

function matchesQuery(recipe, tokens) {
  const haystack = [recipe.title, recipe.description, ...(recipe.tags ?? []), recipe.category]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  const normalized = haystack + ' ' + haystack.replace(/-/g, '');
  return tokens.every((t) => normalized.includes(t));
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  const params = event.queryStringParameters ?? {};
  const q = (params.q ?? '').trim();
  const ingredient = (params.ingredient ?? '').trim();
  const category = (params.category ?? '').trim().toLowerCase();
  const servings = params.servings ? parseInt(params.servings, 10) : null;
  const limit = Math.min(parseInt(params.limit ?? '10', 10) || 10, 30);

  const tokens = q ? q.toLowerCase().split(/\s+/).filter(Boolean) : [];

  let results = knowledge.ricette.filter((r) => {
    if (tokens.length && !matchesQuery(r, tokens)) return false;
    if (ingredient && !matchesIngredient(r, ingredient)) return false;
    if (category && r.category?.toLowerCase() !== category) return false;
    return true;
  });

  // Rilevanza: titolo match prima
  if (tokens.length) {
    const titleTokens = tokens.filter((t) => results.some((r) => r.title.toLowerCase().includes(t)));
    if (titleTokens.length) {
      results.sort((a, b) => {
        const aTitle = titleTokens.filter((t) => a.title.toLowerCase().includes(t)).length;
        const bTitle = titleTokens.filter((t) => b.title.toLowerCase().includes(t)).length;
        return bTitle - aTitle;
      });
    }
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
