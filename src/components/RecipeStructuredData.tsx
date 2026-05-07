import React from 'react';
import Head from '@docusaurus/Head';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {RECIPE_DATA, type RecipeData} from '@site/src/data/recipe-data';

const FALLBACK_SITE_URL = 'https://paginegiappe.it';
const AUTHOR = {
  '@type': 'Person',
  name: 'Stefano Guglielmetti',
  url: 'https://paginegiappe.it/',
};

function absoluteUrl(siteUrl: string, p: string | null | undefined): string | undefined {
  if (!p) return undefined;
  if (/^https?:\/\//i.test(p)) return p;
  return siteUrl.replace(/\/$/, '') + (p.startsWith('/') ? p : '/' + p);
}

/** Aggiunge trailing slash alle pagine HTML (coerente con trailingSlash: true). */
function withTrailingSlash(p: string): string {
  return p.endsWith('/') ? p : p + '/';
}

function normalizePath(p: string): string {
  return p.replace(/\/+$/, '');
}

function buildRecipeSchema(
  data: RecipeData,
  permalink: string,
  siteUrl: string,
  dateModified: string | undefined,
): Record<string, unknown> {
  const keywordParts = [...data.recipeKeywords, 'ricetta giapponese', 'cucina giapponese'];
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: data.title,
    description: data.description,
    url: absoluteUrl(siteUrl, withTrailingSlash(permalink)),
    author: AUTHOR,
    recipeCuisine: 'Giapponese',
    keywords: keywordParts.join(', '),
  };
  const imageUrl = absoluteUrl(siteUrl, data.image);
  if (imageUrl) schema.image = [imageUrl];
  if (data.recipeCategory) schema.recipeCategory = data.recipeCategory;
  if (data.recipeYield) schema.recipeYield = data.recipeYield;
  if (data.recipeIngredient.length > 0) schema.recipeIngredient = data.recipeIngredient;
  if (data.instructionsText) {
    schema.recipeInstructions = [
      {
        '@type': 'HowToStep',
        name: 'Preparazione',
        text: data.instructionsText,
        url: absoluteUrl(siteUrl, withTrailingSlash(permalink)) + '#preparazione',
      },
    ];
  }
  if (dateModified) schema.dateModified = dateModified;
  return schema;
}

/**
 * Inietta lo schema JSON-LD `Recipe` nelle pagine ricetta sotto /ricette/.
 * Attivo su tutte le pagine il cui docId e' presente in RECIPE_DATA
 * (popolato dal prebuild script per ogni file md sotto docs/ricette/
 * che ha sezioni "Ingredienti" o "Preparazione" parsabili).
 */
export default function RecipeStructuredData(): React.ReactElement | null {
  const {siteConfig} = useDocusaurusContext();
  const {metadata} = useDoc();
  const siteUrl = siteConfig.url || FALLBACK_SITE_URL;

  const data = RECIPE_DATA[metadata.id];
  if (!data) return null;

  const dateModified = metadata.lastUpdatedAt
    ? new Date(metadata.lastUpdatedAt).toISOString()
    : undefined;

  const schema = buildRecipeSchema(data, metadata.permalink, siteUrl, dateModified);

  return (
    <Head>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Head>
  );
}
