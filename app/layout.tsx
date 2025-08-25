import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { Manrope } from "next/font/google"
import "./globals.css"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
})

export const metadata: Metadata = {
  title: "Tours España - Descubre la Cultura",
  description: "Monumentos, atracciones y experiencias alucinantes. ¿Cuál será tu próxima aventura?",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${GeistSans.variable} ${manrope.variable}`}>
      <head>
        <style>{`
html {
  font-family: ${manrope.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-manrope: ${manrope.variable};
}
        `}</style>
      </head>
      <body className="font-sans antialiased">
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
