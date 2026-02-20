import React, { ReactNode } from 'react';
import styles from './ArticleCard.module.css';

interface ArticleCardProps {
  originalTitle: string;
  imageSrc: string;
  imageAlt: string;
  children: ReactNode;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  originalTitle,
  imageSrc,
  imageAlt,
  children,
}) => {
  return (
    <div className={styles.articleCardWrapper}>
      <small className={styles.articleTitle}>
        {originalTitle}
      </small>
      <div className={styles.articleCard}>
        <img
          src={imageSrc}
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

