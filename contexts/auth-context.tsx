'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase'
import { AuthService, LoginRequest, RegisterRequest } from '@/services/auth-service'
import type { User } from '@/lib/types'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'
import { toast } from 'sonner'

interface NavigationItem {
  title: string
  href: string
  icon: any
  badge?: string
  description?: string
}

interface AdminHeaderProps {
  className?: string
  onSearchSubmit?: (query: string) => void
}

interface NotificationItem {
  id: string
  type: 'booking' | 'payment' | 'user'
  title: string
  description: string
  timestamp: Date
  read: boolean
}

interface UserMenuProps {
  user: User
  onLogout: () => Promise<void>
}

interface AuthError {
  type: 'profile_load' | 'database' | 'permission' | 'unknown'
  message: string
  code?: string
  retryable: boolean
}

interface AuthContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  session: Session | null
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  error: AuthError | null
  retryCount: number
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  retryAuthentication: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const supabase = createClient()

  // Initialize auth state on mount and listen for auth changes
  useEffect(() => {
    // Get initial authenticated user using secure method
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (user && !error) {
        setSupabaseUser(user)
        // Get session after confirming user is authenticated
        supabase.auth.getSession().then(({ data: { session } }) => {
          setSession(session)
        })
        loadUserProfile(user.id)
      } else {
        setSupabaseUser(null)
        setSession(null)
        setIsLoading(false)
      }
    })

    // Listen for auth changes - this is safe for state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setSupabaseUser(session?.user ?? null)
      
      if (session?.user) {
        await loadUserProfile(session.user.id)
      } else {
        setUser(null)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Removed automatic profile creation - profiles should be created during registration process

  const loadUserProfile = async (userId: string, retryAttempt: number = 0): Promise<void> => {
    try {
      setError(null)
      
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.log('Database query error:', error)
        
        // Handle profile not found error (PGRST116)
        if (error.code === 'PGRST116') {
          console.log('User profile not found - user needs to complete registration or admin setup')
          
          // Don't try to create profile automatically - this should be done during registration
          // Just set user to null and let the app handle the missing profile state
          setUser(null)
          setError(null) // No error - this is expected for users without profiles
          return
        }
        
        // Handle other database errors
        const isRetryable = retryAttempt < 3 && (
          error.message?.includes('connection') ||
          error.message?.includes('timeout') ||
          error.code === 'PGRST301' // JWT expired
        )
        
        if (isRetryable) {
          console.log(`Retrying profile load (attempt ${retryAttempt + 1}/3)...`)
          setTimeout(() => {
            loadUserProfile(userId, retryAttempt + 1)
          }, Math.pow(2, retryAttempt) * 1000) // Exponential backoff
          return
        }
        
        setError({
          type: 'database',
          message: error.message || 'Database connection error',
          code: error.code,
          retryable: true
        })
        
      } else if (userProfile) {
        console.log('Successfully loaded user profile:', userProfile)
        setUser(userProfile)
        setError(null)
        
        // Update last login
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', userId)
      }
    } catch (error: any) {
      console.error('Unexpected error loading user profile:', error)
      setError({
        type: 'unknown',
        message: error.message || 'Unexpected error occurred',
        retryable: true
      })
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true)
      const response = await AuthService.login(credentials)
      setUser(response.profile)
      setSupabaseUser(response.user)
      setSession(response.session)
      toast.success('¡Bienvenido! Has iniciado sesión correctamente.')
    } catch (error: any) {
      const message = error.message || 'Error al iniciar sesión'
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterRequest) => {
    try {
      setIsLoading(true)
      const response = await AuthService.register(userData)
      setUser(response.profile)
      setSupabaseUser(response.user)
      setSession(response.session)
      toast.success('¡Registro exitoso! Bienvenido.')
    } catch (error: any) {
      const message = error.message || 'Error al registrarse'
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await AuthService.logout()
      setUser(null)
      setSupabaseUser(null)
      setSession(null)
      toast.success('Has cerrado sesión correctamente.')
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear user state even if API call fails
      setUser(null)
      setSupabaseUser(null)
      setSession(null)
    }
  }

  const refreshUser = async () => {
    try {
      if (supabaseUser) {
        setIsLoading(true)
        await loadUserProfile(supabaseUser.id)
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
      setError({
        type: 'profile_load',
        message: 'Failed to refresh user profile',
        retryable: true
      })
    }
  }

  const retryAuthentication = async () => {
    if (supabaseUser && retryCount < 3) {
      setRetryCount(prev => prev + 1)
      setIsLoading(true)
      setError(null)
      await loadUserProfile(supabaseUser.id)
    }
  }

  const clearError = () => {
    setError(null)
    setRetryCount(0)
  }

  const contextValue: AuthContextType = {
    user,
    supabaseUser,
    session,
    isAuthenticated: !!session, // User is authenticated if they have a session, even without a profile
    isAdmin: user?.role === 'admin',
    isLoading,
    error,
    retryCount,
    login,
    register,
    logout,
    refreshUser,
    retryAuthentication,
    clearError,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Enhanced HOC for protecting routes with better type safety
export const withAuth = <P extends Record<string, any>>(
  Component: React.ComponentType<P>
) => {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, user, isLoading, error, retryAuthentication } = useAuth()

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      )
    }

    if (error && error.retryable) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error de autenticación</p>
            <button
              onClick={retryAuthentication}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      )
    }

    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
      return null
    }

    // If user is authenticated but doesn't have a profile, redirect to registration completion
    if (isAuthenticated && !user) {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/register'
      }
      return null
    }

    return <Component {...props} />
  }
}

// Enhanced HOC for protecting admin routes with better type safety
export const withAdminAuth = <P extends Record<string, any>>(
  Component: React.ComponentType<P>
) => {
  return function AdminAuthenticatedComponent(props: P) {
    const { isAuthenticated, isAdmin, user, isLoading, error, retryAuthentication, clearError } = useAuth()

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando autenticación...</p>
          </div>
        </div>
      )
    }

    // Show error state with retry option
    if (error) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-red-800 mb-2">
                Error de Autenticación
              </h2>
              <p className="text-red-600 mb-4">
                {error.type === 'profile_load' && 'No se pudo cargar tu perfil de usuario.'}
                {error.type === 'database' && 'Error de conexión con la base de datos.'}
                {error.type === 'permission' && 'No tienes permisos suficientes.'}
                {error.type === 'unknown' && 'Ocurrió un error inesperado.'}
              </p>
              <p className="text-sm text-red-500 mb-4">
                {error.message}
              </p>
              {error.retryable && (
                <div className="space-y-2">
                  <button
                    onClick={retryAuthentication}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors mr-2"
                  >
                    Reintentar
                  </button>
                  <button
                    onClick={clearError}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Limpiar Error
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
      return null
    }

    // If user is authenticated but doesn't have a profile, redirect to admin setup
    if (isAuthenticated && !user) {
      if (typeof window !== 'undefined') {
        window.location.href = '/admin-setup'
      }
      return null
    }

    if (!isAdmin) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Acceso Denegado
            </h1>
            <p className="text-gray-600">
              No tienes permisos para acceder a esta página.
            </p>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}