# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Italian-language Japanese cooking recipe and ingredient guide website built with Docusaurus 3.x, deployed at `https://paginegiappe.it/`. Content is written in Italian, measurements use the metric system. Visual identity is **Bentō × Izakaya** — editorial bento grid + sophisticated izakaya palette.

## Commands

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

**Design system (`src/css/custom.css`):**
- Bentō × Izakaya tokens: `--pg-ink`, `--pg-paper`, `--pg-paper-2`, `--pg-red`, `--pg-yellow`, `--pg-rule-soft`, etc.
- Typography: **Fraunces** (serif headings + body), **Shippori Mincho** (Japanese), **Inter** (UI sans), **JetBrains Mono** (mono labels). Loaded via `stylesheets` + `headTags` in `docusaurus.config.ts` — do **not** `@import` from CSS (sequential dependency chain hurts first paint).
- Light-mode only. `colorMode: { defaultMode: 'light', disableSwitch: true, respectPrefersColorScheme: false }`. Don't add `[data-theme='dark']` rules.

**Key custom components:**
- `OptimizedImage` — Shared responsive image; reads srcset from `/image-srcset.json`, falls back to `<img>`. Used by `DocCard`, `ArticleCard`.
- `CategoryIndexPage` — Used in `index.md` files inside category folders to auto-render a card grid; delegates to `DocCardGrid`.
- `DocCardGrid` / `DocCard` — Card grid + single card. Auto-loads images from `/image-metadata.json`.
- `ArticleCard` — Editorial-row card (subtitle + image + content) used on `/film_anime_serie_tv`.
- `ImageComponent` — Recipe hero image rendered from frontmatter.
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

**Inline icons in markdown content:** add `className="social-icon"` (existing convention) or `className="no-border"` to opt out of the global recipe-image border + paper-fill rule. Markdown content `<img>`s otherwise pick up a 2px ink border with a `--pg-paper-2` backdrop.

**City headings inside `RegionShopList`** are real `<h2>` elements for screen-reader heading navigation. The CSS explicitly neutralises the global `.markdown h2` cascade (zero `border`, `padding`, `margin`) on `.city-section .city-name`.

## Data modules (single source of truth)

- `src/data/negozi.ts` — Physical stores: `{ id, name, region, city, address, lat, lng, url?, note?, map_url? }`. To add/remove a shop, edit this file directly. **When you add or remove a shop, also update the hardcoded counts in the SEO intro paragraphs of the affected region page** — `docs/negozi/<region>.md` (5 top regions: Lombardia, Lazio, Piemonte, Emilia-Romagna, Veneto) and `docs/negozi/<other>.md` `description:` frontmatter (all regions). The numbers in the description (`"19 negozi…"`) and intro (`"In Lombardia trovi **19 negozi**…"` plus per-city counts like "Milano 7", "Brescia 2") are static for SEO snippet quality and need to stay in sync with the dataset. Sidebar meta-strip (`<NegoziStats />`) on `/negozi_orientali/` and `/negozi_orientali/mappa/` updates automatically — only the region-page copy needs manual sync.
- `src/data/negozi-online.ts` — Online-only stores (`ONLINE_ONLY` array) plus `getAllOnlineShops()` which merges them with NEGOZI entries that have a `url`. Used by both `OnlineShopList` (rendering) and `RegionsList` (Online row count).
- `src/data/regioni.ts` — Canonical Italian region list `{ name, slug? }`. Slug is **omitted** for regions without a published page (currently Basilicata, Molise) — they render as "in arrivo" placeholders. When you create `docs/negozi/<slug>.md`, add the `slug` here in the same commit. Both `RegionsList` and `OnlineShopList` consume this; never duplicate the table inline.

## gtag / analytics

`gtag` is enabled only in production builds via `gtag: process.env.NODE_ENV === 'production' ? {...} : undefined` in `docusaurus.config.ts`. Don't enable it unconditionally — in dev the route-update callback can fire before `window.gtag` is bound and crashes navigation. (A known dev-server side effect: running `npm run build` while `npm start` is up can leave the dev bundle wired to the gtag callback. `npm run clear` + restart fixes it; see also the comment in the gtag config block.)

## Do not edit generated files

- `build/` — Docusaurus build output
- `static/image-metadata.json` — regenerated by `npm run build` or `npm run prebuild`
- `static/image-srcset.json` — regenerated by image optimization
- `src/data/ingredient-recipes.ts` — regenerated by prebuild scripts

If you add images to a recipe, ensure the frontmatter `image` field is set correctly so the build pipeline picks it up.

## Common pitfalls

- **Don't** add a `themeConfig.footer` block — the Footer is fully swizzled and ignores it. Edits there will silently do nothing.
- **Don't** `@import url('https://fonts.googleapis.com/...')` from CSS — fonts are linked from the SSR'd `<head>` via `stylesheets` in `docusaurus.config.ts`.
- **Don't** add `[data-theme='dark']` rules — dark mode was intentionally removed. The site is light-only.
- **Don't** duplicate the region → slug map. Use `regionSlug(name)` from `src/data/regioni.ts`.
- **Don't** render an `<a href="#">` for "disabled" links. It's still keyboard-focusable and Enter scrolls the page to the top. Render a `<div aria-disabled="true">` instead.
