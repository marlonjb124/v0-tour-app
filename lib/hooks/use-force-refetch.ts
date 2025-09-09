import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'

/**
 * Hook que fuerza el refetch de queries específicas al montar el componente
 * Esto asegura que se ejecuten fetch frescos cuando sea necesario
 */
export function useForceRefetch() {
  const queryClient = useQueryClient()
  const pathname = usePathname()
  const hasRefetched = useRef(false)
  const lastPathname = useRef<string | null>(null)
  const lastInvalidationTime = useRef<number>(0)

  useEffect(() => {
    // Invalidar queries cuando cambie la ruta o sea la primera carga
    const isNewRoute = lastPathname.current !== pathname
    const isFirstLoad = !hasRefetched.current

    if (isNewRoute || isFirstLoad) {
      const now = Date.now()
      // Evitar invalidaciones muy frecuentes (mínimo 200ms entre invalidaciones)
      if (now - lastInvalidationTime.current > 200) {
        console.log('🔄 Force refetch triggered for:', pathname)
        
        // Invalidar TODAS las queries de manera más agresiva
        queryClient.invalidateQueries()
        
        // También forzar refetch inmediato
        queryClient.refetchQueries()
        
        lastInvalidationTime.current = now
      }

      hasRefetched.current = true
      lastPathname.current = pathname
    }
  }, [queryClient, pathname])

  // Agregar listener para detectar cuando el usuario vuelve al navegador
  useEffect(() => {
    const handleFocus = () => {
      const now = Date.now()
      // Evitar invalidaciones muy frecuentes (mínimo 1000ms entre invalidaciones)
      if (now - lastInvalidationTime.current > 1000) {
        console.log('🎯 Window focused, force refetching all queries for:', pathname)
        
        // Invalidar TODAS las queries de manera más agresiva
        queryClient.invalidateQueries()
        
        // También forzar refetch inmediato
        queryClient.refetchQueries()
        
        lastInvalidationTime.current = now
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now()
        // Evitar invalidaciones muy frecuentes (mínimo 1000ms entre invalidaciones)
        if (now - lastInvalidationTime.current > 1000) {
          console.log('👁️ Page became visible, force refetching all queries for:', pathname)
          
          // Invalidar TODAS las queries de manera más agresiva
          queryClient.invalidateQueries()
          
          // También forzar refetch inmediato
          queryClient.refetchQueries()
          
          lastInvalidationTime.current = now
        }
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [queryClient, pathname])
}

/**
 * Hook que fuerza el refetch de queries específicas al montar el componente
 * @param queryKeys - Array de query keys a invalidar
 */
export function useForceRefetchQueries(queryKeys: string[][]) {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Invalidar queries específicas para forzar refetch
    queryKeys.forEach(queryKey => {
      queryClient.invalidateQueries({ queryKey })
    })
  }, [queryClient, queryKeys])
}
