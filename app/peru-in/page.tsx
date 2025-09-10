"use client"

import { useState, useEffect } from "react"
import { TourExcelService } from "@/services/tour-excel-service"
import { TourExcel, PaginatedResponse } from "@/lib/types-excel"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Star } from "lucide-react"
import { ToursExcelFilters } from "@/components/tours-excel-filters"
import { TiqetsCard } from "@/components/tiqets-card"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { usePersistentFilters } from "@/lib/hooks/use-persistent-filters"
import { useForceAllFetch } from "@/lib/hooks/use-force-all-fetch"
import { TourExcelFilters } from "@/lib/types-excel"

export default function PeruInPage() {
  const [searchInput, setSearchInput] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  // Forzar TODOS los fetch cada vez que se navega a esta página
  useForceAllFetch()

  // Filtros persistentes
  const { filters, hasAppliedFilters, updateFilters, clearFilters } = usePersistentFilters({
    country: "Perú",
    search: "",
    min_duration_hours: 1,
    max_duration_hours: 384, // 16 días = 384 horas (máximo en BD)
  })

  // Fetch filter options
  const { data: locations } = useQuery({
    queryKey: ['tours-excel-locations'],
    queryFn: () => TourExcelService.getLocations(),
  })

  const { data: tourTypes } = useQuery({
    queryKey: ['tours-excel-types'],
    queryFn: () => TourExcelService.getTourTypes(),
  })

  const { data: languages } = useQuery({
    queryKey: ['tours-excel-languages'],
    queryFn: () => TourExcelService.getLanguages(),
  })

  const { data: priceStats } = useQuery({
    queryKey: ['tours-excel-price-stats'],
    queryFn: () => TourExcelService.getPriceStats(),
  })

  // Fetch domestic tours with pagination
  const {
    data: toursData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['tours-excel', 'domestic', JSON.stringify(filters), currentPage],
    queryFn: () => TourExcelService.getTours(filters, currentPage, itemsPerPage),
    retry: 3,
    refetchOnMount: true,
    staleTime: 0
  })

  const tours = toursData?.items || []
  const totalTours = toursData?.total || 0

  const handleSearch = () => {
    updateFilters({ ...filters, search: searchInput.trim() });
    setCurrentPage(1); // Reset to first page when searching
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const totalPages = Math.ceil(totalTours / itemsPerPage)

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
      <section className="py-12 px-6 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Tours en Perú</h2>
            <p className="text-muted-foreground">
              {totalTours} experiencias para descubrir en Perú
            </p>
          </div>

          <div className="mb-8">
            <ToursExcelFilters 
              filters={filters}
              onFiltersChange={updateFilters}
              locations={locations}
              tourTypes={tourTypes}
              languages={languages}
              priceStats={priceStats}
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
                {filters.location || filters.search 
                  ? "No hay tours disponibles con los filtros seleccionados."
                  : "No hay tours domésticos disponibles en este momento."
                }
              </p>
              {hasAppliedFilters && (
                <Button onClick={() => {
                  clearFilters();
                  setSearchInput("");
                }}>
                  Limpiar filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-1 md:px-0">
              {tours.map((tour: TourExcel) => (
                <TiqetsCard key={tour.id} tour={tour} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-12 space-x-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2"
              >
                Anterior
              </Button>
              
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      onClick={() => handlePageChange(pageNumber)}
                      className="px-3 py-2 min-w-[40px]"
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2"
              >
                Siguiente
              </Button>
            </div>
          )}
          
          {/* Pagination Info */}
          <div className="text-center mt-4 text-sm text-muted-foreground">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalTours)} de {totalTours} tours
          </div>
        </div>
      </section>
    </div>
  )
}