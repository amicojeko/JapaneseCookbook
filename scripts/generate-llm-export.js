#!/usr/bin/env node
/**
 * Genera static/paginegiappe-knowledge.json — export unificato di tutti i
 * contenuti pubblicati del sito, ottimizzato per l'ingestione da parte di LLM
 * (Custom GPT, Gemini Gem, MCP server). Rigenerato dal prebuild.
 *
 * Sezioni: ricette, ingredienti, strumenti, libri, viaggi, video, negozi, blog.
 * Esclusi: file con draft:true, index.md di categoria (dove non è l'unico contenuto).
 */

'use strict';

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const ROOT = process.cwd();
const SITE_URL = 'https://paginegiappe.it';
const OUTPUT_FILE = path.join(ROOT, 'static/paginegiappe-knowledge.json');

// ─── Utility ─────────────────────────────────────────────────────────────────

function absUrl(slug) {
  if (!slug) return null;
  const s = slug.startsWith('/') ? slug : '/' + slug;
  return SITE_URL + (s.endsWith('/') ? s : s + '/');
}

function absImg(img) {
  if (!img) return null;
  if (/^https?:\/\//.test(img)) return img;
  return SITE_URL + (img.startsWith('/') ? img : '/' + img);
}

/** Pulisce il body markdown rimuovendo componenti MDX/JSX, import, link e formattazione. */
function stripMdx(content) {
  return content
    .replace(/^import\s+.+$/gm, '')
    .replace(/:::[^\n]*\n[\s\S]*?:::/g, '')
    .replace(/<[A-Za-z][A-Za-z0-9]*[^>]*\/>/g, '')
    .replace(/<[A-Za-z][A-Za-z0-9]*[^>]*>[\s\S]*?<\/[A-Za-z][A-Za-z0-9]*>/g, '')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*\n]+)\*/g, '$1')
    .replace(/_([^_\n]+)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+(.+)$/gm, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Visita ricorsiva di una directory raccogliendo file .md/.mdx. */
function walk(dir, { includeIndex = false } = {}) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(full, { includeIndex }));
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
      if (!includeIndex && entry.name === 'index.md') continue;
      files.push(full);
    }
  }
  return files;
}

function readMd(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data: fm, content } = matter(raw);
  return { fm, content };
}

// ─── Ricette ─────────────────────────────────────────────────────────────────

const CATEGORY_MAP = {
  agemono: 'Fritti',
  antipasti: 'Antipasti',
  fish: 'Pesce',
  menrui: 'Noodles',
  nimono: 'Stufati',
  riso: 'Riso',
  sides: 'Contorni',
  tsukemono: 'Marinati',
  yakimono: 'Griglia',
  zuppe: 'Zuppe',
  brodi: 'Brodi',
  salse: 'Salse',
  condimenti: 'Condimenti',
  sushi_and_sashimi: 'Sushi',
};

function parseSections(body) {
  const lines = body.split('\n');
  const sections = [];
  let current = null;
  for (const line of lines) {
    const m = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (m) {
      if (current) sections.push(current);
      current = { level: m[1].length, title: m[2].trim(), lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) sections.push(current);
  return sections.map((s) => ({ ...s, content: s.lines.join('\n').trim() }));
}

function parseList(content) {
  return content
    .split('\n')
    .map((l) => l.match(/^\s*[-*+]\s+(.+?)\s*$/)?.[1])
    .filter(Boolean)
    .map((s) =>
      s
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/\*\*?([^*]+)\*\*?/g, '$1')
        .trim(),
    );
}

function cleanInstructions(content) {
  return content
    .replace(/:::[^\n]*\n[\s\S]*?:::/g, '')
    .replace(/<[A-Za-z][^>]*\/>/g, '')
    .replace(/<[A-Za-z][^>]*>[\s\S]*?<\/[A-Za-z][^>]*>/g, '')
    .split('\n')
    .map((l) =>
      l
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/\*\*?([^*]+)\*\*?/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .trim(),
    )
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function categoryFromPath(filePath) {
  const rel = path
    .relative(path.join(ROOT, 'docs/ricette'), filePath)
    .replace(/\\/g, '/');
  const parts = rel.split('/');
  const folder = parts[parts.length - 2];
  return CATEGORY_MAP[folder] ?? null;
}

function processRicette() {
  const dir = path.join(ROOT, 'docs/ricette');
  const files = walk(dir, { includeIndex: false });
  const result = [];
  for (const f of files) {
    const { fm, content } = readMd(f);
    if (fm.draft === true) continue;
    if (!fm.title) continue;
    const sections = parseSections(content);
    const ingrSection = sections.find((s) => /^ingredienti$/i.test(s.title));
    const prepSection = sections.find((s) => /^preparazione$/i.test(s.title));
    const ingredients = ingrSection
      ? parseList(ingrSection.content)
      : Array.isArray(fm.ingredients)
        ? fm.ingredients
        : [];
    result.push({
      title: fm.title,
      description: fm.description ?? '',
      url: absUrl(fm.slug),
      image: absImg(fm.image),
      category: categoryFromPath(f),
      tags: Array.isArray(fm.tags) ? fm.tags : [],
      ingredients,
      instructions: prepSection ? cleanInstructions(prepSection.content) : '',
    });
  }
  return result;
}

// ─── Sezioni doc generiche ────────────────────────────────────────────────────

function processDocSection(dirRel, { includeIndex = false } = {}) {
  const dir = path.join(ROOT, dirRel);
  const files = walk(dir, { includeIndex });
  const result = [];
  for (const f of files) {
    const { fm, content } = readMd(f);
    if (fm.draft === true) continue;
    if (!fm.title && !fm.slug) continue;
    result.push({
      title: fm.title ?? '',
      description: fm.description ?? '',
      url: absUrl(fm.slug),
      image: absImg(fm.image ?? null),
      tags: Array.isArray(fm.tags) ? fm.tags : [],
      content: stripMdx(content),
    });
  }
  return result;
}

// ─── Negozi (parse TypeScript sorgente) ──────────────────────────────────────

/**
 * Estrae un array literal da un file TypeScript tramite bracket matching.
 * Non richiede ts-node — funziona finché gli oggetti sono JSON-compatibili
 * (no computed properties, no template literals nei valori).
 */
function extractTsArray(filePath, varName) {
  const src = fs.readFileSync(path.join(ROOT, filePath), 'utf-8');
  const declIdx = src.indexOf(`const ${varName}`);
  if (declIdx === -1) {
    console.warn(`⚠️  ${varName} non trovato in ${filePath}`);
    return [];
  }
  // Cerca il '[' dopo il '=' per saltare le type annotation (es: Negozio[])
  const eqIdx = src.indexOf('=', declIdx);
  if (eqIdx === -1) return [];
  const bracketStart = src.indexOf('[', eqIdx);
  if (bracketStart === -1) return [];

  let depth = 0;
  let i = bracketStart;
  for (; i < src.length; i++) {
    if (src[i] === '[') depth++;
    else if (src[i] === ']') {
      depth--;
      if (depth === 0) break;
    }
  }

  const arrayStr = src.slice(bracketStart, i + 1);
  const jsonStr = arrayStr
    .replace(/(?<!:)\/\/[^\n]*/g, '')  // commenti inline (non :// nelle URL)
    .replace(/\/\*[\s\S]*?\*\//g, '')  // commenti blocco
    .replace(/,(\s*[\}\]])/g, '$1')   // trailing commas
    .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":'); // quota chiavi

  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.warn(`⚠️  Impossibile parsare ${varName} in ${filePath}: ${e.message}`);
    return [];
  }
}

