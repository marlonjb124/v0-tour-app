"use client"

import { Search, Star, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import Link from "next/link"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { TourService, Tour } from "@/services/tour-service"
import { toast } from "sonner"
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

// Componente para el filtro de ciudades con "Ver más"
const CityFilterGrid = ({ cities, cityImages, selectedCity, onCityChange }: {
  cities: string[],
  cityImages: Record<string, string>,
  selectedCity: string,
  onCityChange: (city: string) => void
}) => {
  const [showAll, setShowAll] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [columns, setColumns] = useState(3);

  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        if (window.innerWidth < 400) setColumns(2);
        else if (window.innerWidth < 600) setColumns(3);
        else setColumns(4);
      } else {
        setColumns(5); // Columns for desktop
      }
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const maxRows = 2;
  const limit = columns * maxRows;
  // Incluir el botón "Todos" en el cálculo del límite
  const totalItems = cities.length + 1; // +1 para el botón "Todos"
  const visibleCities = isMobile && !showAll ? cities.slice(0, Math.max(0, limit - 1)) : cities;

  // Generar clases CSS válidas para el grid
  const getGridClass = () => {
    if (!isMobile) {
      return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';
    }
    
    switch (columns) {
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      case 5: return 'grid-cols-5';
      default: return 'grid-cols-3';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 mb-12">
      <div className={`grid gap-4 justify-items-center ${getGridClass()}`}>
        <Button
          variant={selectedCity === "" ? "default" : "outline"}
          className={`rounded-full px-6 py-2 ${
            selectedCity === "" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted border-border"
          }`}
          onClick={() => onCityChange("")}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-muted-foreground/20" />
            Todos
          </div>
        </Button>
        {visibleCities.map((city) => (
          <Button
            key={city}
            variant={selectedCity === city ? "default" : "outline"}
            className={`rounded-full px-6 py-2 ${
              selectedCity === city ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted border-border"
            }`}
            onClick={() => onCityChange(city)}
          >
            <div className="flex items-center gap-2">
              <img 
                src={cityImages[city] || '/images/default-city.png'} 
                alt={city}
                className="w-6 h-6 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="w-6 h-6 rounded-full bg-muted-foreground/20 hidden" />
              {city}
            </div>
          </Button>
        ))}
      </div>
      {isMobile && totalItems > limit && (
        <Button variant="link" onClick={() => setShowAll(!showAll)}>
          {showAll ? "Ver menos" : "Ver más"}
        </Button>
      )}
    </div>
  );
};

const FeatureCardsCarousel = () => {
  const [emblaRef] = useEmblaCarousel({
    loop: true,
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 768px)': {
        slidesToScroll: 1,
      },
    },
  }, [Autoplay({ delay: 3000, stopOnInteraction: false })])

  const featureCards = [
    {
      id: 1,
      title: "Flexibilidad en todo momento",
      description: "Opciones flexibles de cancelación en todos los establecimientos",
      bgColor: "bg-secondary/10",
      iconColor: "bg-secondary",
    },
    {
      id: 2,
      title: "Reserva con confianza",
      description: "Reserva desde tu móvil con facilidad y sáltate la cola",
      bgColor: "bg-primary/10",
      iconColor: "bg-primary",
    },
    {
      id: 3,
      title: "Descubre la cultura a tu manera",
      description: "Las mejores experiencias en sitios arqueológicos y atracciones de todo el Perú",
      bgColor: "bg-accent/10",
      iconColor: "bg-accent",
    },
  ]

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex h-48">
        {featureCards.map((card) => (
          <div key={card.id} className="flex-[0_0_100%] md:flex-[0_0_33.33%] px-2">
            <div className="flex items-start gap-4 p-6 bg-card rounded-lg h-full">
              <div className={`w-12 h-12 ${card.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                <div className={`w-6 h-6 ${card.iconColor} rounded-full`} />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">{card.title}</h3>
                <p className="text-muted-foreground">{card.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// City images mapping
const cityImages: Record<string, string> = {
  'Arequipa': '/santa-catalina-monastery-arequipa-colonial-archite.png',
  'Barcelona': '/sagrada-familia-barcelona-architecture.png',
  'Cusco': '/sacsayhuaman-fortress-cusco-stone-walls.png',
  'Ica': '/huacachina-oasis-desert-sand-dunes-peru.png',
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
  const [searchInput, setSearchInput] = useState<string>("")  // For controlled input
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [centerCardIndex, setCenterCardIndex] = useState(0)
  const [featuredCenterCardIndex, setFeaturedCenterCardIndex] = useState(0)
  const [oneDayCenterCardIndex, setOneDayCenterCardIndex] = useState(0)
  const [multiDayCenterCardIndex, setMultiDayCenterCardIndex] = useState(0)
  const featuredScrollContainerRef = useRef<HTMLDivElement>(null)
  const oneDayScrollContainerRef = useRef<HTMLDivElement>(null)
  const multiDayScrollContainerRef = useRef<HTMLDivElement>(null)

  // Fetch cities
  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: TourService.getCities,
    staleTime: 30 * 60 * 1000, // 30 minutes
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
    queryFn: ({ pageParam = 1 }) => TourService.getTours({
      city: selectedCity || undefined,
      search: searchTerm || undefined,
      is_active: true,
    }, pageParam, 6), // page, size - Load 6 tours per batch for horizontal scrolling
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.reduce((acc, page) => acc + (page.items?.length || 0), 0)
      return totalLoaded < (lastPage.total || 0) ? allPages.length + 1 : undefined
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch featured tours
  const { data: featuredTours = [] } = useQuery({
    queryKey: ['featured-tours', selectedFeaturedCity],
    queryFn: () => TourService.getFeaturedTours(6, selectedFeaturedCity || undefined),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
  })

  // Fetch one-day tours
  const { data: oneDayToursData = { items: [] } } = useQuery({
    queryKey: ['one-day-tours', selectedOneDayCity],
    queryFn: () => TourService.getToursByCategory('one-day', { 
      is_active: true,
      city: selectedOneDayCity || undefined
    }, 1, 8),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
  })
  
  // Fetch multi-day tours
  const { data: multiDayToursData = { items: [] } } = useQuery({
    queryKey: ['multi-day-tours', selectedMultiDayCity],
    queryFn: () => TourService.getToursByDuration(null, 2, { 
      is_active: true,
      city: selectedMultiDayCity || undefined
    }, 1, 8),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
  })
  
  // Extract tour arrays from data
  const oneDayTours = oneDayToursData.items || []
  const multiDayTours = multiDayToursData.items || []

  // Flatten tours from all pages
  const tours = toursData?.pages.flatMap(page => page.items || []) || []
  const totalTours = toursData?.pages[0]?.total || 0

  // Global mouse up handler to ensure drag stops when mouse is released anywhere
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false)
      setFeaturedCenterCardIndex(0)
      setOneDayCenterCardIndex(0)
      setMultiDayCenterCardIndex(0)
      
      // Reset cursors for all containers
      if (scrollContainerRef.current) {
        scrollContainerRef.current.style.cursor = 'grab'
      }
      if (featuredScrollContainerRef.current) {
        featuredScrollContainerRef.current.style.cursor = 'grab'
      }
      if (oneDayScrollContainerRef.current) {
        oneDayScrollContainerRef.current.style.cursor = 'grab'
      }
      if (multiDayScrollContainerRef.current) {
        multiDayScrollContainerRef.current.style.cursor = 'grab'
      }
    }

    const handleGlobalMouseLeave = () => {
      setIsDragging(false)
      setFeaturedCenterCardIndex(0)
      setOneDayCenterCardIndex(0)
      setMultiDayCenterCardIndex(0)
      
      // Reset cursors for all containers
      if (scrollContainerRef.current) {
        scrollContainerRef.current.style.cursor = 'grab'
      }
      if (featuredScrollContainerRef.current) {
        featuredScrollContainerRef.current.style.cursor = 'grab'
      }
      if (oneDayScrollContainerRef.current) {
        oneDayScrollContainerRef.current.style.cursor = 'grab'
      }
      if (multiDayScrollContainerRef.current) {
        multiDayScrollContainerRef.current.style.cursor = 'grab'
      }
    }

    // Add global event listeners
    document.addEventListener('mouseup', handleGlobalMouseUp)
    document.addEventListener('mouseleave', handleGlobalMouseLeave)
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('mouseleave', handleGlobalMouseLeave)
    }
  }, [])

  // Horizontal scroll handler for infinite loading
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container || isScrolling || isFetchingNextPage || !hasNextPage) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    const scrollPercentage = (scrollLeft + clientWidth) / scrollWidth

    // Load more when 80% scrolled horizontally
    if (scrollPercentage > 0.8) {
      setIsScrolling(true)
      fetchNextPage().finally(() => {
        setTimeout(() => setIsScrolling(false), 1000) // Prevent rapid fetching
      })
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isScrolling])

  // Attach scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  // Calculate center card index based on scroll position
  const updateCenterCard = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container || tours.length === 0) return

    const containerWidth = container.clientWidth
    const cardWidth = 300 // Fixed card width
    const scrollLeft = container.scrollLeft
    const centerPosition = scrollLeft + containerWidth / 2
    const newCenterIndex = Math.round(centerPosition / (cardWidth + 24)) // 24px gap
    
    setCenterCardIndex(Math.max(0, Math.min(newCenterIndex, tours.length - 1)))
  }, [tours.length])

  // Drag scroll handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.pageX - (scrollContainerRef.current?.offsetLeft || 0))
    setScrollLeft(scrollContainerRef.current?.scrollLeft || 0)
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grabbing'
    }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    e.preventDefault()
    const x = e.pageX - (scrollContainerRef.current.offsetLeft || 0)
    const walk = (x - startX) * 2 // Scroll speed multiplier
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
    updateCenterCard()
  }, [isDragging, startX, scrollLeft, updateCenterCard])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab'
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false)
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab'
    }
  }, [])

  // Touch handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(false) // Don't set dragging immediately
    setStartX(e.touches[0].pageX - (scrollContainerRef.current?.offsetLeft || 0))
    setScrollLeft(scrollContainerRef.current?.scrollLeft || 0)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return
    const x = e.touches[0].pageX - (scrollContainerRef.current.offsetLeft || 0)
    const deltaX = Math.abs(x - startX)
    
    // Only start dragging if moved more than 10px
    if (deltaX > 10) {
      setIsDragging(true)
      const walk = (x - startX) * 1.5 // Touch scroll speed
      scrollContainerRef.current.scrollLeft = scrollLeft - walk
      updateCenterCard()
    }
  }, [startX, scrollLeft, updateCenterCard])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Update center card on scroll
  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      const scrollHandler = () => {
        updateCenterCard()
        handleScroll()
      }
      container.addEventListener('scroll', scrollHandler)
      return () => container.removeEventListener('scroll', scrollHandler)
    }
  }, [updateCenterCard, handleScroll])

  // Featured tours center card calculation
  const updateFeaturedCenterCard = useCallback(() => {
    const container = featuredScrollContainerRef.current
    if (!container || featuredTours.length === 0) return

    const containerWidth = container.clientWidth
    const cardWidth = 300 // Fixed card width
    const scrollLeft = container.scrollLeft
    const centerPosition = scrollLeft + containerWidth / 2
    const newCenterIndex = Math.round(centerPosition / (cardWidth + 24)) // 24px gap
    
    setFeaturedCenterCardIndex(Math.max(0, Math.min(newCenterIndex, featuredTours.length - 1)))
  }, [featuredTours.length])

  // Featured tours drag handlers
  const handleFeaturedMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.pageX - (featuredScrollContainerRef.current?.offsetLeft || 0))
    setScrollLeft(featuredScrollContainerRef.current?.scrollLeft || 0)
    if (featuredScrollContainerRef.current) {
      featuredScrollContainerRef.current.style.cursor = 'grabbing'
    }
  }, [])

  const handleFeaturedMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !featuredScrollContainerRef.current) return
    e.preventDefault()
    const x = e.pageX - (featuredScrollContainerRef.current.offsetLeft || 0)
    const walk = (x - startX) * 2
    featuredScrollContainerRef.current.scrollLeft = scrollLeft - walk
    updateFeaturedCenterCard()
  }, [isDragging, startX, scrollLeft, updateFeaturedCenterCard])

  const handleFeaturedMouseUp = useCallback(() => {
    setIsDragging(false)
    if (featuredScrollContainerRef.current) {
      featuredScrollContainerRef.current.style.cursor = 'grab'
    }
  }, [])

  const handleFeaturedMouseLeave = useCallback(() => {
    setIsDragging(false)
    if (featuredScrollContainerRef.current) {
      featuredScrollContainerRef.current.style.cursor = 'grab'
    }
  }, [])

  // Featured tours touch handlers
  const handleFeaturedTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(false)
    setStartX(e.touches[0].pageX - (featuredScrollContainerRef.current?.offsetLeft || 0))
    setScrollLeft(featuredScrollContainerRef.current?.scrollLeft || 0)
  }, [])

  const handleFeaturedTouchMove = useCallback((e: React.TouchEvent) => {
    if (!featuredScrollContainerRef.current) return
    const x = e.touches[0].pageX - (featuredScrollContainerRef.current.offsetLeft || 0)
    const deltaX = Math.abs(x - startX)
    
    if (deltaX > 10) {
      setIsDragging(true)
      const walk = (x - startX) * 1.5
      featuredScrollContainerRef.current.scrollLeft = scrollLeft - walk
      updateFeaturedCenterCard()
    }
  }, [startX, scrollLeft, updateFeaturedCenterCard])

  const handleFeaturedTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])
  
  // One-day tours center card calculation
  const updateOneDayCenterCard = useCallback(() => {
    const container = oneDayScrollContainerRef.current
    if (!container || oneDayTours.length === 0) return

    const containerWidth = container.clientWidth
    const cardWidth = 300 // Fixed card width
    const scrollLeft = container.scrollLeft
    const centerPosition = scrollLeft + containerWidth / 2
    const newCenterIndex = Math.round(centerPosition / (cardWidth + 24)) // 24px gap
    
    setOneDayCenterCardIndex(Math.max(0, Math.min(newCenterIndex, oneDayTours.length - 1)))
  }, [oneDayTours.length])

  // One-day tours drag handlers
  const handleOneDayMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.pageX - (oneDayScrollContainerRef.current?.offsetLeft || 0))
    setScrollLeft(oneDayScrollContainerRef.current?.scrollLeft || 0)
    if (oneDayScrollContainerRef.current) {
      oneDayScrollContainerRef.current.style.cursor = 'grabbing'
    }
  }, [])

  const handleOneDayMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !oneDayScrollContainerRef.current) return
    e.preventDefault()
    const x = e.pageX - (oneDayScrollContainerRef.current.offsetLeft || 0)
    const walk = (x - startX) * 2
    oneDayScrollContainerRef.current.scrollLeft = scrollLeft - walk
    updateOneDayCenterCard()
  }, [isDragging, startX, scrollLeft, updateOneDayCenterCard])

  const handleOneDayMouseUp = useCallback(() => {
    setIsDragging(false)
    if (oneDayScrollContainerRef.current) {
      oneDayScrollContainerRef.current.style.cursor = 'grab'
    }
  }, [])

  const handleOneDayMouseLeave = useCallback(() => {
    setIsDragging(false)
    if (oneDayScrollContainerRef.current) {
      oneDayScrollContainerRef.current.style.cursor = 'grab'
    }
  }, [])

  // One-day tours touch handlers
  const handleOneDayTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(false)
    setStartX(e.touches[0].pageX - (oneDayScrollContainerRef.current?.offsetLeft || 0))
    setScrollLeft(oneDayScrollContainerRef.current?.scrollLeft || 0)
  }, [])

  const handleOneDayTouchMove = useCallback((e: React.TouchEvent) => {
    if (!oneDayScrollContainerRef.current) return
    const x = e.touches[0].pageX - (oneDayScrollContainerRef.current.offsetLeft || 0)
    const deltaX = Math.abs(x - startX)
    
    if (deltaX > 10) {
      setIsDragging(true)
      const walk = (x - startX) * 1.5
      oneDayScrollContainerRef.current.scrollLeft = scrollLeft - walk
      updateOneDayCenterCard()
    }
  }, [startX, scrollLeft, updateOneDayCenterCard])

  const handleOneDayTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])
  
  // Multi-day tours center card calculation
  const updateMultiDayCenterCard = useCallback(() => {
    const container = multiDayScrollContainerRef.current
    if (!container || multiDayTours.length === 0) return

    const containerWidth = container.clientWidth
    const cardWidth = 300 // Fixed card width
    const scrollLeft = container.scrollLeft
    const centerPosition = scrollLeft + containerWidth / 2
    const newCenterIndex = Math.round(centerPosition / (cardWidth + 24)) // 24px gap
    
    setMultiDayCenterCardIndex(Math.max(0, Math.min(newCenterIndex, multiDayTours.length - 1)))
  }, [multiDayTours.length])

  // Multi-day tours drag handlers
  const handleMultiDayMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.pageX - (multiDayScrollContainerRef.current?.offsetLeft || 0))
    setScrollLeft(multiDayScrollContainerRef.current?.scrollLeft || 0)
    if (multiDayScrollContainerRef.current) {
      multiDayScrollContainerRef.current.style.cursor = 'grabbing'
    }
  }, [])

  const handleMultiDayMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !multiDayScrollContainerRef.current) return
    e.preventDefault()
    const x = e.pageX - (multiDayScrollContainerRef.current.offsetLeft || 0)
    const walk = (x - startX) * 2
    multiDayScrollContainerRef.current.scrollLeft = scrollLeft - walk
    updateMultiDayCenterCard()
  }, [isDragging, startX, scrollLeft, updateMultiDayCenterCard])

  const handleMultiDayMouseUp = useCallback(() => {
    setIsDragging(false)
    if (multiDayScrollContainerRef.current) {
      multiDayScrollContainerRef.current.style.cursor = 'grab'
    }
  }, [])

  const handleMultiDayMouseLeave = useCallback(() => {
    setIsDragging(false)
    if (multiDayScrollContainerRef.current) {
      multiDayScrollContainerRef.current.style.cursor = 'grab'
    }
  }, [])

  // Multi-day tours touch handlers
  const handleMultiDayTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(false)
    setStartX(e.touches[0].pageX - (multiDayScrollContainerRef.current?.offsetLeft || 0))
    setScrollLeft(multiDayScrollContainerRef.current?.scrollLeft || 0)
  }, [])

  const handleMultiDayTouchMove = useCallback((e: React.TouchEvent) => {
    if (!multiDayScrollContainerRef.current) return
    const x = e.touches[0].pageX - (multiDayScrollContainerRef.current.offsetLeft || 0)
    const deltaX = Math.abs(x - startX)
    
    if (deltaX > 10) {
      setIsDragging(true)
      const walk = (x - startX) * 1.5
      multiDayScrollContainerRef.current.scrollLeft = scrollLeft - walk
      updateMultiDayCenterCard()
    }
  }, [startX, scrollLeft, updateMultiDayCenterCard])

  const handleMultiDayTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

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

      {/* Feature Cards Carousel */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="relative">
            {/* Embla Carousel */}
            <FeatureCardsCarousel />
          </div>
        </div>
      </section>

      {/* Tours Section */}
      <section id="tours" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Los mejores lugares para visitar en Perú</h2>

          {/* City Filter Tabs */}
          <CityFilterGrid 
            cities={cities}
            cityImages={cityImages}
            selectedCity={selectedCity}
            onCityChange={setSelectedCity}
          />


          {/* Horizontal Tours Scroll */}
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
                {/* Carousel Container with Drag Scrolling */}
                <div 
                  ref={scrollContainerRef}
                  className="overflow-x-auto scrollbar-hide pb-4 cursor-grab select-none"
                  style={{ 
                    scrollbarWidth: 'none', 
                    msOverflowStyle: 'none',
                    scrollBehavior: isDragging ? 'auto' : 'smooth'
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <div className="flex gap-6 min-w-max px-4 py-8">
                    {tours.map((tour, index) => {
                      const isCenter = index === centerCardIndex
                      const distance = Math.abs(index - centerCardIndex)
                      const scale = isCenter ? 1.1 : Math.max(0.85, 1 - distance * 0.1)
                      const opacity = isCenter ? 1 : Math.max(0.6, 1 - distance * 0.2)
                      const zIndex = isCenter ? 20 : Math.max(1, 10 - distance)
                      
                      return (
                        <Link key={`${tour.id}-${index}`} href={`/tours/${tour.id}`}>
                          <Card 
                            className={`
                              group cursor-pointer transition-all duration-500 ease-out flex-shrink-0 flex flex-col overflow-hidden p-0
                              ${isCenter 
                                ? 'hover:shadow-2xl shadow-xl border-primary/20' 
                                : 'hover:shadow-lg shadow-md'
                              }
                            `}
                            style={{
                              width: '300px',
                              height: '380px',
                              transform: `scale(${scale}) translateZ(0)`,
                              opacity: opacity,
                              zIndex: zIndex,
                              filter: isCenter ? 'none' : 'blur(0.5px)',
                            }}
                          >
                            <div className="relative overflow-hidden" style={{ height: '170px' }}>
                              <img
                                src={(() => {
                                  if (Array.isArray(tour.images) && tour.images.length > 0) {
                                    return String(tour.images[0])
                                  }
                                  return "/placeholder.svg"
                                })()}
                                alt={tour.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                draggable={false}
                              />
                              {tour.discount_percentage && (
                                <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-500 text-white">
                                  -{tour.discount_percentage}%
                                </Badge>
                              )}
                              {isCenter && (
                                <Badge className="absolute top-3 right-3 bg-primary hover:bg-primary text-white animate-pulse">
                                  ★ Destacado
                                </Badge>
                              )}
                            </div>

                            <CardContent className="flex-1 flex flex-col justify-between p-2">
                              <div>
                                <div className="mb-1">
                                  <Badge variant="secondary" className="text-xs font-medium mb-1">
                                    {tour.city?.toUpperCase()}
                                  </Badge>
                                </div>

                                <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2 text-base">
                                  {tour.title}
                                </h3>

                                <p className="text-muted-foreground mb-1 line-clamp-2 text-sm">
                                  {tour.description}
                                </p>
                              </div>

                              <div className="flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="font-medium text-sm">
                                    {tour.rating}
                                  </span>
                                  <span className="text-muted-foreground text-xs">
                                    ({tour.review_count?.toLocaleString()})
                                  </span>
                                </div>

                                <div className="text-right">
                                  <div className="text-muted-foreground text-xs">
                                    Desde
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {tour.original_price && tour.original_price > tour.price && (
                                      <span className="text-muted-foreground line-through text-xs">
                                        ${tour.original_price.toFixed(2)}
                                      </span>
                                    )}
                                    <span className="font-bold text-lg text-primary">
                                      ${tour.price.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      )
                    })}
                    
                    {/* Loading indicator for infinite scroll */}
                    {isFetchingNextPage && (
                      <div className="flex items-center justify-center w-80 flex-shrink-0">
                        <div className="flex flex-col items-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin" />
                          <span className="mt-2 text-sm text-muted-foreground">Cargando más tours...</span>
                        </div>
                      </div>
                    )}
                    
                    {/* End indicator */}
                    {!hasNextPage && tours.length > 0 && (
                      <div className="flex items-center justify-center w-80 flex-shrink-0">
                        <div className="text-center py-12">
                          <p className="text-sm text-muted-foreground">¡Has visto todos los tours disponibles!</p>
                          <p className="text-xs text-muted-foreground mt-1">Total: {totalTours} tours</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Navigation Arrows */}
                <div className="absolute inset-y-0 left-0 flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background border-2 ml-2"
                    onClick={() => {
                      const container = scrollContainerRef.current
                      if (container) {
                        container.scrollBy({ left: -350, behavior: 'smooth' })
                      }
                    }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background border-2 mr-2"
                    onClick={() => {
                      const container = scrollContainerRef.current
                      if (container) {
                        container.scrollBy({ left: 350, behavior: 'smooth' })
                      }
                    }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                {/* Drag Instructions */}
                <div className="text-center mt-8">
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-2 mb-2">
                    <span className="inline-block animate-bounce">👆</span>
                    Arrastra las tarjetas o desliza para explorar tours
                    <span className="inline-block animate-bounce">👆</span>
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    El tour del centro aparece destacado • Mostrando {tours.length} de {totalTours} tours
                  </p>
                  {centerCardIndex < tours.length && (
                    <p className="text-xs text-primary font-medium">
                      Viendo: {tours[centerCardIndex]?.title}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* One-Day Tours Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Tours de un día</h2>

          {/* City Filter Tabs for One-Day Tours */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button
              variant={selectedOneDayCity === "" ? "default" : "outline"}
              className={`rounded-full px-6 py-2 ${
                selectedOneDayCity === "" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted border-border"
              }`}
              onClick={() => setSelectedOneDayCity("")}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-muted-foreground/20" />
                Todos
              </div>
            </Button>
            {cities.map((city) => (
              <Button
                key={city}
                variant={selectedOneDayCity === city ? "default" : "outline"}
                className={`rounded-full px-6 py-2 ${
                  selectedOneDayCity === city ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted border-border"
                }`}
                onClick={() => setSelectedOneDayCity(city)}
              >
                <div className="flex items-center gap-2">
                  <img 
                    src={cityImages[city] || '/images/default-city.png'} 
                    alt={city}
                    className="w-6 h-6 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="w-6 h-6 rounded-full bg-muted-foreground/20 hidden" />
                  {city}
                </div>
              </Button>
            ))}
          </div>

          <div className="relative">
            {oneDayTours.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No hay tours de un día disponibles en este momento.</p>
              </div>
            ) : (
              <>
                {/* Carousel Container with Drag Scrolling */}
                <div 
                  ref={oneDayScrollContainerRef}
                  className="overflow-x-auto scrollbar-hide pb-4 cursor-grab select-none"
                  style={{ 
                    scrollbarWidth: 'none', 
                    msOverflowStyle: 'none',
                    scrollBehavior: isDragging ? 'auto' : 'smooth'
                  }}
                  onMouseDown={handleOneDayMouseDown}
                  onMouseMove={handleOneDayMouseMove}
                  onMouseUp={handleOneDayMouseUp}
                  onMouseLeave={handleOneDayMouseLeave}
                  onTouchStart={handleOneDayTouchStart}
                  onTouchMove={handleOneDayTouchMove}
                  onTouchEnd={handleOneDayTouchEnd}
                >
                  <div className="flex gap-6 min-w-max px-4 py-8">
                    {oneDayTours.map((tour, index) => {
                      const isCenter = index === oneDayCenterCardIndex
                      const distance = Math.abs(index - oneDayCenterCardIndex)
                      const scale = isCenter ? 1.1 : Math.max(0.85, 1 - distance * 0.1)
                      const opacity = isCenter ? 1 : Math.max(0.6, 1 - distance * 0.2)
                      const zIndex = isCenter ? 20 : Math.max(1, 10 - distance)
                      
                      return (
                        <Link key={`one-day-${tour.id}-${index}`} href={`/tours/${tour.id}`}>
                          <Card 
                            className={`
                              group cursor-pointer transition-all duration-500 ease-out flex-shrink-0 flex flex-col overflow-hidden p-0
                              ${isCenter 
                                ? 'hover:shadow-2xl shadow-xl border-primary/20' 
                                : 'hover:shadow-lg shadow-md'
                              }
                            `}
                            style={{
                              width: '300px',
                              height: '380px',
                              transform: `scale(${scale}) translateZ(0)`,
                              opacity: opacity,
                              zIndex: zIndex,
                              filter: isCenter ? 'none' : 'blur(0.5px)',
                            }}
                          >
                            <div className="relative overflow-hidden" style={{ height: '170px' }}>
                              <img
                                src={(() => {
                                  if (Array.isArray(tour.images) && tour.images.length > 0) {
                                    return String(tour.images[0])
                                  }
                                  return "/placeholder.svg"
                                })()}
                                alt={tour.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                draggable={false}
                              />
                              <Badge className="absolute top-3 left-3 bg-green-500 hover:bg-green-500 text-white">
                                ⏱️ 1 día
                              </Badge>
                              {tour.discount_percentage && (
                                <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-500 text-white">
                                  -{tour.discount_percentage}%
                                </Badge>
                              )}
                              {isCenter && (
                                <Badge className="absolute bottom-3 left-3 bg-primary hover:bg-primary text-white animate-pulse">
                                  🕒 Duración corta
                                </Badge>
                              )}
                            </div>

                            <CardContent className="flex-1 flex flex-col justify-between p-2">
                              <div>
                                <div className="mb-1">
                                  <Badge variant="secondary" className="text-xs font-medium mb-1">
                                    {tour.city?.toUpperCase()}
                                  </Badge>
                                </div>

                                <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2 text-base">
                                  {tour.title}
                                </h3>

                                <p className="text-muted-foreground mb-1 line-clamp-2 text-sm">
                                  {tour.description}
                                </p>
                              </div>

                              <div className="flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="font-medium text-sm">
                                    {tour.rating}
                                  </span>
                                  <span className="text-muted-foreground text-xs">
                                    ({tour.review_count?.toLocaleString()})
                                  </span>
                                </div>

                                <div className="text-right">
                                  <div className="text-muted-foreground text-xs">
                                    Desde
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {tour.original_price && tour.original_price > tour.price && (
                                      <span className="text-muted-foreground line-through text-xs">
                                        ${tour.original_price.toFixed(2)}
                                      </span>
                                    )}
                                    <span className="font-bold text-lg text-primary">
                                      ${tour.price.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      )
                    })}
                    
                    {/* View All Card */}
                    <Link href="/tours?max_days=1">
                      <Card 
                        className="group cursor-pointer transition-all duration-300 ease-out flex-shrink-0 w-[200px] h-[400px] flex items-center justify-center border-dashed border-2 hover:border-primary hover:bg-primary/5"
                      >
                        <CardContent className="text-center p-6">
                          <div className="mb-4 mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <ChevronRight className="h-6 w-6 text-primary" />
                          </div>
                          <h3 className="font-medium text-lg mb-2 group-hover:text-primary transition-colors">
                            Ver todos
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            Explorar todos los tours de un día
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                </div>

                {/* Navigation Arrows for One-Day Tours */}
                <div className="absolute inset-y-0 left-0 flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background border-2 ml-2"
                    onClick={() => {
                      const container = oneDayScrollContainerRef.current
                      if (container) {
                        container.scrollBy({ left: -350, behavior: 'smooth' })
                      }
                    }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background border-2 mr-2"
                    onClick={() => {
                      const container = oneDayScrollContainerRef.current
                      if (container) {
                        container.scrollBy({ left: 350, behavior: 'smooth' })
                      }
                    }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                {/* One-Day Tours Instructions */}
                <div className="text-center mt-4">
                  <p className="text-xs text-muted-foreground">
                    Tours que puedes completar en un solo día • {oneDayTours.length} disponibles
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
      {/* Multi-Day Tours Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Tours de Varios Días</h2>

          {/* City Filter Tabs for Multi-Day Tours */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button
              variant={selectedMultiDayCity === "" ? "default" : "outline"}
              className={`rounded-full px-6 py-2 ${
                selectedMultiDayCity === "" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted border-border"
              }`}
              onClick={() => setSelectedMultiDayCity("")}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-muted-foreground/20" />
                Todos
              </div>
            </Button>
            {cities.map((city) => (
              <Button
                key={city}
                variant={selectedMultiDayCity === city ? "default" : "outline"}
                className={`rounded-full px-6 py-2 ${
                  selectedMultiDayCity === city ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted border-border"
                }`}
                onClick={() => setSelectedMultiDayCity(city)}
              >
                <div className="flex items-center gap-2">
                  <img 
                    src={cityImages[city] || '/images/default-city.png'} 
                    alt={city}
                    className="w-6 h-6 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="w-6 h-6 rounded-full bg-muted-foreground/20 hidden" />
                  {city}
                </div>
              </Button>
            ))}
          </div>
          <p className="text-center text-muted-foreground mb-8">Experiencias completas para conocer más a fondo</p>

          {/* Multi-Day Tours Carousel */}
          <div className="relative">
            {multiDayTours.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No hay tours de varios días disponibles en este momento.</p>
              </div>
            ) : (
              <>
                {/* Carousel Container with Drag Scrolling */}
                <div 
                  ref={multiDayScrollContainerRef}
                  className="overflow-x-auto scrollbar-hide pb-4 cursor-grab select-none"
                  style={{ 
                    scrollbarWidth: 'none', 
                    msOverflowStyle: 'none',
                    scrollBehavior: isDragging ? 'auto' : 'smooth'
                  }}
                  onMouseDown={handleMultiDayMouseDown}
                  onMouseMove={handleMultiDayMouseMove}
                  onMouseUp={handleMultiDayMouseUp}
                  onMouseLeave={handleMultiDayMouseLeave}
                  onTouchStart={handleMultiDayTouchStart}
                  onTouchMove={handleMultiDayTouchMove}
                  onTouchEnd={handleMultiDayTouchEnd}
                  onScroll={updateMultiDayCenterCard}
                >
                  <div className="flex gap-6 min-w-max px-4 py-8">
                    {multiDayTours.map((tour, index) => {
                      const isCenter = index === multiDayCenterCardIndex
                      const distance = Math.abs(index - multiDayCenterCardIndex)
                      const scale = isCenter ? 1.1 : Math.max(0.85, 1 - distance * 0.1)
                      const opacity = isCenter ? 1 : Math.max(0.6, 1 - distance * 0.2)
                      const zIndex = isCenter ? 20 : Math.max(1, 10 - distance)
                      
                      return (
                        <Link key={`multi-day-${tour.id}-${index}`} href={`/tours/${tour.id}`}>
                          <Card 
                            className={`
                              group cursor-pointer transition-all duration-500 ease-out flex-shrink-0 flex flex-col overflow-hidden p-0
                              ${isCenter 
                                ? 'hover:shadow-2xl shadow-xl border-primary/20' 
                                : 'hover:shadow-lg shadow-md'
                              }
                            `}
                            style={{
                              width: '300px',
                              height: '380px',
                              transform: `scale(${scale}) translateZ(0)`,
                              opacity: opacity,
                              zIndex: zIndex,
                              filter: isCenter ? 'none' : 'blur(0.5px)',
                            }}
                          >
                            <div className="relative overflow-hidden" style={{ height: '170px' }}>
                              <img
                                src={(() => {
                                  if (Array.isArray(tour.images) && tour.images.length > 0) {
                                    return String(tour.images[0])
                                  }
                                  return "/placeholder.svg"
                                })()}
                                alt={tour.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                draggable={false}
                              />
                              <Badge className="absolute top-3 left-3 bg-purple-500 hover:bg-purple-500 text-white">
                                🗓️ {tour.duration_days || 2}+ días
                              </Badge>
                              {tour.discount_percentage && (
                                <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-500 text-white">
                                  -{tour.discount_percentage}%
                                </Badge>
                              )}
                              {isCenter && (
                                <Badge className="absolute bottom-3 left-3 bg-primary hover:bg-primary text-white animate-pulse">
                                  ✨ Experiencia completa
                                </Badge>
                              )}
                            </div>

                            <CardContent className="flex-1 flex flex-col justify-between p-2">
                              <div>
                                <div className="mb-1">
                                  <Badge variant="secondary" className="text-xs font-medium mb-1">
                                    {tour.city?.toUpperCase()}
                                  </Badge>
                                </div>

                                <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2 text-base">
                                  {tour.title}
                                </h3>

                                <p className="text-muted-foreground mb-1 line-clamp-2 text-sm">
                                  {tour.description}
                                </p>
                              </div>

                              <div className="flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="font-medium text-sm">
                                    {tour.rating}
                                  </span>
                                  <span className="text-muted-foreground text-xs">
                                    ({tour.review_count?.toLocaleString()})
                                  </span>
                                </div>

                                <div className="text-right">
                                  <div className="text-muted-foreground text-xs">
                                    Desde
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {tour.original_price && tour.original_price > tour.price && (
                                      <span className="text-muted-foreground line-through text-xs">
                                        ${tour.original_price.toFixed(2)}
                                      </span>
                                    )}
                                    <span className="font-bold text-lg text-primary">
                                      ${tour.price.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      )
                    })}
                    
                    {/* View All Card */}
                    <Link href="/tours?min_days=2">
                      <Card 
                        className="group cursor-pointer transition-all duration-300 ease-out flex-shrink-0 w-[200px] h-[400px] flex items-center justify-center border-dashed border-2 hover:border-primary hover:bg-primary/5"
                      >
                        <CardContent className="text-center p-6">
                          <div className="mb-4 mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <ChevronRight className="h-6 w-6 text-primary" />
                          </div>
                          <h3 className="font-medium text-lg mb-2 group-hover:text-primary transition-colors">
                            Ver todos
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            Explorar todos los tours de varios días
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                </div>

                {/* Navigation Arrows for Multi-Day Tours */}
                <div className="absolute inset-y-0 left-0 flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background border-2 ml-2"
                    onClick={() => {
                      const container = multiDayScrollContainerRef.current
                      if (container) {
                        container.scrollBy({ left: -350, behavior: 'smooth' })
                      }
                    }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background border-2 mr-2"
                    onClick={() => {
                      const container = multiDayScrollContainerRef.current
                      if (container) {
                        container.scrollBy({ left: 350, behavior: 'smooth' })
                      }
                    }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                {/* Multi-Day Tours Instructions */}
                <div className="text-center mt-4">
                  <p className="text-xs text-muted-foreground">
                    Tours de experiencias completas de varios días • {multiDayTours.length} disponibles
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Tours Destacados</h2>

          {/* City Filter Tabs for Featured Tours */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button
              variant={selectedFeaturedCity === "" ? "default" : "outline"}
              className={`rounded-full px-6 py-2 ${
                selectedFeaturedCity === "" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted border-border"
              }`}
              onClick={() => setSelectedFeaturedCity("")}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-muted-foreground/20" />
                Todos
              </div>
            </Button>
            {cities.map((city) => (
              <Button
                key={city}
                variant={selectedFeaturedCity === city ? "default" : "outline"}
                className={`rounded-full px-6 py-2 ${
                  selectedFeaturedCity === city ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted border-border"
                }`}
                onClick={() => setSelectedFeaturedCity(city)}
              >
                <div className="flex items-center gap-2">
                  <img 
                    src={cityImages[city] || '/images/default-city.png'} 
                    alt={city}
                    className="w-6 h-6 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="w-6 h-6 rounded-full bg-muted-foreground/20 hidden" />
                  {city}
                </div>
              </Button>
            ))}
          </div>

          <p className="text-center text-muted-foreground mb-12">Los tours más populares y mejor valorados</p>

          {/* Featured Tours Carousel */}
          <div className="relative">
            {featuredTours.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No hay tours destacados disponibles en este momento.</p>
              </div>
            ) : (
              <>
                {/* Carousel Container with Drag Scrolling */}
                <div 
                  ref={featuredScrollContainerRef}
                  className="overflow-x-auto scrollbar-hide pb-4 cursor-grab select-none"
                  style={{ 
                    scrollbarWidth: 'none', 
                    msOverflowStyle: 'none',
                    scrollBehavior: isDragging ? 'auto' : 'smooth'
                  }}
                  onMouseDown={handleFeaturedMouseDown}
                  onMouseMove={handleFeaturedMouseMove}
                  onMouseUp={handleFeaturedMouseUp}
                  onMouseLeave={handleFeaturedMouseLeave}
                  onTouchStart={handleFeaturedTouchStart}
                  onTouchMove={handleFeaturedTouchMove}
                  onTouchEnd={handleFeaturedTouchEnd}
                  onScroll={updateFeaturedCenterCard}
                >
                  <div className="flex gap-6 min-w-max px-4 py-8">
                    {featuredTours.map((tour, index) => {
                      const isCenter = index === featuredCenterCardIndex
                      const distance = Math.abs(index - featuredCenterCardIndex)
                      const scale = isCenter ? 1.1 : Math.max(0.85, 1 - distance * 0.1)
                      const opacity = isCenter ? 1 : Math.max(0.6, 1 - distance * 0.2)
                      const zIndex = isCenter ? 20 : Math.max(1, 10 - distance)
                      
                      return (
                        <Link key={`featured-${tour.id}-${index}`} href={`/tours/${tour.id}`}>
                          <Card 
                            className={`
                              group cursor-pointer transition-all duration-500 ease-out flex-shrink-0 flex flex-col overflow-hidden p-0
                              ${isCenter 
                                ? 'hover:shadow-2xl shadow-xl border-primary/20' 
                                : 'hover:shadow-lg shadow-md'
                              }
                            `}
                            style={{
                              width: '300px',
                              height: '380px',
                              transform: `scale(${scale}) translateZ(0)`,
                              opacity: opacity,
                              zIndex: zIndex,
                              filter: isCenter ? 'none' : 'blur(0.5px)',
                            }}
                          >
                            <div className="relative overflow-hidden" style={{ height: '170px' }}>
                              <img
                                src={(() => {
                                  if (Array.isArray(tour.images) && tour.images.length > 0) {
                                    return String(tour.images[0])
                                  }
                                  return "/placeholder.svg"
                                })()}
                                alt={tour.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                draggable={false}
                              />
                              <Badge className="absolute top-3 left-3 bg-blue-500 hover:bg-blue-500 text-white">
                                ⭐ Destacado
                              </Badge>
                              {tour.discount_percentage && (
                                <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-500 text-white">
                                  -{tour.discount_percentage}%
                                </Badge>
                              )}
                              {isCenter && (
                                <Badge className="absolute bottom-3 left-3 bg-primary hover:bg-primary text-white animate-pulse">
                                  🏆 Más Popular
                                </Badge>
                              )}
                            </div>

                            <CardContent className="flex-1 flex flex-col justify-between p-2">
                              <div>
                                <div className="mb-1">
                                  <Badge variant="secondary" className="text-xs font-medium mb-1">
                                    {tour.city?.toUpperCase()}
                                  </Badge>
                                </div>

                                <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2 text-base">
                                  {tour.title}
                                </h3>

                                <p className="text-muted-foreground mb-1 line-clamp-2 text-sm">
                                  {tour.description}
                                </p>
                              </div>

                              <div className="flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="font-medium text-sm">
                                    {tour.rating}
                                  </span>
                                  <span className="text-muted-foreground text-xs">
                                    ({tour.review_count?.toLocaleString()})
                                  </span>
                                </div>

                                <div className="text-right">
                                  <div className="text-muted-foreground text-xs">
                                    Desde
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {tour.original_price && tour.original_price > tour.price && (
                                      <span className="text-muted-foreground line-through text-xs">
                                        ${tour.original_price.toFixed(2)}
                                      </span>
                                    )}
                                    <span className="font-bold text-lg text-primary">
                                      ${tour.price.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      )
                    })}
                  </div>
                </div>

                {/* Navigation Arrows for Featured Tours */}
                <div className="absolute inset-y-0 left-0 flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background border-2 ml-2"
                    onClick={() => {
                      const container = featuredScrollContainerRef.current
                      if (container) {
                        container.scrollBy({ left: -350, behavior: 'smooth' })
                      }
                    }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background border-2 mr-2"
                    onClick={() => {
                      const container = featuredScrollContainerRef.current
                      if (container) {
                        container.scrollBy({ left: 350, behavior: 'smooth' })
                      }
                    }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                {/* Featured Tours Instructions */}
                <div className="text-center mt-8">
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-2 mb-2">
                    <span className="inline-block animate-bounce">🏆</span>
                    Arrastra para explorar nuestros tours más populares
                    <span className="inline-block animate-bounce">🏆</span>
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Tours con las mejores calificaciones • {featuredTours.length} tours destacados
                  </p>
                  {featuredCenterCardIndex < featuredTours.length && (
                    <p className="text-xs text-primary font-medium">
                      Destacado: {featuredTours[featuredCenterCardIndex]?.title}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
