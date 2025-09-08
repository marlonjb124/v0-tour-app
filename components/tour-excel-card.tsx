"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, MapPin, Users, DollarSign, Star } from "lucide-react"
import { TourExcel } from "@/lib/types-excel"

interface TourExcelCardProps {
  tour: TourExcel
}

export function TourExcelCard({ tour }: TourExcelCardProps) {
  const formatDuration = (hours: number) => {
    if (hours <= 4) return `${hours}h`
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

  return (
    <Link href={`/tour-excel/${tour.id}`} className="block">
      <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg border border-gray-200 rounded-lg bg-white h-full flex flex-col">
        <CardContent className="p-4 flex flex-col h-full">
          {/* Header con país y tipo */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getCountryFlag(tour.country)}</span>
              <span className="text-sm text-gray-600">{tour.country}</span>
            </div>
            <Badge className={getTourTypeColor(tour.tipo_tour)}>
              {tour.tipo_tour}
            </Badge>
          </div>

          {/* Ubicación */}
          <div className="flex items-center gap-1 mb-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{tour.location}</span>
          </div>

          {/* Título */}
          <h3 className="font-bold text-lg leading-tight text-gray-900 mb-3 line-clamp-2">
            {tour.titulo}
          </h3>

          {/* Highlights */}
          {tour.highlights && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {tour.highlights}
            </p>
          )}

          {/* Información del tour */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(tour.durations_hours)}</span>
              <span>•</span>
              <span>{tour.rango_horario_inicio}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>{tour.caracteristicas_servicio}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>🗣️</span>
              <span>{tour.languages}</span>
            </div>
          </div>

          {/* Precios */}
          <div className="mt-auto">
            <div className="flex items-center justify-between">
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-1">Adulto</div>
                <div className="text-lg font-bold text-gray-900">
                  ${tour.adult.toFixed(2)} USD
                </div>
              </div>
              {tour.child > 0 && (
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-1">Niño</div>
                  <div className="text-sm font-semibold text-gray-700">
                    ${tour.child.toFixed(2)} USD
                  </div>
                </div>
              )}
            </div>
            
            {tour.edad_ninos && (
              <div className="text-xs text-gray-500 mt-1">
                Edad niños: {tour.edad_ninos}
              </div>
            )}
          </div>

          {/* Información adicional */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Cancelación: {tour.purchase_anticipation_hours}h antes</span>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>4.5</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

