import React from 'react';
import clsx from 'clsx';
import DocCard, {type DocCardDoc} from './DocCard';
import styles from './DocCardGrid.module.css';

interface DocCardGridProps {
  docs: DocCardDoc[];
  className?: string;
}

export default function DocCardGrid({
  docs,
  className,
}: DocCardGridProps): React.ReactElement {
  return (
    <section className={clsx(styles.docsGrid, className)}>
      {docs.map((doc) => (
        <DocCard key={doc.id} doc={doc} />
      ))}
    </section>
  );
}
