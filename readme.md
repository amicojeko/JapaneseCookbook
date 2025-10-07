# Welcome to my Japanese cookbook

[![Netlify Status](https://api.netlify.com/api/v1/badges/80a3d727-7506-4555-8637-07fbe3145b1e/deploy-status)](https://app.netlify.com/sites/courageous-rabanadas-aca8ca/deploys)

The cookbook is available at http://ricettegiapponesi.jeko.net/

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Installation

```bash
yarn
```

## Local Development

```bash
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

Using SSH:

```bash
USE_SSH=true yarn deploy
```

Not using SSH:

```bash
GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.

## Serialize recipes for AI

to update the `ricettario.json` file, run

```bash
ruby serialize_recipes.rb
```

to add an hook to the `serialize_recipes.rb` file,  install `husky`

```bash
npm install --save-dev husky
npx husky init
```
