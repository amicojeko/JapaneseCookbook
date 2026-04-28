import React, { useMemo } from 'react';
import Link from '@docusaurus/Link';
import type { Negozio } from '@site/src/data/negozi';
import { NEGOZI } from '@site/src/data/negozi';

type Props = {
  region: string;
  shops?: Negozio[];
};

// Region display name → URL slug (matches docs/negozi/<slug>.md filenames).
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

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const RegionShopList: React.FC<Props> = ({ region, shops }) => {
  const allShops = shops ?? NEGOZI;
  const regionShops = useMemo(
    () => allShops.filter((s) => s.region === region),
    [allShops, region]
  );

  // Other regions strip — counts from the full dataset.
  const otherRegions = useMemo(() => {
    const counts: Record<string, number> = {};
    allShops.forEach((s) => {
      if (s.region && s.region !== region) {
        counts[s.region] = (counts[s.region] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);
  }, [allShops, region]);

  if (regionShops.length === 0) {
    return (
      <p>
        Per ora non ho ancora negozi in {region}. Se ne conosci,{' '}
        <a
          href="https://instagram.com/amicojeko"
          target="_blank"
          rel="noopener noreferrer"
        >
          scrivimi
        </a>
        !
      </p>
    );
  }

  // Group shops by city, alphabetically (it).
  const groupedByCity = regionShops.reduce((acc, shop) => {
    const city = shop.city || 'Altre località';
    (acc[city] = acc[city] || []).push(shop);
    return acc;
  }, {} as Record<string, Negozio[]>);

  const sortedCities = Object.keys(groupedByCity).sort((a, b) =>
    a.localeCompare(b, 'it', { sensitivity: 'base' })
  );

  const onlineCount = regionShops.filter((s) => s.url).length;

  return (
    <>
      <header className="region-hero">
        <div className="region-hero-info">
          <span className="pg-kicker">
            Regione · {regionShops.length} negoz{regionShops.length === 1 ? 'io' : 'i'}{' '}
            · {sortedCities.length} citt{sortedCities.length === 1 ? 'à' : 'à'}
          </span>
          <h1>{region}.</h1>
          <div className="pg-meta-strip">
            <div>
              <div className="l">Negozi</div>
              <div className="v">{regionShops.length}</div>
            </div>
            <div>
              <div className="l">Città</div>
              <div className="v">{sortedCities.length}</div>
            </div>
            <div>
              <div className="l">Online</div>
              <div className="v">{onlineCount}</div>
            </div>
          </div>
        </div>
      </header>

      {sortedCities.length > 1 && (
        <nav className="region-toc" aria-label="Città in questa regione">
          <span className="lab">Città:</span>
          {sortedCities.map((city) => (
            <a key={city} href={`#city-${slugify(city)}`}>
              {city} <span className="n">{groupedByCity[city].length}</span>
            </a>
          ))}
        </nav>
      )}

      {sortedCities.map((city) => {
        const cityShops = groupedByCity[city];
        return (
          <section
            key={city}
            className="city-section"
            id={`city-${slugify(city)}`}
          >
            <header className="city-h">
              <div className="city-name">{city}</div>
              <div className="city-cnt">
                <strong>{cityShops.length}</strong> negoz
                {cityShops.length === 1 ? 'io' : 'i'}
              </div>
            </header>
            <ol className="shop-list">
              {cityShops.map((shop) => (
                <li key={shop.id} className="shop-row-ed">
                  <h3 className="name">{shop.name}</h3>
                  <p className="addr">{shop.address}</p>
                  {(shop.url || shop.note) && (
                    <div className="badges">
                      {shop.url && (
                        <span className="badge b-online">Online</span>
                      )}
                      {shop.note && (
                        <span className="badge b-promo">Sconto Jeko</span>
                      )}
                    </div>
                  )}
                  {shop.note && <div className="note">«{shop.note}»</div>}
                  {(shop.map_url || shop.url) && (
                    <div className="actions">
                      {shop.map_url && (
                        <a
                          className="ext-link"
                          href={shop.map_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          GOOGLE MAPS <span aria-hidden="true">↗</span>
                        </a>
                      )}
                      {shop.url && (
                        <a
                          className="ext-link"
                          href={shop.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          SITO <span aria-hidden="true">↗</span>
                        </a>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </section>
        );
      })}

      {otherRegions.length > 0 && (
        <section className="other-regions">
          <h4>Continua a esplorare</h4>
          <div className="strip">
            {otherRegions.map(([name, count]) => {
              const slug = REGION_SLUG[name];
              if (!slug) return null;
              return (
                <Link key={name} to={`/negozi_orientali/${slug}`}>
                  {name} <span className="n">{count}</span>
                </Link>
              );
            })}
            <Link to="/negozi_orientali">→ Tutte le regioni</Link>
          </div>
        </section>
      )}
    </>
  );
};

export default RegionShopList;
