import React from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import imageMetadata from '../../static/image-metadata.json';
import OptimizedImage from './OptimizedImage';
import styles from './DocCard.module.css';

export interface DocCardDoc {
  id: string;
  title: string;
  description?: string;
  permalink: string;
}

interface DocCardProps {
  doc: DocCardDoc;
}

export default function DocCard({doc}: DocCardProps): React.ReactElement {
  const displayImage = (imageMetadata as Record<string, string>)[doc.id] || '/img/placeholder.jpg';

  return (
    <Link to={doc.permalink} className={styles.docItemLink}>
      <article className={styles.docItem}>
        <div className={styles.imageWrapper}>
          <OptimizedImage
            src={displayImage}
            alt={doc.title}
            className={styles.image}
            pictureClassName={styles.picture}
          />
        </div>
        <div className={styles.content}>
          <Heading as="h3" className={styles.title}>
            {doc.title}
          </Heading>
          {doc.description && (
            <p className={styles.description}>{doc.description}</p>
          )}
        </div>
      </article>
    </Link>
  );
}
