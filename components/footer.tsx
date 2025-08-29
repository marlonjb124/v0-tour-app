import Link from "next/link"
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">Tours Perú</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Descubre la cultura española con nuestros tours únicos y experiencias inolvidables.
            </p>
            <div className="flex gap-4">
              <Facebook className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Twitter className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Instagram className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Enlaces rápidos</h4>
            <div className="space-y-2">
              <Link href="/" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Inicio
              </Link>
              <Link href="/#tours" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Tours
              </Link>
              <Link href="/#about" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Sobre nosotros
              </Link>
              <Link
                href="/#contact"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Contacto
              </Link>
            </div>
          </div>

          {/* Destinations */}
          <div className="space-y-4">
            <h4 className="font-semibold">Destinos</h4>
            <div className="space-y-2">
              <Link
                href="/?city=Lima"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Lima
              </Link>
              <Link
                href="/?city=Cusco"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Cusco
              </Link>
              <Link
                href="/?city=Arequipa"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Arequipa
              </Link>
              <Link
                href="/?city=Trujillo"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Trujillo
              </Link>
              <Link
                href="/?city=Ica"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Ica
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold">Contacto</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>+51 1 234 5678</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>info@toursperu.com</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>
                  Av. José Larco, 345
                  <br />
                  Miraflores, Lima 15074, Perú
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Tours Perú. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
