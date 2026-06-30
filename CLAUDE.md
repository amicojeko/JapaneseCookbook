# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Italian-language Japanese cooking recipe and ingredient guide website built with Docusaurus 3.x, deployed at `https://paginegiappe.it/`. Content is written in Italian, measurements use the metric system. Visual identity is **Bentō × Izakaya** — editorial bento grid + sophisticated izakaya palette.

## Commands

> **Always run commands through WSL when on Windows.** This repo lives on the WSL filesystem and Node/npm are installed there (via nvm). Don't run `npm`/`node`/`git` from the Windows host shell — invoke them inside WSL (e.g. `wsl.exe -d ubuntu-20.04 -- bash -c "…"`).

```bash
npm install        # Install dependencies (Node 20+ required)
npm start          # Start local dev server with hot-reload
npm run build      # Run prebuild scripts, then build static site
npm run serve      # Preview the built site locally
npm run typecheck  # TypeScript type checking
npm run clear      # Clear Docusaurus cache (.docusaurus/)
ruby scripts/serialize_recipes.rb  # Regenerate ricettario.json (for AI consumption)
```

The `prebuild` step runs automatically before `build` and generates:
- `static/image-metadata.json` — maps doc IDs to image paths (from frontmatter)
- `src/data/ingredient-recipes.ts` — ingredient → recipe mappings
- `src/data/recipe-data.ts` / `faq-data.ts` / `blog-index.ts` — structured data for components
- `static/paginegiappe-knowledge.json` — unified content export for AI (see **AI integration**)

**Responsive image variants** (`-320w` / `-640w` / `-1280w` / `-1600w` `.jpg` and `.webp`) are NOT built by `npm run build`. They're generated incrementally by `scripts/optimize-images.js` and committed to the repo. A husky pre-commit hook (`.husky/pre-commit`) runs the script automatically when you stage a master image — only the masters whose MD5 changed get re-encoded (the manifest at `static/image-srcset.json` tracks the per-master hash). To force a full rebuild, delete the manifest and run `npm run optimize-images`. CI just consumes the pre-generated variants — keeps Netlify builds fast.

## Architecture

This is a Docusaurus static site. Content lives in `docs/` as Markdown/MDX. Custom React components in `src/components/` extend Docusaurus with recipe-specific functionality.

**Content directories:**
- `docs/ricette/` — Recipes, organized by cooking method (e.g., `agemono/`, `contorni/`)
- `docs/ingredienti/` — Ingredient guides
- `docs/strumenti/` — Kitchen tools
- `docs/negozi/` — Store guides (region pages + map + online list); structured shop data lives in `src/data/negozi.ts` and `src/data/negozi-online.ts`
- `docs/libri/` — Book recommendations
- `docs/viaggi/` — Travel guides
- `docs/video/` — Films / anime / TV (slug `/film_anime_serie_tv`)
- `blog/` — Docusaurus blog. One post per folder (`YYYY-MM-DD-slug/index.md`). Authors in `blog/authors.yml`, tags in `blog/tags.yml`.

**Design system (`src/css/custom.css`):**
- Bentō × Izakaya tokens: `--pg-ink`, `--pg-paper`, `--pg-paper-2`, `--pg-red`, `--pg-yellow`, `--pg-rule-soft`, etc.
- Typography: **Fraunces** (serif headings + body), **Shippori Mincho** (Japanese), **Inter** (UI sans), **JetBrains Mono** (mono labels). Loaded via `stylesheets` + `headTags` in `docusaurus.config.ts` — do **not** `@import` from CSS (sequential dependency chain hurts first paint).
- Light-mode only. `colorMode: { defaultMode: 'light', disableSwitch: true, respectPrefersColorScheme: false }`. Don't add `[data-theme='dark']` rules.

