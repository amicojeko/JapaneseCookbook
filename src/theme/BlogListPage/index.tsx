import React, {type ReactNode} from 'react';
import clsx from 'clsx';

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
} from '@docusaurus/theme-common';
import BlogLayout from '@theme/BlogLayout';
import BlogListPaginator from '@theme/BlogListPaginator';
import SearchMetadata from '@theme/SearchMetadata';
import type {Props} from '@theme/BlogListPage';
import BlogListPageStructuredData from '@theme/BlogListPage/StructuredData';
import BlogCardGrid, {blogItemsToCards} from '@site/src/components/BlogCardGrid';
import NoindexMeta from '@site/src/components/NoindexMeta';

// Ejected (not wrapped): renders the blog index as homepage-style editorial
// cards (BlogCardGrid) instead of the default full BlogPostItems list, while
// keeping layout, metadata, structured data and pagination intact.
// Paginated pages (/blog/page/2/ and beyond) are noindexed — page 1 (/blog/)
// is the real, indexable blog home.

function BlogListPageMetadata(props: Props): ReactNode {
  const {metadata} = props;
  const {
    siteConfig: {title: siteTitle},
  } = useDocusaurusContext();
  const {blogDescription, blogTitle, permalink} = metadata;
  const isBlogOnlyMode = permalink === '/';
  const title = isBlogOnlyMode ? siteTitle : blogTitle;
  return (
    <>
      <PageMetadata title={title} description={blogDescription} />
      <SearchMetadata tag="blog_posts_list" />
    </>
  );
}

function BlogListPageContent(props: Props): ReactNode {
  const {metadata, items, sidebar} = props;
  return (
    <BlogLayout sidebar={sidebar}>
      <BlogCardGrid posts={blogItemsToCards(items)} />
      <BlogListPaginator metadata={metadata} />
    </BlogLayout>
  );
}

export default function BlogListPage(props: Props): ReactNode {
  const isPaginated = props.metadata.page > 1;
  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogListPage,
      )}>
      {isPaginated && <NoindexMeta />}
      <BlogListPageMetadata {...props} />
      <BlogListPageStructuredData {...props} />
      <BlogListPageContent {...props} />
    </HtmlClassNameProvider>
  );
}
