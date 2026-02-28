import React, { ReactNode } from 'react';
import imageSrcset from '../../static/image-srcset.json';
import styles from './ArticleCard.module.css';

interface ArticleCardProps {
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
  children: ReactNode;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  subtitle,
  imageSrc,
  imageAlt,
  children,
}) => {
  // Convertisci il path per trovare il srcset
  const srcsetKey = imageSrc.replace(/^\/img\//, '');
  const srcsetData = (imageSrcset as Record<string, any>)[srcsetKey];

  return (
    <div className={styles.articleCardWrapper}>
      <small className={styles.articleSubtitle}>
        {subtitle}
      </small>
      <div className={styles.articleCard}>
        {srcsetData?.srcset ? (
          <picture>
            <source srcSet={srcsetData.srcset} type="image/jpeg" />
            <img
              src={srcsetData.original || imageSrc}
              alt={imageAlt}
              className={styles.articleImage}
              loading="lazy"
              decoding="async"
              width={srcsetData.width}
              height={srcsetData.height}
            />
          </picture>
        ) : (
          <img
            src={imageSrc}
            alt={imageAlt}
            className={styles.articleImage}
            loading="lazy"
            decoding="async"
          />
        )}
        <div className={styles.articleContent}>
          {children}
        </div>
      </div>
    </div>
  );
};

