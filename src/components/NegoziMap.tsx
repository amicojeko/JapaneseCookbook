import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';
import { NEGOZI } from '@site/src/data/negozi';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

const NegoziMap: React.FC = () => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

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

            // Crea i marker e aggiungili al cluster
            const shopIcon = L.divIcon({
              html: '🏪',
              className: 'negozio-marker',
              iconSize: [30, 30],
              iconAnchor: [15, 30],
              popupAnchor: [0, -30],
            });

            // Pulisci i marker precedenti
            markerClusterGroup.current.clearLayers();

            // Aggiungi tutti i marker al cluster
            NEGOZI.forEach((shop) => {
              const marker = L.marker([shop.lat, shop.lng], { icon: shopIcon });

              // Crea il popup
              const popupContent = `
                <div>
                  <strong>${shop.name}</strong><br />
                  ${shop.address}${shop.city ? `, ${shop.city}` : ''}<br />
                  ${shop.region}<br />
                  ${shop.url ? `<a href="${shop.url}" target="_blank" rel="noopener noreferrer">Sito web</a><br />` : ''}
                  ${shop.note ? `<em>${shop.note}</em><br />` : ''}
                  ${shop.map_url ? `<a href="${shop.map_url}" target="_blank" rel="noopener noreferrer">Vedi su Google Maps</a>` : ''}
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
            {isDark ? (
              <>
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
                  className="map-base-dark"
                />
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
                  className="map-labels-dark"
                />
              </>
            ) : (
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
            )}

            <ClusteredMarkers />
          </MapContainer>
        );
      }}
    </BrowserOnly>
  );
};

export default NegoziMap;
