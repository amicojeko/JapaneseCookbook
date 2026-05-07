import React from 'react';
import clsx from 'clsx';
import DocCard, {type DocCardDoc} from './DocCard';
import styles from './DocCardGrid.module.css';

interface DocCardGridProps {
  /** Array di DocCardDoc resi via il componente DocCard. */
  docs?: DocCardDoc[];
  /** Card già renderizzate dal chiamante (es. da DocsByIdGrid). */
  children?: React.ReactNode;
  className?: string;
}

export default function DocCardGrid({
  docs,
  children,
  className,
}: DocCardGridProps): React.ReactElement {
  return (
    <section className={clsx(styles.docsGrid, className)}>
      {docs
        ? docs.map((doc) => <DocCard key={doc.id} doc={doc} />)
        : children}
    </section>
  );
}
