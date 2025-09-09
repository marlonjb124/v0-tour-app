import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'

/**
 * Hook que maneja el fetch basado en el tipo de navegación:
 * - Navegación fresca (click en header, URL directa) → FETCH FRESCO
 * - Regreso de navegación (botón atrás) → MANTENER estado actual
 */
export function useNavigationFetch() {
  const queryClient = useQueryClient()
  const pathname = usePathname()
  const previousPathname = useRef<string | null>(null)
  const isInitialLoad = useRef(true)
  const navigationHistory = useRef<string[]>([])

  useEffect(() => {
    // Detectar si es navegación fresca o regreso
    const isFreshNavigation = isInitialLoad.current || 
      !navigationHistory.current.includes(pathname) ||
      navigationHistory.current[navigationHistory.current.length - 1] !== pathname

    if (isFreshNavigation) {
      // Navegación fresca - hacer fetch fresco
      console.log('🔄 Fresh navigation detected, invalidating queries for:', pathname)
      
      // Invalidar queries específicas para la página actual
      if (pathname.includes('/peru-in')) {
        queryClient.invalidateQueries({ 
          queryKey: ['tours-excel', 'domestic'],
          exact: false
        })
      } else if (pathname.includes('/peru-out')) {
        queryClient.invalidateQueries({ 
          queryKey: ['tours-excel', 'international'],
          exact: false
        })
      } else if (pathname.includes('/tickets')) {
        queryClient.invalidateQueries({ 
          queryKey: ['tours-excel', 'tickets'],
          exact: false
        })
      } else if (pathname.includes('/tours-excel')) {
        queryClient.invalidateQueries({ 
          queryKey: ['tours-excel', 'all'],
          exact: false
        })
      }
    } else {
      console.log('↩️ Back navigation detected, keeping current state for:', pathname)
    }

    // Actualizar historial de navegación
    if (isFreshNavigation) {
      navigationHistory.current.push(pathname)
      // Mantener solo los últimos 10 elementos
      if (navigationHistory.current.length > 10) {
        navigationHistory.current = navigationHistory.current.slice(-10)
      }
    }

    // Actualizar referencias
    previousPathname.current = pathname
    isInitialLoad.current = false
  }, [pathname, queryClient])
}

/**
 * Hook para detectar si el usuario está regresando de una página de tour
 */
export function useTourNavigation() {
  const pathname = usePathname()
  const isTourPage = pathname.includes('/tour-excel/')
  
  return {
    isTourPage,
    tourId: isTourPage ? pathname.split('/').pop() : null
  }
}
