import React, {useMemo} from 'react';
import {useCurrentSidebarCategory} from '@docusaurus/plugin-content-docs/client';
import type {PropSidebarItem, PropSidebarItemLink, PropSidebarItemCategory} from '@docusaurus/plugin-content-docs';
import type {DocCardDoc} from './DocCard';
import DocCardGrid from './DocCardGrid';

// Questa pagina non ha bisogno di titolo/descrizione perché il template del doc li renderizza già.
export default function CategoryIndexPage(): React.ReactElement {
  const category = useCurrentSidebarCategory();

  const docs = useMemo<DocCardDoc[]>(() => {
    const items = category?.items ?? [];

    // Se la categoria contiene sotto-categorie, mostriamo quelle come card
    // (hub di navigazione). Es. /ricette/preparazioni_di_base/ → 4 card per
    // Brodi/Condimenti/Salse/Sushi anziché flatare tutti i doc nidificati.
    const subCategories = items.filter(
      (i): i is PropSidebarItemCategory => i.type === 'category',
    );

    if (subCategories.length > 0) {
      return subCategories.map((sub) => {
        // L'href della category punta al suo index.md (se esiste). Da lì
        // ricaviamo anche il docId per il lookup dell'immagine.
        const indexLink = sub.items?.find(
          (it): it is PropSidebarItemLink => it.type === 'link' && it.href === sub.href,
        );
        const fallbackId = sub.href ? `${sub.href.replace(/^\//, '').replace(/\/$/, '')}/index` : '';
        return {
          id: indexLink?.docId ?? fallbackId,
          title: sub.label ?? '',
          description: (sub.customProps?.subtitle as string | undefined) ?? indexLink?.customProps?.subtitle as string | undefined,
          permalink: sub.href ?? '',
        };
      });
    }

    // Caso base: la categoria contiene solo doc → flat-list di link.
    const flatten = (list: PropSidebarItem[]): PropSidebarItemLink[] =>
      list.flatMap((item) => {
        if (item.type === 'category') return flatten((item as PropSidebarItemCategory).items ?? []);
        return item.type === 'link' ? [item as PropSidebarItemLink] : [];
      });

    return flatten(items)
      .filter((item) => !item.unlisted)
      .map((item) => ({
        id: item.docId ?? item.href,
        title: item.label ?? item.docId ?? item.href,
        description: item.customProps?.subtitle as string | undefined,
        permalink: item.href,
      }));
  }, [category]);

  return <DocCardGrid docs={docs} />;
}
