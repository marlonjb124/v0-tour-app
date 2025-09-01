'use client'

import React from 'react'
import { AuthProvider, useAuth, withAdminAuth } from '@/contexts/auth-context'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import { Loader2 } from 'lucide-react'

// The actual layout component with sidebar, header, etc.
function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isLoading, error, retryAuthentication, clearError } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando panel de administración...</p>
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
              {error.message}
            </p>
            {error.retryable && (
              <button
                onClick={retryAuthentication}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

// Wrap the layout content with the authentication HOC
const AuthenticatedAdminLayout = withAdminAuth(AdminLayoutContent)

// The final layout component that provides the auth context
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthenticatedAdminLayout>{children}</AuthenticatedAdminLayout>
    </AuthProvider>
  )
}