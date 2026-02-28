import React from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import imageMetadata from '../../static/image-metadata.json';
import imageSrcset from '../../static/image-srcset.json';
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
  
  // Convertisci il path per trovare il srcset
  // Esempio: displayImage = '/img/ingredienti/agedama.jpg'
  // Key nel srcset = 'ingredienti/agedama.jpg'
  const srcsetKey = displayImage.replace(/^\/img\//, '');
  const srcsetData = (imageSrcset as Record<string, any>)[srcsetKey];

  return (
    <Link to={doc.permalink} className={styles.docItemLink}>
      <article className={styles.docItem}>
        <div className={styles.imageWrapper}>
          {srcsetData?.srcset ? (
            <picture>
              {srcsetData.srcset && (
                <source srcSet={srcsetData.srcset} type="image/jpeg" />
              )}
              <img
                src={srcsetData.original || displayImage}
                alt={doc.title}
                className={styles.image}
                loading="lazy"
                decoding="async"
              />
            </picture>
          ) : (
            <img
              src={displayImage}
              alt={doc.title}
              className={styles.image}
              loading="lazy"
              decoding="async"
            />
          )}
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