function processNegozi() {
  const negozi = extractTsArray('src/data/negozi.ts', 'NEGOZI').map((n) => ({
    name: n.name,
    region: n.region,
    city: n.city,
    address: n.address,
    url: n.url ?? null,
    lat: n.lat,
    lng: n.lng,
    note: n.note ?? null,
  }));

  const negoziOnline = extractTsArray(
    'src/data/negozi-online.ts',
    'ONLINE_ONLY',
  ).map((n) => ({
    name: n.name,
    url: n.url,
    category: n.category ?? null,
    note: n.note ?? null,
    region: n.region ?? null,
    city: n.city ?? null,
  }));

  return { negozi, negozi_online: negoziOnline };
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

function processBlog() {
  const blogDir = path.join(ROOT, 'blog');
  const result = [];
  for (const entry of fs.readdirSync(blogDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const indexFile = path.join(blogDir, entry.name, 'index.md');
    if (!fs.existsSync(indexFile)) continue;
    const { fm } = readMd(indexFile);
    if (fm.draft === true) continue;
    const slug = fm.slug ?? entry.name.replace(/^\d{4}-\d{2}-\d{2}-/, '');
    const dateMatch = entry.name.match(/^(\d{4}-\d{2}-\d{2})/);
    const authors = Array.isArray(fm.authors) ? fm.authors : fm.authors ? [fm.authors] : [];
    result.push({
      title: fm.title ?? '',
      description: fm.description ?? '',
      url: absUrl(`/blog/${slug}`),
      image: absImg(fm.image ?? null),
      date: dateMatch?.[1] ?? null,
      authors,
      tags: Array.isArray(fm.tags) ? fm.tags : [],
    });
  }
  result.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
  return result;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const t0 = Date.now();

  const ricette = processRicette();
  const ingredienti = processDocSection('docs/ingredienti', { includeIndex: false });
  const strumenti = processDocSection('docs/strumenti', { includeIndex: false });
  // Libri e video hanno l'unica pagina significativa in index.md
  const libri = processDocSection('docs/libri', { includeIndex: true });
  const viaggi = processDocSection('docs/viaggi', { includeIndex: false });
  const video = processDocSection('docs/video', { includeIndex: true });
  const { negozi, negozi_online } = processNegozi();
  const blog = processBlog();

  const output = {
    meta: {
      site: SITE_URL,
      description:
        'Guida italiana alla cucina giapponese: ricette autentiche, ingredienti, negozi orientali in Italia, strumenti, viaggi e cultura gastronomica.',
      generated: new Date().toISOString(),
      version: 1,
    },
    ricette,
    ingredienti,
    strumenti,
    libri,
    viaggi,
    video,
    negozi,
    negozi_online,
    blog,
  };

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');

  const elapsed = Date.now() - t0;
  const counts = [
    `ricette:${ricette.length}`,
    `ingredienti:${ingredienti.length}`,
    `strumenti:${strumenti.length}`,
    `libri:${libri.length}`,
    `viaggi:${viaggi.length}`,
    `video:${video.length}`,
    `negozi:${negozi.length}`,
    `negozi_online:${negozi_online.length}`,
    `blog:${blog.length}`,
  ].join(' ');
  console.log(
    `✅ Generated ${path.relative(ROOT, OUTPUT_FILE)} in ${elapsed}ms — ${counts}`,
  );
}

main();