**Key custom components:**
- `OptimizedImage` — Shared responsive image; reads srcset from `/image-srcset.json`, falls back to `<img>`. Used by `DocCard`, `ArticleCard`.
- `CategoryIndexPage` — Used in `index.md` files inside category folders to auto-render a card grid; delegates to `DocCardGrid`.
- `DocCardGrid` / `DocCard` — Card grid + single card. Auto-loads images from `/image-metadata.json`.
- `ArticleCard` — Editorial-row card (subtitle + image + content) used on `/film_anime_serie_tv`.
- `ImageComponent` — Two modes. (a) **No props** inside a docs page: reads `image` from frontmatter and renders the recipe hero. (b) **With `src` / `alt` props**: renders that specific image, usable anywhere (docs, blog posts, MDX pages). Accepts an optional `caption` (string or JSX); when present, the component renders `<figure>` + `<figcaption>` for proper semantics, otherwise a plain `<div>` container. Both modes are centered with 1.5rem vertical margin. **Globally registered in `src/theme/MDXComponents.tsx`** — no import needed in `.md` / `.mdx`. This is the default for inline content images; only fall back to raw markdown `![](…)` for tiny inline icons.
- `YouTubeVideo` — Embed.
- `NegoziMap` — Leaflet map with custom red teardrop SVG pin (single shared `divIcon` instance, no `is-online` variant). Cluster styled black-with-yellow-border + red shadow. Popups use `.pop-card` / `.pop-name` / `.pop-addr` / `.pop-note` / `.pop-actions`.
- `NegoziStats` — Editorial meta-strip (Negozi / Regioni / Città) for the map page header.
- `RegionShopList` — Region detail page: meta-strip + sticky `.region-toc` + city sections with real `<h2>` headings + editorial shop rows (`.shop-row-ed`). The page H1 comes from frontmatter `title:` (no custom hero).
- `RegionsList` — Alphabetical region list rendered on `/negozi_orientali/`. Empty regions (no published page) render as a non-anchor `<div>` so they're not keyboard-focusable.
- `OnlineShopList` — `/negozi_orientali/online/` page with merged online shops.
- `IngredientRecipeList` — Ingredient → recipes via the prebuild-generated `ingredient-recipes.ts`.

**Theme overrides (swizzle):**
- `src/theme/Footer/` — **Fully swizzled** custom 4-column footer (Brand+socials / Esplora / Per approfondire / Supporta). Reads from local `SOCIALS` / `ESPLORA` / `APPROFONDIRE` arrays — does **not** consume `themeConfig.footer`. There is intentionally no `footer:` block in `docusaurus.config.ts`; edit `src/theme/Footer/index.tsx` to change footer content.
- `src/theme/DocTagDocListPage/` — Tag listing pages render `DocCard` grids.
- `src/theme/DocBreadcrumbs/StructuredData/` — Fixes trailing-slash bug in JSON-LD breadcrumb structured data.
- `src/theme/DocSidebarItem/Link/` — Custom sidebar link rendering with image support and a subtitle override. The `.subtitle` switches to white when the parent link has `.menu__link--active` (red background) for contrast.
- `src/theme/Root.tsx` — Adds runtime DNS prefetch/preconnect for GTM/GA. Google Fonts hints are SSR'd via `headTags` instead.
- `src/theme/MDXComponents.tsx` — Custom MDX component mappings.

## Content conventions

**Recipe frontmatter minimum required fields:**
```yaml
---
title: "Recipe Name"
description: "Short description"
slug: /ricette/category/recipe-name
image: /img/path/to/image.jpg
ingredients:
  - ingredient1
  - ingredient2
tags:
  - tag1
---
```

**CategoryIndexPage usage** (in `docs/ricette/<category>/index.md`):
```markdown
---
title: "Category Title"
description: "Category description"
slug: "/ricette/category"
---

import CategoryIndexPage from '@site/src/components/CategoryIndexPage';

<CategoryIndexPage />
```

**Region page (negozi/<region>.md):**
The default Docusaurus page title is used (driven by frontmatter `title:`). Don't add `hide_title: true` and don't render a custom `<h1>`. Just:
```mdx
---
title: Lombardia
description: Negozi orientali in Lombardia.
slug: "/negozi_orientali/lombardia"
---
import { NEGOZI } from '@site/src/data/negozi';
import RegionShopList from '@site/src/components/RegionShopList';

<RegionShopList region="Lombardia" shops={NEGOZI} />
```

