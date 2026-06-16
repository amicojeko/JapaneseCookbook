import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
} from '@docusaurus/theme-common';
import {
  useBlogAuthorPageTitle,
  BlogAuthorsListViewAllLabel,
  BlogAuthorNoPostsLabel,
} from '@docusaurus/theme-common/internal';
import Link from '@docusaurus/Link';
import {useBlogMetadata} from '@docusaurus/plugin-content-blog/client';
import BlogLayout from '@theme/BlogLayout';
import BlogListPaginator from '@theme/BlogListPaginator';
import SearchMetadata from '@theme/SearchMetadata';
import type {Props} from '@theme/Blog/Pages/BlogAuthorsPostsPage';
import Author from '@theme/Blog/Components/Author';
import BlogCardGrid, {blogItemsToCards} from '@site/src/components/BlogCardGrid';
import NoindexMeta from '@site/src/components/NoindexMeta';

// Ejected (not wrapped): renders per-author listings as homepage-style cards
// (BlogCardGrid) instead of the default BlogPostItems list. These thin utility
// /blog/authors/<author>/ pages stay out of the search index (NoindexMeta).

function Metadata({author}: Props): ReactNode {
  const title = useBlogAuthorPageTitle(author);
  return (
    <>
      <PageMetadata title={title} />
      <SearchMetadata tag="blog_authors_posts" />
    </>
  );
}

function ViewAllAuthorsLink() {
  const {authorsListPath} = useBlogMetadata();
  return (
    <Link href={authorsListPath}>
      <BlogAuthorsListViewAllLabel />
    </Link>
  );
}

function Content({author, items, sidebar, listMetadata}: Props): ReactNode {
  return (
    <BlogLayout sidebar={sidebar}>
      <header className="margin-bottom--xl">
        <Author as="h1" author={author} />
        {author.description && <p>{author.description}</p>}
        <ViewAllAuthorsLink />
      </header>
      {items.length === 0 ? (
        <p>
          <BlogAuthorNoPostsLabel />
        </p>
      ) : (
        <>
          <hr />
          <BlogCardGrid posts={blogItemsToCards(items)} />
          <BlogListPaginator metadata={listMetadata} />
        </>
      )}
    </BlogLayout>
  );
}

export default function BlogAuthorsPostsPage(props: Props): ReactNode {
  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogAuthorsPostsPage,
      )}>
      <NoindexMeta />
      <Metadata {...props} />
      <Content {...props} />
    </HtmlClassNameProvider>
  );
}
