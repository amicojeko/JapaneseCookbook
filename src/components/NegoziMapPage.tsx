import React, { useState, useEffect, useRef, useCallback } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { NEGOZI } from '@site/src/data/negozi';

/* ---- Haversine (km) ---- */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type Negozio = (typeof NEGOZI)[number];
type Result = Negozio & { distance: number };

const NegoziMapPage: React.FC = () => {
  return (
    <BrowserOnly fallback={<div>Carico la mappa dei negozi...</div>}>
      {() => {
        const { MapContainer, TileLayer, useMap } = require('react-leaflet');
        const L = require('leaflet');
        require('leaflet.markercluster');

        /* ---- FlyTo controller ---- */
        const FlyToController: React.FC<{
          lat: number | null;
          lng: number | null;
          zoom: number;
        }> = ({ lat, lng, zoom }) => {
          const map = useMap();
          useEffect(() => {
            if (lat != null && lng != null) {
              map.flyTo([lat, lng], zoom, { duration: 1.5 });
            }
          }, [lat, lng]);
          return null;
        };

        /* ---- Marker cluster ---- */
        const ClusteredMarkers: React.FC<{
          markerRefs: React.MutableRefObject<Map<string, any>>;
          popupId: string | null;
        }> = ({ markerRefs, popupId }) => {
          const map = useMap();
          const clusterRef = useRef<any>(null);
          const addedRef = useRef(false);

          useEffect(() => {
            if (addedRef.current) return;
            addedRef.current = true;

            clusterRef.current = L.markerClusterGroup({
              maxClusterRadius: 50,
              disableClusteringAtZoom: 14,
              showCoverageOnHover: false,
              zoomToBoundsOnClick: true,
            });
            map.addLayer(clusterRef.current);

            const escapeHtml = (s: string) =>
              String(s).replace(
                /[&<>"']/g,
                (c) =>
                  (
                    {
                      '&': '&amp;',
                      '<': '&lt;',
                      '>': '&gt;',
                      '"': '&quot;',
                      "'": '&#39;',
                    } as Record<string, string>
                  )[c],
              );

            const pinSvg =
              '<svg class="neg-marker" viewBox="0 0 24 32" width="24" height="32" xmlns="http://www.w3.org/2000/svg" overflow="visible">' +
              '<path d="M 12 2 C 7 2 2 7 2 12 C 2 17 7 22 12 30 C 17 22 22 17 22 12 C 22 7 17 2 12 2 Z"/>' +
              '</svg>';
            const shopIcon = L.divIcon({
              html: pinSvg,
              className: '',
              iconSize: [24, 32],
              iconAnchor: [12, 31],
              popupAnchor: [0, -30],
            });

            const refs = markerRefs.current;
            refs.clear();

            NEGOZI.forEach((shop: Negozio) => {
              const marker = L.marker([shop.lat, shop.lng], { icon: shopIcon });

              const popupContent = `
                <div class="pop-card">
                  <p class="pop-name">${escapeHtml(shop.name)}</p>
                  <p class="pop-addr">${escapeHtml(shop.address)}${
                    shop.city
                      ? `<br/><strong>${escapeHtml(shop.city)}</strong>`
                      : ''
                  }${shop.region ? ` · ${escapeHtml(shop.region)}` : ''}</p>
                  ${
                    shop.note
                      ? `<div class="pop-note">«${escapeHtml(shop.note)}»</div>`
                      : ''
                  }
                  <div class="pop-actions">
                    ${
                      shop.map_url
                        ? `<a href="${shop.map_url}" target="_blank" rel="noopener noreferrer">🗺 Apri in Maps</a>`
                        : ''
                    }
                    ${
                      shop.url
                        ? `<a class="gh" href="${shop.url}" target="_blank" rel="noopener noreferrer">🌐 Sito web</a>`
                        : ''
                    }
                  </div>
                </div>
              `;

              marker.bindPopup(popupContent);
              refs.set(shop.id, marker);
              clusterRef.current.addLayer(marker);
            });

            return () => {
              if (clusterRef.current) {
                map.removeLayer(clusterRef.current);
              }
            };
          }, [map]);

          /* Open popup when popupId changes */
          useEffect(() => {
            if (popupId) {
              const m = markerRefs.current.get(popupId);
              if (m) {
                m.openPopup();
              }
            }
          }, [popupId]);

          return null;
        };

        /* ---- Page body ---- */
        const PageBody: React.FC = () => {
          const [address, setAddress] = useState('');
          const [results, setResults] = useState<Result[]>([]);
          const [searching, setSearching] = useState(false);
          const [error, setError] = useState('');
          const [locatedName, setLocatedName] = useState('');
          const [flyLat, setFlyLat] = useState<number | null>(null);
          const [flyLng, setFlyLng] = useState<number | null>(null);
          const [flyZoom, setFlyZoom] = useState(12);
          const [flyKey, setFlyKey] = useState(0);
          const [popupId, setPopupId] = useState<string | null>(null);
          const markerRefs = useRef<Map<string, any>>(new Map());

          const flyTo = useCallback(
            (lat: number, lng: number, zoom: number) => {
              setFlyLat(lat);
              setFlyLng(lng);
              setFlyZoom(zoom);
              setFlyKey((k) => k + 1);
            },
            [],
          );

          const findNearest = useCallback(
            (lat: number, lng: number, label: string) => {
              const withDist: Result[] = NEGOZI.map((s) => ({
                ...s,
                distance: haversineDistance(lat, lng, s.lat, s.lng),
              }));
              withDist.sort((a, b) => a.distance - b.distance);
              setResults(withDist.slice(0, 10));
              setLocatedName(label);
              setError('');
              flyTo(lat, lng, 12);
              setPopupId(null);
            },
            [flyTo],
          );

          const handleGeolocate = () => {
            if (!navigator.geolocation) {
              setError('Il tuo browser non supporta la geolocalizzazione.');
              return;
            }
            setSearching(true);
            setError('');
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                setSearching(false);
                findNearest(
                  pos.coords.latitude,
                  pos.coords.longitude,
                  'La tua posizione',
                );
              },
              () => {
                setSearching(false);
                setError(
                  'Impossibile ottenere la posizione. Controlla i permessi.',
                );
              },
              { enableHighAccuracy: true, timeout: 10000 },
            );
          };

          const handleAddressSearch = async () => {
            if (!address.trim()) return;
            setSearching(true);
            setError('');
            try {
              const resp = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=it`,
                { headers: { 'User-Agent': 'PagineGiappe.it/1.0' } },
              );
              const data = await resp.json();
              if (data && data.length > 0) {
                const { lat, lon, display_name } = data[0];
                findNearest(
                  parseFloat(lat),
                  parseFloat(lon),
                  display_name,
                );
              } else {
                setError(
                  'Indirizzo non trovato. Prova con una città o un indirizzo più preciso.',
                );
              }
            } catch {
              setError('Errore durante la ricerca. Riprova.');
            }
            setSearching(false);
          };

          return (
            <>
              <section className="negozi-search">
                <div className="search-form">
                  <button
                    className="geo-btn"
                    onClick={handleGeolocate}
                    disabled={searching}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="2" />
                      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                    </svg>
                    Vicino a me
                  </button>
                  <span className="search-divider">oppure</span>
                  <div className="address-row">
                    <input
                      type="text"
                      placeholder="Inserisci un indirizzo o una città…"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === 'Enter' && handleAddressSearch()
                      }
                    />
                    <button
                      className="search-btn"
                      onClick={handleAddressSearch}
                      disabled={searching}
                    >
                      {searching ? '…' : 'Cerca'}
                    </button>
                  </div>
                </div>
                {error && <p className="search-error">{error}</p>}
                {results.length > 0 && (
                  <div className="search-results">
                    <p className="results-heading">
                      I 10 negozi più vicini a{' '}
                      <strong>{locatedName}</strong>
                    </p>
                    <ol>
                      {results.map((s, i) => (
                        <li
                          key={s.id}
                          className="result-item"
                          onClick={() => {
                            flyTo(s.lat, s.lng, 16);
                            setPopupId(s.id);
                          }}
                        >
                          <span className="result-num">{i + 1}</span>
                          <div className="result-info">
                            <strong>{s.name}</strong>
                            <span className="result-meta">
                              {s.city} ({s.region}) — {s.distance.toFixed(1)}{' '}
                              km
                            </span>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </section>

              <MapContainer
                center={[42.0, 12.5]}
                zoom={5.5}
                style={{ height: '700px', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />
                <ClusteredMarkers
                  markerRefs={markerRefs}
                  popupId={popupId}
                />
                <FlyToController
                  key={flyKey}
                  lat={flyLat}
                  lng={flyLng}
                  zoom={flyZoom}
                />
              </MapContainer>
            </>
          );
        };

        return <PageBody />;
      }}
    </BrowserOnly>
  );
};

export default NegoziMapPage;
