#!/usr/bin/env node

/**
 * Estrae da ogni file ricetta in docs/ricette/ il frontmatter + ingredienti
 * e preparazione parsati dal body markdown, e produce
 * src/data/recipe-data.ts. Il file viene poi consumato dal componente
 * RecipeStructuredData per costruire lo schema JSON-LD Recipe.
 *
 * MVP: prima sezione "Ingredienti" (h2/h3), prima sezione "Preparazione"
 * (con tolleranza per typo "Preprarazione"). Iter 2: split per paragrafo
 * delle istruzioni in HowToStep multipli.
 */

const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');
const matter = require('gray-matter');

const ROOT = process.cwd();
const RICETTE_DIR = path.join(ROOT, 'docs/ricette');
const OUTPUT_FILE = path.join(ROOT, 'src/data/recipe-data.ts');

// Mapping cartella -> recipeCategory schema.org (italiano)
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

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if ((entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) && entry.name !== 'index.md') {
      files.push(full);
    }
  }
  return files;
}

function stripInlineMarkdown(s) {
  return s
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')   // [text](url) -> text
    .replace(/\*\*([^*]+)\*\*/g, '$1')          // bold
    .replace(/__([^_]+)__/g, '$1')              // bold alt
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '$1') // italic
    .replace(/(?<!_)_([^_]+)_(?!_)/g, '$1')     // italic alt
    .replace(/`([^`]+)`/g, '$1')                // inline code
    .trim();
}

/**
 * Split body markdown in blocchi delimitati dagli header (#, ##, ###...).
 * Ogni blocco: { level, title, content }.
 */
function parseSections(body) {
  const lines = body.split('\n');
  const sections = [];
  let current = null;
  for (const line of lines) {
    const m = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (m) {
      if (current) sections.push(current);
      current = {level: m[1].length, title: m[2].trim(), lines: []};
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) sections.push(current);
  return sections.map((s) => ({...s, content: s.lines.join('\n').trim()}));
}

function parseList(content) {
  const items = [];
  for (const line of content.split('\n')) {
    const m = line.match(/^\s*[-*+]\s+(.+?)\s*$/);
    if (m) items.push(stripInlineMarkdown(m[1]));
  }
  return items;
}

/**
 * Pulisce il testo di una sezione di preparazione: rimuove admonitions,
 * componenti MDX, link markdown, codice, e collassa righe multiple in un
 * unico blob di testo separato da spazi (MVP: singolo HowToStep).
 */
function cleanInstructions(content) {
  return content
    .replace(/:::[^\n]*\n[\s\S]*?:::/g, '')             // admonitions
    .replace(/<[A-Za-z][^>]*\/>/g, '')                   // self-closing JSX
    .replace(/<[A-Za-z][^>]*>[\s\S]*?<\/[A-Za-z][^>]*>/g, '') // paired JSX
    .split('\n')
    .map((l) => stripInlineMarkdown(l).trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function docIdFromPath(filePath) {
  // docs/ricette/agemono/kara-age.md -> ricette/agemono/kara-age
  return path
    .relative(path.join(ROOT, 'docs'), filePath)
    .replace(/\\/g, '/')
    .replace(/\.(md|mdx)$/, '');
}

function categoryFromPath(filePath) {
  // docs/ricette/agemono/kara-age.md -> agemono
  // docs/ricette/preparazioni_di_base/brodi/dashi.md -> brodi
  const rel = path.relative(RICETTE_DIR, filePath).replace(/\\/g, '/');
  const parts = rel.split('/');
  // parts: ['agemono', 'kara-age.md'] OR ['preparazioni_di_base', 'brodi', 'dashi.md']
  // Prendiamo l'ultima cartella prima del file.
  const folder = parts[parts.length - 2];
  return CATEGORY_MAP[folder] ?? null;
}

/** Estrae tutti i videoId dai componenti `<YouTubeVideo videoId="..." />`. */
function extractVideoIds(body) {
  const ids = [];
  const re = /<YouTubeVideo\s+videoId=["']([^"']+)["'][^>]*\/?>/g;
  for (const m of body.matchAll(re)) ids.push(m[1]);
  return ids;
}

/**
 * Data del primo commit del file (proxy per "datePublished" dello schema).
 * Usa --diff-filter=A --follow per beccare il commit di creazione anche
 * dopo rinomine. Ritorna ISO 8601 string o null se non in git.
 */
function firstCommitDate(absFile) {
  try {
    const out = execSync(
      `git log --diff-filter=A --follow --format='%aI' -- ${JSON.stringify(absFile)}`,
      {encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore']},
    ).trim();
    if (!out) return null;
    const lines = out.split('\n').filter(Boolean);
    return lines[lines.length - 1] || null;
  } catch {
    return null;
  }
}

function extractRecipe(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const {data: frontMatter, content: body} = matter(raw);

  // Skip draft: true (Docusaurus stesso esclude la pagina dal build)
  if (frontMatter.draft === true) return null;

  const sections = parseSections(body);
  const videoIds = extractVideoIds(body);
  const datePublished = firstCommitDate(filePath);

  // Prima sezione il cui titolo e' esattamente "Ingredienti" (case-insensitive).
  // Eventuali varianti tipo "Ingredienti per N persone" vanno rinominate nel
  // body e il yield va spostato nel frontmatter `recipeYield`.
  const ingrSection = sections.find((s) => /^ingredienti$/i.test(s.title));
  const recipeIngredient = ingrSection ? parseList(ingrSection.content) : [];

  // Prima sezione il cui titolo e' esattamente "Preparazione".
  const prepSection = sections.find((s) => /^preparazione$/i.test(s.title));
  const instructionsText = prepSection ? cleanInstructions(prepSection.content) : '';

  return {
    docId: docIdFromPath(filePath),
    title: frontMatter.title ?? '',
    description: frontMatter.description ?? '',
    image: frontMatter.image ?? null,
    recipeCategory: categoryFromPath(filePath),
    recipeKeywords: Array.isArray(frontMatter.tags) ? frontMatter.tags : [],
    recipeYield: typeof frontMatter.recipeYield === 'string' ? frontMatter.recipeYield : null,
    recipeIngredient,
    instructionsText,
    videoIds,
    datePublished,
  };
}

function main() {
  const files = walk(RICETTE_DIR);
  const recipes = files
    .map(extractRecipe)
    .filter((r) => r !== null)
    .filter((r) => r.recipeIngredient.length > 0 || r.instructionsText.length > 0);

  // Indicizza per docId
  const byId = Object.create(null);
  for (const r of recipes) byId[r.docId] = r;

  // Output: file TS con const RECIPE_DATA.
  const header = `// AUTO-GENERATED da scripts/generate-recipe-data.js — non editare a mano.\n// Estratto da docs/ricette/**/*.md. Rigenerato dal prebuild.\n\nexport interface RecipeData {\n  docId: string;\n  title: string;\n  description: string;\n  image: string | null;\n  recipeCategory: string | null;\n  recipeKeywords: string[];\n  recipeYield: string | null;\n  recipeIngredient: string[];\n  instructionsText: string;\n  videoIds: string[];\n  datePublished: string | null;\n}\n\nexport const RECIPE_DATA: Record<string, RecipeData> = `;

  const body = JSON.stringify(byId, null, 2);

  fs.mkdirSync(path.dirname(OUTPUT_FILE), {recursive: true});
  fs.writeFileSync(OUTPUT_FILE, header + body + ';\n', 'utf-8');

  console.log(`✅ Generated ${path.relative(ROOT, OUTPUT_FILE)} with ${Object.keys(byId).length} recipes.`);
}

main();
