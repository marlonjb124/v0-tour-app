"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { TourService, Tour } from '@/services/tour-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Star, MapPin, Calendar, Clock } from 'lucide-react'
import Link from 'next/link'
import Script from 'next/script'

// Use a temporary default Mapbox token (should be replaced with env variable)
const MAPBOX_TOKEN = 'pk.eyJ1IjoicGxhY2Vob2xkZXIiLCJhIjoiY2xleGljZGJwMDZvbDN5cW92cGQ3ZnRvNCJ9.p9xYjvzCeVhkuKlV0vNtfw';

export default function MapaInteractivoPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [cities, setCities] = useState<string[]>([]);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef<any[]>([]);

  // Load tours with coordinates
  useEffect(() => {
    async function loadToursWithCoordinates() {
      try {
        setLoading(true);
        const filters: any = {};
        
        if (selectedType !== 'all') {
          filters.tour_type = selectedType;
        }
        
        if (selectedCity !== 'all') {
          filters.city = selectedCity;
        }
        
        const toursData = await TourService.getToursWithCoordinates(filters);
        setTours(toursData);
        
        // Extract unique cities from tours for filter
        const uniqueCities = [...new Set(toursData.map(tour => tour.city))];
        setCities(uniqueCities.sort());
      } catch (err) {
        console.error('Error loading tours:', err);
        setError('No se pudieron cargar los tours. Intente nuevamente más tarde.');
      } finally {
        setLoading(false);
      }
    }
    
    loadToursWithCoordinates();
  }, [selectedType, selectedCity]);

  // Initialize map when component mounts
  useEffect(() => {
    if (!window.mapboxgl || !mapContainer.current || map.current) return;
    
    try {
      window.mapboxgl.accessToken = MAPBOX_TOKEN;
      
      map.current = new window.mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-75.015, -9.189], // Center of Peru
        zoom: 5,
      });
      
      map.current.addControl(new window.mapboxgl.NavigationControl());
      
      map.current.on('load', () => {
        setMapInitialized(true);
      });
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('No se pudo inicializar el mapa. Intente nuevamente más tarde.');
    }
  }, []);

  // Update markers when tours or map changes
  useEffect(() => {
    if (!mapInitialized || !map.current || !tours.length) return;
    
    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
    
    // Add new markers
    const bounds = new window.mapboxgl.LngLatBounds();
    
    tours.forEach(tour => {
      if (!tour.coordinates) return;
      
      try {
        const coordinates = typeof tour.coordinates === 'string' 
          ? JSON.parse(tour.coordinates) 
          : tour.coordinates;
        
        if (!coordinates?.lng || !coordinates?.lat) return;
        
        // Create custom marker element
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.width = '30px';
        el.style.height = '30px';
        el.style.borderRadius = '50%';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.backgroundColor = tour.tour_type === 'ticket' ? '#3b82f6' : '#ef4444';
        el.style.color = 'white';
        el.style.fontWeight = 'bold';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        el.style.cursor = 'pointer';
        el.innerHTML = tour.tour_type === 'ticket' ? '🎟️' : '🏞️';
        el.title = tour.title;
        
        // Create marker and popup
        const marker = new window.mapboxgl.Marker(el)
          .setLngLat([coordinates.lng, coordinates.lat])
          .addTo(map.current);
          
        marker.getElement().addEventListener('click', () => {
          setSelectedTour(tour);
        });
        
        markers.current.push(marker);
        bounds.extend([coordinates.lng, coordinates.lat]);
      } catch (err) {
        console.error(`Error creating marker for tour ${tour.id}:`, err);
      }
    });
    
    // Fit map to bounds if there are markers
    if (!bounds.isEmpty()) {
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 10,
        duration: 1000
      });
    }
  }, [tours, mapInitialized]);

  return (
    <main className="min-h-screen">
      {/* Load Mapbox GL JS from CDN */}
      <Script 
        src="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js"
        onLoad={() => console.log('Mapbox script loaded')}
      />
      <link 
        href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css" 
        rel="stylesheet" 
      />
      
      {/* Hero Section */}
      <section className="relative h-[250px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/peru-map-background.jpg')`,
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-bold mb-2">Mapa Interactivo</h1>
          <p className="text-lg opacity-90">
            Explora todos nuestros tours y tickets en un mapa interactivo del Perú
          </p>
        </div>
      </section>
      
      {/* Filter Bar */}
      <section className="bg-card border-b py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="tour">Tours</SelectItem>
                    <SelectItem value="ticket">Tickets</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Ciudad</label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Ciudad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {cities.map(city => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <span className="text-sm text-muted-foreground">
                {tours.length} {tours.length === 1 ? 'lugar' : 'lugares'} encontrados
              </span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Map and Sidebar Layout */}
      <div className="flex flex-col md:flex-row h-[600px]">
        {/* Map Container */}
        <div className="flex-1 h-[300px] md:h-full">
          {error ? (
            <div className="h-full flex items-center justify-center bg-muted">
              <div className="text-center p-4">
                <p className="text-destructive font-medium mb-2">Error</p>
                <p className="text-muted-foreground">{error}</p>
                <Button 
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Reintentar
                </Button>
              </div>
            </div>
          ) : (
            <div 
              ref={mapContainer} 
              className="h-full w-full"
            />
          )}
        </div>
        
        {/* Sidebar */}
        <div className="w-full md:w-[350px] border-l bg-card overflow-y-auto">
          {selectedTour ? (
            <div className="p-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="mb-2"
                onClick={() => setSelectedTour(null)}
              >
                ← Volver a la lista
              </Button>
              
              <Card className="overflow-hidden">
                <div className="relative h-48">
                  <img
                    src={(() => {
                      if (Array.isArray(selectedTour.images) && selectedTour.images.length > 0) {
                        return String(selectedTour.images[0])
                      }
                      return "/placeholder.svg"
                    })()}
                    alt={selectedTour.title}
                    className="w-full h-full object-cover"
                  />
                  
                  <div className="absolute top-2 left-2">
                    <Badge className={`${
                      selectedTour.tour_type === 'ticket' ? 'bg-blue-500' : 'bg-red-500'
                    } text-white`}>
                      {selectedTour.tour_type === 'ticket' ? 'Ticket' : 'Tour'}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{selectedTour.title}</h3>
                  
                  <div className="flex items-center gap-2 mb-2 text-muted-foreground text-sm">
                    <MapPin className="h-4 w-4" /> 
                    <span>{selectedTour.city}, {selectedTour.location}</span>
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-3">
                    {selectedTour.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{selectedTour.rating}</span>
                      <span className="text-muted-foreground text-sm">
                        ({selectedTour.review_count})
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <Clock className="h-4 w-4" /> 
                      <span>{selectedTour.duration}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Precio</p>
                      <div className="flex items-center gap-2">
                        {selectedTour.original_price && selectedTour.original_price > selectedTour.price && (
                          <span className="text-muted-foreground line-through text-sm">
                            ${selectedTour.original_price.toFixed(2)}
                          </span>
                        )}
                        <span className="font-bold text-xl">
                          ${selectedTour.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    <Link href={`/tours/${selectedTour.id}`}>
                      <Button>Ver detalles</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-3">Listado de tours y tickets</h2>
              
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  <span className="ml-2">Cargando...</span>
                </div>
              ) : tours.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No se encontraron tours o tickets con las coordenadas especificadas.
                </div>
              ) : (
                <div className="space-y-4">
                  {tours.map(tour => (
                    <Card key={tour.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedTour(tour)}>
                      <div className="flex">
                        <div className="w-24 h-24 flex-shrink-0">
                          <img
                            src={(() => {
                              if (Array.isArray(tour.images) && tour.images.length > 0) {
                                return String(tour.images[0])
                              }
                              return "/placeholder.svg"
                            })()}
                            alt={tour.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <CardContent className="p-3 flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <Badge className={`mb-1 ${
                                tour.tour_type === 'ticket' ? 'bg-blue-500' : 'bg-red-500'
                              } text-white`}>
                                {tour.tour_type === 'ticket' ? 'Ticket' : 'Tour'}
                              </Badge>
                              <h3 className="font-medium text-sm line-clamp-2">{tour.title}</h3>
                            </div>
                            <div className="text-right">
                              <span className="font-semibold text-sm">${tour.price.toFixed(2)}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> 
                              <span>{tour.city}</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span>{tour.rating}</span>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Legend */}
      <div className="bg-card border-t py-4 px-4">
        <div className="container mx-auto">
          <div className="flex flex-wrap items-center gap-6 justify-center">
            <div className="text-sm font-medium">Leyenda:</div>
            
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                🏞️
              </div>
              <span className="text-sm">Tours</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                🎟️
              </div>
              <span className="text-sm">Tickets</span>
            </div>
            
            <div className="text-xs text-muted-foreground">
              Haz clic en los marcadores para ver más información
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}