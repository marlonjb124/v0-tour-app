'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'

/**
 * Hook for real-time subscriptions to Supabase tables
 */
export function useSupabaseSubscription<T = any>(
  table: string,
  filter?: string,
  onInsert?: (payload: T) => void,
  onUpdate?: (payload: T) => void,
  onDelete?: (payload: T) => void
) {
  const [isConnected, setIsConnected] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    let subscription: any

    const setupSubscription = () => {
      subscription = supabase
        .channel(`${table}_changes`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
            filter: filter
          },
          (payload) => {
            switch (payload.eventType) {
              case 'INSERT':
                onInsert?.(payload.new as T)
                break
              case 'UPDATE':
                onUpdate?.(payload.new as T)
                break
              case 'DELETE':
                onDelete?.(payload.old as T)
                break
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true)
          } else if (status === 'CHANNEL_ERROR') {
            setIsConnected(false)
            toast.error('Error en la conexión en tiempo real')
          }
        })
    }

    setupSubscription()

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription)
      }
      setIsConnected(false)
    }
  }, [table, filter, onInsert, onUpdate, onDelete])

  return { isConnected }
}

/**
 * Hook for optimistic updates with Supabase
 */
export function useOptimisticUpdate<T>() {
  const [isUpdating, setIsUpdating] = useState(false)

  const update = async (
    optimisticData: T[],
    setData: (data: T[]) => void,
    updateFn: () => Promise<T[]>
  ) => {
    setIsUpdating(true)
    const originalData = [...optimisticData]

    try {
      const newData = await updateFn()
      setData(newData)
      return newData
    } catch (error) {
      // Rollback on error
      setData(originalData)
      throw error
    } finally {
      setIsUpdating(false)
    }
  }

  return { isUpdating, update }
}

/**
 * Hook for paginated data fetching
 */
export function usePagination(initialPage = 1, initialSize = 10) {
  const [page, setPage] = useState(initialPage)
  const [size, setSize] = useState(initialSize)
  const [total, setTotal] = useState(0)

  const totalPages = Math.ceil(total / size)
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  const nextPage = () => {
    if (hasNextPage) {
      setPage(page + 1)
    }
  }

  const prevPage = () => {
    if (hasPrevPage) {
      setPage(page - 1)
    }
  }

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  const reset = () => {
    setPage(1)
    setTotal(0)
  }

  return {
    page,
    size,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    setPage,
    setSize,
    setTotal,
    nextPage,
    prevPage,
    goToPage,
    reset
  }
}

/**
 * Hook for handling authentication state changes
 */
export function useAuthStateChange() {
  const { user, session } = useAuth()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const isAuthenticated = isHydrated && !!session && !!user
  const isAdmin = isAuthenticated && user?.role === 'admin'
  const isLoading = !isHydrated

  return {
    isAuthenticated,
    isAdmin,
    isLoading,
    user,
    session
  }
}

/**
 * Hook for handling file uploads to Supabase Storage
 */
export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const supabase = createClient()

  const uploadFile = async (
    file: File,
    bucket: string,
    path: string,
    options?: {
      cacheControl?: string
      upsert?: boolean
    }
  ) => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: options?.cacheControl || '3600',
          upsert: options?.upsert || false
        })

      if (error) {
        throw error
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path)

      setUploadProgress(100)
      toast.success('Archivo subido exitosamente')

      return {
        path: data.path,
        fullPath: data.fullPath,
        publicUrl
      }
    } catch (error: any) {
      toast.error(`Error al subir archivo: ${error.message}`)
      throw error
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  const deleteFile = async (bucket: string, path: string) => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path])

      if (error) {
        throw error
      }

      toast.success('Archivo eliminado exitosamente')
    } catch (error: any) {
      toast.error(`Error al eliminar archivo: ${error.message}`)
      throw error
    }
  }

  return {
    uploadFile,
    deleteFile,
    isUploading,
    uploadProgress
  }
}

/**
 * Hook for database operations with error handling
 */
export function useSupabaseQuery() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const execute = async <T>(
    operation: () => Promise<{ data: T | null; error: any }>
  ): Promise<T> => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await operation()

      if (error) {
        throw new Error(error.message)
      }

      return data as T
    } catch (err: any) {
      const errorMessage = err.message || 'Error en la operación'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    execute,
    isLoading,
    error,
    supabase
  }
}