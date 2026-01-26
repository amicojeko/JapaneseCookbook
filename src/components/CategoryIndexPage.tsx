import React, {useMemo} from 'react';
import {useCurrentSidebarCategory} from '@docusaurus/plugin-content-docs/client';
import DocCard, {type DocCardDoc} from './DocCard';
import styles from './CategoryIndexPage.module.css';

// Questa pagina non ha bisogno di titolo/descrizione perché il template del doc li renderizza già.
export default function CategoryIndexPage(): React.ReactElement {
  const category = useCurrentSidebarCategory();

  const docs = useMemo<DocCardDoc[]>(() => {
    const items = (category?.items ?? []) as any[];

    const flatten = (list: any[]): any[] =>
      list.flatMap((item) => {
        if (item.type === 'category') return flatten(item.items ?? []);
        return item.type === 'link' ? [item] : [];
      });

    return flatten(items)
      .filter((item) => !item.unlisted)
      .map((item) => ({
        id: item.docId ?? item.href,
        title: item.label ?? item.docId ?? item.href,
        description: item.customProps?.subtitle,
        permalink: item.href,
      }));
  }, [category]);

  return (
    <section className={styles.docsGrid}>
      {docs.map((doc) => (
        <DocCard key={doc.id} doc={doc} />
      ))}
    </section>
  );
}
