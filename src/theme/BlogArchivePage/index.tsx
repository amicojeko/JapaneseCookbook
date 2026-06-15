import React, {type ReactNode} from 'react';
import BlogArchivePage from '@theme-original/BlogArchivePage';
import type BlogArchivePageType from '@theme/BlogArchivePage';
import type {WrapperProps} from '@docusaurus/types';
import NoindexMeta from '@site/src/components/NoindexMeta';

type Props = WrapperProps<typeof BlogArchivePageType>;

// Wrap (not eject): /blog/archive/ is a thin utility listing — keep it out of
// the search index.
export default function BlogArchivePageWrapper(props: Props): ReactNode {
  return (
    <>
      <NoindexMeta />
      <BlogArchivePage {...props} />
    </>
  );
}
