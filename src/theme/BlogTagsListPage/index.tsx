import React, {type ReactNode} from 'react';
import BlogTagsListPage from '@theme-original/BlogTagsListPage';
import type BlogTagsListPageType from '@theme/BlogTagsListPage';
import type {WrapperProps} from '@docusaurus/types';
import NoindexMeta from '@site/src/components/NoindexMeta';

type Props = WrapperProps<typeof BlogTagsListPageType>;

// Wrap (not eject): the /blog/tags/ index is a thin utility page — keep it out
// of the search index. See src/components/NoindexMeta.tsx.
export default function BlogTagsListPageWrapper(props: Props): ReactNode {
  return (
    <>
      <NoindexMeta />
      <BlogTagsListPage {...props} />
    </>
  );
}
