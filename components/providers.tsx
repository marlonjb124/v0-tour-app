'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/auth-context'
import { ErrorBoundary } from '@/components/error-boundary'
import { Toaster } from 'sonner'
import { useState } from 'react'
import { toast } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5 minutes
          retry: (failureCount, error: any) => {
            // Don't retry on authentication errors
            if (error?.message?.includes('JWT') || error?.message?.includes('auth')) {
              return false
            }
            // Don't retry on Supabase permission errors
            if (error?.message?.includes('row-level security') || error?.message?.includes('permission')) {
              return false
            }
            // Retry up to 2 times for other errors
            return failureCount < 2
          },
          onError: (error: any) => {
            // Global error handling for Supabase queries
            if (error?.message?.includes('Failed to fetch')) {
              toast.error('Error de conexión con la base de datos.')
            } else if (error?.message?.includes('JWT')) {
              toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.')
            } else if (error?.message?.includes('row-level security')) {
              toast.error('No tienes permisos para acceder a este recurso.')
            }
          },
        },
        mutations: {
          retry: false,
          onError: (error: any) => {
            // Global error handling for Supabase mutations
            if (error?.message?.includes('duplicate key')) {
              toast.error('Ya existe un registro con estos datos.')
            } else if (error?.message?.includes('foreign key')) {
              toast.error('No se puede completar la operación. Datos relacionados no encontrados.')
            } else if (error?.message?.includes('check constraint')) {
              toast.error('Los datos proporcionados no son válidos.')
            }
          },
        },
      },
    })
  )

  const handleGlobalError = (error: Error, errorInfo: any) => {
    // Log to error monitoring service
    console.error('Global Error:', error, errorInfo)
    
    // Show user-friendly error message
    toast.error('Se ha producido un error inesperado. Por favor, recarga la página.')
    
    // Report to error monitoring (implement based on your service)
    // e.g., Sentry.captureException(error, { contexts: { errorInfo } })
  }

  return (
    <ErrorBoundary onError={handleGlobalError}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            expand
            closeButton
          />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}