import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

/**
 * Hook que fuerza el refetch de todas las queries al montar el componente
 * Esto asegura que siempre se ejecuten fetch frescos al acceder a las páginas
 */
export function useForceRefetch() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Invalidar todas las queries para forzar refetch
    queryClient.invalidateQueries()
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
