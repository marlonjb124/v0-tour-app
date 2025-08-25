"use client"

import { notFound } from "next/navigation"
import { Star, MapPin, Clock, Users, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import TourCalendar from "@/components/tour-calendar"

// Static tour data (same as in main page)
const tours = [
  {
    id: 1,
    title: "Sagrada Familia",
    location: "BARCELONA",
    city: "Barcelona",
    description: "Ven a ver la obra maestra arquitectónica de Gaudí",
    fullDescription:
      "La Sagrada Familia es la obra maestra inacabada del arquitecto Antoni Gaudí y uno de los monumentos más visitados de España. Esta basílica única combina elementos góticos y Art Nouveau con un diseño innovador que ha fascinado a visitantes durante más de un siglo. Descubre los secretos de su construcción, admira las impresionantes fachadas y sumérgete en un mundo de simbolismo religioso y creatividad arquitectónica sin igual.",
    image: "/sagrada-familia-barcelona-architecture.png",
    gallery: [
      "/sagrada-familia-barcelona-architecture.png",
      "/placeholder.svg?key=sg1",
      "/placeholder.svg?key=sg2",
      "/placeholder.svg?key=sg3",
    ],
    rating: 4.7,
    reviews: 80309,
    price: 33.8,
    originalPrice: null,
    discount: null,
    duration: "1-2 horas",
    groupSize: "Hasta 25 personas",
    highlights: [
      "Acceso sin colas a la Sagrada Familia",
      "Audioguía disponible en español",
      "Vistas panorámicas desde las torres",
      "Acceso al museo de Gaudí",
    ],
    included: [
      "Entrada a la Sagrada Familia",
      "Audioguía en español",
      "Acceso a las torres (opcional)",
      "Mapa del recorrido",
    ],
    meetingPoint: "Carrer de Mallorca, 401, 08013 Barcelona",
    cancellation: "Cancelación gratuita hasta 24 horas antes",
  },
  {
    id: 2,
    title: "Tours en bus turístico por Barcelona",
    location: "BARCELONA",
    city: "Barcelona",
    description: "Explora los lugares más destacados de Barcelona a tu ritmo",
    fullDescription:
      "Descubre Barcelona de la manera más cómoda con nuestro tour en bus turístico. Con paradas en los lugares más emblemáticos de la ciudad, podrás subir y bajar cuando quieras para explorar cada atracción a tu propio ritmo. El recorrido incluye comentarios en audio en múltiples idiomas y te llevará por la Sagrada Familia, Park Güell, Las Ramblas, el Barrio Gótico y mucho más.",
    image: "/barcelona-tourist-bus-red-double-decker.png",
    gallery: [
      "/barcelona-tourist-bus-red-double-decker.png",
      "/placeholder.svg?key=bt1",
      "/placeholder.svg?key=bt2",
      "/placeholder.svg?key=bt3",
    ],
    rating: 4.3,
    reviews: 15450,
    price: 22.0,
    originalPrice: 26.0,
    discount: "HASTA -15%",
    duration: "1-2 días",
    groupSize: "Ilimitado",
    highlights: [
      "Hop-on hop-off en 44 paradas",
      "Audioguía en 16 idiomas",
      "Vistas panorámicas desde el piso superior",
      "Válido por 1 o 2 días",
    ],
    included: ["Ticket de bus hop-on hop-off", "Audioguía multiidioma", "Mapa de rutas", "Descuentos en atracciones"],
    meetingPoint: "Plaça de Catalunya, 08002 Barcelona",
    cancellation: "Cancelación gratuita hasta 24 horas antes",
  },
  // Add more tours as needed...
]

interface TourDetailPageProps {
  params: {
    id: string
  }
}

export default function TourDetailPage({ params }: TourDetailPageProps) {
  const tour = tours.find((t) => t.id === Number.parseInt(params.id))

  if (!tour) {
    notFound()
  }

  const handleBooking = (date: Date, time: string) => {
    // Handle booking logic here
    alert(`Reserva confirmada para ${date.toLocaleDateString("es-ES")} a las ${time}`)
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
                <img src={tour.image || "/placeholder.svg"} alt={tour.title} className="w-full h-96 object-cover" />
                {tour.discount && (
                  <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-500 text-white">
                    {tour.discount}
                  </Badge>
                )}
              </div>

              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-4 gap-2">
                {tour.gallery?.map((img, index) => (
                  <img
                    key={index}
                    src={img || "/placeholder.svg"}
                    alt={`${tour.title} ${index + 1}`}
                    className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ))}
              </div>
            </div>

            {/* Tour Info */}
            <div className="space-y-6">
              <div>
                <Badge variant="secondary" className="mb-2">
                  {tour.location}
                </Badge>
                <h1 className="text-3xl font-bold mb-4">{tour.title}</h1>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{tour.rating}</span>
                    <span className="text-muted-foreground">({tour.reviews.toLocaleString()} reseñas)</span>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6">{tour.fullDescription}</p>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">{tour.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">{tour.groupSize}</span>
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
                        {tour.originalPrice && (
                          <span className="text-lg text-muted-foreground line-through">
                            {tour.originalPrice.toFixed(2)} €
                          </span>
                        )}
                        <span className="text-2xl font-bold">{tour.price.toFixed(2)} €</span>
                      </div>
                      <div className="text-sm text-muted-foreground">por persona</div>
                    </div>
                  </div>

                  <Button className="w-full bg-primary hover:bg-primary/90" size="lg">
                    Reservar ahora
                  </Button>

                  <p className="text-xs text-muted-foreground mt-2 text-center">{tour.cancellation}</p>
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
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Lo más destacado</h3>
                <ul className="space-y-2">
                  {tour.highlights?.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* What's Included */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Qué incluye</h3>
                <ul className="space-y-2">
                  {tour.included?.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Meeting Point */}
          <Card className="mt-8">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Punto de encuentro</h3>
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <span className="text-sm">{tour.meetingPoint}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <TourCalendar tourPrice={tour.price} onBooking={handleBooking} />
        </div>
      </section>
    </div>
  )
}
