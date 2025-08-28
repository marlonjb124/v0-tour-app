'use client'

import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  Shield,
  RefreshCw
} from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function AdminHeader() {
  const { user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Implement global search functionality
      console.log('Search:', searchQuery)
    }
  }

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar tours, usuarios, reservas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80 focus-visible:ring-1"
            />
          </form>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Refresh Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.location.reload()}
            title="Actualizar datos"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                Notificaciones
                <Badge variant="secondary">3 nuevas</Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <div className="space-y-1">
                <div className="px-2 py-3 hover:bg-muted/50 rounded-sm cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Nueva reserva</p>
                      <p className="text-xs text-muted-foreground">Juan Pérez reservó Machu Picchu</p>
                      <p className="text-xs text-muted-foreground">Hace 5 minutos</p>
                    </div>
                  </div>
                </div>
                
                <div className="px-2 py-3 hover:bg-muted/50 rounded-sm cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Pago confirmado</p>
                      <p className="text-xs text-muted-foreground">Reserva #1234 - $150.00</p>
                      <p className="text-xs text-muted-foreground">Hace 15 minutos</p>
                    </div>
                  </div>
                </div>
                
                <div className="px-2 py-3 hover:bg-muted/50 rounded-sm cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Usuario registrado</p>
                      <p className="text-xs text-muted-foreground">María García se unió a la plataforma</p>
                      <p className="text-xs text-muted-foreground">Hace 1 hora</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center justify-center">
                Ver todas las notificaciones
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium">{user?.full_name}</p>
                  <p className="text-xs text-muted-foreground">Administrador</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}