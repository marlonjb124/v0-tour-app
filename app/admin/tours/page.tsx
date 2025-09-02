'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AdminService } from '@/services/admin-service'
import { TourService } from '@/services/tour-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Star,
  MapPin,
  Users,
  Clock,
  DollarSign,
  Loader2,
  Download,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { Tour } from '@/services/tour-service'

interface ToursFilters {
  search: string
  city: string
  is_active: string
  is_featured: string
}

export default function ToursManagement() {
  const [filters, setFilters] = useState<ToursFilters>({
    search: '',
    city: '',
    is_active: '',
    is_featured: ''
  })
  const [selectedTours, setSelectedTours] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const queryClient = useQueryClient()

  // Fetch tours with admin view
  const { data: toursData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-tours', filters, currentPage],
    queryFn: () => AdminService.getTours(
      {
        search: filters.search || undefined,
        city: filters.city || undefined,
        is_active: filters.is_active ? filters.is_active === 'true' : undefined,
        is_featured: filters.is_featured ? filters.is_featured === 'true' : undefined,
      },
      currentPage,
      pageSize
    ),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  // Fetch cities for filter
  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: TourService.getCities,
    staleTime: 30 * 60 * 1000, // 30 minutes
  })

  // Delete tour mutation
  const deleteTourMutation = useMutation({
    mutationFn: TourService.deleteTour,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] })
      toast.success('Tour eliminado correctamente')
      setSelectedTours(prev => prev.filter(id => !selectedTours.includes(id)))
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Error al eliminar el tour')
    }
  })

  // Toggle featured mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: TourService.toggleFeatured,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] })
      toast.success('Estado destacado actualizado')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Error al actualizar el tour')
    }
  })

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: TourService.toggleActive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] })
      toast.success('Estado de activación actualizado')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Error al actualizar el tour')
    }
  })

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: ({ tourIds, updateData }: { tourIds: string[], updateData: any }) =>
      TourService.bulkUpdateTours(tourIds, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] })
      toast.success('Tours actualizados correctamente')
      setSelectedTours([])
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Error al actualizar los tours')
    }
  })

  const tours = toursData?.items || []
  const totalPages = Math.ceil((toursData?.total || 0) / 10)

  const handleFilterChange = (key: keyof ToursFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleSelectTour = (tourId: string, checked: boolean) => {
    if (checked) {
      setSelectedTours(prev => [...prev, tourId])
    } else {
      setSelectedTours(prev => prev.filter(id => id !== tourId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTours(tours.map(tour => tour.id))
    } else {
      setSelectedTours([])
    }
  }

  const handleBulkAction = (action: string) => {
    if (selectedTours.length === 0) {
      toast.error('Selecciona al menos un tour')
      return
    }

    switch (action) {
      case 'activate':
        bulkUpdateMutation.mutate({
          tourIds: selectedTours,
          updateData: { is_active: true }
        })
        break
      case 'deactivate':
        bulkUpdateMutation.mutate({
          tourIds: selectedTours,
          updateData: { is_active: false }
        })
        break
      case 'feature':
        bulkUpdateMutation.mutate({
          tourIds: selectedTours,
          updateData: { is_featured: true }
        })
        break
      case 'unfeature':
        bulkUpdateMutation.mutate({
          tourIds: selectedTours,
          updateData: { is_featured: false }
        })
        break
    }
  }

  const formatPrice = (price: number, originalPrice?: number) => {
    return (
      <div className="text-right">
        {originalPrice && originalPrice > price && (
          <div className="text-xs text-muted-foreground line-through">
            ${originalPrice.toFixed(2)}
          </div>
        )}
        <div className="font-medium">${price.toFixed(2)}</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-red-600 mb-2">Error al cargar los tours</h3>
        <p className="text-muted-foreground mb-4">No se pudieron cargar los tours</p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Tours</h1>
          <p className="text-muted-foreground">
            Administra todos los tours de la plataforma
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Link href="/admin/tours/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Tour
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar tours..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ciudad</label>
              <Select value={filters.city} onValueChange={(value) => handleFilterChange('city', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las ciudades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las ciudades</SelectItem>
                  {Array.isArray(cities) && cities.filter(city => typeof city === 'string' && city.trim() !== '').map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select value={filters.is_active} onValueChange={(value) => handleFilterChange('is_active', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="true">Activos</SelectItem>
                  <SelectItem value="false">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Destacados</label>
              <Select value={filters.is_featured} onValueChange={(value) => handleFilterChange('is_featured', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="true">Destacados</SelectItem>
                  <SelectItem value="false">No destacados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedTours.length > 0 && (
        <Card className="border-primary">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedTours.length} tour(s) seleccionado(s)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('activate')}
                  disabled={bulkUpdateMutation.isPending}
                >
                  Activar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('deactivate')}
                  disabled={bulkUpdateMutation.isPending}
                >
                  Desactivar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('feature')}
                  disabled={bulkUpdateMutation.isPending}
                >
                  Destacar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('unfeature')}
                  disabled={bulkUpdateMutation.isPending}
                >
                  No destacar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tours Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Lista de Tours ({toursData?.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Cargando tours...</span>
            </div>
          ) : tours.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay tours</h3>
              <p className="text-muted-foreground mb-4">
                No se encontraron tours con los filtros aplicados
              </p>
              <Link href="/admin/tours/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primer tour
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedTours.length === tours.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Tour</TableHead>
                    <TableHead>Ciudad</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Destacado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tours.map((tour) => (
                    <TableRow key={tour.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedTours.includes(tour.id)}
                          onCheckedChange={(checked) => handleSelectTour(tour.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={tour.images?.[0] || '/placeholder.svg'}
                            alt={tour.title}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <div className="font-medium">{tour.title}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {tour.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{tour.city}</Badge>
                      </TableCell>
                      <TableCell>
                        {formatPrice(tour.price, tour.original_price || undefined)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{tour.rating}</span>
                          <span className="text-xs text-muted-foreground">
                            ({tour.review_count})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={tour.is_active ? "default" : "secondary"}>
                          {tour.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={tour.is_featured ? "default" : "outline"}>
                          {tour.is_featured ? 'Destacado' : 'Normal'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <Link href={`/tour/${tour.id}`}>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver tour
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/admin/tours/${tour.id}/edit`}>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem
                              onClick={() => toggleFeaturedMutation.mutate(tour.id)}
                              disabled={toggleFeaturedMutation.isPending}
                            >
                              <Star className="h-4 w-4 mr-2" />
                              {tour.is_featured ? 'No destacar' : 'Destacar'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleActiveMutation.mutate(tour.id)}
                              disabled={toggleActiveMutation.isPending}
                            >
                              <Users className="h-4 w-4 mr-2" />
                              {tour.is_active ? 'Desactivar' : 'Activar'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Eliminar
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar tour?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Se eliminará permanentemente el tour
                                    "{tour.title}" y todas sus reservas asociadas.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteTourMutation.mutate(tour.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={deleteTourMutation.isPending}
                                  >
                                    {deleteTourMutation.isPending ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Eliminando...
                                      </>
                                    ) : (
                                      'Eliminar'
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}