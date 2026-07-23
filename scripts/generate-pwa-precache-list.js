#!/usr/bin/env node

/**
 * Genera static/pwa-precache-images.json: la lista delle foto hero delle
 * ricette che il client module (src/clientModules/pwaWarmImages.ts) pre-scarica
 * in background così ogni ricetta è disponibile OFFLINE con foto, senza doverle
 * aprire una a una.
 *
 * Per contenere il traffico si sceglie UNA variante piccola per ricetta (≈640w
 * WebP dall'srcset in static/image-srcset.json, fallback al master). Offline la
 * pagina ricetta potrebbe richiedere una taglia diversa: ci pensa il service
 * worker (src/sw-custom.js) che, in mancanza di rete, serve una variante
 * "sorella" già in cache della stessa immagine.
 *
 * Fa parte della catena prebuild. Legge il frontmatter `image` di ogni ricetta
 * in docs/ricette/ (esclusi gli index di categoria).
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const ROOT = process.cwd();
const RICETTE_DIR = path.join(ROOT, 'docs/ricette');
const SRCSET_FILE = path.join(ROOT, 'static/image-srcset.json');
const OUTPUT_FILE = path.join(ROOT, 'static/pwa-precache-images.json');

// Larghezza-obiettivo per la variante da pre-scaldare (px). Piccola per pesare
// poco; il fallback "sorella" del SW copre le altre taglie offline.
const TARGET_WIDTH = 640;

const srcset = fs.existsSync(SRCSET_FILE)
  ? JSON.parse(fs.readFileSync(SRCSET_FILE, 'utf8'))
  : {};

/** Tutti i .md/.mdx sotto docs/ricette, esclusi gli index di categoria. */
function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full));
    } else if (/\.mdx?$/.test(entry.name) && !/^index\.mdx?$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

/** Sceglie dall'srcset la variante WebP ≈TARGET_WIDTH (la più grande ≤ target,
 *  altrimenti la più piccola disponibile). Ritorna un URL root-relative. */
function pickVariant(imagePath) {
  const key = imagePath.replace(/^\/img\//, '');
  const data = srcset[key];
  if (!data || !data.srcset) {
    return imagePath; // nessuna variante: usa il master
  }
  const entries = data.srcset
    .split(',')
    .map((s) => s.trim())
    .map((s) => {
      const [url, w] = s.split(/\s+/);
      return { url, width: parseInt(w, 10) };
    })
    .filter((e) => e.url && !Number.isNaN(e.width))
    .sort((a, b) => a.width - b.width);

  if (entries.length === 0) {
    return imagePath;
  }
  const leq = entries.filter((e) => e.width <= TARGET_WIDTH);
  return (leq.length ? leq[leq.length - 1] : entries[0]).url;
}

const urls = [];
const seen = new Set();
for (const file of walk(RICETTE_DIR)) {
  const { data } = matter(fs.readFileSync(file, 'utf8'));
  const image = data.image;
  if (data.draft === true) continue;
  if (typeof image !== 'string' || !image.startsWith('/img/')) continue;
  const url = pickVariant(image);
  if (!seen.has(url)) {
    seen.add(url);
    urls.push(url);
  }
}

urls.sort();
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(urls));
console.log(
  `✅ Generated static/pwa-precache-images.json — ${urls.length} recipe hero image(s) to warm`
);
