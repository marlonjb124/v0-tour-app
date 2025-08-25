"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Menu, X, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="hidden sm:block">Tours España</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Inicio
            </Link>
            <Link href="/#tours" className="text-sm font-medium hover:text-primary transition-colors">
              Tours
            </Link>
            <Link href="/#about" className="text-sm font-medium hover:text-primary transition-colors">
              Sobre nosotros
            </Link>
            <Link href="/#contact" className="text-sm font-medium hover:text-primary transition-colors">
              Contacto
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="text" placeholder="Buscar tours..." className="pl-10 w-64" />
            </div>
            <Button className="bg-primary hover:bg-primary/90">Buscar</Button>
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="sm" className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            <div className="flex flex-col gap-4">
              <Link
                href="/"
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                href="/#tours"
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Tours
              </Link>
              <Link
                href="/#about"
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Sobre nosotros
              </Link>
              <Link
                href="/#contact"
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contacto
              </Link>

              {/* Mobile Search */}
              <div className="pt-4 border-t">
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="text" placeholder="Buscar tours..." className="pl-10" />
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90">Buscar</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
