import Link from "next/link"
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-12">
        {/* Mobile Optimized Layout */}
        <div className="block sm:hidden">
          {/* Company Info - Compact */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                  <MapPin className="w-3 h-3 text-primary-foreground" />
                </div>
                <span className="font-bold text-sm">Tours Perú</span>
              </div>
              <p className="text-xs text-muted-foreground leading-tight pr-2">
                Descubre la cultura peruana con nuestros tours únicos.
              </p>
            </div>
            <div className="flex gap-3 mt-1">
              <Facebook className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Twitter className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Instagram className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Links and Destinations in 2 columns */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-sm mb-2">Enlaces rápidos</h4>
              <div className="space-y-1">
                <Link href="/" className="block text-xs text-muted-foreground hover:text-primary transition-colors">
                  Inicio
                </Link>
                <Link href="/#tours" className="block text-xs text-muted-foreground hover:text-primary transition-colors">
                  Tours
                </Link>
                <Link href="/#about" className="block text-xs text-muted-foreground hover:text-primary transition-colors">
                  Sobre nosotros
                </Link>
                <Link href="/#contact" className="block text-xs text-muted-foreground hover:text-primary transition-colors">
                  Contacto
                </Link>
              </div>
            </div>

            {/* Destinations */}
            <div>
              <h4 className="font-semibold text-sm mb-2">Destinos</h4>
              <div className="space-y-1">
                <Link href="/?city=Lima" className="block text-xs text-muted-foreground hover:text-primary transition-colors">
                  Lima
                </Link>
                <Link href="/?city=Cusco" className="block text-xs text-muted-foreground hover:text-primary transition-colors">
                  Cusco
                </Link>
                <Link href="/?city=Arequipa" className="block text-xs text-muted-foreground hover:text-primary transition-colors">
                  Arequipa
                </Link>
                <Link href="/?city=Trujillo" className="block text-xs text-muted-foreground hover:text-primary transition-colors">
                  Trujillo
                </Link>
                <Link href="/?city=Ica" className="block text-xs text-muted-foreground hover:text-primary transition-colors">
                  Ica
                </Link>
              </div>
            </div>
          </div>

          {/* Contact Info - Full width */}
          <div>
            <h4 className="font-semibold text-sm mb-2">Contacto</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3 flex-shrink-0" />
                <span>+51 1 234 5678</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3 flex-shrink-0" />
                <span>info@toursperu.com</span>
              </div>
              <div className="flex items-center gap-1 w-full mt-1">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span>Av. José Larco, 345 - Miraflores, Lima 15074, Perú</span>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t mt-3 pt-3 text-center text-xs text-muted-foreground">
            <p>&copy; 2025 Tours Perú. Todos los derechos reservados.</p>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Company Info */}
          <div className="space-y-2 sm:space-y-3 lg:space-y-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center">
                <MapPin className="w-3 h-3 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-base sm:text-lg">Tours Perú</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Descubre la cultura peruana con nuestros tours únicos y experiencias inolvidables.
            </p>
            <div className="flex gap-3 sm:gap-4">
              <Facebook className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Twitter className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Instagram className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2 sm:space-y-3 lg:space-y-4">
            <h4 className="font-semibold text-sm sm:text-base">Enlaces rápidos</h4>
            <div className="space-y-1 sm:space-y-2">
              <Link href="/" className="block text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">
                Inicio
              </Link>
              <Link href="/#tours" className="block text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">
                Tours
              </Link>
              <Link href="/#about" className="block text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">
                Sobre nosotros
              </Link>
              <Link
                href="/#contact"
                className="block text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Contacto
              </Link>
            </div>
          </div>

          {/* Destinations */}
          <div className="space-y-2 sm:space-y-3 lg:space-y-4">
            <h4 className="font-semibold text-sm sm:text-base">Destinos</h4>
            <div className="space-y-1 sm:space-y-2">
              <Link
                href="/?city=Lima"
                className="block text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Lima
              </Link>
              <Link
                href="/?city=Cusco"
                className="block text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Cusco
              </Link>
              <Link
                href="/?city=Arequipa"
                className="block text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Arequipa
              </Link>
              <Link
                href="/?city=Trujillo"
                className="block text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Trujillo
              </Link>
              <Link
                href="/?city=Ica"
                className="block text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Ica
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 sm:space-y-3 lg:space-y-4">
            <h4 className="font-semibold text-sm sm:text-base">Contacto</h4>
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>+51 1 234 5678</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>info@toursperu.com</span>
              </div>
              <div className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
                <span className="leading-tight">
                  Av. José Larco, 345<br className="hidden sm:block" />
                  <span className="sm:hidden"> - </span>Miraflores, Lima 15074, Perú
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Copyright */}
          <div className="sm:col-span-2 lg:col-span-4 border-t mt-4 sm:mt-6 lg:mt-8 pt-3 sm:pt-4 lg:pt-8 text-center text-xs sm:text-sm text-muted-foreground">
            <p>&copy; 2025 Tours Perú. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
