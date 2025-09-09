import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'

/**
 * Hook que fuerza TODOS los fetch necesarios cada vez que se navega a una página
 * Lógica simple: SIEMPRE refetch al cambiar de ruta
 */
export function useForceAllFetch() {
  const queryClient = useQueryClient()
  const pathname = usePathname()

  useEffect(() => {
    console.log('🔄 Force all fetch triggered for:', pathname)
    
    // Invalidar TODAS las queries
    queryClient.invalidateQueries()
    
    // Forzar refetch inmediato de TODAS las queries
    queryClient.refetchQueries()
    
  }, [pathname, queryClient])
}
