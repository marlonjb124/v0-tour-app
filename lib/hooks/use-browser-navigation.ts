import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'

/**
 * Hook especializado para detectar navegación del navegador (botones atrás/adelante)
 * y forzar refetch de datos cuando sea necesario
 */
export function useBrowserNavigation() {
  const queryClient = useQueryClient()
  const pathname = usePathname()
  const isBrowserNavigation = useRef(false)
  const lastPathname = useRef<string | null>(null)
  const lastInvalidationTime = useRef<number>(0)

  useEffect(() => {
    // Detectar navegación del navegador
    const handlePopState = () => {
      isBrowserNavigation.current = true
      console.log('🔙 Browser navigation detected (back/forward button)')
    }

    // Agregar listener para popstate
    window.addEventListener('popstate', handlePopState)

    // Si es navegación del navegador, invalidar queries
    if (isBrowserNavigation.current && lastPathname.current !== pathname) {
      const now = Date.now()
      // Evitar invalidaciones muy frecuentes (mínimo 100ms entre invalidaciones)
      if (now - lastInvalidationTime.current > 100) {
        console.log('🔄 Invalidating queries due to browser navigation to:', pathname)
        
        // Invalidar TODAS las queries de manera más agresiva
        queryClient.invalidateQueries()
        
        // También forzar refetch inmediato
        queryClient.refetchQueries()
        
        lastInvalidationTime.current = now
      }

      // Reset flag
      isBrowserNavigation.current = false
    }

    lastPathname.current = pathname

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [pathname, queryClient])
}

/**
 * Hook para detectar cuando el usuario vuelve a la página después de estar en otra pestaña
 */
export function usePageVisibility() {
  const queryClient = useQueryClient()
  const lastInvalidationTime = useRef<number>(0)

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now()
        // Evitar invalidaciones muy frecuentes (mínimo 500ms entre invalidaciones)
        if (now - lastInvalidationTime.current > 500) {
          console.log('👁️ Page became visible, invalidating ALL queries')
          
          // Invalidar TODAS las queries de manera más agresiva
          queryClient.invalidateQueries()
          
          // También forzar refetch inmediato
          queryClient.refetchQueries()
          
          lastInvalidationTime.current = now
        }
      }
    }

    const handleFocus = () => {
      const now = Date.now()
      // Evitar invalidaciones muy frecuentes (mínimo 500ms entre invalidaciones)
      if (now - lastInvalidationTime.current > 500) {
        console.log('🎯 Window focused, invalidating ALL queries')
        
        // Invalidar TODAS las queries de manera más agresiva
        queryClient.invalidateQueries()
        
        // También forzar refetch inmediato
        queryClient.refetchQueries()
        
        lastInvalidationTime.current = now
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [queryClient])
}
