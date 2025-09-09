import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'

/**
 * Hook especializado para detectar cuando el usuario vuelve al navegador
 * después de haber estado fuera (otra pestaña, aplicación, etc.)
 * y forzar refetch inmediato de todas las queries
 */
export function useBrowserReturn() {
  const queryClient = useQueryClient()
  const lastInvalidationTime = useRef<number>(0)
  const isPageVisible = useRef<boolean>(true)

  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible'
      
      // Si la página se vuelve visible después de estar oculta
      if (isVisible && !isPageVisible.current) {
        const now = Date.now()
        // Evitar invalidaciones muy frecuentes (mínimo 1000ms entre invalidaciones)
        if (now - lastInvalidationTime.current > 1000) {
          console.log('🔄 Browser return detected - invalidating ALL queries')
          
          // Invalidar TODAS las queries de manera más agresiva
          queryClient.invalidateQueries()
          
          // También forzar refetch inmediato
          queryClient.refetchQueries()
          
          lastInvalidationTime.current = now
        }
      }
      
      isPageVisible.current = isVisible
    }

    const handleFocus = () => {
      const now = Date.now()
      // Evitar invalidaciones muy frecuentes (mínimo 1000ms entre invalidaciones)
      if (now - lastInvalidationTime.current > 1000) {
        console.log('🎯 Window focus detected - invalidating ALL queries')
        
        // Invalidar TODAS las queries de manera más agresiva
        queryClient.invalidateQueries()
        
        // También forzar refetch inmediato
        queryClient.refetchQueries()
        
        lastInvalidationTime.current = now
      }
    }

    const handlePageShow = (event: PageTransitionEvent) => {
      // Detectar si la página se está mostrando desde el caché del navegador
      if (event.persisted) {
        const now = Date.now()
        // Evitar invalidaciones muy frecuentes (mínimo 1000ms entre invalidaciones)
        if (now - lastInvalidationTime.current > 1000) {
          console.log('📄 Page restored from cache - invalidating ALL queries')
          
          // Invalidar TODAS las queries de manera más agresiva
          queryClient.invalidateQueries()
          
          // También forzar refetch inmediato
          queryClient.refetchQueries()
          
          lastInvalidationTime.current = now
        }
      }
    }

    // Agregar todos los listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('pageshow', handlePageShow)

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [queryClient])
}
