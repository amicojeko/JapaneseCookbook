import React from 'react';
import type { Negozio } from '@site/src/data/negozi';

type Props = {
  region: string;
  shops: Negozio[];
};

const RegionShopList: React.FC<Props> = ({ region, shops }) => {
  const regionShops = shops.filter((s) => s.region === region);

  if (regionShops.length === 0) {
    return <p>Per ora non ho ancora negozi in {region}. Se ne conosci, scrivimi!</p>;
  }

  // raggruppo per città, mantenendo l’ordine dei negozi
  const groupedByCity = regionShops.reduce((acc, shop) => {
    const city = shop.city || 'Altre località';
    if (!acc[city]) {
      acc[city] = [];
    }
    acc[city].push(shop);
    return acc;
  }, {} as Record<string, Negozio[]>);

  // ordino le città in ordine alfabetico (con locale italiano)
  const sortedCities = Object.keys(groupedByCity).sort((a, b) =>
    a.localeCompare(b, 'it', { sensitivity: 'base' })
  );

  return (
    <div>
      {sortedCities.map((city) => (
        <section key={city} style={{ marginBottom: '1.5rem' }}>
          <h2
            id={city.toLowerCase().replace(/\s+/g, '-')}
            className="anchor anchorTargetStickyNavbar_Vzrq"
          >
            {city}
            <a
              href={`#${city.toLowerCase().replace(/\s+/g, '-')}`}
              className="hash-link"
              aria-label={`Link diretto a ${city}`}
              title={`Link diretto a ${city}`}
              translate="no"
              >
              ​
            </a>
          </h2>
          <ul>
            {groupedByCity[city].map((shop) => (
              <li key={shop.id} style={{ marginBottom: '0.5rem' }}>
                <strong>{shop.name}</strong><br />
                {shop.address}
                <br />
                {shop.map_url && (
                  <a href={shop.map_url} target="_blank" rel="noopener noreferrer">
                    Vedi su Google Maps
                  </a>
                )}
                <br />
                {shop.url && (
                  <a href={shop.url} target="_blank" rel="noopener noreferrer">
                    Sito web
                  </a>
                )}
                {shop.note && <div>{shop.note}</div>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

export default RegionShopList;
