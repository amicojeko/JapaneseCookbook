import React from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import {BLOG_INDEX} from '../data/blog-index';
import BlogCardGrid, {type BlogCardData} from './BlogCardGrid';
import styles from './LatestBlogPosts.module.css';

interface LatestBlogPostsProps {
  /** Quanti post mostrare al massimo. Default 2. */
  limit?: number;
  /**
   * Soglia minima di post nell'indice perché la strip venga renderizzata.
   * Sotto la soglia il componente ritorna null. Serve a non mostrare la
   * strip in homepage finché il blog non ha abbastanza materiale —
   * appena l'indice raggiunge minPosts si "sveglia" da sola.
   */
  minPosts?: number;
  /** Heading mostrato sopra la strip (omettere per non mostrarne). */
  heading?: string;
  /** Etichetta del CTA "vedi tutti" sotto la strip. Omettere per non mostrarne. */
  seeAllLabel?: string;
}

export default function LatestBlogPosts({
  limit = 2,
  minPosts = 0,
  heading = '📝 Dal blog',
  seeAllLabel = 'Tutti i post →',
}: LatestBlogPostsProps): React.ReactElement | null {
  if (BLOG_INDEX.length < minPosts) return null;
  const posts: BlogCardData[] = BLOG_INDEX.slice(0, limit).map((p) => ({
    permalink: p.permalink,
    title: p.title,
    date: p.date,
    description: p.description ?? undefined,
    readingTime: p.readingTime ?? undefined,
    authorName: p.authors[0]?.name,
    image: p.image ?? undefined,
  }));
  if (posts.length === 0) return null;
  return (
    <section className={styles.wrapper}>
      {heading && (
        <div className={styles.headerRow}>
          <Heading as="h2" className={styles.heading}>{heading}</Heading>
          {seeAllLabel && (
            <Link to="/blog/" className={styles.seeAll}>{seeAllLabel}</Link>
          )}
        </div>
      )}
      <BlogCardGrid posts={posts} titleAs="h3" />
    </section>
  );
}
