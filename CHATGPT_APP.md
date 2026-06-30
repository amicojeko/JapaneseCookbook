# paginegiappe — ChatGPT App (Apps SDK)

L'MCP hostato (`/mcp`) è anche una **ChatGPT App**: i tool `find_recipes`, `suggest_menu`
e `find_shops` renderizzano **widget UI nativi** dentro ChatGPT (Apps SDK, basato su MCP).
Gli altri client (Claude connector, Gemini CLI) continuano a ricevere il Markdown invariato.

## Come funziona

- Ogni tool ritorna **`content` Markdown** (compatibilità) **+ `structuredContent`** (validato da `outputSchema`).
- I 3 tool con UI espongono `_meta["openai/outputTemplate"]` → risorsa `ui://widget/<nome>.html`
  (mimetype `text/html;profile=mcp-app`). Il widget legge `window.openai.toolOutput`.
- Sorgenti widget: `widgets/*.tsx` (Preact). Build → `netlify/lib/widgets/*.html.mjs`
  (stringa HTML self-contained), importati da `netlify/lib/mcp-tools.mjs`.

## Sviluppo

```bash
npm run build-widgets   # ribuilda i widget (o gira da solo nella catena prebuild)
```

Itera sul widget → `npm run build-widgets` → redeploy (o restart di `netlify dev`) →
**Refresh** del connector in ChatGPT.

### Validazione locale (prima di ChatGPT)

```bash
npx @modelcontextprotocol/inspector     # punta a http://localhost:8888/mcp (netlify dev) o /mcp in prod
```

Controlla: `List Tools` (gli 8 tool, con `outputSchema`/`_meta` sui 3 widget),
`List Resources` (3 risorse `ui://`), `Call Tool` (presenza di `structuredContent`).

## Fase 1 — Developer Mode (privato)

1. ChatGPT → **Settings → Apps & Connectors → Advanced → Developer Mode** ON.
2. **Create connector** → URL `https://paginegiappe.it/mcp` (prod) **oppure** un tunnel HTTPS
   di `netlify dev` (`ngrok http 8888` → `https://<sub>.ngrok.app/mcp`).
3. In una nuova chat: **+ → More →** seleziona il connector. Prompt di prova:
   - «ricette con tofu» → widget card ricetta
   - «menu giapponese per 4» → widget menu (card + lista spesa + ordine)
   - «negozi giapponesi a Milano» → widget mappa + lista
4. Dopo modifiche: **Refresh** nel connector.

## Fase 2 — Submission allo Store

Prerequisiti: verifica identità org su OpenAI Platform + permesso `api.apps.write`.
Servono: nome app, logo, descrizione, **privacy policy** (`https://paginegiappe.it/privacy`),
contatto supporto, **screenshot dei 3 widget**, **prompt di test con risposte attese**, lingua (it).
L'app è **public/no-auth read-only** → niente demo-account, review più snella.
La CSP è già dichiarata sui tool (immagini `paginegiappe.it`; tile mappa `*.basemaps.cartocdn.com`).

## Note tecniche / gotcha

- **JSX runtime**: `scripts/build-widgets.js` passa `tsconfigRaw` per forzare il runtime Preact;
  senza, esbuild eredita `jsx:"react"` dal `tsconfig.json` del repo e il widget crasha
  con `React is not defined`.
- **`widgets/` è escluso** da `tsconfig.json` (lo builda esbuild, non `tsc`).
- **Versionare l'URI** del widget per cache-bust quando cambia in modo incompatibile
  (es. `ui://widget/recipe-cards-v2.html`), aggiornando `UI.*` in `mcp-tools.mjs`.
- I `*.html.mjs` generati sono **committati** (come gli altri artefatti di prebuild); su Netlify
  vengono comunque rigenerati dal `prebuild` prima del bundling delle function.
