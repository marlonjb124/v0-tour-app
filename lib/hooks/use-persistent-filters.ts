import { useState, useEffect } from 'react'
import { TourExcelFilters } from '@/lib/types-excel'

/**
 * Hook que mantiene los filtros persistentes durante la navegación
 * Los filtros se mantienen hasta que el usuario navega a una página diferente
 */
export function usePersistentFilters(initialFilters: TourExcelFilters) {
  const [filters, setFilters] = useState<TourExcelFilters>(initialFilters)
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false)

  // Detectar si se han aplicado filtros
  useEffect(() => {
    const hasFilters = Object.values(filters).some(value => {
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === 'string') return value.trim() !== ''
      if (typeof value === 'number') return value > 0
      return value !== undefined && value !== null
    })
    setHasAppliedFilters(hasFilters)
  }, [filters])

  const updateFilters = (newFilters: TourExcelFilters) => {
    setFilters(newFilters)
  }

  const clearFilters = () => {
    setFilters(initialFilters)
    setHasAppliedFilters(false)
  }

  return {
    filters,
    hasAppliedFilters,
    updateFilters,
    clearFilters
  }
}
