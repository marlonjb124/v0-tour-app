import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { Manrope } from "next/font/google"
import "./globals.css"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Providers } from "@/components/providers"

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
})

export const metadata: Metadata = {
  title: "Tours Perú - Descubre la Cultura",
  description: "Monumentos, atracciones y experiencias alucinantes en Perú. ¿Cuál será tu próxima aventura?",
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body
        className={`${GeistSans.variable} ${manrope.variable} font-sans antialiased w-full overflow-x-hidden`}
      >
        <Providers>
          <div className="min-h-screen flex flex-col w-full">
            <Navigation />
            <main className="flex-1 w-full">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
