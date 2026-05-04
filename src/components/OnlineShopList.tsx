import React, { useMemo } from 'react';
import Link from '@docusaurus/Link';
import { NEGOZI } from '@site/src/data/negozi';
import { getAllOnlineShops } from '@site/src/data/negozi-online';

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
  const allOnline = useMemo(() => getAllOnlineShops(), []);

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
