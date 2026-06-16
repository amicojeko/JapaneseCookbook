import React from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import type {PropBlogPostContent} from '@docusaurus/plugin-content-blog';
import OptimizedImage from './OptimizedImage';
import styles from './LatestBlogPosts.module.css';

// Single source of truth for the editorial blog card grid: the homepage
// "Dal blog" strip (LatestBlogPosts) and the blog index / tag / author listing
// pages all render through this component, so the cards look identical
// everywhere. Both feeds normalise their data into BlogCardData first.

export interface BlogCardData {
  permalink: string;
  title: string;
  /** ISO date string (YYYY-MM-DD). */
  date: string;
  description?: string;
  readingTime?: number;
  authorName?: string;
  image?: string;
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

/** Adapt the theme `items` array (blog list / tag / author pages) to cards. */
export function blogItemsToCards(
  items: readonly {readonly content: PropBlogPostContent}[],
): BlogCardData[] {
  return items.map(({content}) => {
    const {metadata, frontMatter} = content;
    return {
      permalink: metadata.permalink,
      title: metadata.title,
      date: new Date(metadata.date).toISOString().slice(0, 10),
      description: metadata.description,
      readingTime: metadata.readingTime,
      authorName: metadata.authors?.[0]?.name,
      image: frontMatter.image as string | undefined,
    };
  });
}

function PostCard({
  post,
  titleAs,
}: {
  post: BlogCardData;
  titleAs: 'h2' | 'h3';
}): React.ReactElement {
  return (
    <Link to={post.permalink} className={styles.cardLink} aria-label={post.title}>
      <article className={styles.card}>
        {post.image && (
          <div className={styles.imageWrapper}>
            <OptimizedImage
              src={post.image}
              alt={post.title}
              className={styles.image}
              // Strip auto-fill minmax(300px, 1fr): card 340-450px
              // (1 col su mobile, 2 col su tablet, 3-4 col su desktop).
              sizes="(max-width: 480px) 100vw, (max-width: 1024px) 50vw, 360px"
            />
          </div>
        )}
        <div className={styles.content}>
          <div className={styles.eyebrow}>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {post.readingTime != null && (
              <span> · {Math.ceil(post.readingTime)} min</span>
            )}
            {post.authorName && (
              <span className={styles.author}> · {post.authorName}</span>
            )}
          </div>
          <Heading as={titleAs} className={styles.title}>{post.title}</Heading>
          {post.description && <p className={styles.description}>{post.description}</p>}
          <span className={styles.cta}>Leggi →</span>
        </div>
      </article>
    </Link>
  );
}

export default function BlogCardGrid({
  posts = [],
  titleAs = 'h2',
}: {
  posts?: BlogCardData[];
  /** Heading level for the card title. Homepage uses h3 (under the section h2). */
  titleAs?: 'h2' | 'h3';
}): React.ReactElement {
  return (
    <div className={styles.grid}>
      {posts.map((post) => (
        <PostCard key={post.permalink} post={post} titleAs={titleAs} />
      ))}
    </div>
  );
}
