#!/usr/bin/env node
/**
 * MCP server per paginegiappe.it
 *
 * Chiama le Netlify Functions già deployate e formatta le risposte in Markdown
 * ricco (foto incluse, schede ricetta impaginate) per una resa curata nel client.
 *
 * Config Claude Desktop (claude_desktop_config.json):
 *   "mcpServers": {
 *     "paginegiappe": { "command": "npx", "args": ["-y", "mcp-paginegiappe@latest"] }
 *   }
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const BASE = 'https://paginegiappe.it/.netlify/functions';

async function apiFetch(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

// ── Helper di formattazione Markdown ───────────────────────────────────────────

/** Immagine markdown (stringa vuota se assente). */
function img(url, alt) {
  return url ? `![${(alt ?? '').replace(/[[\]]/g, '')}](${url})\n` : '';
}

/** Scheda ricetta completa: foto, meta, descrizione, ingredienti, preparazione, fonte. */
function recipeCard(r, { heading = '##' } = {}) {
  const out = [`${heading} ${r.title}`];
  if (r.image) out.push(`\n${img(r.image, r.title)}`);
  const meta = [];
  if (r.category) meta.push(`**Categoria:** ${r.category}`);
  if (r.recipeYield) meta.push(`**Resa:** ${r.recipeYield}`);
  if (meta.length) out.push(`\n${meta.join(' · ')}`);
  if (r.description) out.push(`\n${r.description}`);
  if (r.servings_note) out.push(`\n> 📐 ${r.servings_note}`);
  if (r.ingredients?.length) {
    out.push(`\n**Ingredienti**`);
    out.push(r.ingredients.map((i) => `- ${i}`).join('\n'));
  }
  if (r.instructions) {
    out.push(`\n**Preparazione**`);
    out.push(r.instructions);
  }
  out.push(`\n🔗 [Ricetta completa su paginegiappe.it](${r.url})`);
  return out.join('\n');
}

/** Scheda negozio: nome, indirizzo, distanza, codici sconto, link. */
function shopCard(s) {
  const out = [`### ${s.name}`];
  const loc = [s.address, s.city, s.region && `(${s.region})`].filter(Boolean).join(' ');
  if (loc) out.push(`📍 ${loc}`);
  if (s.distance_km != null) out.push(`📏 ~${s.distance_km} km`);
  if (s.note) out.push(`🏷️ ${s.note}`);
  const links = [];
  if (s.url) links.push(`[Sito](${s.url})`);
  if (s.lat && s.lng) links.push(`[Mappa](https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng})`);
  if (links.length) out.push(links.join(' · '));
  return out.join('\n');
}

/** Voce online: nome, categoria, sconto, link. */
function onlineShopCard(s) {
  const out = [`### ${s.name}${s.category ? ` — _${s.category}_` : ''}`];
  if (s.note) out.push(`🏷️ ${s.note}`);
  if (s.url) out.push(`[Sito](${s.url})`);
  return out.join('\n');
}

/** Risultato generico (search / blog): titolo linkato, foto, snippet. */
function linkCard(item) {
  const title = item.title || item.url;
  const out = [`### [${title}](${item.url})`];
  if (item.breadcrumb) out.push(`_${item.breadcrumb}_`);
  if (item.image) out.push(`\n${img(item.image, title)}`);
  if (item.content || item.description) out.push(`\n${item.content || item.description}`);
  return out.join('\n');
}

const SEP = '\n\n---\n\n';

// ── Server ──────────────────────────────────────────────────────────────────

const server = new McpServer(
  { name: 'paginegiappe', version: '1.1.0' },
  {
    instructions:
      "Questi tool restituiscono già contenuti formattati in Markdown da paginegiappe.it. " +
      "Quando li presenti all'utente: mantieni SEMPRE le immagini (sintassi ![]()) e i link alla fonte, " +
      "non riassumere via le foto. Per le ricette conserva il layout a scheda (foto, ingredienti, preparazione). " +
      "Cita esclusivamente contenuti presenti nei risultati: non inventare ricette, dosi, negozi o codici sconto.",
  },
);

/** Registra un tool il cui handler ritorna una stringa Markdown; gestisce gli errori. */
function tool(name, description, schema, run) {
  server.tool(name, description, schema, async (args) => {
    try {
      return { content: [{ type: 'text', text: await run(args) }] };
    } catch (e) {
      return { content: [{ type: 'text', text: `⚠️ Errore: ${e?.message ?? e}` }], isError: true };
    }
  });
}

// ── search ──────────────────────────────────────────────────────────────────

