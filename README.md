# Welcome to my Japanese cookbook

[![Netlify Status](https://api.netlify.com/api/v1/badges/80a3d727-7506-4555-8637-07fbe3145b1e/deploy-status)](https://app.netlify.com/sites/courageous-rabanadas-aca8ca/deploys)

The cookbook is available at https://paginegiappe.it/

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

---

## Prerequisites

- Node.js 20 or 22 LTS
- npm 9+

---

## Installation

Use npm. If `package-lock.json` is present, prefer `npm ci`.

```bash
# first time or on CI
npm ci

# or, if you are developing and adding deps
npm install
```

---

## Local Development

```bash
npm start
```

This starts the dev server and opens a browser. Changes hot-reload automatically.

---

## Build

```bash
npm run build
```

This generates static files into the `build` directory.

Optional local preview:

```bash
npm run serve
```

---

## Deployment on Netlify

This project is deployed on Netlify.

### Setup (once)
- Build command: `npm run build`
- Publish directory: `build`
- Environment:
  - `NODE_VERSION = 22`

You can connect the site to this GitHub repo for automatic deploys on push.

### Manual deploy via CLI (optional)

```bash
npm run build
npx netlify-cli deploy --prod --dir build
```

You will be prompted to pick the existing site.

---

## Serialize recipes for AI

To update `ricettario.json`:

```bash
ruby serialize_recipes.rb
```

To add a git hook that runs `serialize_recipes.rb`, install Husky:

```bash
npm install --save-dev husky
npx husky init
```

Then edit `.husky/pre-commit` and add:

```bash
ruby serialize_recipes.rb
git add ricettario.json
```

---

## Scripts

- `npm start` — start local dev server
- `npm run build` — build static site
- `npm run serve` — preview the built site locally
