"use client"

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import { Tour } from '@/services/tour-service'
import { LatLngExpression, Icon, divIcon } from 'leaflet'
import { useEffect } from 'react';

// Fix for default icon issue with Webpack
import 'leaflet/dist/leaflet.css';

interface MapProps {
  tours: Tour[];
  onMarkerClick: (tour: Tour) => void;
  selectedTour?: Tour | null;
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
        .map(tour => {
          if (!tour.coordinates) return null;
          
          // Handle different coordinate formats
          let lat: number, lon: number;
          if (Array.isArray(tour.coordinates)) {
            [lat, lon] = tour.coordinates;
          } else if (tour.coordinates.lat !== undefined && tour.coordinates.lon !== undefined) {
            lat = tour.coordinates.lat;
            lon = tour.coordinates.lon;
          } else {
            return null;
          }
          
          return [lat, lon] as [number, number];
        })
        .filter(coord => coord !== null) as [number, number][];
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [tours, map]);
  return null;
};

// Function to generate route points for a tour
const generateTourRoute = (tour: Tour): [number, number][] => {
  if (!tour.coordinates) return [];
  
  // Handle different coordinate formats
  let startLat: number, startLon: number;
  if (Array.isArray(tour.coordinates)) {
    [startLat, startLon] = tour.coordinates;
  } else if (tour.coordinates.lat !== undefined && tour.coordinates.lon !== undefined) {
    startLat = tour.coordinates.lat;
    startLon = tour.coordinates.lon;
  } else {
    return [];
  }

  // For demonstration, create a simple route based on tour type and duration
  const points: [number, number][] = [[startLat, startLon]];
  
  // If it's a multi-day tour, simulate multiple stops
  if (tour.duration && tour.duration.includes('día') && parseInt(tour.duration) > 1) {
    const days = parseInt(tour.duration);
    const offsetDistance = 0.05; // ~5km offset for route points
    
    for (let i = 1; i < Math.min(days, 5); i++) {
      const angle = (i * 2 * Math.PI) / days;
      const newLat = startLat + Math.cos(angle) * offsetDistance;
      const newLon = startLon + Math.sin(angle) * offsetDistance;
      points.push([newLat, newLon]);
    }
    
    // Return to start for circular tours
    if (days > 2) {
      points.push([startLat, startLon]);
    }
  }
  
  return points;
};

const Map = ({ tours, onMarkerClick, selectedTour }: MapProps) => {
  const position: LatLngExpression = [-9.189, -75.015] // Default center for Peru

  return (
    <MapContainer center={position} zoom={5} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {/* Render tour routes */}
      {selectedTour && (
        (() => {
          const routePoints = generateTourRoute(selectedTour);
          if (routePoints.length > 1) {
            return (
              <Polyline
                positions={routePoints}
                color="#ff6b35"
                weight={4}
                opacity={0.8}
                dashArray="10, 10"
              />
            );
          }
          return null;
        })()
      )}
      
      {/* Render markers */}
      {tours.map(tour => {
        if (!tour.coordinates) return null;
        
        // Handle different coordinate formats
        let lat: number, lon: number;
        if (Array.isArray(tour.coordinates)) {
          [lat, lon] = tour.coordinates;
        } else if (tour.coordinates.lat !== undefined && tour.coordinates.lon !== undefined) {
          lat = tour.coordinates.lat;
          lon = tour.coordinates.lon;
        } else {
          return null;
        }
        
        return (
          <Marker
            key={tour.id}
            position={[lat, lon]}
            icon={createCustomIcon(tour)}
            eventHandlers={{
              click: () => {
                onMarkerClick(tour);
              },
            }}
          />
        );
      })}
      
      {/* Render route waypoints for selected tour */}
      {selectedTour && (
        (() => {
          const routePoints = generateTourRoute(selectedTour);
          return routePoints.slice(1, -1).map((point, index) => (
            <Marker
              key={`waypoint-${selectedTour.id}-${index}`}
              position={point}
              icon={divIcon({
                html: `<div style="background-color: #ff6b35; width: 20px; height: 20px; border-radius: 50%; text-align: center; line-height: 20px; color: white; font-size: 12px; border: 2px solid white;">${index + 1}</div>`,
                className: 'waypoint-icon',
                iconSize: [20, 20],
                iconAnchor: [10, 10],
              })}
            />
          ));
        })()
      )}
      
      <BoundsUpdater tours={tours} />
    </MapContainer>
  )
}

export default Map;
