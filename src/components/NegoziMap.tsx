import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { NEGOZI } from '@site/src/data/negozi';

const NegoziMap: React.FC = () => {
  return (
    <BrowserOnly fallback={<div>Carico la mappa dei negozi...</div>}>
      {() => {
        const { MapContainer, TileLayer, Marker, Popup } = require('react-leaflet');
        const L = require('leaflet');

        // icona emoji 🏪
        const shopIcon = L.divIcon({
          html: '🏪',
          className: 'negozio-marker', // la styliamo noi sotto
          iconSize: [300, 300],
          iconAnchor: [15, 30],
          popupAnchor: [0, -30],
        });

        const center: [number, number] = [42.0, 12.5];

        return (
          <MapContainer
            center={center}
            zoom={5.5}
            style={{ height: '700px', width: '100%', borderRadius: '8px' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />

            {NEGOZI.map((shop) => (
              <Marker
                key={shop.id}
                position={[shop.lat, shop.lng]}
                icon={shopIcon}
              >
                <Popup>
                  <div>
                    <strong>{shop.name}</strong>
                    <br />
                    {shop.address}
                    {shop.city ? `, ${shop.city}` : ''}
                    <br />
                    {shop.region}
                    <br />
                    {shop.url && (
                      <a
                        href={shop.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Sito web
                      </a>
                    )}
                    {shop.note && (
                      <>
                        <br />
                        <em>{shop.note}</em>
                      </>
                    )}
                    {shop.map_url && (
                      <>
                        <br />
                        <a href={shop.map_url} target="_blank" rel="noopener noreferrer">
                          Vedi su Google Maps
                        </a>
                      </>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        );
      }}
    </BrowserOnly>
  );
};

export default NegoziMap;