tool(
  'search',
  'Cerca qualsiasi contenuto di paginegiappe.it: ricette, ingredienti, strumenti, blog, viaggi. Usa questo tool per domande generiche o quando non sai in quale categoria cercare.',
  {
    query: z.string().describe('Termine di ricerca (es. "miso", "ramen", "dashi")'),
    limit: z.number().int().min(1).max(20).optional().default(8),
  },
  async ({ query, limit }) => {
    const data = await apiFetch(`/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    if (!data.results?.length) return `Nessun risultato per "${query}" su paginegiappe.it.`;
    return `Risultati per **${query}** (${data.results.length}):\n\n` + data.results.map(linkCard).join(SEP);
  },
);

// ── find_recipes ──────────────────────────────────────────────────────────────

tool(
  'find_recipes',
  'Cerca ricette di cucina giapponese. Supporta ricerca per nome, per ingrediente, per categoria e calcolo dosi per numero di persone.',
  {
    query: z.string().optional().describe('Nome o parola chiave della ricetta (es. "karaage", "pollo fritto")'),
    ingredient: z.string().optional().describe('Filtra ricette che contengono questo ingrediente (es. "miso", "tofu", "shoyu")'),
    category: z.string().optional().describe('Categoria: Fritti, Zuppe, Riso, Noodles, Griglia, Antipasti, Pesce, Stufati, Contorni, Sushi, Marinati, Brodi, Salse, Condimenti'),
    servings: z.number().int().min(1).max(20).optional().describe('Numero di persone — aggiunge note di conversione dosi'),
    limit: z.number().int().min(1).max(30).optional().default(8),
  },
  async ({ query, ingredient, category, servings, limit }) => {
    const p = new URLSearchParams();
    if (query) p.set('q', query);
    if (ingredient) p.set('ingredient', ingredient);
    if (category) p.set('category', category);
    if (servings) p.set('servings', String(servings));
    if (limit) p.set('limit', String(limit));
    const data = await apiFetch(`/recipes?${p}`);
    if (!data.results?.length) return 'Nessuna ricetta trovata con questi criteri.';
    const head = `Trovate ${data.total} ricette${data.total > data.returned ? ` (mostro le prime ${data.returned})` : ''}.`;
    return `${head}\n\n` + data.results.map((r) => recipeCard(r)).join(SEP);
  },
);

// ── explain_ingredient ────────────────────────────────────────────────────────

tool(
  'explain_ingredient',
  "Spiega un ingrediente giapponese: cos'è, come si usa, dove trovarlo, differenze tra varietà. Restituisce foto e scheda completa.",
  {
    ingredient: z.string().describe('Nome dell\'ingrediente (es. "miso", "dashi", "mirin", "nori")'),
  },
  async ({ ingredient }) => {
    const data = await apiFetch(`/ingredienti?q=${encodeURIComponent(ingredient)}&limit=2`);
    if (!data.results?.length) return `Nessuna scheda ingrediente trovata per "${ingredient}".`;
    return data.results
      .map((ing) => {
        const out = [`## ${ing.title}`];
        if (ing.image) out.push(`\n${img(ing.image, ing.title)}`);
        if (ing.content) out.push(`\n${ing.content}`);
        else if (ing.description) out.push(`\n${ing.description}`);
        out.push(`\n🔗 [Scheda completa](${ing.url})`);
        return out.join('\n');
      })
      .join(SEP);
  },
);

// ── find_shops ────────────────────────────────────────────────────────────────

tool(
  'find_shops',
  'Trova negozi di alimentari giapponesi/asiatici in Italia. Supporta ricerca per città, regione o coordinate GPS (negozi vicino all\'utente).',
  {
    region: z.string().optional().describe('Regione italiana (es. "Lombardia", "Lazio", "Piemonte")'),
    city: z.string().optional().describe('Città (es. "Milano", "Roma", "Torino")'),
    lat: z.number().optional().describe('Latitudine GPS dell\'utente'),
    lng: z.number().optional().describe('Longitudine GPS dell\'utente'),
    radius_km: z.number().optional().default(20).describe('Raggio di ricerca in km (default 20, usato solo con lat+lng)'),
    online: z.boolean().optional().describe('true per cercare solo negozi online'),
    query: z.string().optional().describe('Ricerca testuale su nome, indirizzo, note'),
  },
  async ({ region, city, lat, lng, radius_km, online, query }) => {
    const p = new URLSearchParams();
    if (region) p.set('region', region);
    if (city) p.set('city', city);
    if (lat !== undefined) p.set('lat', String(lat));
    if (lng !== undefined) p.set('lng', String(lng));
    if (radius_km) p.set('radius_km', String(radius_km));
    if (online) p.set('online', 'true');
    if (query) p.set('q', query);
    const data = await apiFetch(`/negozi?${p}`);
    const sections = [];
    if (data.negozi?.length) sections.push(data.negozi.map(shopCard).join(SEP));
    if (data.negozi_online?.length) sections.push(`## Negozi online\n\n` + data.negozi_online.map(onlineShopCard).join(SEP));
    if (!sections.length) return 'Nessun negozio trovato con questi criteri.';
    return `${data.total} negozi trovati.\n\n` + sections.join(SEP);
  },
);

