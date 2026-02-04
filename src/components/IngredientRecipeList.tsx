import React, {useMemo} from 'react';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import Heading from '@theme/Heading';
import type {DocCardDoc} from './DocCard';
import DocCardGrid from './DocCardGrid';
import {INGREDIENT_RECIPE_INDEX} from '../data/ingredient-recipes';

interface IngredientRecipeListProps {
  ingredientTag: string;
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function IngredientRecipeList({
  ingredientTag,
}: IngredientRecipeListProps): React.ReactElement | null {
  if (!ingredientTag || ingredientTag.trim() === '') {
    throw new Error(
      'IngredientRecipeList richiede il parametro "ingredientTag".',
    );
  }
  const doc = useDoc();

  const metadata = (doc as any)?.metadata ?? (doc as any);
  const ingredientTitle =
    metadata?.title ??
    (metadata?.unversionedId ?? metadata?.id ?? metadata?.slug ?? '')
      .split('/')
      .pop()
      ?.replace(/[_-]+/g, ' ') ??
    '';

  const recipes = useMemo<DocCardDoc[]>(() => {
    const tagKey = normalize(ingredientTag);
    const items = INGREDIENT_RECIPE_INDEX[tagKey] ?? [];
    const seen = new Set<string>();

    return items.filter((item) => {
      const id = item.id ?? '';
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [ingredientTag]);

  if (recipes.length === 0) return null;

  return (
    <>
      <Heading as="h2">{`Ricette con ${ingredientTitle}`}</Heading>
      <DocCardGrid docs={recipes} />
    </>
  );
}
