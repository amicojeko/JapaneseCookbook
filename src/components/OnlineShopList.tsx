import React, { useMemo } from 'react';
import Link from '@docusaurus/Link';
import { NEGOZI } from '@site/src/data/negozi';

/**
 * Online-only shops (not in NEGOZI because they have no physical address).
 * Physical shops that also have an `url` are pulled in from NEGOZI automatically.
 */
type OnlineShop = {
  id: string;
  name: string;
  url: string;
  note?: string;
  category?: string; // e.g. "Coltelli & accessori"
  city?: string;
  region?: string;
};

const ONLINE_ONLY: OnlineShop[] = [
  { id: 'sushitalia', name: 'Sushitalia', url: 'https://sushitalia.com' },
  { id: 'sushi-sushi', name: 'Sushi Sushi', url: 'https://sushi-sushi.it' },
  { id: 'orientalitalia', name: 'Oriental Italia', url: 'https://www.orientalitalia.com' },
  { id: 'fusioneat', name: 'FusionEat', url: 'https://www.fusioneat.it' },
  { id: 'domechan', name: 'Domechan', url: 'https://domechan.com/it' },
  {
    id: 'zanzino',
    name: 'Zanzino',
    url: 'https://www.zanzino.it/gb/',
    category: 'Coltelli & accessori',
  },
];

// Region display name → URL slug (mirror of RegionShopList's table).
const REGION_SLUG: Record<string, string> = {
  Abruzzo: 'abruzzo',
  Calabria: 'calabria',
  Campania: 'campania',
  'Emilia-Romagna': 'emilia_romagna',
  'Friuli-Venezia Giulia': 'friuli-venezia_giulia',
  Lazio: 'lazio',
  Liguria: 'liguria',
  Lombardia: 'lombardia',
  Marche: 'marche',
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

const OnlineShopList: React.FC = () => {
  const allOnline: OnlineShop[] = useMemo(() => {
    const fromNegozi: OnlineShop[] = NEGOZI.filter((s) => !!s.url).map((s) => ({
      id: s.id,
      name: s.name,
      url: s.url as string,
      note: s.note,
      city: s.city,
      region: s.region,
    }));
    return [...ONLINE_ONLY, ...fromNegozi].sort((a, b) =>
      a.name.localeCompare(b.name, 'it', { sensitivity: 'base' })
    );
  }, []);

  const total = allOnline.length;
  const withDiscount = allOnline.filter((s) => !!s.note).length;
  const withPhysical = allOnline.filter((s) => !!s.region).length;

  // Top regions strip — mirrors region page's "Continua a esplorare".
  const otherRegions = useMemo(() => {
    const counts: Record<string, number> = {};
    NEGOZI.forEach((s) => {
      if (s.region) counts[s.region] = (counts[s.region] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);
  }, []);

  return (
    <>
      <header className="region-hero">
        <div className="region-hero-info">
          <span className="pg-kicker">
            Sezione · {total} negoz{total === 1 ? 'io' : 'i'} online
          </span>
          <h1>Online.</h1>
          <div className="pg-meta-strip">
            <div>
              <div className="l">Negozi</div>
              <div className="v">{total}</div>
            </div>
            <div>
              <div className="l">Anche fisici</div>
              <div className="v">{withPhysical}</div>
            </div>
            <div>
              <div className="l">Sconti</div>
              <div className="v">{withDiscount}</div>
            </div>
          </div>
        </div>
      </header>

      <ol className="shop-list">
        {allOnline.map((shop) => (
          <li key={shop.id} className="shop-row-ed">
            <h3 className="name">{shop.name}</h3>
            {(shop.city || shop.region || shop.category) && (
              <p className="addr">
                {shop.category ? (
                  shop.category
                ) : (
                  <>
                    Anche negozio fisico{shop.city ? ` a ${shop.city}` : ''}
                    {shop.region ? ` · ${shop.region}` : ''}
                  </>
                )}
              </p>
            )}
            {shop.note && (
              <div className="badges">
                <span className="badge b-promo">Sconto Jeko</span>
              </div>
            )}
            {shop.note && <div className="note">«{shop.note}»</div>}
            <div className="actions">
              <a
                className="ext-link"
                href={shop.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                APRI IL SITO <span aria-hidden="true">↗</span>
              </a>
            </div>
          </li>
        ))}
      </ol>

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

export default OnlineShopList;
