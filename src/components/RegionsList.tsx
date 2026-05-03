import React, { useMemo } from 'react';
import Link from '@docusaurus/Link';
import { NEGOZI } from '@site/src/data/negozi';
import { getAllOnlineShops } from '@site/src/data/negozi-online';

// Map region display name → URL slug used by docs/negozi/<slug>.md
const REGION_SLUG: Record<string, string> = {
  Abruzzo: 'abruzzo',
  Basilicata: 'basilicata',
  Calabria: 'calabria',
  Campania: 'campania',
  'Emilia-Romagna': 'emilia_romagna',
  'Friuli-Venezia Giulia': 'friuli-venezia_giulia',
  Lazio: 'lazio',
  Liguria: 'liguria',
  Lombardia: 'lombardia',
  Marche: 'marche',
  Molise: 'molise',
  Piemonte: 'piemonte',
  Puglia: 'puglia',
  Sardegna: 'sardegna',
  Sicilia: 'sicilia',
  Toscana: 'toscana',
  'Trentino-Alto Adige': 'trentino-alto_adige',
  Umbria: 'umbria',
  "Valle d'Aosta": 'valle_d_aosta',
  Veneto: 'veneto',
};

const ALL_REGIONS = Object.keys(REGION_SLUG);

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
      ALL_REGIONS.slice().sort((a, b) =>
        a.localeCompare(b, 'it', { sensitivity: 'base' })
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
      {sortedRegions.map((region) => {
        const count = counts[region] || 0;
        const isEmpty = count === 0;
        const slug = REGION_SLUG[region];
        return (
          <li
            key={region}
            className={`region-row${isEmpty ? ' is-empty' : ''}`}
          >
            <Link
              className="region-row__link"
              to={isEmpty ? '#' : `/negozi_orientali/${slug}`}
            >
              <span className="region-row__name">{region}</span>
              <span className="region-row__cnt">
                {isEmpty ? (
                  <em>— in arrivo</em>
                ) : (
                  <>
                    <strong>{count}</strong> negoz{count === 1 ? 'io' : 'i'}
                  </>
                )}
              </span>
              <span className="region-row__arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
};

export default RegionsList;
