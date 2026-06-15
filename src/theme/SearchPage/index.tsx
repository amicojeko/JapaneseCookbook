import React, {type ReactNode} from 'react';
import SearchPage from '@theme-original/SearchPage';
import type SearchPageType from '@theme/SearchPage';
import type {WrapperProps} from '@docusaurus/types';
import NoindexMeta from '@site/src/components/NoindexMeta';

type Props = WrapperProps<typeof SearchPageType>;

// Wrap (not eject): the Algolia /search/ results page has no standalone
// content worth indexing — keep it out of the search index.
export default function SearchPageWrapper(props: Props): ReactNode {
  return (
    <>
      <NoindexMeta />
      <SearchPage {...props} />
    </>
  );
}
