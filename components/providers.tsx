'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
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
        },
        mutations: {
          retry: false,
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
        {children}
        <Toaster
          position="top-right"
          richColors
          expand
          closeButton
        />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}