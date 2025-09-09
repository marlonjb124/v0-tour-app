import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'

/**
 * Hook que fuerza el refetch de queries específicas al montar el componente
 * Esto asegura que se ejecuten fetch frescos solo cuando sea necesario
 */
export function useForceRefetch() {
  const queryClient = useQueryClient()
  const hasRefetched = useRef(false)

  useEffect(() => {
    // Solo invalidar una vez por montaje del componente
    if (!hasRefetched.current) {
      // Invalidar solo las queries de tours para forzar refetch
      queryClient.invalidateQueries({ 
        queryKey: ['tours-excel'],
        exact: false // Invalida todas las queries que empiecen con 'tours-excel'
      })
      hasRefetched.current = true
    }
  }, [queryClient])
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
