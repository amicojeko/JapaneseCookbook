#!/usr/bin/env node
/**
 * MCP server per paginegiappe.it
 *
 * Chiama le Netlify Functions già deployate — nessuna logica duplicata.
 * Configura in Claude Desktop aggiungendo a claude_desktop_config.json:
 *
 *   "mcpServers": {
 *     "paginegiappe": {
 *       "command": "node",
 *       "args": ["/percorso/assoluto/JapaneseCookbook/mcp/server.js"]
 *     }
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

const server = new McpServer({
  name: 'paginegiappe',
  version: '1.0.0',
});

// ── search ────────────────────────────────────────────────────────────────────

server.tool(
  'search',
  'Cerca qualsiasi contenuto di paginegiappe.it: ricette, ingredienti, strumenti, blog, viaggi. Usa questo tool per domande generiche o quando non sai in quale categoria cercare.',
  {
    query: z.string().describe('Termine di ricerca (es. "miso", "ramen", "dashi")'),
    limit: z.number().int().min(1).max(20).optional().default(8).describe('Numero massimo di risultati'),
  },
  async ({ query, limit }) => {
    const data = await apiFetch(`/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  },
);

// ── find_recipes ──────────────────────────────────────────────────────────────

server.tool(
  'find_recipes',
  'Cerca ricette di cucina giapponese. Supporta ricerca per nome, per ingrediente, per categoria e calcolo dosi per numero di persone.',
  {
    query: z.string().optional().describe('Nome o parola chiave della ricetta (es. "karaage", "pollo fritto")'),
    ingredient: z.string().optional().describe('Filtra ricette che contengono questo ingrediente (es. "miso", "tofu", "shoyu")'),
    category: z.string().optional().describe('Categoria: Fritti, Zuppe, Riso, Noodles, Griglia, Antipasti, Pesce, Stufati, Contorni, Sushi, Marinati, Brodi, Salse, Condimenti'),
    servings: z.number().int().min(1).max(20).optional().describe('Numero di persone — aggiunge note di conversione dosi'),
    limit: z.number().int().min(1).max(30).optional().default(10),
  },
  async ({ query, ingredient, category, servings, limit }) => {
    const p = new URLSearchParams();
    if (query) p.set('q', query);
    if (ingredient) p.set('ingredient', ingredient);
    if (category) p.set('category', category);
    if (servings) p.set('servings', String(servings));
    if (limit) p.set('limit', String(limit));
    const data = await apiFetch(`/recipes?${p}`);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

// ── explain_ingredient ────────────────────────────────────────────────────────

server.tool(
  'explain_ingredient',
  'Spiega un ingrediente giapponese: cos\'è, come si usa, dove trovarlo, differenze tra varietà. Usa questo tool quando l\'utente chiede informazioni su un ingrediente specifico.',
  {
    ingredient: z.string().describe('Nome dell\'ingrediente (es. "miso", "dashi", "mirin", "nori")'),
  },
  async ({ ingredient }) => {
    const data = await apiFetch(`/search?q=${encodeURIComponent(ingredient)}&type=ingredienti&limit=3`);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

// ── find_shops ────────────────────────────────────────────────────────────────

server.tool(
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
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

// ── find_shops_with_discount ──────────────────────────────────────────────────

server.tool(
  'find_shops_with_discount',
  'Trova negozi di alimentari giapponesi che offrono codici sconto esclusivi per i lettori di paginegiappe.it.',
  {
    region: z.string().optional().describe('Filtra per regione italiana (opzionale)'),
  },
  async ({ region }) => {
    const p = new URLSearchParams({ discount: 'true' });
    if (region) p.set('region', region);
    const data = await apiFetch(`/negozi?${p}`);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

// ── suggest_menu ──────────────────────────────────────────────────────────────

server.tool(
  'suggest_menu',
  'Suggerisce un menu giapponese completo con ricette, ingredienti e istruzioni. Usa questo tool quando l\'utente chiede un menu, vuole la lista della spesa o un piano di preparazione. Il tool restituisce le ricette complete (ingredienti + istruzioni) — elabora tu la lista della spesa aggregata e il piano di cottura ordinato.',
  {
    servings: z.number().int().min(1).max(20).optional().default(2).describe('Numero di persone'),
    occasion: z.enum(['pranzo', 'cena', 'aperitivo']).optional().default('cena').describe('Tipo di pasto'),
  },
  async ({ servings, occasion }) => {
    const data = await apiFetch(`/suggest?type=menu&servings=${servings}&occasion=${occasion}`);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

// ── get_reading_list ──────────────────────────────────────────────────────────

server.tool(
  'get_reading_list',
  'Suggerisce libri di cucina giapponese e film/anime/serie TV legati al cibo e alla cultura gastronomica giapponese.',
  {},
  async () => {
    const data = await apiFetch('/suggest?type=reading');
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

// ── get_blog_curiosity ────────────────────────────────────────────────────────

server.tool(
  'get_blog_curiosity',
  'Trova articoli e curiosità sul Giappone dal blog di paginegiappe.it: storia, cultura gastronomica, ingredienti, bevande, viaggi, anime. Usa questo tool quando l\'utente chiede "raccontami qualcosa sul Giappone" o vuole approfondire un argomento culturale.',
  {
    topic: z.string().optional().describe('Argomento di interesse (es. "sake", "ramen", "storia", "birra", "mercato del pesce")'),
  },
  async ({ topic }) => {
    const p = new URLSearchParams({ type: 'blog' });
    if (topic) p.set('topic', topic);
    const data = await apiFetch(`/suggest?${p}`);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

// ── Avvio ─────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
