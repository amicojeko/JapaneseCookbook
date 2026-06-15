import React, {type ReactNode} from 'react';
import BlogAuthorsListPage from '@theme-original/Blog/Pages/BlogAuthorsListPage';
import type BlogAuthorsListPageType from '@theme/Blog/Pages/BlogAuthorsListPage';
import type {WrapperProps} from '@docusaurus/types';
import NoindexMeta from '@site/src/components/NoindexMeta';

type Props = WrapperProps<typeof BlogAuthorsListPageType>;

// Wrap (not eject): the /blog/authors/ index is a thin utility page — keep it
// out of the search index.
export default function BlogAuthorsListPageWrapper(props: Props): ReactNode {
  return (
    <>
      <NoindexMeta />
      <BlogAuthorsListPage {...props} />
    </>
  );
}
