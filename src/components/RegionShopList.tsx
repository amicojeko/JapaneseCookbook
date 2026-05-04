import React, { useEffect, useMemo, useRef } from 'react';
import type { Negozio } from '@site/src/data/negozi';
import { NEGOZI } from '@site/src/data/negozi';

const NAVBAR_HEIGHT = 60;
const TOC_BOTTOM_BUFFER = 20;

/**
 * Smooth-scroll a TOC click to the city section, leaving room for the sticky
 * navbar AND the sticky region-toc. Computing the offset from the toc's
 * *current* height is more reliable than a static `scroll-margin-top` because
 * it always scrolls past the sticky-engagement threshold — even on short
 * pages (e.g. Abruzzo with 2 cities) where the static target wasn't quite
 * far enough to push the toc into its top:60 position.
 */
function useTocScroll(tocRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const toc = tocRef.current;
    if (!toc) return;
    const links = Array.from(
      toc.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')
    );

    const onClick = (e: MouseEvent) => {
      const a = e.currentTarget as HTMLAnchorElement;
      const id = a.getAttribute('href')?.slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const targetTop =
        target.getBoundingClientRect().top + window.scrollY;
      const top = Math.max(
        0,
        targetTop - (NAVBAR_HEIGHT + toc.offsetHeight + TOC_BOTTOM_BUFFER)
      );
      window.scrollTo({ top, behavior: 'smooth' });
      window.history.pushState(null, '', `#${id}`);
    };

    links.forEach((l) => l.addEventListener('click', onClick));
    return () => {
      links.forEach((l) => l.removeEventListener('click', onClick));
    };
  }, [tocRef]);
}

type Props = {
  region: string;
  shops?: Negozio[];
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
  const tocRef = useRef<HTMLElement>(null);
  useTocScroll(tocRef);

  return (
    <>
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

      {sortedCities.length > 1 && (
        <nav
          ref={tocRef}
          className="region-toc"
          aria-label="Città in questa regione"
        >
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
              <h2 className="city-name">{city}</h2>
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

    </>
  );
};

export default RegionShopList;
