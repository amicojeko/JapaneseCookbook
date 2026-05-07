#!/usr/bin/env node

/**
 * Walks docs/ alla ricerca di sezioni "Domande frequenti..." nel body
 * markdown, estrae i Q/A pair (`**Domanda?**\nRisposta...`) e produce
 * src/data/faq-data.ts. Il file viene poi consumato da FAQStructuredData
 * per costruire lo schema JSON-LD FAQPage.
 *
 * Pattern atteso nel markdown:
 *
 *   ## Domande frequenti sul furikake
 *
 *   **Cos'è il furikake?**
 *   Risposta...
 *
 *   **Dove si compra?**
 *   Risposta su piu' righe se serve.
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const ROOT = process.cwd();
const DOCS_DIR = path.join(ROOT, 'docs');
const OUTPUT_FILE = path.join(ROOT, 'src/data/faq-data.ts');

// Header h2/h3 che inizia con "Domande frequenti" (con o senza suffix).
const FAQ_HEADER_RE = /^#{2,3}\s+Domande\s+frequenti\b.*$/im;

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
      files.push(full);
    }
  }
  return files;
}

function stripInlineMarkdown(s) {
  return s
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [text](url) -> text
    .replace(/\*\*([^*]+)\*\*/g, '$1')        // bold
    .replace(/__([^_]+)__/g, '$1')            // bold alt
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '$1') // italic
    .replace(/(?<!_)_([^_]+)_(?!_)/g, '$1')     // italic alt
    .replace(/`([^`]+)`/g, '$1')              // inline code
    .trim();
}

/**
 * Estrae il body della sezione "Domande frequenti...": dal primo header
 * che matcha FAQ_HEADER_RE fino al prossimo header dello stesso o
 * superiore livello (oppure fine file).
 */
function extractFaqSection(body) {
  const lines = body.split('\n');
  let startIdx = -1;
  let startLevel = 0;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(#{1,6})\s+(.+?)\s*$/);
    if (m && /^Domande\s+frequenti\b/i.test(m[2])) {
      startIdx = i + 1;
      startLevel = m[1].length;
      break;
    }
  }
  if (startIdx === -1) return null;
  let endIdx = lines.length;
  for (let i = startIdx; i < lines.length; i++) {
    const m = lines[i].match(/^(#{1,6})\s+/);
    if (m && m[1].length <= startLevel) {
      endIdx = i;
      break;
    }
  }
  return lines.slice(startIdx, endIdx).join('\n');
}

/**
 * Parsa il body della sezione FAQ in coppie {q, a}. Una Q e' un paragrafo
 * che inizia con `**...**` e termina con `?`. La A e' tutto il testo fino
 * alla prossima Q (o fine sezione), con righe vuote convertite in spazi.
 */
function parseFaqItems(sectionBody) {
  const items = [];
  const cleaned = sectionBody
    .replace(/:::[^\n]*\n[\s\S]*?:::/g, '')             // admonitions
    .replace(/<[A-Za-z][^>]*\/>/g, '')                   // self-closing JSX
    .replace(/<[A-Za-z][^>]*>[\s\S]*?<\/[A-Za-z][^>]*>/g, ''); // paired JSX

  const lines = cleaned.split('\n');
  let current = null;
  for (const line of lines) {
    const qMatch = line.match(/^\*\*([^*]+\?)\*\*\s*$/);
    if (qMatch) {
      if (current) items.push(current);
      current = {q: stripInlineMarkdown(qMatch[1]), parts: []};
    } else if (current) {
      current.parts.push(line);
    }
  }
  if (current) items.push(current);

  return items
    .map(({q, parts}) => {
      const a = parts
        .map((l) => stripInlineMarkdown(l).trim())
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      return {q, a};
    })
    .filter((it) => it.a.length > 0);
}

function docIdFromPath(filePath) {
  return path
    .relative(DOCS_DIR, filePath)
    .replace(/\\/g, '/')
    .replace(/\.(md|mdx)$/, '');
}

function main() {
  const files = walk(DOCS_DIR);
  const byId = Object.create(null);

  for (const f of files) {
    const raw = fs.readFileSync(f, 'utf-8');
    const {data, content} = matter(raw);
    if (data.draft === true) continue;
    if (!FAQ_HEADER_RE.test(content)) continue;

    const sectionBody = extractFaqSection(content);
    if (!sectionBody) continue;
    const items = parseFaqItems(sectionBody);
    if (items.length === 0) continue;

    byId[docIdFromPath(f)] = items;
  }

  const header = `// AUTO-GENERATED da scripts/generate-faq-data.js — non editare a mano.\n// Estratto dalle sezioni "Domande frequenti..." nei docs/. Rigenerato dal prebuild.\n\nexport interface FaqItem {\n  q: string;\n  a: string;\n}\n\nexport const FAQ_DATA: Record<string, FaqItem[]> = `;

  fs.mkdirSync(path.dirname(OUTPUT_FILE), {recursive: true});
  fs.writeFileSync(OUTPUT_FILE, header + JSON.stringify(byId, null, 2) + ';\n', 'utf-8');

  const total = Object.values(byId).reduce((acc, arr) => acc + arr.length, 0);
  console.log(`✅ Generated ${path.relative(ROOT, OUTPUT_FILE)} with ${Object.keys(byId).length} pages, ${total} Q/A.`);
}

main();
