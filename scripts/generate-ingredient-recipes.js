const fs = require('fs');
const path = require('path');

const DOCS_ROOT = path.join(process.cwd(), 'docs');
const RECIPES_ROOT = path.join(DOCS_ROOT, 'ricette');
const OUTPUT_FILE = path.join(process.cwd(), 'src', 'data', 'ingredient-recipes.ts');

function readFiles(dir) {
  const entries = fs.readdirSync(dir, {withFileTypes: true});
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return readFiles(fullPath);
    if (!entry.name.endsWith('.md')) return [];
    return [fullPath];
  });
}

function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseFrontmatter(content) {
  if (!content.startsWith('---')) return null;
  const end = content.indexOf('\n---', 3);
  if (end === -1) return null;
  const fm = content.slice(3, end).replace(/^\n/, '');
  const lines = fm.split(/\r?\n/);

  const data = {};
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const keyMatch = /^([a-zA-Z0-9_]+):\s*(.*)$/.exec(line);
    if (!keyMatch) {
      i += 1;
      continue;
    }

    const key = keyMatch[1];
    const value = keyMatch[2];

    if (value.startsWith('[') && value.endsWith(']')) {
      data[key] = value
        .slice(1, -1)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      i += 1;
      continue;
    }

    if (value === '') {
      const list = [];
      let j = i + 1;
      while (j < lines.length && /^\s*-\s+/.test(lines[j])) {
        list.push(lines[j].replace(/^\s*-\s+/, '').trim());
        j += 1;
      }
      if (list.length > 0) {
        data[key] = list;
        i = j;
        continue;
      }
    }

    data[key] = value.replace(/^"|"$/g, '').trim();
    i += 1;
  }

  return data;
}

function toDocId(filePath) {
  const rel = path.relative(DOCS_ROOT, filePath);
  return rel.replace(/\\/g, '/').replace(/\.md$/, '');
}

function toPermalink(docId, slug) {
  if (typeof slug === 'string' && slug.length > 0) {
    return slug.startsWith('/') ? slug : `/${slug}`;
  }
  return `/${docId}`;
}

const files = readFiles(RECIPES_ROOT);
const index = {};

for (const filePath of files) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fm = parseFrontmatter(content);
  if (!fm) continue;

  const tags = Array.isArray(fm.tags) ? fm.tags : [];
  if (tags.length === 0) continue;

  const docId = toDocId(filePath);
  const title = typeof fm.title === 'string' ? fm.title : docId;
  const description = typeof fm.description === 'string' ? fm.description : undefined;
  const permalink = toPermalink(docId, fm.slug);

  for (const tag of tags) {
    const key = normalize(tag);
    if (!key) continue;
    if (!index[key]) index[key] = [];
    index[key].push({
      id: docId,
      title,
      description,
      permalink,
    });
  }
}

const output = `export const INGREDIENT_RECIPE_INDEX = ${JSON.stringify(index, null, 2)};\n`;
fs.writeFileSync(OUTPUT_FILE, output);
console.log(`Wrote ${OUTPUT_FILE} with ${Object.keys(index).length} tags.`);
