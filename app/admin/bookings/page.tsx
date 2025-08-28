'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AdminService, type BookingDetails } from '@/services/admin-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Calendar,
  Clock,
  MapPin,
  Users,
  Loader2,
  RefreshCw,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'

interface BookingFilters {
  search: string
  status: string
  payment_status: string
  date_from: string
  date_to: string
}

export default function BookingsManagement() {
  const [filters, setFilters] = useState<BookingFilters>({
    search: '',
    status: '',
    payment_status: '',
    date_from: '',
    date_to: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedBooking, setSelectedBooking] = useState<BookingDetails | null>(null)
  const [isBookingDetailOpen, setIsBookingDetailOpen] = useState(false)
  const pageSize = 10

  const queryClient = useQueryClient()

  // Fetch bookings
  const { data: bookingsData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-bookings', filters, currentPage],
    queryFn: () => AdminService.getBookings(
      {
        search: filters.search || undefined,
        status: filters.status || undefined,
        payment_status: filters.payment_status || undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
      },
      currentPage,
      pageSize
    ),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  // Update booking status mutation
  const updateBookingStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      AdminService.updateBookingStatus(id, status as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] })
      toast.success('Estado de reserva actualizado')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Error al actualizar la reserva')
    }
  })

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      AdminService.cancelBooking(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] })
      toast.success('Reserva cancelada correctamente')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Error al cancelar la reserva')
    }
  })

  const bookings = bookingsData?.items || []
  const totalBookings = bookingsData?.total || 0

  const handleSearch = () => {
    setCurrentPage(1)
    refetch()
  }

  const handleFilterChange = (key: keyof BookingFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleViewBooking = (booking: BookingDetails) => {
    setSelectedBooking(booking)
    setIsBookingDetailOpen(true)
  }

  const handleUpdateStatus = (bookingId: string, status: string) => {
    updateBookingStatusMutation.mutate({ id: bookingId, status })
  }

  const handleCancelBooking = (bookingId: string, reason?: string) => {
    cancelBookingMutation.mutate({ id: bookingId, reason })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: AlertCircle, color: 'text-orange-600' },
      confirmed: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      cancelled: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
      completed: { variant: 'default' as const, icon: CheckCircle, color: 'text-blue-600' },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {status === 'pending' && 'Pendiente'}
        {status === 'confirmed' && 'Confirmada'}
        {status === 'cancelled' && 'Cancelada'}
        {status === 'completed' && 'Completada'}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, color: 'text-orange-600' },
      paid: { variant: 'default' as const, color: 'text-green-600' },
      refunded: { variant: 'outline' as const, color: 'text-blue-600' },
      failed: { variant: 'destructive' as const, color: 'text-red-600' },
    }
    
    const config = statusConfig[paymentStatus as keyof typeof statusConfig] || statusConfig.pending
    
    return (
      <Badge variant={config.variant}>
        {paymentStatus === 'pending' && 'Pendiente'}
        {paymentStatus === 'paid' && 'Pagado'}
        {paymentStatus === 'refunded' && 'Reembolsado'}
        {paymentStatus === 'failed' && 'Fallido'}
      </Badge>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-red-600 mb-2">Error al cargar las reservas</h3>
        <p className="text-muted-foreground mb-4">No se pudieron cargar las reservas</p>
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
          <h1 className="text-3xl font-bold">Gestión de Reservas</h1>
          <p className="text-muted-foreground">
            Administra todas las reservas de tours
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Total Reservas</div>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{totalBookings}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Confirmadas</div>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {bookings.filter(b => b.status === 'confirmed').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Pendientes</div>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {bookings.filter(b => b.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Ingresos Totales</div>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">
              ${bookings.reduce((sum, b) => sum + (b.payment_status === 'paid' ? b.total_amount : 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por usuario, tour o ID..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="confirmed">Confirmadas</SelectItem>
                <SelectItem value="cancelled">Canceladas</SelectItem>
                <SelectItem value="completed">Completadas</SelectItem>
              </SelectContent>
            </Select>

            {/* Payment Status Filter */}
            <Select value={filters.payment_status} onValueChange={(value) => handleFilterChange('payment_status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los pagos</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="paid">Pagado</SelectItem>
                <SelectItem value="refunded">Reembolsado</SelectItem>
                <SelectItem value="failed">Fallido</SelectItem>
              </SelectContent>
            </Select>

            {/* Date From */}
            <Input
              type="date"
              placeholder="Fecha desde"
              value={filters.date_from}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
            />

            {/* Date To */}
            <Input
              type="date"
              placeholder="Fecha hasta"
              value={filters.date_to}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
            />
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={handleSearch} disabled={isLoading}>
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Lista de Reservas ({totalBookings})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Cargando reservas...</span>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay reservas</h3>
              <p className="text-muted-foreground mb-4">
                No se encontraron reservas con los filtros aplicados
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Tour</TableHead>
                  <TableHead>Fecha/Hora</TableHead>
                  <TableHead>Huéspedes</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono text-xs">
                      {booking.id.slice(-8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {booking.user.full_name?.charAt(0) || booking.user.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{booking.user.full_name}</div>
                          <div className="text-xs text-muted-foreground">{booking.user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{booking.tour.title}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {booking.tour.city}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(booking.date).toLocaleDateString('es-ES')}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {booking.time}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="h-3 w-3" />
                        {booking.guest_count}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${booking.total_amount.toFixed(2)}</div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(booking.status)}
                    </TableCell>
                    <TableCell>
                      {getPaymentStatusBadge(booking.payment_status)}
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
                          <DropdownMenuItem onClick={() => handleViewBooking(booking)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver detalles
                          </DropdownMenuItem>
                          <Link href={`/tour/${booking.tour_id}`}>
                            <DropdownMenuItem>
                              <MapPin className="h-4 w-4 mr-2" />
                              Ver tour
                            </DropdownMenuItem>
                          </Link>
                          
                          {booking.status === 'pending' && (
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                              disabled={updateBookingStatusMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Confirmar
                            </DropdownMenuItem>
                          )}
                          
                          {booking.status === 'confirmed' && (
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(booking.id, 'completed')}
                              disabled={updateBookingStatusMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Marcar completada
                            </DropdownMenuItem>
                          )}
                          
                          {['pending', 'confirmed'].includes(booking.status) && (
                            <>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Cancelar reserva
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Cancelar reserva?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción cancelará la reserva del usuario "{booking.user.full_name}" 
                                      para el tour "{booking.tour.title}".
                                      {booking.payment_status === 'paid' && 
                                        ' El reembolso deberá procesarse por separado.'}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleCancelBooking(booking.id, 'Cancelación por administrador')}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Cancelar reserva
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalBookings > pageSize && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || isLoading}
          >
            Anterior
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Página {currentPage} de {Math.ceil(totalBookings / pageSize)}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage >= Math.ceil(totalBookings / pageSize) || isLoading}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Booking Details Dialog */}
      <Dialog open={isBookingDetailOpen} onOpenChange={setIsBookingDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Reserva</DialogTitle>
            <DialogDescription>
              Información completa de la reserva seleccionada
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6">
              {/* Booking Header */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <h3 className="text-lg font-semibold">Reserva #{selectedBooking.id.slice(-8).toUpperCase()}</h3>
                  <p className="text-muted-foreground">
                    Creada {formatDistanceToNow(new Date(selectedBooking.created_at), { addSuffix: true, locale: es })}
                  </p>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(selectedBooking.status)}
                  {getPaymentStatusBadge(selectedBooking.payment_status)}
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Tour Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Información del Tour</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tour</label>
                      <p className="font-medium">{selectedBooking.tour.title}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Ciudad</label>
                      <p>{selectedBooking.tour.city}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Duración</label>
                      <p>{selectedBooking.tour.duration}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Fecha y hora</label>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(selectedBooking.date).toLocaleDateString('es-ES')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedBooking.time}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Customer Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Información del Cliente</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {selectedBooking.user.full_name?.charAt(0) || selectedBooking.user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedBooking.user.full_name}</p>
                        <p className="text-sm text-muted-foreground">{selectedBooking.user.email}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Número de huéspedes</label>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedBooking.guest_count} persona(s)</span>
                      </div>
                    </div>
                    {selectedBooking.special_requests && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Solicitudes especiales</label>
                        <p className="text-sm bg-muted/30 p-2 rounded">{selectedBooking.special_requests}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Payment Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Información de Pago</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Monto total</label>
                      <p className="text-xl font-bold">${selectedBooking.total_amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Estado del pago</label>
                      <div className="mt-1">
                        {getPaymentStatusBadge(selectedBooking.payment_status)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Estado de la reserva</label>
                      <div className="mt-1">
                        {getStatusBadge(selectedBooking.status)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                {selectedBooking.status === 'pending' && (
                  <Button
                    onClick={() => {
                      handleUpdateStatus(selectedBooking.id, 'confirmed')
                      setIsBookingDetailOpen(false)
                    }}
                    disabled={updateBookingStatusMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmar reserva
                  </Button>
                )}
                
                {selectedBooking.status === 'confirmed' && (
                  <Button
                    onClick={() => {
                      handleUpdateStatus(selectedBooking.id, 'completed')
                      setIsBookingDetailOpen(false)
                    }}
                    disabled={updateBookingStatusMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar completada
                  </Button>
                )}

                {['pending', 'confirmed'].includes(selectedBooking.status) && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleCancelBooking(selectedBooking.id, 'Cancelación por administrador')
                      setIsBookingDetailOpen(false)
                    }}
                    disabled={cancelBookingMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelar reserva
                  </Button>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingDetailOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}