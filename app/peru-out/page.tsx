"use client"

import { useState, useEffect } from "react"
import { TourService, type TourFilters as TourFiltersType } from "@/services/tour-service"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Star } from "lucide-react"
import { TourFilters } from "@/components/tours-filters"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"

export default function PeruOutPage() {
  const [filters, setFilters] = useState<TourFiltersType>({
    city: "",
    search: "",
    category: "",
    duration: undefined,
    destination: "",
    starting_point: "",
    min_price: undefined,
    max_price: undefined,
    min_rating: undefined,
    services: [],
  });
  const [searchInput, setSearchInput] = useState<string>("")

  // Fetch international tours
  const {
    data: toursData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['peru-out-tours', filters],
    queryFn: () => TourService.getToursByLocationType('international', filters, 1, 24),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    refetchOnWindowFocus: true,
  })

  // Fetch cities for international tours
  const { data: cities = [] } = useQuery({
    queryKey: ['international-cities'],
    queryFn: async () => {
      const toursData = await TourService.getToursByLocationType('international', {}, 1, 1000);
      const uniqueCities = [...new Set(toursData.items.map(tour => tour.city))];
      return uniqueCities.sort();
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: true,
  });

  const tours = toursData?.items || []
  const totalTours = toursData?.total || 0

  const handleSearch = () => {
    setFilters((prev: TourFiltersType) => ({ ...prev, search: searchInput.trim() }));
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        {/* Background Image - International travel */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/kyle-glenn-international-peru-out-unsplash.jpg')`,
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-sans">Tours Internacionales</h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Viaja desde Perú a los destinos más increíbles del mundo
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="flex items-center bg-white rounded-full shadow-lg overflow-hidden">
              <Search className="ml-4 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar tours por destino, categoría..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 border-0 bg-transparent px-4 py-4 text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
              />
              <Button 
                onClick={handleSearch}
                className="m-2 rounded-full bg-primary hover:bg-primary/90"
              >
                Buscar
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Tours Internacionales</h2>
            <p className="text-muted-foreground">
              {totalTours} experiencias para descubrir
            </p>
          </div>

          <div className="mb-8">
            <TourFilters 
              filters={filters}
              setFilters={setFilters}
              cities={cities}
            />
          </div>

          {/* Tours Grid */}
          {error ? (
                <div className="text-center py-20">
                  <h3 className="text-xl font-medium mb-2 text-red-600">Error al cargar tours</h3>
                  <p className="text-muted-foreground mb-4">
                    Hubo un problema al obtener los tours. Por favor, intenta nuevamente.
                  </p>
                  <Button onClick={() => refetch()} variant="outline">
                    Reintentar
                  </Button>
                </div>
              ) : isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : tours.length === 0 ? (
                <div className="text-center py-20">
                  <h3 className="text-xl font-medium mb-2">No se encontraron tours</h3>
                  <p className="text-muted-foreground mb-4">
                    No hay tours disponibles con los filtros seleccionados.
                  </p>
                  <Button onClick={() => {
                    setFilters({
                      city: "", search: "", category: "", duration: undefined, destination: "",
                      starting_point: "", min_price: undefined, max_price: undefined,
                      min_rating: undefined, services: [],
                    });
                    setSearchInput("");
                  }}>
                    Limpiar filtros
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tours.map((tour) => (
                    <Link key={tour.id} href={`/tours/${tour.id}`}>
                      <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative h-48">
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
                          <Badge className="absolute top-2 left-2 bg-blue-500 text-white">
                            Internacional
                          </Badge>
                          {tour.discount_percentage && (
                            <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                              -{tour.discount_percentage}%
                            </Badge>
                          )}
                          <Badge className="absolute bottom-2 right-2 bg-black/70">
                            {tour.duration}
                          </Badge>
                        </div>
                        
                        <CardContent className="p-4">
                          <div className="mb-2">
                            <Badge variant="secondary" className="text-xs font-medium">
                              {tour.city}
                            </Badge>
                          </div>
                          
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                            {tour.title}
                          </h3>
                          
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                            {tour.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium text-sm">{tour.rating}</span>
                              <span className="text-muted-foreground text-xs">
                                ({tour.review_count})
                              </span>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-xs text-muted-foreground">Desde</div>
                              <div className="font-bold text-lg text-primary">
                                ${tour.price.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}

        </div>
      </section>
    </div>
  )
}