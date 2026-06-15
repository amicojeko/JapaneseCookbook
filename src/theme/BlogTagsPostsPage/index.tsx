import React, {type ReactNode} from 'react';
import BlogTagsPostsPage from '@theme-original/BlogTagsPostsPage';
import type BlogTagsPostsPageType from '@theme/BlogTagsPostsPage';
import type {WrapperProps} from '@docusaurus/types';
import NoindexMeta from '@site/src/components/NoindexMeta';

type Props = WrapperProps<typeof BlogTagsPostsPageType>;

// Wrap (not eject): individual /blog/tags/<tag>/ pages (and their /page/N/
// variants) are thin utility listings — keep them out of the search index.
export default function BlogTagsPostsPageWrapper(props: Props): ReactNode {
  return (
    <>
      <NoindexMeta />
      <BlogTagsPostsPage {...props} />
    </>
  );
}
