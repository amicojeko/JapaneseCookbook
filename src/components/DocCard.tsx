import React, {useState, useEffect} from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import IdealImage from '@theme/IdealImage';
import styles from './DocCard.module.css';

// Usa il file immagini metadata generato durante la build
function useDocImage(docId: string) {
  const [image, setImage] = useState<string | undefined>();

  useEffect(() => {
    fetch('/image-metadata.json')
      .then(res => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(data => {
        if (!data) return;
        const imagePath = data[docId];
        setImage(imagePath);
      })
      .catch(() => {
        // Silently fail if image metadata is not available
      });
  }, [docId]);

  return image;
}

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
  const image = useDocImage(doc.id);
  const displayImage = image || '/img/placeholder.jpg';

  return (
    <Link to={doc.permalink} className={styles.docItemLink}>
      <article className={styles.docItem}>
        <div className={styles.imageWrapper}>
          <IdealImage
            img={displayImage}
            alt={doc.title}
            className={styles.image}
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
