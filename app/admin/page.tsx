'use client'

import { useQuery } from '@tanstack/react-query'
import { AdminService } from '@/services/admin-service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Loader2,
  RefreshCw,
  Eye,
  ArrowUpRight
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface StatCardProps {
  title: string
  value: string | number
  icon: any
  trend?: {
    value: number
    isPositive: boolean
  }
  href?: string
}

function StatCard({ title, value, icon: Icon, trend, href }: StatCardProps) {
  const CardWrapper = href ? Link : 'div'
  
  return (
    <CardWrapper href={href || ''}>
      <Card className={`${href ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
              {trend && (
                <div className={`flex items-center text-sm ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trend.isPositive ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {trend.value}% vs mes anterior
                </div>
              )}
            </div>
            <div className={`p-3 rounded-full ${
              href ? 'bg-primary/10 text-primary' : 'bg-muted/10 text-muted-foreground'
            }`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
          {href && (
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              Ver detalles <ArrowUpRight className="h-3 w-3 ml-1" />
            </div>
          )}
        </CardContent>
      </Card>
    </CardWrapper>
  )
}

function RecentActivity() {
  // Mock data for recent activity - replace with real API call
  const activities = [
    {
      id: '1',
      type: 'booking',
      message: 'Nueva reserva para Machu Picchu',
      user: 'Juan Pérez',
      time: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      status: 'confirmed'
    },
    {
      id: '2',
      type: 'payment',
      message: 'Pago procesado correctamente',
      user: 'María García',
      time: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      status: 'success'
    },
    {
      id: '3',
      type: 'user',
      message: 'Nuevo usuario registrado',
      user: 'Carlos López',
      time: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      status: 'active'
    },
    {
      id: '4',
      type: 'tour',
      message: 'Tour actualizado: Valle Sagrado',
      user: 'Admin',
      time: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      status: 'updated'
    }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking': return Calendar
      case 'payment': return DollarSign
      case 'user': return Users
      case 'tour': return MapPin
      default: return Calendar
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'success': return 'bg-blue-100 text-blue-800'
      case 'active': return 'bg-purple-100 text-purple-800'
      case 'updated': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Actividad Reciente</CardTitle>
        <CardDescription>
          Últimas acciones realizadas en el sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = getActivityIcon(activity.type)
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-full">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium truncate">{activity.message}</p>
                    <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {activity.user} • {formatDistanceToNow(activity.time, { 
                      addSuffix: true, 
                      locale: es 
                    })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4 text-center">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Ver toda la actividad
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: AdminService.getDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  })

  if (error) {
    toast.error('Error al cargar las estadísticas del dashboard')
  }

  const handleRefresh = () => {
    refetch()
    toast.success('Datos actualizados')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen general de la plataforma de tours
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
                  <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <>
          {/* Statistics Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Tours"
              value={stats.total_tours || 0}
              icon={MapPin}
              trend={{ value: 12, isPositive: true }}
              href="/admin/tours"
            />
            <StatCard
              title="Total Reservas"
              value={stats.total_bookings || 0}
              icon={Calendar}
              trend={{ value: 8, isPositive: true }}
              href="/admin/bookings"
            />
            <StatCard
              title="Ingresos Totales"
              value={`$${(stats.total_revenue || 0).toLocaleString()}`}
              icon={DollarSign}
              trend={{ value: 15, isPositive: true }}
            />
            <StatCard
              title="Usuarios Activos"
              value={stats.total_users || 0}
              icon={Users}
              trend={{ value: 5, isPositive: true }}
              href="/admin/users"
            />
          </div>

          {/* Charts and Activity */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Revenue Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Ingresos por Mes</CardTitle>
                <CardDescription>
                  Evolución de los ingresos en los últimos 6 meses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Gráfico de ingresos</p>
                    <p className="text-sm">(Se implementará con librería de gráficos)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <RecentActivity />
          </div>

          {/* Popular Tours */}
          {stats.popular_tours && stats.popular_tours.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tours Más Populares</CardTitle>
                <CardDescription>
                  Los tours con más reservas este mes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.popular_tours.map((tour, index) => (
                    <div key={tour.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{tour.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {tour.bookings_count} reservas
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${tour.revenue.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">ingresos</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se pudieron cargar las estadísticas</p>
          <Button onClick={handleRefresh} variant="outline" className="mt-4">
            Reintentar
          </Button>
        </div>
      )}
    </div>
  )
}