**Internal links from MD/MDX:** use `import Link from '@docusaurus/Link'` and `<Link to="/path">` for SPA navigation. Plain `<a href="/...">` triggers a full page reload and bypasses Docusaurus prefetch. External links stay as `<a target="_blank" rel="noopener noreferrer">`.

**Pull internal URLs from `build/sitemap.xml` — never invent them or infer them from folder paths.** The `slug:` declared in the destination's frontmatter is what controls the URL, and it routinely differs from the folder structure. Concrete example: `docs/ricette/preparazioni_di_base/brodi/dashi.md` is published at `/ricette/dashi/`, not `/ricette/preparazioni_di_base/brodi/dashi/`. Workflow: `grep <keyword> build/sitemap.xml`, take the `<loc>`, strip `https://paginegiappe.it`. If the sitemap is stale or missing, run `npm run build` first or read `slug:` from the destination file's frontmatter. **Exception:** tag pages (`/blog/tags/<tag>/`, `/tags/<tag>/`) are excluded from the sitemap (`ignorePatterns: ['/tags/**']` in the sitemap config) — link those by tag permalink as declared in `blog/tags.yml` or by the documented tag URL convention.

**Inline icons in markdown content:** add `className="social-icon"` (existing convention) or `className="no-border"` to opt out of the global recipe-image border + paper-fill rule. Markdown content `<img>`s otherwise pick up a 2px ink border with a `--pg-paper-2` backdrop.

**City headings inside `RegionShopList`** are real `<h2>` elements for screen-reader heading navigation. The CSS explicitly neutralises the global `.markdown h2` cascade (zero `border`, `padding`, `margin`) on `.city-section .city-name`.

## Blog posts

Each post is its own folder under `blog/`: `blog/YYYY-MM-DD-slug/index.md`. The date in the folder name drives the publication date; don't duplicate it in frontmatter.

**Post frontmatter:**
```yaml
---
slug: my-post-slug                          # final URL is /blog/<slug>
title: "Post title"
authors: [aki]                              # key from blog/authors.yml; can be multiple
tags: [cucina, ingredienti]                 # keys from blog/tags.yml
description: "Short SEO description, 1–2 sentences."
image: /img/blog/foo.jpg                    # used for OG / social card and blog-index hero
---
```

Place the truncation marker (`<!-- truncate -->`) right after the lead paragraph. Everything before it shows in the blog index excerpt.

**When the user passes content for a blog post, place it 1:1 — verbatim.** Don't paraphrase, don't reorder, don't smooth wording, don't add closing signatures, don't reformat bullet lists into numbered ones (or vice-versa). The only structural additions allowed are: (a) the `<!-- truncate -->` marker after the opening paragraph, (b) H2 paragraph headings (`## …`) where they help scannability — pick the wording yourself but don't change the body text underneath. **H2s only when they earn their keep**: typically only for longer posts (rough threshold ~500–800 words) or when sections answer distinct sub-questions / are featured-snippet candidates. On short personal posts (intros, announcements, single-thread reflections) skip the H2s — they create more noise in the right-side TOC than they save in scannability, and Google's semantic parsing doesn't need them. If you think the copy needs editing, suggest the change in chat first and wait for confirmation; don't apply it directly.

**Adding a new author** — edit `blog/authors.yml`:
```yaml
aki:
  name: Aki Nakagoe
  title: Cuoco giapponese e divulgatore della cucina washoku casalinga
  url: https://www.instagram.com/aki_nonsolosushi/    # primary author link
  image_url: /img/authors/aki.jpg                     # optional; omit if you don't have a photo
  page: true                                          # generates /blog/authors/aki
  socials:
    instagram: https://www.instagram.com/aki_nonsolosushi/
```

