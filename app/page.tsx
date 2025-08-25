"use client"

import { Search, Star, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"
import Link from "next/link"

// Static tour data matching the reference design
const tours = [
  {
    id: 1,
    title: "Sagrada Familia",
    location: "BARCELONA",
    city: "Barcelona",
    description: "Ven a ver la obra maestra arquitectónica de Gaudí",
    image: "/sagrada-familia-barcelona-architecture.png",
    rating: 4.7,
    reviews: 80309,
    price: 33.8,
    originalPrice: null,
    discount: null,
  },
  {
    id: 2,
    title: "Tours en bus turístico por Barcelona",
    location: "BARCELONA",
    city: "Barcelona",
    description: "Explora los lugares más destacados de Barcelona a tu ritmo",
    image: "/barcelona-tourist-bus-red-double-decker.png",
    rating: 4.3,
    reviews: 15450,
    price: 22.0,
    originalPrice: null,
    discount: "HASTA -15%",
  },
  {
    id: 3,
    title: "Park Güell",
    location: "BARCELONA",
    city: "Barcelona",
    description: "Descubre el parque más famoso de Gaudí con vistas panorámicas de Barcelona",
    image: "/park-g-ell-barcelona-colorful-mosaics.png",
    rating: 4.5,
    reviews: 45230,
    price: 15.0,
    originalPrice: null,
    discount: null,
  },
  {
    id: 4,
    title: "Parque Warner Madrid",
    location: "MADRID",
    city: "Madrid",
    description:
      "Conoce a superhéroes y súbete a montañas rusas llenas de acción en el mejor parque temático de Madrid",
    image: "/warner-bros-theme-park-madrid-superheroes.png",
    rating: 4.4,
    reviews: 1591,
    price: 41.91,
    originalPrice: null,
    discount: null,
  },
  {
    id: 5,
    title: "Estadio Santiago Bernabéu",
    location: "MADRID",
    city: "Madrid",
    description: "Ve uno de los estadios de fútbol con más historia de Madrid",
    image: "/santiago-bernabeu-stadium-real-madrid.png",
    rating: 4.4,
    reviews: 5453,
    price: 35.0,
    originalPrice: null,
    discount: null,
  },
  {
    id: 6,
    title: "Museo del Prado",
    location: "MADRID",
    city: "Madrid",
    description: "Descubre las obras maestras del arte español en uno de los museos más importantes del mundo",
    image: "/museo-del-prado-madrid-art-gallery.png",
    rating: 4.6,
    reviews: 23450,
    price: 18.0,
    originalPrice: null,
    discount: null,
  },
  {
    id: 7,
    title: "Alcázar de Sevilla",
    location: "SEVILLA",
    city: "Sevilla",
    description: "Explora el palacio real más antiguo de Europa en uso, con jardines espectaculares",
    image: "/alc-zar-sevilla-palace-gardens.png",
    rating: 4.8,
    reviews: 34567,
    price: 13.5,
    originalPrice: null,
    discount: "HASTA -10%",
  },
  {
    id: 8,
    title: "Catedral de Sevilla",
    location: "SEVILLA",
    city: "Sevilla",
    description: "Visita la catedral gótica más grande del mundo y sube a la Giralda",
    image: "/sevilla-cathedral-giralda-tower.png",
    rating: 4.7,
    reviews: 28900,
    price: 12.0,
    originalPrice: null,
    discount: null,
  },
  {
    id: 9,
    title: "Terra Mítica",
    location: "BENIDORM",
    city: "Benidorm",
    description: "Disfruta de las mejores atracciones temáticas en la Costa Blanca",
    image: "/terra-mitica-benidorm-theme-park.png",
    rating: 4.2,
    reviews: 8750,
    price: 32.0,
    originalPrice: null,
    discount: "HASTA -20%",
  },
  {
    id: 10,
    title: "Aqua Natura Benidorm",
    location: "BENIDORM",
    city: "Benidorm",
    description: "Parque acuático con toboganes y piscinas para toda la familia",
    image: "/aqua-natura-benidorm-water-park-slides.png",
    rating: 4.0,
    reviews: 5420,
    price: 25.0,
    originalPrice: null,
    discount: null,
  },
  {
    id: 11,
    title: "Ciudad de las Artes y las Ciencias",
    location: "VALENCIA",
    city: "Valencia",
    description: "Complejo arquitectónico futurista con museos, planetario y oceanográfico",
    image: "/valencia-city-arts-sciences-futuristic-architectur.png",
    rating: 4.6,
    reviews: 19800,
    price: 28.0,
    originalPrice: null,
    discount: null,
  },
  {
    id: 12,
    title: "Oceanográfico Valencia",
    location: "VALENCIA",
    city: "Valencia",
    description: "El acuario más grande de Europa con especies marinas de todo el mundo",
    image: "/oceanographic-valencia-aquarium-marine-life.png",
    rating: 4.5,
    reviews: 15670,
    price: 35.5,
    originalPrice: null,
    discount: "HASTA -15%",
  },
]

const cities = ["Barcelona", "Madrid", "Sevilla", "Benidorm", "Valencia"]

export default function HomePage() {
  const [selectedCity, setSelectedCity] = useState("Barcelona")

  const filteredTours = tours.filter((tour) => tour.city === selectedCity)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Imagen%20de%20WhatsApp%202025-08-24%20a%20las%2017.15.42_d24af432.jpg-G7NYM9lLI8K5LPIQwlxc3kNnoOxAo7.jpeg')`,
          }}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 font-sans">Más formas de descubrir la cultura</h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Monumentos, atracciones y experiencias alucinantes. ¿Cuál será tu próxima aventura?
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
            <span>Más de 50.000.000 de viajeros han reservado con Tiqets</span>
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
                  Las mejores experiencias en museos y atracciones de todo el mundo
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tours Section */}
      <section id="tours" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Los mejores lugares para visitar en España</h2>

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
          <h2 className="text-3xl font-bold mb-8 text-center">Los mejores lugares para visitar en España</h2>

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

          {/* Second Tours Grid - Different tours for Madrid */}
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
