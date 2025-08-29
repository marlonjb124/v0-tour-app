'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard,
  MapPin,
  Users,
  Calendar,
  Settings,
  LogOut,
  BarChart3,
  FileText,
  Shield,
  Globe
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavigationItem {
  title: string
  href: string
  icon: any
  badge?: string
  description?: string
}

const navigation: NavigationItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Resumen general'
  },
  {
    title: 'Tours',
    href: '/admin/tours',
    icon: MapPin,
    description: 'Gestión de tours'
  },
  {
    title: 'Reservas',
    href: '/admin/bookings',
    icon: Calendar,
    description: 'Gestión de reservas'
  },
  {
    title: 'Usuarios',
    href: '/admin/users',
    icon: Users,
    description: 'Gestión de usuarios'
  },
  {
    title: 'Estadísticas',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'Análisis y reportes'
  },
  {
    title: 'Configuración',
    href: '/admin/settings',
    icon: Settings,
    description: 'Configuración del sistema'
  }
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="w-64 bg-card border-r border-border h-screen sticky top-0 flex flex-col">
      {/* Logo and Title */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3\">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Tours Admin</h1>
            <p className="text-xs text-muted-foreground">Panel de Control</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3\">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0\">
            <p className="font-medium text-sm truncate">{user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.email}</p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Administrador
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Navegación
        </div>
        
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
                          (item.href !== '/admin' && pathname.startsWith(item.href))
          
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-muted group',
                isActive ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground hover:text-foreground'
              )}>
                <item.icon className={cn(
                  'w-4 h-4 flex-shrink-0',
                  isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                )} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.title}</div>
                  {item.description && (
                    <div className={cn(
                      'text-xs truncate',
                      isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                    )}>
                      {item.description}
                    </div>
                  )}
                </div>
                {item.badge && (
                  <Badge 
                    variant={isActive ? 'secondary' : 'default'}
                    className="text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border">
        <div className="space-y-2">
          <Link href="/" className="w-full">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Globe className="w-4 h-4 mr-2" />
              Ver Sitio Web
            </Button>
          </Link>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            v1.0.0
          </p>
        </div>
      </div>
    </div>
  )
}