**Adding a new tag** — edit `blog/tags.yml` (key + `label` + `permalink` + `description`). Don't reference a tag in a post before adding it to `tags.yml`; Docusaurus will fail the build.

**Inline images: always use `<ImageComponent>`, not raw markdown `![](…)`.** The component is registered globally so no import is required in the `.md` file. Pass `caption` to get a proper `<figure>` + `<figcaption>`:

```mdx
<ImageComponent
  src="/img/blog/Shoyu_ramen_Hayashida_Ikebukuro.jpg"
  alt="Ciotola di shoyu ramen del ristorante Hayashida a Ikebukuro, brodo limpido ambrato"
  caption="Shoyu ramen — Hayashida, Ikebukuro (Tokyo)."
/>
```

- Drop blog photos in `static/img/blog/`. The prebuild image pipeline (`npm run prebuild`) picks them up and generates the responsive `-320w` / `-640w` `.webp` / `.jpg` variants automatically.
- Alt text describes the image content for screen readers and SEO; the caption is editorial context (rendered italic and muted). Don't duplicate the same string in both.
- The frontmatter `image:` should point to the same in-post photo when one is a natural lead (the SEO `image:` is what becomes the Open Graph / Twitter card). Avoid `/img/social_media_card.png` as a default when a real post image exists.

**Always run `npm run build` after adding a new blog post.** The home page's "Ultimi post" sidebar (and other places that read from `src/data/blog-index.ts`) is fed by the auto-generated `blog-index.ts`, which is regenerated by the `prebuild` step. Without a build run, the new post exists at its own URL but doesn't appear on the home page, the blog index sidebar, or in `BLOG_INDEX`-driven components — until somebody else runs `npm run build` or `npm run prebuild`. Same for ricette: adding a new recipe regenerates `recipe-data.ts` only via prebuild. So: write → build → commit (the regenerated `src/data/*.ts` files go in the same commit).

## Data modules (single source of truth)

- `src/data/negozi.ts` — Physical stores: `{ id, name, region, city, address, lat, lng, url?, note?, map_url? }`. To add/remove a shop, edit this file directly. **When you add or remove a shop, also update the hardcoded counts in the SEO intro paragraphs of the affected region page** — `docs/negozi/<region>.md` (5 top regions: Lombardia, Lazio, Piemonte, Emilia-Romagna, Veneto) and `docs/negozi/<other>.md` `description:` frontmatter (all regions). The numbers in the description (`"19 negozi…"`) and intro (`"In Lombardia trovi **19 negozi**…"` plus per-city counts like "Milano 7", "Brescia 2") are static for SEO snippet quality and need to stay in sync with the dataset. Sidebar meta-strip (`<NegoziStats />`) on `/negozi_orientali/` and `/negozi_orientali/mappa/` updates automatically — only the region-page copy needs manual sync.
- `src/data/negozi-online.ts` — Online-only stores (`ONLINE_ONLY` array) plus `getAllOnlineShops()` which merges them with NEGOZI entries that have a `url`. Used by both `OnlineShopList` (rendering) and `RegionsList` (Online row count).
- `src/data/regioni.ts` — Canonical Italian region list `{ name, slug? }`. Slug is **omitted** for regions without a published page (currently Basilicata, Molise) — they render as "in arrivo" placeholders. When you create `docs/negozi/<slug>.md`, add the `slug` here in the same commit. Both `RegionsList` and `OnlineShopList` consume this; never duplicate the table inline.

## AI integration

The site is consumable by AI assistants (Custom GPT, Gemini Gem, Claude via MCP). All layers
read from the **same prebuild-generated** `static/paginegiappe-knowledge.json` (unified export of
ricette/ingredienti/strumenti/libri/viaggi/video/negozi/blog, `draft: true` excluded, absolute URLs).
Regenerated by `scripts/generate-llm-export.js` (last in the `prebuild` chain).