// ── find_shops_with_discount ──────────────────────────────────────────────────

tool(
  'find_shops_with_discount',
  'Trova negozi di alimentari giapponesi che offrono codici sconto esclusivi per i lettori di paginegiappe.it.',
  {
    region: z.string().optional().describe('Filtra per regione italiana (opzionale)'),
  },
  async ({ region }) => {
    const p = new URLSearchParams({ discount: 'true' });
    if (region) p.set('region', region);
    const data = await apiFetch(`/negozi?${p}`);
    const all = [...(data.negozi ?? []).map(shopCard), ...(data.negozi_online ?? []).map(onlineShopCard)];
    if (!all.length) return 'Nessun negozio con codice sconto trovato.';
    return `🏷️ Negozi con codici sconto (${all.length}):\n\n` + all.join(SEP);
  },
);

// ── suggest_menu ──────────────────────────────────────────────────────────────

tool(
  'suggest_menu',
  'Suggerisce un menu giapponese completo con ricette, ingredienti e istruzioni. Usa questo tool quando l\'utente chiede un menu, vuole la lista della spesa o un piano di preparazione.',
  {
    servings: z.number().int().min(1).max(20).optional().default(2).describe('Numero di persone'),
    occasion: z.enum(['pranzo', 'cena', 'aperitivo']).optional().default('cena').describe('Tipo di pasto'),
  },
  async ({ servings, occasion }) => {
    const data = await apiFetch(`/suggest?type=menu&servings=${servings}&occasion=${occasion}`);
    if (!data.courses?.length) return 'Non sono riuscito a comporre un menu.';
    const head = `# Menu ${data.occasion} per ${data.servings} ${data.servings === 1 ? 'persona' : 'persone'}`;
    // recipeCard titola con c.title; anteponiamo il ruolo (Antipasto, Primo…)
    const body = data.courses
      .map((c) => {
        const card = recipeCard(c);
        return c.role
          ? card.replace(`## ${c.title}`, `## ${c.role[0].toUpperCase()}${c.role.slice(1)}: ${c.title}`)
          : card;
      })
      .join(SEP);
    return `${head}\n\n${body}\n\n---\n\n${data.note ?? ''}`;
  },
);

// ── get_reading_list ──────────────────────────────────────────────────────────

tool(
  'get_reading_list',
  'Suggerisce libri di cucina giapponese e film/anime/serie TV legati al cibo e alla cultura gastronomica giapponese.',
  {},
  async () => {
    const data = await apiFetch('/suggest?type=reading');
    const out = [];
    if (data.libri?.length) out.push(`# 📚 Libri\n\n` + data.libri.map(linkCard).join(SEP));
    if (data.video?.length) out.push(`# 🎬 Film, Anime e Serie TV\n\n` + data.video.map(linkCard).join(SEP));
    return out.join(SEP) || 'Nessun suggerimento disponibile.';
  },
);

// ── get_blog_curiosity ────────────────────────────────────────────────────────

tool(
  'get_blog_curiosity',
  'Trova articoli e curiosità sul Giappone dal blog di paginegiappe.it: storia, cultura gastronomica, ingredienti, bevande, viaggi, anime.',
  {
    topic: z.string().optional().describe('Argomento di interesse (es. "sake", "ramen", "storia", "birra")'),
  },
  async ({ topic }) => {
    const p = new URLSearchParams({ type: 'blog' });
    if (topic) p.set('topic', topic);
    const data = await apiFetch(`/suggest?${p}`);
    if (!data.results?.length) return topic ? `Nessun articolo trovato su "${topic}".` : 'Nessun articolo disponibile.';
    const head = topic ? `Articoli sul tema **${topic}**:` : 'Ultimi articoli dal blog:';
    return `${head}\n\n` + data.results.map(linkCard).join(SEP);
  },
);

// ── Avvio ─────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
