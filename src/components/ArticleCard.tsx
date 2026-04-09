import React, { ReactNode } from 'react';
import OptimizedImage from './OptimizedImage';
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
  return (
    <div className={styles.articleCardWrapper}>
      <small className={styles.articleSubtitle}>
        {subtitle}
      </small>
      <div className={styles.articleCard}>
        <OptimizedImage
          src={imageSrc}
          alt={imageAlt}
          className={styles.articleImage}
          pictureClassName={styles.picture}
        />
        <div className={styles.articleContent}>
          {children}
        </div>
      </div>
    </div>
  );
};
