"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { TourService, Tour } from '@/services/tour-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Star, MapPin, Calendar, Clock, List, Map as MapIcon } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query'
import 'leaflet/dist/leaflet.css';
import { useForceAllFetch } from '@/lib/hooks/use-force-all-fetch'

export default function MapaInteractivoPage() {
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [client, setClient] = useState(false);
  const [showMobileList, setShowMobileList] = useState(false);

  // Forzar TODOS los fetch cada vez que se navega a esta página
  useForceAllFetch()

  // Dynamically import the Map component to avoid SSR issues with Leaflet
  const Map = dynamic(() => import('@/components/map'), { ssr: false });

  useEffect(() => {
    setClient(true);
  }, []);

  // Effect to handle tour selection on mobile
  useEffect(() => {
    if (selectedTour && window.innerWidth < 768) {
      setShowMobileList(true);
    }
  }, [selectedTour]);

  // Fetch tours with coordinates using React Query
  const {
    data: tours = [],
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['tours-with-coordinates', selectedType, selectedCity],
    queryFn: () => {
      const filters: any = {};
      
      if (selectedType !== 'all') {
        filters.tour_type = selectedType;
      }
      
      if (selectedCity !== 'all') {
        filters.city = selectedCity;
      }
      
      return TourService.getToursWithCoordinates(filters);
    },
    refetchOnWindowFocus: true,
  });

  // Extract unique cities from tours for filter
  const cities = [...new Set(tours.map(tour => tour.city))].sort();

  return (
    <main className="min-h-screen">
      {/* Hero Section - Hidden on mobile */}
      <section className="relative h-[250px] flex items-center justify-center overflow-hidden hidden md:flex">
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

      {/* Mobile Header - Only visible on mobile */}
      <section className="md:hidden bg-primary text-primary-foreground py-3 px-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Mapa Interactivo</h1>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowMobileList(!showMobileList)}
            className="flex items-center gap-2"
          >
            {showMobileList ? (
              <>
                <MapIcon className="h-4 w-4" />
                Mapa
              </>
            ) : (
              <>
                <List className="h-4 w-4" />
                Lista
              </>
            )}
          </Button>
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
      <div className="flex flex-col md:flex-row h-[calc(100vh-180px)] md:h-[600px]">
        {/* Map Container - Hidden on mobile when showing list */}
        <div className={`flex-1 ${showMobileList ? 'hidden md:block' : 'block'} h-[60vh] md:h-full`}>
          <div className="relative w-full h-full">
            {client ? (
              <Map tours={tours} onMarkerClick={setSelectedTour} selectedTour={selectedTour} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p>Cargando mapa...</p>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-100 text-red-700 z-10">
                <p>Error al cargar los tours. Intente nuevamente.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar - Full width on mobile when showing list */}
        <div className={`
          ${showMobileList ? 'w-full h-[calc(100vh-180px)]' : 'hidden md:block'} 
          md:w-[350px] md:h-full border-l bg-card overflow-y-auto
        `}>
          {selectedTour ? (
            <div className="p-4">
              <div className="sticky top-0 z-30 bg-card pt-2 pb-2 md:static md:z-auto">
                <div className="flex items-center gap-2 mb-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedTour(null)}
                  >
                    ← Volver a la lista
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="md:hidden"
                    onClick={() => setShowMobileList(false)}
                  >
                    <MapIcon className="h-4 w-4 mr-1" />
                    Ver mapa
                  </Button>
                </div>
              </div>
              
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