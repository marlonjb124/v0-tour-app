"use client"

import { notFound } from "next/navigation"
import { Star, MapPin, Clock, Users, ArrowLeft, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import TourCalendar from "@/components/tour-calendar"
import { useQuery } from "@tanstack/react-query"
import { TourService, Tour } from "@/services/tour-service"
import { toast } from "sonner"
import { useState, use } from "react"

interface TourDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function TourDetailPage({ params }: TourDetailPageProps) {
  const resolvedParams = use(params)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // Fetch tour data from API
  const { data: tour, isLoading, error, refetch } = useQuery({
    queryKey: ['tour', resolvedParams.id],
    queryFn: () => TourService.getTour(resolvedParams.id),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 404 errors
      if (error?.response?.status === 404) {
        return false
      }
      return failureCount < 2
    }
  })

  if (error?.response?.status === 404) {
    notFound()
  }

  if (error && error?.response?.status !== 404) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error al cargar el tour</h3>
          <p className="text-muted-foreground mb-4">No se pudo cargar la información del tour</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver a tours
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Cargando información del tour...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!tour) {
    notFound()
  }

  const handleBooking = (bookingId: string, date: Date, time: string) => {
    // Handle successful booking creation
    toast.success(`Reserva ${bookingId.slice(-8).toUpperCase()} creada para ${date.toLocaleDateString("es-ES")} a las ${time}`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver a tours
              </Button>
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-lg">
                <img 
                  src={tour.images?.[selectedImageIndex] || tour.images?.[0] || "/placeholder.svg"} 
                  alt={tour.title} 
                  className="w-full h-96 object-cover" 
                />
                {tour.discount_percentage && (
                  <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-500 text-white">
                    -{tour.discount_percentage}%
                  </Badge>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {tour.images && tour.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {tour.images.map((img: string, index: number) => (
                    <img
                      key={index}
                      src={img || "/placeholder.svg"}
                      alt={`${tour.title} ${index + 1}`}
                      className={`w-full h-20 object-cover rounded cursor-pointer transition-all ${
                        selectedImageIndex === index 
                          ? 'ring-2 ring-primary opacity-100' 
                          : 'hover:opacity-80'
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Tour Info */}
            <div className="space-y-6">
              <div>
                <Badge variant="secondary" className="mb-2">
                  {tour.city?.toUpperCase()}
                </Badge>
                <h1 className="text-3xl font-bold mb-4">{tour.title}</h1>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{tour.rating}</span>
                    <span className="text-muted-foreground">({tour.review_count?.toLocaleString()} reseñas)</span>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6">
                  {tour.full_description || tour.description}
                </p>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">{tour.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">Hasta {tour.max_group_size} personas</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">{tour.city}</span>
                </div>
              </div>

              {/* Pricing */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Desde</div>
                      <div className="flex items-center gap-2">
                        {tour.original_price && tour.original_price > tour.price && (
                          <span className="text-lg text-muted-foreground line-through">
                            ${tour.original_price.toFixed(2)}
                          </span>
                        )}
                        <span className="text-2xl font-bold">${tour.price.toFixed(2)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">por persona</div>
                    </div>
                  </div>

                  <Button className="w-full bg-primary hover:bg-primary/90" size="lg">
                    Reservar ahora
                  </Button>

                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {tour.cancellation_policy}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Highlights */}
            {tour.highlights && tour.highlights.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Lo más destacado</h3>
                  <ul className="space-y-2">
                    {tour.highlights.map((highlight: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* What's Included */}
            {tour.included && tour.included.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Qué incluye</h3>
                  <ul className="space-y-2">
                    {tour.included.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Meeting Point */}
          <Card className="mt-8">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Punto de encuentro</h3>
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <span className="text-sm">{tour.meeting_point}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <TourCalendar 
            tourId={tour.id}
            tourTitle={tour.title}
            tourPrice={tour.price} 
            tourInfo={{
              meetingPoint: tour.meeting_point || '',
              duration: tour.duration || '',
              highlights: tour.highlights || [],
              included: tour.included || [],
              cancellation: tour.cancellation_policy || 'Consultar política de cancelación'
            }}
            onBooking={handleBooking} 
          />
        </div>
      </section>
    </div>
  )
}
