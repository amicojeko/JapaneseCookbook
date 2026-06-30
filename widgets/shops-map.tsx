/** Widget find_shops: mappa Leaflet (tile CartoDB, pin teardrop rosso) + lista negozi. */
import L from 'leaflet';
import leafletCss from 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'preact/hooks';
import { mount, useToolOutput, type OnlineShop, type Shop } from './_shared';

interface ShopsOutput {
  total?: number;
  search_center?: { lat: number; lng: number } | null;
  radius_km?: number | null;
  negozi?: Shop[];
  negozi_online?: OnlineShop[];
}

const SHOPS_CSS = `
.pg-map { height: 320px; width: 100%; border-radius: 12px; overflow: hidden; border: 1px solid var(--pg-rule-soft); }
.leaflet-container { font-family: var(--pg-font-sans); background: var(--pg-paper-2); }
.neg-marker path { fill: var(--pg-red); stroke: #fff; stroke-width: 1.5; filter: drop-shadow(0 1px 2px rgba(0,0,0,.35)); }
.pg-pop b { font-family: var(--pg-font-serif); font-size: 14px; }
.pg-pop .pg-pop-addr { color: var(--pg-ink-soft); font-size: 12px; }
.pg-shops { margin-top: 16px; display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
.pg-shop-row { background: var(--pg-paper-2); border: 1px solid var(--pg-rule-soft); border-radius: 10px; padding: 10px 12px; font-size: 13px; }
.pg-shop-row .nm { font-family: var(--pg-font-serif); font-size: 15px; }
.pg-shop-row .ad { color: var(--pg-ink-faint); font-size: 12px; margin: 2px 0; }
.pg-shop-row .dist { font-family: var(--pg-font-mono); font-size: 11px; color: var(--pg-red-ink); }
.pg-shop-row .note { color: var(--pg-red-ink); font-size: 12px; margin-top: 4px; }
.pg-shop-row a { font-size: 12.5px; margin-right: 10px; }
.pg-online h3 { font-size: 15px; margin: 18px 0 8px; }
`;

const PIN_SVG =
  '<svg class="neg-marker" viewBox="0 0 24 32" width="24" height="32" xmlns="http://www.w3.org/2000/svg" overflow="visible">' +
  '<path d="M 12 2 C 7 2 2 7 2 12 C 2 17 7 22 12 30 C 17 22 22 17 22 12 C 22 7 17 2 12 2 Z"/></svg>';

function esc(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
}

function ShopMap({ negozi, center }: { negozi: Shop[]; center?: { lat: number; lng: number } | null }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const pts = negozi.filter((s) => typeof s.lat === 'number' && typeof s.lng === 'number');
    if (!el || !pts.length) return;

    const map = L.map(el, { scrollWheelZoom: false, attributionControl: true });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
      maxZoom: 19,
    }).addTo(map);

    const icon = L.divIcon({ html: PIN_SVG, className: '', iconSize: [24, 32], iconAnchor: [12, 31], popupAnchor: [0, -30] });
    const bounds: [number, number][] = [];
    for (const s of pts) {
      const m = L.marker([s.lat as number, s.lng as number], { icon }).addTo(map);
      const addr = [s.address, s.city].filter(Boolean).join(', ');
      const maps = `https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`;
      m.bindPopup(
        `<div class="pg-pop"><b>${esc(s.name)}</b>` +
          (addr ? `<div class="pg-pop-addr">${esc(addr)}</div>` : '') +
          `<div style="margin-top:4px">` +
          (s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">Sito</a> · ` : '') +
          `<a href="${maps}" target="_blank" rel="noopener">Mappa</a></div></div>`,
      );
      bounds.push([s.lat as number, s.lng as number]);
    }
    if (center) bounds.push([center.lat, center.lng]);
    if (bounds.length === 1) map.setView(bounds[0], 13);
    else map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });

    return () => map.remove();
  }, [negozi, center]);

  return <div class="pg-map" ref={ref} />;
}

function ShopRow({ s }: { s: Shop }) {
  const addr = [s.address, s.city, s.region && `(${s.region})`].filter(Boolean).join(' ');
  const maps = s.lat && s.lng ? `https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}` : null;
  return (
    <div class="pg-shop-row">
      <div class="nm">{s.name}</div>
      {addr ? <div class="ad">📍 {addr}</div> : null}
      {s.distance_km != null ? <div class="dist">~{s.distance_km} km</div> : null}
      {s.note ? <div class="note">🏷️ {s.note}</div> : null}
      <div style="margin-top:6px">
        {s.url ? (
          <a href={s.url} target="_blank" rel="noopener noreferrer">
            Sito
          </a>
        ) : null}
        {maps ? (
          <a href={maps} target="_blank" rel="noopener noreferrer">
            Mappa
          </a>
        ) : null}
      </div>
    </div>
  );
}

function App() {
  const data = useToolOutput<ShopsOutput>();
  const negozi = data?.negozi ?? [];
  const online = data?.negozi_online ?? [];

  if (!negozi.length && !online.length) {
    return <p class="pg-empty">Nessun negozio trovato su paginegiappe.it.</p>;
  }

  const hasCoords = negozi.some((s) => typeof s.lat === 'number' && typeof s.lng === 'number');

  return (
    <div>
      <p class="pg-eyebrow">paginegiappe.it · {data?.total ?? negozi.length + online.length} negozi</p>

      {hasCoords ? <ShopMap negozi={negozi} center={data?.search_center} /> : null}

      {negozi.length ? (
        <div class="pg-shops">
          {negozi.map((s) => (
            <ShopRow s={s} />
          ))}
        </div>
      ) : null}

      {online.length ? (
        <div class="pg-online">
          <h3>Negozi online</h3>
          <div class="pg-shops">
            {online.map((s) => (
              <ShopRow s={{ name: s.name, note: s.note, url: s.url, region: s.category }} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

mount(<App />, leafletCss + SHOPS_CSS);
