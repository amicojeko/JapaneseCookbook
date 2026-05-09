import React from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import {BLOG_INDEX, type BlogIndexEntry} from '../data/blog-index';
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

const dateFormatter = new Intl.DateTimeFormat('it-IT', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return dateFormatter.format(d);
}

function PostCard({post}: {post: BlogIndexEntry}): React.ReactElement {
  const author = post.authors[0];
  return (
    <Link to={post.permalink} className={styles.cardLink} aria-label={post.title}>
      <article className={styles.card}>
        {post.image && (
          <div className={styles.imageWrapper}>
            <img src={post.image} alt={post.title} className={styles.image} loading="lazy" />
          </div>
        )}
        <div className={styles.content}>
          <div className={styles.eyebrow}>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {post.readingTime != null && (
              <span> · {Math.ceil(post.readingTime)} min</span>
            )}
            {author && <span className={styles.author}> · {author.name}</span>}
          </div>
          <Heading as="h3" className={styles.title}>{post.title}</Heading>
          {post.description && <p className={styles.description}>{post.description}</p>}
          <span className={styles.cta}>Leggi →</span>
        </div>
      </article>
    </Link>
  );
}

export default function LatestBlogPosts({
  limit = 2,
  minPosts = 0,
  heading = '📝 Dal blog',
  seeAllLabel = 'Tutti i post →',
}: LatestBlogPostsProps): React.ReactElement | null {
  if (BLOG_INDEX.length < minPosts) return null;
  const posts = BLOG_INDEX.slice(0, limit);
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
      <div className={styles.grid}>
        {posts.map((p) => <PostCard key={p.slug} post={p} />)}
      </div>
    </section>
  );
}
