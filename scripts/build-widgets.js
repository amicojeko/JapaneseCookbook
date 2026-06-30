// @ts-check
/**
 * Builda i widget UI della ChatGPT App (Apps SDK) in stringhe HTML self-contained.
 *
 * Per ogni entry in `widgets/`, esbuild produce un bundle IIFE (Preact) con CSS e JS
 * inline; lo script lo incapsula in un documento HTML completo e lo scrive come
 * `netlify/lib/widgets/<nome>.html.mjs` (un `export default "<html>"`).
 *
 * `netlify/lib/mcp-tools.mjs` importa queste stringhe e le registra come risorse MCP
 * `ui://widget/<nome>.html` (mimetype text/html;profile=mcp-app). Import statici →
 * l'esbuild di Netlify le include nel bundle della function `/mcp`.
 *
 * Eseguito nella catena `prebuild` (e via `npm run build-widgets`).
 */

const esbuild = require('esbuild');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'widgets');
const OUT_DIR = path.join(ROOT, 'netlify', 'lib', 'widgets');

// Widget da buildare → deve combaciare con gli URI in mcp-tools.mjs (UI.*).
const WIDGETS = ['recipe-cards', 'menu', 'shops-map'];

// Token di design Bentō × Izakaya (sottoinsieme di src/css/custom.css) + reset.
// Il widget porta il proprio fondo "paper" così è leggibile su host chiari o scuri.
const BASE_CSS = `
:root {
  --pg-ink: #1b1a17; --pg-ink-soft: #3b3a36; --pg-ink-faint: #6b6960;
  --pg-paper: #fbf7ec; --pg-paper-2: #f4edd8; --pg-rule-soft: #e3dbbf;
  --pg-red: #c8321c; --pg-red-ink: #8a1d0c; --pg-red-soft: #fbe3dc;
  --pg-yellow: #ffdc06; --pg-yellow-soft: #fff6c4; --pg-mustard: #d4a82a;
  --pg-font-serif: 'Newsreader', 'Iowan Old Style', Georgia, serif;
  --pg-font-sans: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --pg-font-mono: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  font-family: var(--pg-font-sans);
  color: var(--pg-ink);
  background: transparent;
  -webkit-font-smoothing: antialiased;
  line-height: 1.5;
}
#pg-root {
  background: var(--pg-paper);
  border: 1px solid var(--pg-rule-soft);
  border-radius: 14px;
  padding: 18px;
  margin: 4px;
}
a { color: var(--pg-red); text-decoration: none; }
a:hover { color: var(--pg-red-ink); text-decoration: underline; }
h1, h2, h3 { font-family: var(--pg-font-serif); color: var(--pg-ink); margin: 0; }
.pg-eyebrow {
  font-family: var(--pg-font-mono); font-size: 11px; letter-spacing: .12em;
  text-transform: uppercase; color: var(--pg-ink-faint); margin: 0 0 10px;
}
.pg-empty { color: var(--pg-ink-faint); font-style: italic; padding: 12px; }
`;

function htmlDoc(title, js) {
  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>${BASE_CSS}</style>
</head>
<body>
<div id="pg-root"></div>
<script>${js}</script>
</body>
</html>`;
}

async function buildWidget(name) {
  const entry = path.join(SRC_DIR, `${name}.tsx`);
  if (!fs.existsSync(entry)) throw new Error(`Widget entry mancante: ${entry}`);
  const result = await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    minify: true,
    format: 'iife',
    target: 'es2020',
    jsx: 'automatic',
    jsxImportSource: 'preact',
    // Neutralizza il tsconfig.json del repo (jsx:"react") che altrimenti esbuild
    // erediterebbe, emettendo React.createElement invece del runtime Preact.
    tsconfigRaw: { compilerOptions: { jsx: 'react-jsx', jsxImportSource: 'preact' } },
    loader: { '.css': 'text', '.svg': 'text' },
    legalComments: 'none',
    write: false,
  });
  const js = result.outputFiles[0].text;
  const html = htmlDoc(`paginegiappe — ${name}`, js);
  const outFile = path.join(OUT_DIR, `${name}.html.mjs`);
  const content = `// GENERATO da scripts/build-widgets.js — non modificare a mano.\nexport default ${JSON.stringify(html)};\n`;
  fs.writeFileSync(outFile, content);
  return { name, bytes: Buffer.byteLength(html) };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const built = [];
  for (const name of WIDGETS) {
    built.push(await buildWidget(name));
  }
  for (const b of built) {
    console.log(`  ✓ widget ${b.name} → ${(b.bytes / 1024).toFixed(1)} KB`);
  }
  console.log(`Widget buildati: ${built.length}`);
}

main().catch((err) => {
  console.error('build-widgets fallito:', err);
  process.exit(1);
});
