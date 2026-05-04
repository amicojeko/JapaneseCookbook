import React, { useMemo } from 'react';
import { getAllOnlineShops } from '@site/src/data/negozi-online';

const OnlineShopList: React.FC = () => {
  const allOnline = useMemo(() => getAllOnlineShops(), []);

  const total = allOnline.length;
  const withDiscount = allOnline.filter((s) => !!s.note).length;
  const withPhysical = allOnline.filter((s) => !!s.region).length;

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
    </>
  );
};

export default OnlineShopList;
