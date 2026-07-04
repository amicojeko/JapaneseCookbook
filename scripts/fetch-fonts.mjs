#!/usr/bin/env node
/**
 * Self-host the Google Fonts used by the site.
 *
 * Downloads the woff2 subsets we actually need into `static/fonts/` and
 * generates `src/css/fonts.css` with the matching `@font-face` rules. Those
 * rules are inlined into <head> by the inline-fontface plugin in
 * docusaurus.config.ts (kept out of the webpack CSS pipeline so the /fonts/
 * URLs stay literal and match the <link rel=preload>). This replaces the old
 * render-blocking stylesheet request to the Google Fonts CDN.
 *
 * Scope:
 *  - Newsreader / Inter / JetBrains Mono → latin + latin-ext subsets, at the
 *    exact weights the site links (matches the previous Google-hosted setup).
 *  - Shippori Mincho → a `text=` subset covering only "ジェコ" (the footer
 *    katakana mark, the one place `--pg-font-jp` is applied) @ weight 800.
 *    Shipping the full Japanese face would be 300+ subset files for no gain.
 *
 * Run:  node scripts/fetch-fonts.mjs
 * (Requires network access to fonts.googleapis.com / fonts.gstatic.com.)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FONT_DIR = path.join(ROOT, 'static', 'fonts');
const CSS_OUT = path.join(ROOT, 'src', 'css', 'fonts.css');

// Modern Chrome UA so the API returns woff2 (with unicode-range subsetting).
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0 Safari/537.36';

function curl(url, binOut) {
  const args = ['-sS', '-A', UA, url];
  if (binOut) args.push('-o', binOut);
  return execFileSync('curl', args, binOut ? {} : { encoding: 'utf8', maxBuffer: 1e8 });
}

const requests = [
  {
    slug: 'newsreader',
    url: 'https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,700;6..72,800&display=swap',
    subsets: ['latin', 'latin-ext'],
  },
  {
    slug: 'inter',
    url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    subsets: ['latin', 'latin-ext'],
  },
  {
    slug: 'jetbrains-mono',
    url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap',
    subsets: ['latin', 'latin-ext'],
  },
  {
    // Footer kanji mark "ジェコ" only. text= returns a single tiny subset with
    // no subset comment, so `subsets: null` keeps every block returned.
    slug: 'shippori-mincho',
    url:
      'https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@800&text=' +
      encodeURIComponent('ジェコ') +
      '&display=swap',
    subsets: null,
    subsetTag: 'ja',
  },
];

fs.mkdirSync(FONT_DIR, { recursive: true });

// Split the API response into (optional /* subset */ comment, @font-face body).
function parseFaces(css) {
  const faces = [];
  const re = /(?:\/\*\s*([a-z0-9\[\]-]+)\s*\*\/\s*)?@font-face\s*{([^}]*)}/gi;
  let m;
  while ((m = re.exec(css))) faces.push({ subset: m[1], body: m[2] });
  return faces;
}

const pick = (body, re) => (body.match(re) || [])[1];

let out = `/* ------------------------------------------------------------------
 * Self-hosted web fonts (@font-face) — GENERATED, do not edit by hand.
 * Regenerate with:  node scripts/fetch-fonts.mjs
 *
 * Injected inline in <head> by the inline-fontface plugin in
 * docusaurus.config.ts (not bundled through webpack), so the /fonts/ URLs
 * stay literal and match the preload links.
 * Subsets: latin + latin-ext. Shippori Mincho is a text-subset of the
 * footer katakana mark "ジェコ" (@800). font-display: swap matches the
 * previous CDN-hosted behaviour.
 * ------------------------------------------------------------------ */
`;

let count = 0;
for (const req of requests) {
  for (const { subset, body } of parseFaces(curl(req.url))) {
    if (req.subsets && (!subset || !req.subsets.includes(subset))) continue;
    const family = pick(body, /font-family:\s*'([^']+)'/);
    const weight = pick(body, /font-weight:\s*(\d+)/);
    const style = pick(body, /font-style:\s*(\w+)/) || 'normal';
    const unicode = pick(body, /unicode-range:\s*([^;]+);/);
    const src = pick(body, /url\(([^)]+)\)/);
    if (!src || !family || !weight) continue;
    const tag = req.subsets ? subset.replace(/[^a-z0-9]/gi, '') : req.subsetTag;
    const file = `${req.slug}-${weight}-${tag}.woff2`;
    curl(src, path.join(FONT_DIR, file));
    count++;
    out += `\n@font-face {\n  font-family: '${family}';\n  font-style: ${style};\n  font-weight: ${weight};\n  font-display: swap;\n  src: url('/fonts/${file}') format('woff2');\n`;
    if (unicode) out += `  unicode-range: ${unicode.trim()};\n`;
    out += `}\n`;
  }
}

fs.writeFileSync(CSS_OUT, out);
console.log(`Downloaded ${count} woff2 → ${path.relative(ROOT, FONT_DIR)}`);
console.log(`Wrote ${path.relative(ROOT, CSS_OUT)}`);
