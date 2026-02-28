import React, { ReactNode } from 'react';
import IdealImage from '@theme/IdealImage';
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
        <IdealImage
          img={imageSrc}
          alt={imageAlt}
          className={styles.articleImage}
        />
        <div className={styles.articleContent}>
          {children}
        </div>
      </div>
    </div>
  );
};

