"use client"

import Link from "next/link"
import { Clock } from "lucide-react"
import { TourExcel } from "@/lib/types-excel"

interface TiqetsCardProps {
  tour: TourExcel
  href?: string
}

export const TiqetsCard = ({ tour, href }: TiqetsCardProps) => {
  const cardHref = href || `/tour-excel/${tour.id}`
  
  return (
    <Link href={cardHref} className="block">
      <div className="group cursor-pointer transition-all duration-300 hover:shadow-lg border border-gray-200 rounded-lg bg-white flex-shrink-0 w-full h-[400px] overflow-hidden flex flex-col">
        {/* Imagen */}
        <div className="relative h-48 overflow-hidden">
          <img
            src="/placeholder.svg"
            alt={tour.titulo}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Badge de tipo de tour */}
          <div className="absolute top-3 left-3">
            <div className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-md">
              {tour.tipo_tour}
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4 flex flex-col justify-between h-[200px]">
          <div className="space-y-2">
            {/* Ubicación */}
            <div className="text-xs text-gray-500 uppercase font-medium tracking-wide">
              {tour.location}
            </div>

            {/* Título */}
            <h3 className="font-bold text-lg leading-tight text-gray-900 line-clamp-2">
              {tour.titulo}
            </h3>

            {/* Highlights */}
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {tour.highlights}
            </p>
          </div>

          {/* Footer con duración y precio */}
          <div className="flex items-end justify-between pt-4">
            {/* Duración */}
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-900">{tour.durations_hours}h</span>
            </div>

            {/* Precio */}
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                ${tour.adult.toFixed(2)} US$
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
