import React, {type ReactNode} from 'react';
import DocTagsListPage from '@theme-original/DocTagsListPage';
import type DocTagsListPageType from '@theme/DocTagsListPage';
import type {WrapperProps} from '@docusaurus/types';
import NoindexMeta from '@site/src/components/NoindexMeta';

type Props = WrapperProps<typeof DocTagsListPageType>;

// Wrap (not eject): the /tags/ index (list of all docs tags) is a thin utility
// page — keep it out of the search index. Per-tag pages get the same treatment
// in src/theme/DocTagDocListPage/index.tsx.
export default function DocTagsListPageWrapper(props: Props): ReactNode {
  return (
    <>
      <NoindexMeta />
      <DocTagsListPage {...props} />
    </>
  );
}
