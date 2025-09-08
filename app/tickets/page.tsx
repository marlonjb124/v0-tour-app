"use client"

import { useState } from "react"
import { TourExcelService } from "@/services/tour-excel-service"
import { TourExcel } from "@/lib/types-excel"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Star, Ticket } from "lucide-react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { FilterPopup } from "@/components/filter-popup"
import { TiqetsCard } from "@/components/tiqets-card"
import { useForceRefetch } from "@/lib/hooks/use-force-refetch"

interface TourFilters {
  location?: string;
  search?: string;
  tipo_tour?: string;
  min_price?: number;
  max_price?: number;
}

export default function TicketsPage() {
  const [filters, setFilters] = useState<TourFilters>({})
  const [searchInput, setSearchInput] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  // Forzar refetch en cada acceso a la página
  useForceRefetch()

  // Fetch tickets with pagination
  const {
    data: ticketsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['tickets-excel', filters, currentPage],
    queryFn: () => TourExcelService.getTours(filters, currentPage, itemsPerPage),
    retry: 3,
    refetchOnWindowFocus: true,
  })

  // Fetch cities for filters
  const { data: cities = [] } = useQuery({
    queryKey: ['excel-locations'],
    queryFn: TourExcelService.getLocations,
    refetchOnWindowFocus: true,
  });

  // Fetch categories for filters
  const { data: categories = [] } = useQuery({
    queryKey: ['excel-categories'],
    queryFn: TourExcelService.getCategories,
    refetchOnWindowFocus: true,
  });

  const tickets = ticketsData?.items || []
  const totalTickets = ticketsData?.total || 0

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchInput.trim() }))
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

  const totalPages = Math.ceil(totalTickets / itemsPerPage)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        {/* Background Image - Ticket attractions */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/sagrada-familia-barcelona-architecture.png')`,
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-sans">Tickets & Entradas</h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Acceso directo a las mejores atracciones sin necesidad de tours guiados
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="flex items-center bg-white rounded-full shadow-lg overflow-hidden">
              <Search className="ml-4 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar tickets y entradas"
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
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <FilterPopup 
              filters={filters} 
              onFiltersChange={setFilters} 
              cities={cities} 
              categories={categories}
            />
          </div>

          {/* Tickets Grid */}
          {error ? (
            <div className="text-center py-20">
              <h3 className="text-xl font-medium mb-2 text-red-600">Error al cargar tickets</h3>
              <p className="text-muted-foreground mb-4">
                Hubo un problema al obtener los tickets. Por favor, intenta nuevamente.
              </p>
              <Button onClick={() => refetch()} variant="outline">
                Reintentar
              </Button>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-xl font-medium mb-2">No se encontraron tickets</h3>
              <p className="text-muted-foreground mb-4">
                {Object.keys(filters).length > 0
                  ? "No hay tickets disponibles con los filtros seleccionados."
                  : "No hay tickets disponibles en este momento."
                }
              </p>
              {Object.keys(filters).length > 0 && (
                <Button onClick={() => {
                  setFilters({})
                  setSearchInput("")
                }}>
                  Ver todos los tickets
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-1 md:px-0">
              {tickets.map((ticket) => (
                <TiqetsCard key={ticket.id} tour={ticket} />
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
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalTickets)} de {totalTickets} tickets
          </div>
        </div>
      </section>
    </div>
  )
}