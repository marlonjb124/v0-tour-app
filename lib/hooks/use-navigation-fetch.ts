import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'

/**
 * Hook que maneja el fetch basado en el tipo de navegación:
 * - Siempre hacer fetch fresco al cambiar de ruta
 * - Detectar navegación del navegador (botones atrás/adelante)
 */
export function useNavigationFetch() {
  const queryClient = useQueryClient()
  const pathname = usePathname()
  const previousPathname = useRef<string | null>(null)
  const isInitialLoad = useRef(true)
  const isBrowserNavigation = useRef(false)

  useEffect(() => {
    // Detectar si es navegación del navegador (popstate)
    const handlePopState = () => {
      isBrowserNavigation.current = true
    }

    // Agregar listener para detectar navegación del navegador
    window.addEventListener('popstate', handlePopState)

    // Siempre invalidar queries al cambiar de ruta
    const isRouteChange = previousPathname.current !== pathname
    const shouldInvalidate = isInitialLoad.current || isRouteChange

    if (shouldInvalidate) {
      const navigationType = isBrowserNavigation.current ? 'browser' : 'fresh'
      console.log(`🔄 ${navigationType} navigation detected, invalidating queries for:`, pathname)
      
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
      } else if (pathname.includes('/tour-excel/')) {
        queryClient.invalidateQueries({ 
          queryKey: ['tour-excel'],
          exact: false
        })
      }

      // Invalidar queries de datos auxiliares
      queryClient.invalidateQueries({ queryKey: ['cities'] })
      queryClient.invalidateQueries({ queryKey: ['tours-excel-locations'] })
      queryClient.invalidateQueries({ queryKey: ['tours-excel-countries'] })
      queryClient.invalidateQueries({ queryKey: ['tours-excel-types'] })
      queryClient.invalidateQueries({ queryKey: ['tours-excel-languages'] })
      queryClient.invalidateQueries({ queryKey: ['tours-excel-price-stats'] })

      // Reset browser navigation flag
      isBrowserNavigation.current = false
    }

    // Actualizar referencias
    previousPathname.current = pathname
    isInitialLoad.current = false

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
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
