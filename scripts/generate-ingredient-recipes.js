const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const DOCS_ROOT = path.join(process.cwd(), 'docs');
const RECIPES_ROOT = path.join(DOCS_ROOT, 'ricette');
const OUTPUT_FILE = path.join(process.cwd(), 'src', 'data', 'ingredient-recipes.ts');

function readFiles(dir) {
  const entries = fs.readdirSync(dir, {withFileTypes: true});
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return readFiles(fullPath);
    if (!entry.name.endsWith('.md') && !entry.name.endsWith('.mdx')) return [];
    return [fullPath];
  });
}

function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toDocId(filePath) {
  const rel = path.relative(DOCS_ROOT, filePath);
  return rel.replace(/\\/g, '/').replace(/\.(md|mdx)$/, '');
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
  const {data: fm} = matter(content);

  if (fm.draft === true) continue;

  const tags = Array.isArray(fm.tags) ? fm.tags : [];
  if (tags.length === 0) continue;

  const docId = toDocId(filePath);
  const title = typeof fm.title === 'string' ? fm.title : docId;
  const description = typeof fm.description === 'string' ? fm.description : undefined;
  const permalink = toPermalink(docId, fm.slug);

  for (const tag of tags) {
    const key = normalize(typeof tag === 'string' ? tag : String(tag));
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
