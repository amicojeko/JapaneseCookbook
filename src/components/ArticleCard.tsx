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
    <>
      <small style={{ fontStyle: 'italic', display: 'block', marginTop: '-1.5em', marginBottom: '1em' }}>
        {originalTitle}
      </small>
      <img
        src={imageSrc}
        alt={imageAlt}
        className={styles.articleImage}
      />
      <div className={styles.articleContent}>
        {children}
      </div>
    </>
  );
};
