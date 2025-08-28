"use client"

import { CheckCircle2, Calendar, Clock, MapPin, Users, Download, Mail } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface BookingConfirmationProps {
  transactionId: string
  bookingDetails: {
    tourId: string  // Changed to string for API compatibility
    tourTitle: string
    date: Date
    time: string
    price: number
    guestCount: number
  }
  tourInfo: {
    meetingPoint: string
    duration: string
    highlights: string[]
    included: string[]
    cancellation: string
  }
  onDownloadTicket?: () => void
  onEmailTicket?: () => void
  onNewBooking?: () => void
}

export default function BookingConfirmation({
  transactionId,
  bookingDetails,
  tourInfo,
  onDownloadTicket,
  onEmailTicket,
  onNewBooking,
}: BookingConfirmationProps) {
  const totalAmount = bookingDetails.price * bookingDetails.guestCount
  const bookingReference = `PT-${bookingDetails.tourId}-${transactionId.slice(-8).toUpperCase()}`

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success Header */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-green-800 mb-2">¡Reserva confirmada!</h1>
          <p className="text-green-700 text-lg">Tu tour ha sido reservado exitosamente</p>
          
          <div className="mt-6 p-4 bg-white rounded-lg border">
            <p className="text-sm text-muted-foreground mb-1">Referencia de reserva</p>
            <p className="text-xl font-bold text-green-800">{bookingReference}</p>
          </div>
        </CardContent>
      </Card>

      {/* Booking Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Tour Information */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Detalles del tour</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-lg">{bookingDetails.tourTitle}</h4>
                <Badge variant="secondary" className="mt-1">Tour confirmado</Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {bookingDetails.date.toLocaleDateString("es-ES", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{bookingDetails.time}</p>
                    <p className="text-sm text-muted-foreground">Duración: {tourInfo.duration}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{bookingDetails.guestCount} persona(s)</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Punto de encuentro</p>
                    <p className="text-sm text-muted-foreground">{tourInfo.meetingPoint}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Información de pago</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Precio por persona:</span>
                <span className="font-medium">{bookingDetails.price.toFixed(2)} €</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Huéspedes:</span>
                <span className="font-medium">{bookingDetails.guestCount}</span>
              </div>
              
              <hr className="border-muted" />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total pagado:</span>
                <span className="text-green-600">{totalAmount.toFixed(2)} €</span>
              </div>
              
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Método de pago:</span>
                <span>PayPal</span>
              </div>
              
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>ID de transacción:</span>
                <span className="font-mono">{transactionId}</span>
              </div>
            </div>

            <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Cancelación:</strong> {tourInfo.cancellation}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* What's Included */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-4">Qué incluye tu tour</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Lo más destacado:</h4>
              <ul className="space-y-2">
                {tourInfo.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Incluido:</h4>
              <ul className="space-y-2">
                {tourInfo.included.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-4">Próximos pasos</h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <Button onClick={onDownloadTicket} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Descargar ticket
            </Button>
            
            <Button variant="outline" onClick={onEmailTicket} className="w-full">
              <Mail className="w-4 h-4 mr-2" />
              Enviar por email
            </Button>
          </div>
          
          <div className="mt-6 text-center">
            <Button variant="ghost" onClick={onNewBooking}>
              Hacer otra reserva
            </Button>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Información importante:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Llega 15 minutos antes de la hora programada</li>
              <li>• Trae una identificación válida</li>
              <li>• Guarda este comprobante como referencia</li>
              <li>• Para cambios o cancelaciones, contacta a nuestro servicio al cliente</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}