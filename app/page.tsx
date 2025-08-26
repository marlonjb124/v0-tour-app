"use client"

import { Search, Star, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"
import Link from "next/link"

const tours = [
  {
    id: 1,
    title: "Machu Picchu",
    location: "CUSCO",
    city: "Cusco",
    description: "Descubre la ciudadela inca más famosa del mundo, Patrimonio de la Humanidad",
    image: "/machu-picchu-ruins.png",
    rating: 4.9,
    reviews: 125000,
    price: 85.0,
    originalPrice: null,
    discount: null,
  },
  {
    id: 2,
    title: "Valle Sagrado de los Incas",
    location: "CUSCO",
    city: "Cusco",
    description: "Explora los pueblos andinos y sitios arqueológicos del Valle Sagrado",
    image: "/sacred-valley-peru-andes-mountains-terraces.png",
    rating: 4.7,
    reviews: 45230,
    price: 65.0,
    originalPrice: null,
    discount: "HASTA -15%",
  },
  {
    id: 3,
    title: "Sacsayhuamán",
    location: "CUSCO",
    city: "Cusco",
    description: "Fortaleza inca con impresionantes muros de piedra y vistas panorámicas de Cusco",
    image: "/sacsayhuaman-fortress-cusco-stone-walls.png",
    rating: 4.6,
    reviews: 28900,
    price: 25.0,
    originalPrice: null,
    discount: null,
  },
  {
    id: 4,
    title: "Líneas de Nazca",
    location: "ICA",
    city: "Ica",
    description: "Sobrevuela los misteriosos geoglifos de Nazca desde una avioneta",
    image: "/nazca-lines-peru-desert-geoglyphs-aerial-view.png",
    rating: 4.5,
    reviews: 15670,
    price: 120.0,
    originalPrice: null,
    discount: null,
  },
  {
    id: 5,
    title: "Oasis de Huacachina",
    location: "ICA",
    city: "Ica",
    description: "Aventura en el desierto con sandboarding y paseos en buggy",
    image: "/huacachina-oasis-desert-sand-dunes-peru.png",
    rating: 4.4,
    reviews: 12450,
    price: 45.0,
    originalPrice: null,
    discount: "HASTA -20%",
  },
  {
    id: 6,
    title: "Islas Ballestas",
    location: "ICA",
    city: "Ica",
    description: "Observa lobos marinos, pingüinos y aves en las Galápagos peruanas",
    image: "/ballestas-islands-sea-lions-penguins-peru.png",
    rating: 4.3,
    reviews: 18750,
    price: 35.0,
    originalPrice: null,
    discount: null,
  },
  {
    id: 7,
    title: "Centro Histórico de Lima",
    location: "LIMA",
    city: "Lima",
    description: "Recorre la Lima colonial con sus iglesias y palacios virreinales",
    image: "/lima-historic-center-colonial-architecture-cathedr.png",
    rating: 4.2,
    reviews: 34560,
    price: 20.0,
    originalPrice: null,
    discount: null,
  },
  {
    id: 8,
    title: "Barranco y Miraflores",
    location: "LIMA",
    city: "Lima",
    description: "Explora los distritos bohemios con vistas al Pacífico y gastronomía",
    image: "/barranco-miraflores-lima-pacific-ocean-cliffs.png",
    rating: 4.4,
    reviews: 22100,
    price: 30.0,
    originalPrice: null,
    discount: "HASTA -10%",
  },
  {
    id: 9,
    title: "Cañón del Colca",
    location: "AREQUIPA",
    city: "Arequipa",
    description: "Observa cóndores andinos en uno de los cañones más profundos del mundo",
    image: "/colca-canyon-condors-arequipa-peru-andes.png",
    rating: 4.6,
    reviews: 19800,
    price: 75.0,
    originalPrice: null,
    discount: null,
  },
  {
    id: 10,
    title: "Monasterio de Santa Catalina",
    location: "AREQUIPA",
    city: "Arequipa",
    description: "Ciudad dentro de la ciudad, monasterio colonial del siglo XVI",
    image: "/santa-catalina-monastery-arequipa-colonial-archite.png",
    rating: 4.5,
    reviews: 16750,
    price: 15.0,
    originalPrice: null,
    discount: null,
  },
  {
    id: 11,
    title: "Lago Titicaca",
    location: "PUNO",
    city: "Puno",
    description: "Navega por el lago navegable más alto del mundo y visita islas flotantes",
    image: "/lake-titicaca-floating-islands-uros-peru-bolivia.png",
    rating: 4.7,
    reviews: 28900,
    price: 55.0,
    originalPrice: null,
    discount: null,
  },
  {
    id: 12,
    title: "Islas Uros",
    location: "PUNO",
    city: "Puno",
    description: "Conoce las islas artificiales de totora y la cultura ancestral uro",
    image: "/uros-islands-reed-boats-titicaca-traditional-cultu.png",
    rating: 4.3,
    reviews: 21450,
    price: 40.0,
    originalPrice: null,
    discount: "HASTA -15%",
  },
]

const cities = ["Cusco", "Lima", "Arequipa", "Ica", "Puno"]

export default function HomePage() {
  const [selectedCity, setSelectedCity] = useState("Cusco")

  const filteredTours = tours.filter((tour) => tour.city === selectedCity)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/machu-picchu-sunrise-andes-mountains-peru.png')`,
          }}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 font-sans">Descubre la magia del Perú</h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Sitios arqueológicos, paisajes andinos y experiencias únicas. ¿Cuál será tu próxima aventura?
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="flex items-center bg-white rounded-full shadow-lg overflow-hidden">
              <Search className="ml-4 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar destinos y experiencias"
                className="flex-1 border-0 bg-transparent px-4 py-4 text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
              />
              <Button className="m-2 rounded-full bg-primary hover:bg-primary/90">Buscar</Button>
            </div>
          </div>

          {/* Trust Indicator */}
          <div className="mt-8 flex items-center justify-center gap-2 text-sm opacity-80">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span>Más de 50.000.000 de viajeros han reservado con Peru Travel</span>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4 p-6 bg-card rounded-lg">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <div className="w-6 h-6 bg-secondary rounded-full" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Flexibilidad en todo momento</h3>
                <p className="text-muted-foreground">Opciones flexibles de cancelación en todos los establecimientos</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-card rounded-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <div className="w-6 h-6 bg-primary rounded-full" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Reserva con confianza</h3>
                <p className="text-muted-foreground">Reserva desde tu móvil con facilidad y sáltate la cola</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-card rounded-lg">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                <div className="w-6 h-6 bg-accent rounded-full" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Descubre la cultura a tu manera</h3>
                <p className="text-muted-foreground">
                  Las mejores experiencias en sitios arqueológicos y atracciones de todo el Perú
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tours Section */}
      <section id="tours" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Los mejores lugares para visitar en Perú</h2>

          {/* City Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {cities.map((city) => (
              <Button
                key={city}
                variant={selectedCity === city ? "default" : "outline"}
                className={`rounded-full px-6 py-2 ${
                  selectedCity === city ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted border-border"
                }`}
                onClick={() => setSelectedCity(city)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted-foreground/20" />
                  {city}
                </div>
              </Button>
            ))}
          </div>

          {/* Tours Grid */}
          <div className="relative">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTours.map((tour) => (
                <Link key={tour.id} href={`/tour/${tour.id}`}>
                  <Card className="group cursor-pointer hover:shadow-lg transition-shadow duration-200">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={tour.image || "/placeholder.svg"}
                        alt={tour.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      {tour.discount && (
                        <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-500 text-white">
                          {tour.discount}
                        </Badge>
                      )}
                    </div>

                    <CardContent className="p-4">
                      <div className="mb-2">
                        <Badge variant="secondary" className="text-xs font-medium mb-2">
                          {tour.location}
                        </Badge>
                      </div>

                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {tour.title}
                      </h3>

                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{tour.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium text-sm">{tour.rating}</span>
                          <span className="text-muted-foreground text-sm">({tour.reviews.toLocaleString()})</span>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Desde</div>
                          <div className="font-bold text-lg">{tour.price.toFixed(2)} €</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Navigation Arrows */}
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 rounded-full bg-background shadow-lg hover:bg-muted"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 rounded-full bg-background shadow-lg hover:bg-muted"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Second Tours Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Más destinos increíbles en Perú</h2>

          {/* City Filter Tabs - Second Instance */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {cities.map((city) => (
              <Button
                key={`second-${city}`}
                variant={selectedCity === city ? "default" : "outline"}
                className={`rounded-full px-6 py-2 ${
                  selectedCity === city ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted border-border"
                }`}
                onClick={() => setSelectedCity(city)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted-foreground/20" />
                  {city}
                </div>
              </Button>
            ))}
          </div>

          {/* Second Tours Grid */}
          <div className="relative">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTours.map((tour) => (
                <Link key={`second-${tour.id}`} href={`/tour/${tour.id}`}>
                  <Card className="group cursor-pointer hover:shadow-lg transition-shadow duration-200">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={tour.image || "/placeholder.svg"}
                        alt={tour.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      {tour.discount && (
                        <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-500 text-white">
                          {tour.discount}
                        </Badge>
                      )}
                    </div>

                    <CardContent className="p-4">
                      <div className="mb-2">
                        <Badge variant="secondary" className="text-xs font-medium mb-2">
                          {tour.location}
                        </Badge>
                      </div>

                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {tour.title}
                      </h3>

                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{tour.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium text-sm">{tour.rating}</span>
                          <span className="text-muted-foreground text-sm">({tour.reviews.toLocaleString()})</span>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Desde</div>
                          <div className="font-bold text-lg">{tour.price.toFixed(2)} €</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Navigation Arrows */}
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 rounded-full bg-background shadow-lg hover:bg-muted"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 rounded-full bg-background shadow-lg hover:bg-muted"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
