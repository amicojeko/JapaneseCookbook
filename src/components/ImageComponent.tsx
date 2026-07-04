import React from 'react';
import Head from '@docusaurus/Head';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import OptimizedImage from './OptimizedImage';
import imageSrcset from '../../static/image-srcset.json';
import styles from './ImageComponent.module.css';

// Sizes hint for the hero, kept in sync with OptimizedImage's DEFAULT_SIZES so
// the variant we preload matches the one <picture> ultimately selects.
const HERO_SIZES = '(max-width: 720px) 100vw, 720px';

interface HeroSrcset {
  original: string;
  srcset: string;
}

interface ImageComponentProps {
  // Props per uso diretto (passando src)
  src?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
  useContainer?: boolean; // Se true, usa il container con stili
  caption?: React.ReactNode; // Quando presente, wrappa in <figure> + <figcaption>
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
// Direct-src branch: doesn't call useDoc(), so it works in any context
// (docs, blog posts, MDX pages — anywhere ImageComponent gets used).
// Delegates the <picture> + srcset emission to OptimizedImage, then wraps
// in <figure>/<div> for layout/caption.
const ImageFromSrc: React.FC<ImageComponentProps> = ({
  src,
  alt,
  width,
  height,
  style,
  useContainer = true,
  caption,
}) => {
  const opt = (
    <OptimizedImage
      src={src!}
      alt={alt || ''}
      className={useContainer ? styles.image : undefined}
      width={width}
      height={height}
      style={style}
    />
  );

  if (!useContainer) {
    return opt;
  }

  if (caption) {
    return (
      <figure className={styles.figure}>
        {opt}
        <figcaption className={styles.caption}>{caption}</figcaption>
      </figure>
    );
  }

  return <div className={styles.imageContainer}>{opt}</div>;
};

// Frontmatter branch: only mounted inside a docs page (DocProvider context).
const ImageFromFrontmatter: React.FC = () => {
  const doc = useDoc();
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

  // The recipe/ingredient hero is almost always the LCP element. Load it
  // eagerly with high fetch priority, and preload the responsive WebP variant
  // (imagesrcset/imagesizes mirror the <picture> below) so it starts
  // downloading during HTML parse instead of after the CSS/JS.
  const srcsetKey = imagePath.replace(/^\/img\//, '');
  const hero = (imageSrcset as Record<string, HeroSrcset>)[srcsetKey];

  return (
    <>
      <Head>
        {hero?.srcset ? (
          <link
            rel="preload"
            as="image"
            type="image/webp"
            imageSrcSet={hero.srcset}
            imageSizes={HERO_SIZES}
            fetchPriority="high"
          />
        ) : (
          <link rel="preload" as="image" href={imagePath} fetchPriority="high" />
        )}
      </Head>
      <div className={styles.imageContainer}>
        <OptimizedImage
          src={imagePath}
          alt={altText as string}
          className={styles.image}
          lazy={false}
          fetchPriority="high"
          sizes={HERO_SIZES}
        />
      </div>
    </>
  );
};

const ImageComponent: React.FC<ImageComponentProps> = (props) => {
  if (props.src) {
    return <ImageFromSrc {...props} />;
  }
  return <ImageFromFrontmatter />;
};

export default ImageComponent;
