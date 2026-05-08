# AGENTS.md

## Repository purpose
This repository contains a Docusaurus site, in Italian, dedicated to Japanese cooking: recipes, ingredients, kitchen tools, and shops. Content must be human-readable (Markdown) while also being functional for the site. The visual identity is **Bentō × Izakaya** (editorial bento grid + sophisticated izakaya palette).

## Language and units
- Language: Italian.
- Units: metric system.
- Match the tone and style of existing files.

## Content structure
- Recipes: `docs/ricette/**`
- Ingredients: `docs/ingredienti/**`
- Tools: `docs/strumenti/**`
- Shops: structured data in `src/data/negozi.ts` + `src/data/negozi-online.ts`, region list in `src/data/regioni.ts`, pages in `docs/negozi/**`
- Books: `docs/libri/**`
- Travel: `docs/viaggi/**`
- Films/anime/TV series: `docs/video/**` (slug `/film_anime_serie_tv`)

## Design system (`src/css/custom.css`)
- Palette tokens: `--pg-ink`, `--pg-paper`, `--pg-paper-2`, `--pg-red`, `--pg-yellow`, `--pg-rule-soft`, etc.
- Typography: **Fraunces** (headings + body), **Shippori Mincho** (Japanese), **Inter** (UI sans), **JetBrains Mono** (mono labels).
- Google Fonts are loaded from `<head>` via `stylesheets` + `headTags` in `docusaurus.config.ts`. **Do not** use `@import` in CSS: it creates a sequential dependency chain that delays first paint.
- **Light mode only**. `colorMode: { defaultMode: 'light', disableSwitch: true, respectPrefersColorScheme: false }`. Do not add `[data-theme='dark']` rules.

## Key components
- `src/components/OptimizedImage.tsx` — responsive images with srcset from `/image-srcset.json`. Used by `DocCard`, `ArticleCard`.
- `src/components/DocCardGrid.tsx` + `DocCard.tsx` — reusable grid + card.
- `src/components/CategoryIndexPage.tsx` — used in subcategory `index.md` files.
- `src/components/ArticleCard.tsx` — editorial-row card (subtitle + image + content); used on `/film_anime_serie_tv`.
- `src/components/ImageComponent.tsx` — recipe hero image.
- `src/components/YouTubeVideo.tsx` — embed.
- `src/components/NegoziMap.tsx` — Leaflet map with red SVG teardrop pin (one shared `divIcon`, no `is-online` variant). Cluster: black with yellow border + red shadow. Popups use `.pop-card` / `.pop-name` / `.pop-addr` / `.pop-note` / `.pop-actions`.
- `src/components/NegoziStats.tsx` — meta-strip (Negozi / Regioni / Città) for the map page header.
- `src/components/RegionShopList.tsx` — region detail page: meta-strip + sticky `.region-toc` + city sections with real `<h2>` headings + `.shop-row-ed` rows. The H1 comes from frontmatter `title:` (no custom hero).
- `src/components/RegionsList.tsx` — alphabetical region list on `/negozi_orientali/`. Regions without a published page render as a `<div>` (not keyboard-focusable) to avoid broken links.
- `src/components/OnlineShopList.tsx` — `/negozi_orientali/online/` page.
- `src/components/IngredientRecipeList.tsx` — ingredient → recipes via `ingredient-recipes.ts`.

## Data modules (single source of truth)
- `src/data/negozi.ts` — physical shops: `{ id, name, region, city, address, lat, lng, url?, note?, map_url? }`. To add/remove a shop, edit this file directly. **When you add or remove a shop, also update the hardcoded counts in the SEO copy of the affected region page** — `docs/negozi/<region>.md`:
  - `description:` frontmatter (e.g. `"19 negozi di alimentari asiatici e giapponesi in Lombardia: …"`) — applies to all 19 region pages.
  - For the 5 top regions (Lombardia, Lazio, Piemonte, Emilia-Romagna, Veneto), the intro paragraph in the body has the total count and per-city counts (e.g. `"Milano [...] con 7 indirizzi"`, `"Brescia e Pavia hanno 2 negozi ciascuna"`) — keep these in sync with the dataset.
  - The sidebar meta-strip (`<NegoziStats />`) on `/negozi_orientali/` and `/negozi_orientali/mappa/` updates automatically. Only the region-page copy needs manual sync.
- `src/data/negozi-online.ts` — online-only stores (`ONLINE_ONLY`) plus `getAllOnlineShops()` which merges them with physical shops that have a `url`. Used by both `OnlineShopList` (rendering) and `RegionsList` (Online row count).
- `src/data/regioni.ts` — canonical Italian region list `{ name, slug? }`. The `slug` is **omitted** for regions without a published page (currently Basilicata, Molise) — they show up as "in arrivo" placeholders. When you create `docs/negozi/<slug>.md`, add the `slug` here in the same commit. Both `RegionsList` and `OnlineShopList` consume from here — **never** duplicate the table elsewhere.

