"use client"

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Tour } from '@/services/tour-service'
import { LatLngExpression, Icon, divIcon } from 'leaflet'
import { useEffect } from 'react';

// Fix for default icon issue with Webpack
import 'leaflet/dist/leaflet.css';

interface MapProps {
  tours: Tour[];
  onMarkerClick: (tour: Tour) => void;
}

const createCustomIcon = (tour: Tour) => {
  const iconHtml = `<div style="background-color: ${tour.tour_type === 'ticket' ? 'blue' : 'red'}; width: 30px; height: 30px; border-radius: 50%; text-align: center; line-height: 30px; color: white; font-size: 18px; cursor: pointer;">${tour.tour_type === 'ticket' ? '🎟️' : '🏞️'}</div>`;
  return divIcon({
    html: iconHtml,
    className: 'custom-leaflet-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const BoundsUpdater = ({ tours }: { tours: Tour[] }) => {
  const map = useMap();
  useEffect(() => {
    if (tours.length > 0) {
      const bounds = tours
        .map(tour => tour.coordinates ? [tour.coordinates.lat, tour.coordinates.lon] : null)
        .filter(coord => coord !== null) as LatLngExpression[];
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [tours, map]);
  return null;
};

const Map = ({ tours, onMarkerClick }: MapProps) => {
  const position: LatLngExpression = [-9.189, -75.015] // Default center for Peru

  return (
    <MapContainer center={position} zoom={5} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {tours.map(tour =>
        tour.coordinates && (
          <Marker
            key={tour.id}
            position={[tour.coordinates.lat, tour.coordinates.lon]}
            icon={createCustomIcon(tour)}
            eventHandlers={{
              click: () => {
                onMarkerClick(tour);
              },
            }}
          />
        )
      )}
      <BoundsUpdater tours={tours} />
    </MapContainer>
  )
}

export default Map;
