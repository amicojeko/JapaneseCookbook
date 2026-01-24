import React from 'react';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import styles from './ImageComponent.module.css';

interface ImageComponentProps {
  // Props per uso diretto (passando src)
  src?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
  useContainer?: boolean; // Se true, usa il container con stili
}

/**
 * Componente ImageComponent - Unificato
 *
 * Supporta due modalità di utilizzo:
 *
 * 1. Con props dirette (per immagini custom):
 *    <ImageComponent src="/img/photo.jpg" alt="Descrizione" width={300} />
 *
 * 2. Con frontmatter (per ricette/ingredienti):
 *    <ImageComponent />
 *
 * Usa automaticamente il titolo come alt text quando usa il frontmatter.
 * Supporta solo il campo singolo "image" nel frontmatter.
 */
const ImageComponent: React.FC<ImageComponentProps> = ({
  src,
  alt,
  width,
  height,
  style,
  useContainer = true,
}) => {
  const doc = useDoc();

  // Se src è fornito, usa la modalità diretta (props)
  if (src) {
    const imgElement = (
      <img
        src={src}
        alt={alt || ''}
        width={width}
        height={height}
        style={style}
        className={useContainer ? styles.image : undefined}
      />
    );

    return useContainer ? (
      <div className={styles.imageContainer}>{imgElement}</div>
    ) : imgElement;
  }

  // Altrimenti usa la modalità frontmatter
  const imagePath = doc?.frontMatter?.image;
  const altText = doc?.frontMatter?.title || 'Immagine';

  if (!imagePath) {
    console.warn(`Nessun campo "image" trovato nel frontmatter di ${doc?.metadata?.source || 'questo documento'}`);
    return null;
  }

  if (typeof imagePath !== 'string') {
    console.error(`imagePath non è una stringa:`, imagePath);
    return null;
  }

  return (
    <div className={styles.imageContainer}>
      <img
        src={imagePath}
        alt={altText}
        className={styles.image}
      />
    </div>
  );
};

export default ImageComponent;
