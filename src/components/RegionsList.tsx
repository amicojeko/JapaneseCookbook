import React, { useMemo } from 'react';
import Link from '@docusaurus/Link';
import { NEGOZI } from '@site/src/data/negozi';
import { getAllOnlineShops } from '@site/src/data/negozi-online';
import { REGIONI } from '@site/src/data/regioni';

const RegionsList: React.FC = () => {
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    NEGOZI.forEach((s) => {
      c[s.region] = (c[s.region] || 0) + 1;
    });
    return c;
  }, []);

  const onlineCount = useMemo(() => getAllOnlineShops().length, []);

  const sortedRegions = useMemo(
    () =>
      REGIONI.slice().sort((a, b) =>
        a.name.localeCompare(b.name, 'it', { sensitivity: 'base' })
      ),
    []
  );

  return (
    <ol className="region-list">
      <li className="region-row is-online">
        <Link className="region-row__link" to="/negozi_orientali/online">
          <span className="region-row__name">Online</span>
          <span className="region-row__cnt">
            <strong>{onlineCount}</strong> shop
          </span>
          <span className="region-row__arrow" aria-hidden="true">
            →
          </span>
        </Link>
      </li>
      {sortedRegions.map(({ name: region, slug }) => {
        const count = counts[region] || 0;
        // A row is a placeholder if the region has no published page (no slug)
        // OR no shops yet — in either case we don't want to render a link.
        const isEmpty = !slug || count === 0;
        const cnt = isEmpty ? (
          <em>— in arrivo</em>
        ) : (
          <>
            <strong>{count}</strong> negoz{count === 1 ? 'io' : 'i'}
          </>
        );
        // Empty regions: render a non-interactive <div> instead of an <a>.
        // An <a href="#"> would still be keyboard-focusable and activatable,
        // jumping the page to the top — the previous CSS-only `pointer-events:
        // none` defence didn't cover keyboard users.
        return (
          <li
            key={region}
            className={`region-row${isEmpty ? ' is-empty' : ''}`}
          >
            {isEmpty ? (
              <div className="region-row__link" aria-disabled="true">
                <span className="region-row__name">{region}</span>
                <span className="region-row__cnt">{cnt}</span>
                <span className="region-row__arrow" aria-hidden="true">
                  →
                </span>
              </div>
            ) : (
              <Link
                className="region-row__link"
                to={`/negozi_orientali/${slug}`}
              >
                <span className="region-row__name">{region}</span>
                <span className="region-row__cnt">{cnt}</span>
                <span className="region-row__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  );
};

export default RegionsList;
