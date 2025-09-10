"use client"

import { Search, Star, ChevronLeft, ChevronRight, Loader2, Clock, Users, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import Link from "next/link"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { TourExcelService } from "@/services/tour-excel-service"
import { TourExcel } from "@/lib/types-excel"
import { toast } from "sonner"
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { useForceAllFetch } from "@/lib/hooks/use-force-all-fetch"
import { TiqetsCard } from "@/components/tiqets-card"

// Componente para el filtro de ciudades horizontal con navegación
const CityFilterGrid = ({ cities, cityImages, selectedCity, onCityChange }: {
  cities: string[],
  cityImages: Record<string, string>,
  selectedCity: string,
  onCityChange: (city: string) => void
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Todas las opciones incluyendo "Todos"
  const allOptions = ["", ...cities]; // "" representa "Todos"

  const checkScrollability = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth);
    }
  }, []);

  useEffect(() => {
    checkScrollability();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      return () => container.removeEventListener('scroll', checkScrollability);
    }
  }, [checkScrollability, cities]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative mb-8">
      {/* Botón de navegación izquierda */}
      {canScrollLeft && (
        <Button
          variant="outline"
          size="sm"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-lg border-gray-200 hover:bg-gray-50"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Contenedor de filtros */}
      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto scrollbar-hide px-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex gap-2 pb-2">
          {/* Botón "Todos" */}
          <Button
            variant="outline"
            className={`
              flex-shrink-0 rounded-full px-4 py-2 shadow-sm border transition-all duration-200
              text-base font-semibold cursor-pointer
              border-primary
              ${selectedCity === "" 
                ? "border-2 text-primary bg-white" 
                : "border border-gray-200 text-gray-700 bg-white"
              }
              hover:border-primary hover:text-primary hover:bg-primary/10
            `}
            style={{ cursor: 'pointer' }}
            onClick={() => onCityChange("")}
          >
            <div className="flex items-center gap-2">
              
              <span className="font-semibold text-base">Todos</span>
            </div>
          </Button>
          {/* Botones de ciudades */}
          {cities.map((city) => (
            <Button
              key={city}
              variant="outline"
              className={`
                flex-shrink-0 rounded-full px-6 py-3 shadow-sm border-2 transition-all duration-300 ease-in-out
                text-lg font-semibold cursor-pointer transform hover:scale-105
                ${selectedCity === city 
                  ? "border-primary text-primary bg-white ring-2 ring-primary/20"
                  : "border-gray-300 text-gray-800 bg-white"
                }
                hover:border-primary hover:text-primary hover:bg-white
              `}
              style={{ cursor: 'pointer' }}
              onClick={() => onCityChange(city)}
            >
              <div className="flex items-center gap-2">

                <span className="font-semibold text-lg">{city}</span>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Botón de navegación derecha */}
      {canScrollRight && (
        <Button
          variant="outline"
          size="sm"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-lg border-gray-200 hover:bg-gray-50"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

// Componente de carrusel estilo Tiqets
const TiqetsStyleCarousel = ({ tours}: { tours: TourExcel[]}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const itemsPerPage = 3;
  const totalPages = Math.ceil(tours.length / itemsPerPage);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const nextSlide = () => {
    if (currentIndex < totalPages - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const getCurrentTours = () => {
    const start = currentIndex * itemsPerPage;
    return tours.slice(start, start + itemsPerPage);
  };

  if (tours.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay tours disponibles en este momento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con navegación */}
      <div className="flex items-center justify-between">
  
        {!isMobile && totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="w-10 h-10 rounded-full p-0 border-gray-300 hover:border-gray-400 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-500 mx-2">
              {currentIndex + 1} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={nextSlide}
              disabled={currentIndex === totalPages - 1}
              className="w-10 h-10 rounded-full p-0 border-gray-300 hover:border-gray-400 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Contenedor de cartas */}
      <div className="relative">
        {isMobile ? (
          // Vista móvil con scroll horizontal snap
          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto scrollbar-hide snap-x snap-mandatory"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              scrollBehavior: 'smooth'
            }}
          >
            <div className="flex gap-4 pb-4 px-4">
              {tours.map((tour, index) => (
                <div 
                  key={tour.id} 
                  className="snap-start flex-shrink-0"
                  style={{ 
                    width: 'calc(100vw - 80px)', // Ancho de pantalla menos márgenes y preview
                    maxWidth: '320px' // Máximo en pantallas grandes
                  }}
                >
                  <TiqetsCard tour={tour} />
                </div>
              ))}
              {/* Espacio extra para mostrar preview de la última tarjeta */}
              <div className="w-4 flex-shrink-0"></div>
            </div>
          </div>
        ) : (
          // Vista desktop con navegación 3x3
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getCurrentTours().map((tour) => (
              <TiqetsCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Componente de carta individual estilo Tiqets (ahora importado)

const FeatureCardsCarousel = () => {
  const [emblaRef] = useEmblaCarousel({
    loop: true,
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 768px)': {
        slidesToScroll: 3
      }
    }
  }, [Autoplay({ delay: 4000 })])

  const featureCards = [
    {
      id: 1,
      title: "Reserva con confianza",
      description: "Reserva desde tu móvil con facilidad y sáltate la cola",
      icon: "🔒"
    },
    {
      id: 2,
      title: "Flexibilidad en todo momento",
      description: "Opciones flexibles de cancelación en todos los establecimientos",
      icon: "📅"
    },
    {
      id: 3,
      title: "Descubre la cultura a tu manera",
      description: "Las mejores experiencias en museos y atracciones de todo el mundo",
      icon: "🎨"
    },
    {
      id: 4,
      title: "Atención 24/7",
      description: "Nuestro equipo está disponible para ayudarte cuando lo necesites",
      icon: "💬"
    },
    {
      id: 5,
      title: "Mejores precios garantizados",
      description: "Encuentra las mejores ofertas y precios exclusivos",
      icon: "💰"
    },
    {
      id: 6,
      title: "Experiencias únicas",
      description: "Accede a experiencias exclusivas que no encontrarás en otro lugar",
      icon: "⭐"
    }
  ]

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex h-48">
        {featureCards.map((card) => (
          <div key={card.id} className="flex-[0_0_100%] md:flex-[0_0_33.33%] px-2">
            <Card className="h-full bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-lg transition-shadow">
              <CardContent className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="text-4xl mb-4">{card.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{card.title}</h3>
                <p className="text-muted-foreground text-sm">{card.description}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}

// City images mapping
const cityImages: Record<string, string> = {
  'Arequipa': '/santa-catalina-monastery-arequipa-colonial-archite.png',
  'Barcelona': '/barcelona-tourist-bus-red-double-decker.png',
  'Cusco': '/machu-picchu-sunrise-andes-mountains-peru.png',
  'Lima': '/lima-historic-center-colonial-architecture-cathedr.png',
  'Madrid': '/museo-del-prado-madrid-art-gallery.png',
  'Paracas': '/ballestas-islands-sea-lions-penguins-peru.png',
  'Puno': '/lake-titicaca-floating-islands-uros-peru-bolivia.png',
  'Valencia': '/valencia-city-arts-sciences-futuristic-architectur.png'
}

export default function HomePage() {
  const [selectedCity, setSelectedCity] = useState<string>("")
  const [selectedFeaturedCity, setSelectedFeaturedCity] = useState<string>("")
  const [selectedOneDayCity, setSelectedOneDayCity] = useState<string>("")
  const [selectedMultiDayCity, setSelectedMultiDayCity] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState<string>("") 
  const [searchInput, setSearchInput] = useState<string>("")

  // Forzar TODOS los fetch cada vez que se navega a esta página
  useForceAllFetch()

  // Fetch cities
  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: TourExcelService.getLocations,
    refetchOnWindowFocus: true,
  })

  // Fetch tours with infinite query for horizontal scrolling
  const {
    data: toursData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['tours-infinite', selectedCity, searchTerm],
    queryFn: ({ pageParam = 1 }) => TourExcelService.getTours({
      location: selectedCity || undefined,
      search: searchTerm || undefined,
    }, pageParam, 6),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.reduce((acc, page) => acc + (page.items?.length || 0), 0)
      return totalLoaded < (lastPage.total || 0) ? allPages.length + 1 : undefined
    },
  })

  // Fetch featured tours
  const { data: featuredToursData = { items: [] } } = useQuery({
    queryKey: ['featured-tours', selectedFeaturedCity],
    queryFn: () => TourExcelService.getTours({ location: selectedFeaturedCity || undefined }, 1, 6),
    refetchOnWindowFocus: true,
  })
  
  const featuredTours = featuredToursData.items || []

  // Fetch one-day tours
  const { data: oneDayToursData = { items: [] } } = useQuery({
    queryKey: ['one-day-tours', selectedOneDayCity],
    queryFn: () => TourExcelService.getTours({ 
      location: selectedOneDayCity || undefined,
      tipo_tour: 'Half day'
    }, 1, 8),
    refetchOnWindowFocus: true,
  })
  
  // Fetch multi-day tours
  const { data: multiDayToursData = { items: [] } } = useQuery({
    queryKey: ['multi-day-tours', selectedMultiDayCity],
    queryFn: () => TourExcelService.getTours({
      location: selectedMultiDayCity || undefined,
      tipo_tour: 'Multi day'
    }, 1, 8),
    refetchOnWindowFocus: true,
  })
  
  // Extract tour arrays from data
  const oneDayTours = oneDayToursData.items || []
  const multiDayTours = multiDayToursData.items || []

  // Extract all tour pages into a single array
  const tours = useMemo(() => {
    return toursData?.pages?.flatMap(page => page.items) || []
  }, [toursData])

  const totalTours = toursData?.pages?.[0]?.total || 0

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

      {/* Trust Badge Section */}
      <section className="py-8 px-4 bg-white border-b">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span>Valoración de 4.6</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Reserva con confianza</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Más de 50.000.000 de viajeros han reservado con Peru Travel</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Carousel */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="relative">
            {/* Embla Carousel */}
            <FeatureCardsCarousel />
          </div>
        </div>
      </section>

      {/* Tours Section */}
      <section id="tours" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Los mejores lugares para visitar en Perú</h2>

          {/* City Filter Tabs */}
          <CityFilterGrid 
            cities={cities}
            cityImages={cityImages}
            selectedCity={selectedCity}
            onCityChange={setSelectedCity}
          />

          {/* Tiqets Style Carousel */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Cargando tours...</span>
              </div>
          ) : (
            <TiqetsStyleCarousel 
              tours={tours} 
              
            />
          )}
        </div>
      </section>

      {/* One-Day Tours Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Tours de un día</h2>

          {/* City Filter Tabs for One-Day Tours */}
          <CityFilterGrid
            cities={cities}
            cityImages={cityImages}
            selectedCity={selectedOneDayCity}
            onCityChange={setSelectedOneDayCity}
          />

          {/* Tiqets Style Carousel */}
          <TiqetsStyleCarousel 
            tours={oneDayTours} 
            
          />
        </div>
      </section>

      {/* Multi-Day Tours Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Tours de Varios Días</h2>

          {/* City Filter Tabs for Multi-Day Tours */}
          <CityFilterGrid
            cities={cities}
            cityImages={cityImages}
            selectedCity={selectedMultiDayCity}
            onCityChange={setSelectedMultiDayCity}
          />

          {/* Tiqets Style Carousel */}
          <TiqetsStyleCarousel 
            tours={multiDayTours} 
            
          />
        </div>
      </section>

      {/* Featured Tours Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Tours Destacados</h2>

          {/* City Filter Tabs for Featured Tours */}
          <CityFilterGrid
            cities={cities}
            cityImages={cityImages}
            selectedCity={selectedFeaturedCity}
            onCityChange={setSelectedFeaturedCity}
          />

          

          {/* Tiqets Style Carousel */}
          <TiqetsStyleCarousel 
            tours={featuredTours} 
            
          />
        </div>
      </section>
    </div>
  )
}
