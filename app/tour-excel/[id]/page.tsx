"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { TourExcelService } from "@/services/tour-excel-service"
import { useForceAllFetch } from "@/lib/hooks/use-force-all-fetch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, MapPin, Users, DollarSign, Star, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function TourExcelDetailPage() {
  const params = useParams()
  const tourId = params.id as string

  // Forzar TODOS los fetch cada vez que se navega a esta página
  useForceAllFetch()

  const {
    data: tour,
    isLoading,
    error
  } = useQuery({
    queryKey: ['tour-excel', tourId],
    queryFn: () => TourExcelService.getTourById(tourId),
    enabled: !!tourId,
    retry: 3,
    refetchOnWindowFocus: true,
  })

  const formatDuration = (hours: number) => {
    if (hours <= 4) return `${hours} horas`
    if (hours <= 8) return 'Medio día'
    if (hours <= 12) return 'Día completo'
    if (hours <= 24) return '1 día'
    return `${Math.ceil(hours / 24)} días`
  }

  const getTourTypeColor = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'half day':
        return 'bg-blue-100 text-blue-800'
      case 'full day':
        return 'bg-green-100 text-green-800'
      case 'multi day':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCountryFlag = (country: string) => {
    switch (country.toLowerCase()) {
      case 'perú':
      case 'peru':
        return '🇵🇪'
      case 'bolivia':
        return '🇧🇴'
      case 'ecuador':
        return '🇪🇨'
      case 'chile':
        return '🇨🇱'
      case 'colombia':
        return '🇨🇴'
      default:
        return '🌍'
    }
  }

  const handleBookNow = () => {
    toast.success("Función de reserva en desarrollo")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Tour no encontrado</h1>
          <p className="text-gray-600 mb-6">El tour que buscas no existe o ha sido eliminado.</p>
          <Link href="/tours-excel">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Tours
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link href="/tours-excel" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Tours
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{getCountryFlag(tour.country)}</span>
            <Badge className={getTourTypeColor(tour.tipo_tour)}>
              {tour.tipo_tour}
            </Badge>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {tour.titulo}
          </h1>
          
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{tour.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(tour.durations_hours)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🗣️</span>
              <span>{tour.languages}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Highlights */}
            {tour.highlights && (
              <Card>
                <CardHeader>
                  <CardTitle>Lo que te espera</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {tour.highlights}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Tour Program */}
            {tour.tour_program && (
              <Card>
                <CardHeader>
                  <CardTitle>Programa del Tour</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {tour.tour_program}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Includes */}
            {tour.includes && (
              <Card>
                <CardHeader>
                  <CardTitle>Incluye</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {tour.includes}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Not Includes */}
            {tour.no_includes && (
              <Card>
                <CardHeader>
                  <CardTitle>No Incluye</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {tour.no_includes}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Before You Go */}
            {tour.before_you_go && (
              <Card>
                <CardHeader>
                  <CardTitle>Antes de ir</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {tour.before_you_go}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Accessibility */}
            {tour.accesibilidad && (
              <Card>
                <CardHeader>
                  <CardTitle>Accesibilidad</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {tour.accesibilidad}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Reservar Tour</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Prices */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Adulto</span>
                    <span className="text-xl font-bold text-gray-900">
                      ${tour.adult.toFixed(2)} USD
                    </span>
                  </div>
                  {tour.child > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Niño ({tour.edad_ninos})</span>
                      <span className="text-lg font-semibold text-gray-700">
                        ${tour.child.toFixed(2)} USD
                      </span>
                    </div>
                  )}
                </div>

                {/* Service Characteristics */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-2">Características del Servicio</h4>
                  <p className="text-sm text-gray-600">{tour.caracteristicas_servicio}</p>
                </div>

                {/* Schedule */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-2">Horarios</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div><strong>Rango:</strong> {tour.rango_horario_inicio}</div>
                    <div><strong>Inicio:</strong> {tour.hora_inicio}</div>
                    <div><strong>Fin:</strong> {tour.hora_fin}</div>
                  </div>
                </div>

                {/* Cancellation */}
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    <strong>Cancelación:</strong> {tour.purchase_anticipation_hours} horas antes
                  </p>
                </div>

                {/* Book Button */}
                <Button 
                  onClick={handleBookNow}
                  className="w-full mt-6"
                  size="lg"
                >
                  Reservar Ahora
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