- `static/llms.txt` — llmstxt.org standard, points crawlers to sections + the knowledge JSON.
- `netlify/functions/` — serverless API (esbuild-bundled; they `require()` the knowledge JSON):
  - `search.js` — proxy to Algolia (reuses the public search key from `docusaurus.config.ts`), dedupes by base URL.
  - `recipes.js` — recipe search by name/ingredient/category; `servings` adds dose-scaling note (needs `recipeYield` in frontmatter).
  - `negozi.js` — shops by region/city, GPS proximity (Haversine `lat`/`lng`/`radius_km`), `discount=true` filter (reads discount codes from the `note` field).
  - `suggest.js` — `type=menu|reading|blog`; menu returns full recipes so the LLM can build a shopping list + cooking order.
  - `mcp.mjs` — **hosted MCP server** (Netlify Function v2, served at `https://paginegiappe.it/mcp`). Streamable HTTP, stateless, web-standard transport (`WebStandardStreamableHTTPServerTransport`), JSON response mode, **no auth** (public read-only). Add as a Custom Connector in Claude.ai/Desktop with that URL — no install needed.
- `static/openapi.json` — OpenAPI 3.1 spec for GPT Custom Actions (import URL: `https://paginegiappe.it/openapi.json`).
- `mcp/` — MCP tool definitions + two entrypoints, all proxying the deployed Netlify functions (data always live):
  - `mcp/tools.js` — **shared** `createServer()` factory: the 8 tools, the Markdown formatters (foto + schede ricetta), and the directive server `instructions`. Single source of truth for both entrypoints.
  - `mcp/server.js` — **stdio** entrypoint, published to npm as `mcp-paginegiappe` (local use via `npx`).
  - `netlify/functions/mcp.mjs` imports the same `createServer()` for the hosted endpoint.

The hosted endpoint requires `@modelcontextprotocol/sdk` + `zod` in the **root** `package.json` (so Netlify installs them and esbuild bundles the function); `mcp/package.json` declares them again for the standalone npm package.

**When you change a tool or its params**, edit `mcp/tools.js` only (both entrypoints update). For the npm package, bump `mcp/package.json` version and `npm publish` from `mcp/`; the hosted endpoint updates automatically on the next Netlify deploy.

## gtag / analytics

`gtag` is enabled only in production builds via `gtag: process.env.NODE_ENV === 'production' ? {...} : undefined` in `docusaurus.config.ts`. Don't enable it unconditionally — in dev the route-update callback can fire before `window.gtag` is bound and crashes navigation. (A known dev-server side effect: running `npm run build` while `npm start` is up can leave the dev bundle wired to the gtag callback. `npm run clear` + restart fixes it; see also the comment in the gtag config block.)

## Do not edit generated files

- `build/` — Docusaurus build output
- `static/image-metadata.json` — regenerated by `npm run build` or `npm run prebuild`
- `static/image-srcset.json` — regenerated incrementally by `scripts/optimize-images.js` via the husky pre-commit hook; tracks per-master MD5 hashes so unchanged images are skipped
- `src/data/ingredient-recipes.ts` (and `recipe-data.ts`, `faq-data.ts`, `blog-index.ts`) — regenerated by prebuild scripts
- `static/paginegiappe-knowledge.json` — regenerated by `scripts/generate-llm-export.js` (prebuild)

If you add images to a recipe, ensure the frontmatter `image` field is set correctly so the build pipeline picks it up.

## Common pitfalls

- **Don't** add a `themeConfig.footer` block — the Footer is fully swizzled and ignores it. Edits there will silently do nothing.
- **Don't** `@import url('https://fonts.googleapis.com/...')` from CSS — fonts are linked from the SSR'd `<head>` via `stylesheets` in `docusaurus.config.ts`.
- **Don't** add `[data-theme='dark']` rules — dark mode was intentionally removed. The site is light-only.
- **Don't** duplicate the region → slug map. Use `regionSlug(name)` from `src/data/regioni.ts`.
- **Don't** render an `<a href="#">` for "disabled" links. It's still keyboard-focusable and Enter scrolls the page to the top. Render a `<div aria-disabled="true">` instead.
