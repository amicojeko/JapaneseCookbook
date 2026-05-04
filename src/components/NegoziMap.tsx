import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { NEGOZI } from '@site/src/data/negozi';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

const NegoziMap: React.FC = () => {
  return (
    <BrowserOnly fallback={<div>Carico la mappa dei negozi...</div>}>
      {() => {
        const { MapContainer, TileLayer, useMap } = require('react-leaflet');
        const L = require('leaflet');
        require('leaflet.markercluster');

        // Componente che aggiunge marker al cluster
        const ClusteredMarkers = () => {
          const map = useMap();
          const markerClusterGroup = React.useRef(null);

          React.useEffect(() => {
            if (!markerClusterGroup.current) {
              // Opzioni di configurazione del cluster
              markerClusterGroup.current = L.markerClusterGroup({
                maxClusterRadius: 50, // Distanza in pixel per il raggruppamento (default: 80)
                disableClusteringAtZoom: 14, // Zoom a cui disattivare il clustering (default: null)
                showCoverageOnHover: false, // Mostra area cluster al passaggio del mouse
                zoomToBoundsOnClick: true, // Zoom al cluster quando cliccato
              });
              map.addLayer(markerClusterGroup.current);
            }

            // Pulisci i marker precedenti
            markerClusterGroup.current.clearLayers();

            const escapeHtml = (s: string) =>
              String(s).replace(/[&<>"']/g, (c) =>
                ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string)
              );

            // Aggiungi tutti i marker al cluster — Bentō × Izakaya pin (店)
            NEGOZI.forEach((shop) => {
              const isOnline = !!shop.url;
              const cls = ['neg-marker'];
              if (isOnline) cls.push('is-online');
              // Tapered teardrop pin (no character) — colour comes from CSS
              const pinSvg =
                `<svg class="${cls.join(' ')}" viewBox="0 0 24 32" width="24" height="32" xmlns="http://www.w3.org/2000/svg" overflow="visible">` +
                `<path d="M 12 2 C 7 2 2 7 2 12 C 2 17 7 22 12 30 C 17 22 22 17 22 12 C 22 7 17 2 12 2 Z"/>` +
                `</svg>`;
              const shopIcon = L.divIcon({
                html: pinSvg,
                className: '',
                iconSize: [24, 32],
                iconAnchor: [12, 31],
                popupAnchor: [0, -30],
              });

              const marker = L.marker([shop.lat, shop.lng], { icon: shopIcon });

              const cat = `${shop.url ? 'E-commerce · ' : ''}Alimentari · Asia`;
              const popupContent = `
                <div class="pop-card">
                  <div class="pop-cat">${cat}</div>
                  <p class="pop-name">${escapeHtml(shop.name)}</p>
                  <p class="pop-addr">${escapeHtml(shop.address)}${
                    shop.city ? `<br/><strong>${escapeHtml(shop.city)}</strong>` : ''
                  }${shop.region ? ` · ${escapeHtml(shop.region)}` : ''}</p>
                  ${shop.note ? `<div class="pop-note">«${escapeHtml(shop.note)}»</div>` : ''}
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
              markerClusterGroup.current.addLayer(marker);
            });

            return () => {
              if (markerClusterGroup.current) {
                map.removeLayer(markerClusterGroup.current);
              }
            };
          }, [map]);

          return null;
        };

        const center: [number, number] = [42.0, 12.5];

        return (
          <MapContainer
            center={center}
            zoom={5.5}
            style={{ height: '700px', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />

            <ClusteredMarkers />
          </MapContainer>
        );
      }}
    </BrowserOnly>
  );
};

export default NegoziMap;
