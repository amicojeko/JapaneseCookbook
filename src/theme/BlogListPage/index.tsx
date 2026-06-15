import React, {type ReactNode} from 'react';
import BlogListPage from '@theme-original/BlogListPage';
import type BlogListPageType from '@theme/BlogListPage';
import type {WrapperProps} from '@docusaurus/types';
import NoindexMeta from '@site/src/components/NoindexMeta';

type Props = WrapperProps<typeof BlogListPageType>;

// Wrap (not eject): noindex only the paginated blog index pages
// (/blog/page/2/ and beyond). Page 1 (/blog/) is the real, indexable blog
// home — `metadata.page` is 1 there — so we leave it untouched.
export default function BlogListPageWrapper(props: Props): ReactNode {
  const isPaginated = props.metadata.page > 1;
  return (
    <>
      {isPaginated && <NoindexMeta />}
      <BlogListPage {...props} />
    </>
  );
}
