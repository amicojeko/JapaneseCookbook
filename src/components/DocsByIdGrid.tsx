import React from 'react';
import clsx from 'clsx';
import {useDocById, useLayoutDoc} from '@docusaurus/plugin-content-docs/client';
import DocCard from './DocCard';
import gridStyles from './DocCardGrid.module.css';

interface FeaturedDocProps {
  id: string;
}

/**
 * Renderizza una singola card recuperando title/description/permalink
 * direttamente dai metadata del doc Docusaurus, senza duplicarli.
 *
 * Se l'id non esiste, useDocById throws con un errore descrittivo. Va bene
 * per MVP: se passi un id sbagliato il build fallisce subito con il nome
 * del doc mancante.
 */
function FeaturedDoc({id}: FeaturedDocProps): React.ReactElement | null {
  const doc = useDocById(id);
  const layoutDoc = useLayoutDoc(id);
  if (!doc || !layoutDoc) return null;
  return (
    <DocCard
      doc={{
        id: doc.id,
        title: doc.title,
        description: doc.description,
        permalink: layoutDoc.path,
      }}
    />
  );
}

interface DocsByIdGridProps {
  /**
   * Lista di doc id (path file relativo a docs/, senza .md).
   * Es. 'ricette/agemono/kara-age', 'ricette/preparazioni_di_base/brodi/dashi'.
   */
  ids: string[];
  className?: string;
}

/**
 * Card grid driven by una lista di doc id. Ogni card recupera title,
 * description, permalink e immagine (via image-metadata.json) dai metadata
 * della pagina linkata — niente duplicazione di copy nel file della home.
 *
 * Per cambiare cosa appare nella home basta modificare la lista di id.
 */
export default function DocsByIdGrid({
  ids,
  className,
}: DocsByIdGridProps): React.ReactElement {
  return (
    <section className={clsx(gridStyles.docsGrid, className)}>
      {ids.map((id) => (
        <FeaturedDoc key={id} id={id} />
      ))}
    </section>
  );
}
