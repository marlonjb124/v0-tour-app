"use client"

import { Search, Star, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { TourService, Tour } from "@/services/tour-service"
import { toast } from "react-hot-toast"

export default function HomePage() {
  const [selectedCity, setSelectedCity] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState<string>("") 
  const [searchInput, setSearchInput] = useState<string>("")  // For controlled input

  // Fetch cities
  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: TourService.getCities,
    staleTime: 30 * 60 * 1000, // 30 minutes
  })

  // Fetch tours based on filters
  const { data: toursData, isLoading, error } = useQuery({
    queryKey: ['tours', selectedCity, searchTerm],
    queryFn: () => TourService.getTours({
      city: selectedCity || undefined,
      search: searchTerm || undefined,
      is_active: true,
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch featured tours
  const { data: featuredTours = [] } = useQuery({
    queryKey: ['featured-tours'],
    queryFn: () => TourService.getFeaturedTours(6),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

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

  if (error) {
    toast.error('Error al cargar los tours')
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/machu-picchu-sunrise-andes-mountains-peru.png')`,
          }}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 font-sans">Descubre la magia del Perú</h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Sitios arqueológicos, paisajes andinos y experiencias únicas. ¿Cuál será tu próxima aventura?
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="flex items-center bg-white rounded-full shadow-lg overflow-hidden">
              <Search className="ml-4 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar destinos y experiencias"
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

          {/* Trust Indicator */}
          <div className="mt-8 flex items-center justify-center gap-2 text-sm opacity-80">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span>Más de 50.000.000 de viajeros han reservado con Peru Travel</span>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4 p-6 bg-card rounded-lg">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <div className="w-6 h-6 bg-secondary rounded-full" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Flexibilidad en todo momento</h3>
                <p className="text-muted-foreground">Opciones flexibles de cancelación en todos los establecimientos</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-card rounded-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <div className="w-6 h-6 bg-primary rounded-full" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Reserva con confianza</h3>
                <p className="text-muted-foreground">Reserva desde tu móvil con facilidad y sáltate la cola</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-card rounded-lg">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                <div className="w-6 h-6 bg-accent rounded-full" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Descubre la cultura a tu manera</h3>
                <p className="text-muted-foreground">
                  Las mejores experiencias en sitios arqueológicos y atracciones de todo el Perú
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tours Section */}
      <section id="tours" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Los mejores lugares para visitar en Perú</h2>

          {/* City Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button
              variant={selectedCity === "" ? "default" : "outline"}
              className={`rounded-full px-6 py-2 ${
                selectedCity === "" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted border-border"
              }`}
              onClick={() => setSelectedCity("")}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-muted-foreground/20" />
                Todos
              </div>
            </Button>
            {cities.map((city) => (
              <Button
                key={city}
                variant={selectedCity === city ? "default" : "outline"}
                className={`rounded-full px-6 py-2 ${
                  selectedCity === city ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted border-border"
                }`}
                onClick={() => setSelectedCity(city)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted-foreground/20" />
                  {city}
                </div>
              </Button>
            ))}
          </div>

          {/* Tours Grid */}
          <div className="relative">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Cargando tours...</span>
              </div>
            ) : tours.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchTerm || selectedCity 
                    ? 'No se encontraron tours para los filtros seleccionados.'
                    : 'No hay tours disponibles en este momento.'}
                </p>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tours.map((tour) => (
                    <Link key={tour.id} href={`/tours/${tour.id}`}>
                      <Card className="group cursor-pointer hover:shadow-lg transition-shadow duration-200">
                        <div className="relative overflow-hidden rounded-t-lg">
                          <img
                            src={tour.images?.[0] || "/placeholder.svg"}
                            alt={tour.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          {tour.discount_percentage && (
                            <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-500 text-white">
                              -{tour.discount_percentage}%
                            </Badge>
                          )}
                        </div>

                        <CardContent className="p-4">
                          <div className="mb-2">
                            <Badge variant="secondary" className="text-xs font-medium mb-2">
                              {tour.city?.toUpperCase()}
                            </Badge>
                          </div>

                          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                            {tour.title}
                          </h3>

                          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{tour.description}</p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium text-sm">{tour.rating}</span>
                              <span className="text-muted-foreground text-sm">({tour.review_count?.toLocaleString()})</span>
                            </div>

                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">Desde</div>
                              <div className="flex items-center gap-2">
                                {tour.original_price && tour.original_price > tour.price && (
                                  <span className="text-xs text-muted-foreground line-through">
                                    ${tour.original_price.toFixed(2)}
                                  </span>
                                )}
                                <span className="font-bold text-lg">${tour.price.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Show total count */}
                {totalTours > 0 && (
                  <div className="text-center mt-8 text-sm text-muted-foreground">
                    Mostrando {tours.length} de {totalTours} tours
                  </div>
                )}
              </>
            )}

            {/* Navigation Arrows */}
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 rounded-full bg-background shadow-lg hover:bg-muted"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 rounded-full bg-background shadow-lg hover:bg-muted"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Tours Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Tours Destacados</h2>
          <p className="text-center text-muted-foreground mb-12">Los tours más populares y mejor valorados</p>

          {/* Featured Tours Grid */}
          <div className="relative">
            {featuredTours.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No hay tours destacados disponibles en este momento.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredTours.map((tour) => (
                  <Link key={`featured-${tour.id}`} href={`/tours/${tour.id}`}>
                    <Card className="group cursor-pointer hover:shadow-lg transition-shadow duration-200">
                      <div className="relative overflow-hidden rounded-t-lg">
                        <img
                          src={tour.images?.[0] || "/placeholder.svg"}
                          alt={tour.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <Badge className="absolute top-3 left-3 bg-blue-500 hover:bg-blue-500 text-white">
                          ⭐ Destacado
                        </Badge>
                        {tour.discount_percentage && (
                          <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-500 text-white">
                            -{tour.discount_percentage}%
                          </Badge>
                        )}
                      </div>

                      <CardContent className="p-4">
                        <div className="mb-2">
                          <Badge variant="secondary" className="text-xs font-medium mb-2">
                            {tour.city?.toUpperCase()}
                          </Badge>
                        </div>

                        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                          {tour.title}
                        </h3>

                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{tour.description}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium text-sm">{tour.rating}</span>
                            <span className="text-muted-foreground text-sm">({tour.review_count?.toLocaleString()})</span>
                          </div>

                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">Desde</div>
                            <div className="flex items-center gap-2">
                              {tour.original_price && tour.original_price > tour.price && (
                                <span className="text-xs text-muted-foreground line-through">
                                  ${tour.original_price.toFixed(2)}
                                </span>
                              )}
                              <span className="font-bold text-lg">${tour.price.toFixed(2)}</span>
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
        </div>
      </section>
    </div>
  )
}
