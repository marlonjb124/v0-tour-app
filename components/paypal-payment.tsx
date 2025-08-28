"use client"

import { useEffect, useState } from "react"
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { BookingService } from "@/services/booking-service"
import { toast } from "react-hot-toast"

interface BookingDetails {
  tourId: string  // Changed to string for API compatibility
  tourTitle: string
  bookingId: string  // Added booking ID for payment processing
  date: Date
  time: string
  price: number
  guestCount: number
}

interface PayPalPaymentProps {
  bookingDetails: BookingDetails
  onSuccess: (transactionId: string, bookingDetails: BookingDetails) => void
  onError: (error: any) => void
  onCancel: () => void
}

interface PayPalButtonWrapperProps {
  bookingDetails: BookingDetails
  onSuccess: (transactionId: string, bookingDetails: BookingDetails) => void
  onError: (error: any) => void
  onCancel: () => void
}

// PayPal buttons wrapper component
function PayPalButtonWrapper({ bookingDetails, onSuccess, onError, onCancel }: PayPalButtonWrapperProps) {
  const [{ isPending, isResolved, isRejected }] = usePayPalScriptReducer()
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)
  const [isCapturingPayment, setIsCapturingPayment] = useState(false)

  if (isPending || isCreatingOrder || isCapturingPayment) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>
          {isPending && 'Cargando PayPal...'}
          {isCreatingOrder && 'Creando orden de pago...'}
          {isCapturingPayment && 'Procesando pago...'}
        </span>
      </div>
    )
  }

  if (isRejected) {
    return (
      <div className="flex items-center justify-center p-8 text-destructive">
        <XCircle className="w-6 h-6 mr-2" />
        <span>Error al cargar PayPal. Por favor, inténtalo de nuevo.</span>
      </div>
    )
  }

  const createOrder = async (data: any, actions: any) => {
    setIsCreatingOrder(true)
    try {
      // Create PayPal order through our backend API
      const returnUrl = `${window.location.origin}/booking/success`
      const cancelUrl = `${window.location.origin}/booking/cancel`
      
      const paypalOrder = await BookingService.createPayPalOrder(
        bookingDetails.bookingId,
        returnUrl,
        cancelUrl
      )
      
      return paypalOrder.id
    } catch (error: any) {
      console.error('Error creating PayPal order:', error)
      toast.error('Error al crear la orden de pago')
      onError(error)
      throw error
    } finally {
      setIsCreatingOrder(false)
    }
  }

  const onApprove = async (data: any, actions: any) => {
    setIsCapturingPayment(true)
    try {
      // Capture payment through our backend API
      const result = await BookingService.capturePayPalPayment(data.orderID)
      
      toast.success('¡Pago completado exitosamente!')
      onSuccess(data.orderID, bookingDetails)
    } catch (error: any) {
      console.error('Error capturing PayPal payment:', error)
      toast.error('Error al procesar el pago')
      onError(error)
    } finally {
      setIsCapturingPayment(false)
    }
  }

  const onErrorHandler = (error: any) => {
    console.error("PayPal payment error:", error)
    onError(error)
  }

  return (
    <PayPalButtons
      style={{
        layout: "vertical",
        color: "gold",
        shape: "rect",
        label: "paypal",
      }}
      createOrder={createOrder}
      onApprove={onApprove}
      onError={onErrorHandler}
      onCancel={onCancel}
    />
  )
}

// Main PayPal Payment component
export default function PayPalPayment({ bookingDetails, onSuccess, onError, onCancel }: PayPalPaymentProps) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setIsReady(true)
  }, [])

  if (!isReady) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Preparando el pago...</span>
      </div>
    )
  }

  const totalAmount = bookingDetails.price * bookingDetails.guestCount

  return (
    <div className="space-y-6">
      {/* Booking Summary */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-4">Resumen de la reserva</h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID de Reserva:</span>
              <span className="font-medium font-mono text-sm">{bookingDetails.bookingId.slice(-8).toUpperCase()}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tour:</span>
              <span className="font-medium">{bookingDetails.tourTitle}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha:</span>
              <span className="font-medium">
                {bookingDetails.date.toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hora:</span>
              <span className="font-medium">{bookingDetails.time}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Huéspedes:</span>
              <span className="font-medium">{bookingDetails.guestCount} persona(s)</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Precio por persona:</span>
              <span className="font-medium">{bookingDetails.price.toFixed(2)} €</span>
            </div>
            
            <hr className="border-muted" />
            
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{totalAmount.toFixed(2)} €</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PayPal Payment */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-4">Método de pago</h3>
          
          <PayPalScriptProvider
            options={{
              "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
              currency: process.env.NEXT_PUBLIC_CURRENCY || "EUR",
              intent: "capture",
            }}
          >
            <PayPalButtonWrapper
              bookingDetails={bookingDetails}
              onSuccess={onSuccess}
              onError={onError}
              onCancel={onCancel}
            />
          </PayPalScriptProvider>
          
          <div className="mt-4 text-xs text-muted-foreground text-center">
            <p>Al hacer clic en "Pagar con PayPal", aceptas nuestros términos y condiciones.</p>
            <p>Tu pago está protegido por la garantía de PayPal.</p>
            <p className="mt-2 font-medium">ID de Reserva: {bookingDetails.bookingId}</p>
          </div>
        </CardContent>
      </Card>

      {/* Cancel Button */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={onCancel}>
          Cancelar reserva
        </Button>
      </div>
    </div>
  )
}