## Theme overrides (swizzle)
- `src/theme/Footer/` — **Fully swizzled footer**. 4 columns (Brand+socials / Esplora / Per approfondire / Supporta). Reads from local `SOCIALS`, `ESPLORA`, `APPROFONDIRE` arrays — does **not** consume `themeConfig.footer`. There is intentionally no `footer:` block in `docusaurus.config.ts`. To change footer content, edit `src/theme/Footer/index.tsx`.
- `src/theme/DocTagDocListPage/` — custom tag pages with `DocCard` grid.
- `src/theme/DocBreadcrumbs/StructuredData/` — fix for missing trailing slash in JSON-LD breadcrumbs (Docusaurus bug).
- `src/theme/DocSidebarItem/Link/` — sidebar link rendering with image support and a subtitle override. When the parent link has `.menu__link--active` (red background), the subtitle switches to white for contrast.
- `src/theme/Root.tsx` — runtime DNS prefetch/preconnect for GTM/GA. Google Fonts hints are SSR'd via `headTags` in the config.
- `src/theme/MDXComponents.tsx` — custom MDX component mappings.

## Recipe frontmatter
Recipes use frontmatter with at minimum:
- `title`, `description`, `slug`
- `image` for the main image
- `ingredients` as the base list used by the site
- `tags` to categorise the recipe

## Region page (negozi/<region>.md)
Use the default Docusaurus page title (driven by frontmatter `title:`). **Do not** add `hide_title: true` and don't render a custom `<h1>`:
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

## Markup conventions

**Internal links from MD/MDX:** import `import Link from '@docusaurus/Link'` and use `<Link to="/path">` for SPA navigation. A raw `<a href="/...">` forces a full page reload and bypasses Docusaurus prefetch. External links stay as `<a target="_blank" rel="noopener noreferrer">`.

**Pull internal URLs from `build/sitemap.xml` — don't invent them or guess from folder paths.** The destination's `slug:` frontmatter is authoritative and often differs from the folder structure. Example: `docs/ricette/preparazioni_di_base/brodi/dashi.md` is published at `/ricette/dashi/`, not `/ricette/preparazioni_di_base/brodi/dashi/`. Workflow: `grep <keyword> build/sitemap.xml`, take the `<loc>`, strip `https://paginegiappe.it`. If the sitemap is missing or stale, run `npm run build` first or read `slug:` from the destination file's frontmatter. **Exception:** tag pages (`/blog/tags/<tag>/`, `/tags/<tag>/`) are intentionally excluded from the sitemap (`ignorePatterns: ['/tags/**']`) — link those via the tag permalink declared in `blog/tags.yml` or the documented tag URL pattern.

**Inline icons in markdown:** add `className="social-icon"` (existing convention) or `className="no-border"` to opt out of the global 2px ink border + paper background that the global rule applies to content images. Without an opt-out, every `<img>` inside `.markdown` picks up the bento frame.

**City headings** in `RegionShopList` are real `<h2>` elements for assistive navigation (screen-reader heading shortcuts). The CSS explicitly neutralises the global `.markdown h2` cascade (`border`, `padding`, `margin` to 0) on `.city-section .city-name`.

## Images and metadata
- The `scripts/generate-image-metadata.js` script generates `static/image-metadata.json` (not `build/`).
- `build/`, `static/image-metadata.json`, `static/image-srcset.json`, and `src/data/ingredient-recipes.ts` are generated artifacts: don't edit them by hand, regenerate them with `npm run build` or `npm run prebuild`.
- When adding images, make sure the page frontmatter and the build pipeline make them available.

## gtag / analytics
The `gtag` plugin is enabled **only in production** via `gtag: process.env.NODE_ENV === 'production' ? {...} : undefined` in the config. Don't enable it unconditionally: in dev the route-change callback can fire before `window.gtag` is defined and crash navigation. Known dev-server side effect: running `npm run build` while `npm start` is up can leave the dev bundle wired to the gtag callback — fix it with `npm run clear` + restart of the dev server.

## Workflow and constraints
- Preserve the structure of existing files (titles, sections, order).
- Don't move content between folders without asking.
- Avoid edits to generated or build files.
- To regenerate `ricettario.json`, use the script `ruby scripts/serialize_recipes.rb`.

## Common pitfalls (things NOT to do)
- **Don't** add a `themeConfig.footer` block — the Footer is fully swizzled and ignores it. Edits there are silently no-ops.
- **Don't** use `@import url('https://fonts.googleapis.com/...')` in CSS — fonts are linked from the SSR'd `<head>` via `stylesheets`.
- **Don't** add `[data-theme='dark']` rules — dark mode was removed on purpose.
- **Don't** duplicate the region → slug map. Use `regionSlug(name)` from `src/data/regioni.ts`.
- **Don't** render `<a href="#">` for "disabled" links. They're still keyboard-focusable and Enter scrolls the page to the top. Use a `<div aria-disabled="true">` with equivalent styling instead.

## Suggested prompt (for agents)
Follow the instructions in `AGENTS.md`. Keep the Italian writing style and the metric system. Only modify content under `docs/` or the TypeScript files that need changing (e.g. `src/data/negozi.ts`, `src/data/regioni.ts`) and don't touch generated files (`build/`, `static/image-metadata.json`, `src/data/ingredient-recipes.ts`). If you can't find a file or a template, ask instead of making one up.
