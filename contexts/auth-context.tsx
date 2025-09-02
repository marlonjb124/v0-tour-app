'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase'
import { AuthService, LoginRequest, RegisterRequest } from '@/services/auth-service'
import type { User } from '@/lib/types'
import type { User as SupabaseUser, Session, AuthChangeEvent } from '@supabase/supabase-js'
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

interface AuthContextError {
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
  error: AuthContextError | null
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
  const [isLoading, setIsLoading] = useState(true) // Start true, set to false after initial check
  const [error, setError] = useState<AuthContextError | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const supabase = createClient()

  const loadUserProfile = async (userId: string): Promise<void> => {
    setIsLoading(true)
    try {
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setUser(null) // Profile not found, expected for new users
        } else {
          throw error // Re-throw other errors
        }
      } else {
        setUser(userProfile)
      }
    } catch (error: any) {
      console.error('Error loading user profile:', error)
      setError({ type: 'profile_load', message: 'Failed to load user profile.', retryable: true })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoading(false);
      } else if (!session) {
        // Any other event with no session: ensure loading is cleared
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Safety: if a session exists but loading takes too long (e.g., network stall on profile), stop blocking UI
  useEffect(() => {
    if (!isLoading) return;
    const timer = setTimeout(() => {
      if (isLoading && session) {
        setIsLoading(false);
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [isLoading, session]);


  const login = async (credentials: LoginRequest) => {
    setIsLoading(true)
    try {
      await AuthService.login(credentials)
      // onAuthStateChange will handle setting the user and profile
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
    setIsLoading(true)
    try {
      await AuthService.register(userData)
      // onAuthStateChange will handle setting the user and profile
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
    await AuthService.logout()
    // onAuthStateChange will handle setting user to null
    toast.success('Has cerrado sesión correctamente.')
  }

  const refreshUser = async () => {
    if (supabaseUser) await loadUserProfile(supabaseUser.id)
  }

  const retryAuthentication = async () => {
    if (supabaseUser) await loadUserProfile(supabaseUser.id)
  }

  const clearError = () => setError(null)

  const contextValue: AuthContextType = {
    user,
    supabaseUser,
    session,
    isAuthenticated: !!session,
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

    if (isAuthenticated && !user) {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/register'
      }
      return null
    }

    return <Component {...props} />
  }
}

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

    if (isAuthenticated && !user) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                Perfil no encontrado
              </h2>
              <p className="text-yellow-700 mb-4">
                Tu sesión está activa pero no encontramos un perfil en la base de datos. Pide a un administrador que cree tu perfil/rol manualmente en Supabase.
              </p>
              <a
                href="/auth/login"
                className="inline-block bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
              >
                Ir a iniciar sesión
              </a>
            </div>
          </div>
        </div>
      )
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