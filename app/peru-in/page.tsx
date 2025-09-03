"use client"

import { useState, useEffect } from "react"
import { TourService } from "@/services/tour-service"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Star, Filter, ChevronDown } from "lucide-react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"

export default function PeruInPage() {
  const [selectedCity, setSelectedCity] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [searchInput, setSearchInput] = useState<string>("")
  const [showFilters, setShowFilters] = useState(false)

  // Fetch domestic tours
  const {
    data: toursData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['peru-in-tours', selectedCity, searchTerm],
    queryFn: () => TourService.getToursByLocationType(
      'domestic',
      {
        city: selectedCity || undefined,
        search: searchTerm || undefined,
      },
      1, // page
      24 // size - showing more items on this dedicated page
    ),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  })

  // Fetch cities for domestic tours
  const { data: cities = [] } = useQuery({
    queryKey: ['domestic-cities'],
    queryFn: async () => {
      const toursData = await TourService.getToursByLocationType('domestic', {}, 1, 1000);
      const uniqueCities = [...new Set(toursData.items.map(tour => tour.city))];
      return uniqueCities.sort();
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  const tours = toursData?.items || []
  const totalTours = toursData?.total || 0

  const handleSearch = () => {
    setSearchTerm(searchInput.trim())
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
        {/* Background Image - Peruvian landscape */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/machu-picchu-sunrise-andes-mountains-peru.png')`,
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-sans">Tours en Perú</h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Explora los destinos más fascinantes del Perú con nuestros tours domésticos
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="flex items-center bg-white rounded-full shadow-lg overflow-hidden">
              <Search className="ml-4 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar tours en Perú"
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
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Tours en Perú</h2>
              <p className="text-muted-foreground">
                {totalTours} experiencias para descubrir
              </p>
            </div>

            {/* Filter Button (Mobile) */}
            <Button 
              variant="outline" 
              className="md:hidden flex items-center gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              Filtros
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>

            {/* Desktop Filters */}
            <div className="hidden md:flex flex-wrap gap-2">
              <Button
                variant={selectedCity === "" ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setSelectedCity("")}
              >
                Todas las ciudades
              </Button>
              {cities.map((city) => (
                <Button
                  key={city}
                  variant={selectedCity === city ? "default" : "outline"}
                  className="rounded-full"
                  onClick={() => setSelectedCity(city)}
                >
                  {city}
                </Button>
              ))}
            </div>
          </div>

          {/* Mobile Filters (Collapsible) */}
          {showFilters && (
            <div className="md:hidden mb-8 p-4 bg-muted/30 rounded-lg">
              <p className="font-medium mb-2">Ciudades</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={selectedCity === "" ? "default" : "outline"}
                  className="rounded-full"
                  onClick={() => setSelectedCity("")}
                >
                  Todas
                </Button>
                {cities.map((city) => (
                  <Button
                    key={city}
                    size="sm"
                    variant={selectedCity === city ? "default" : "outline"}
                    className="rounded-full"
                    onClick={() => setSelectedCity(city)}
                  >
                    {city}
                  </Button>
                ))}
              </div>
            </div>
          )}

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
                {selectedCity || searchTerm 
                  ? "No hay tours disponibles con los filtros seleccionados."
                  : "No hay tours domésticos disponibles en este momento."
                }
              </p>
              {(selectedCity || searchTerm) && (
                <Button onClick={() => {
                  setSelectedCity("")
                  setSearchTerm("")
                  setSearchInput("")
                }}>
                  Ver todos los tours
                </Button>
              )}
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
                      {tour.discount_percentage && (
                        <Badge className="absolute top-2 left-2 bg-red-500 text-white">
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

          {/* Pagination can be added here if needed */}
        </div>
      </section>
    </div>
  )
}