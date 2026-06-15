import React, {type ReactNode} from 'react';
import BlogAuthorsPostsPage from '@theme-original/Blog/Pages/BlogAuthorsPostsPage';
import type BlogAuthorsPostsPageType from '@theme/Blog/Pages/BlogAuthorsPostsPage';
import type {WrapperProps} from '@docusaurus/types';
import NoindexMeta from '@site/src/components/NoindexMeta';

type Props = WrapperProps<typeof BlogAuthorsPostsPageType>;

// Wrap (not eject): per-author /blog/authors/<author>/ listings are thin
// utility pages — keep them out of the search index.
export default function BlogAuthorsPostsPageWrapper(props: Props): ReactNode {
  return (
    <>
      <NoindexMeta />
      <BlogAuthorsPostsPage {...props} />
    </>
  );
}
