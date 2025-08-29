"use client"

import { useState, useEffect } from "react"
import { Calendar, ChevronLeft, ChevronRight, Clock, Users, Minus, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import PayPalPayment from "./paypal-payment"
import BookingConfirmation from "./booking-confirmation"
import { BookingService, type AvailabilityCalendar, type TimeSlot as APITimeSlot } from "@/services/booking-service"
import { useQuery } from "@tanstack/react-query"
import { toast } from "react-hot-toast"
import { useAuth } from "@/contexts/auth-context"

interface TimeSlot {
  id: string
  time: string
  available: boolean
  available_spots: number
  price?: number
}

interface AvailableDate {
  date: Date
  timeSlots: TimeSlot[]
}

interface TourCalendarProps {
  tourId: string  // Changed to string for API compatibility
  tourTitle: string
  tourPrice: number
  tourInfo: {
    meetingPoint: string
    duration: string
    highlights: string[]
    included: string[]
    cancellation: string
  }
  onBooking?: (bookingId: string, date: Date, time: string) => void
}

type BookingStep = 'calendar' | 'payment' | 'confirmation'

export default function TourCalendar({ tourId, tourTitle, tourPrice, tourInfo, onBooking }: TourCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null)
  const [guestCount, setGuestCount] = useState(1)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [currentStep, setCurrentStep] = useState<BookingStep>('calendar')
  const [transactionId, setTransactionId] = useState<string>('')
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [isCreatingBooking, setIsCreatingBooking] = useState(false)
  
  const { user } = useAuth()

  // Get start and end dates for availability query (30 days from now)
  const getDateRange = () => {
    const today = new Date()
    const endDate = new Date()
    endDate.setDate(today.getDate() + 30)
    
    return {
      start: today.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    }
  }

  const { start, end } = getDateRange()
  
  // Fetch availability from API
  const { data: availabilityData, isLoading: isLoadingAvailability, error } = useQuery({
    queryKey: ['tour-availability', tourId, start, end],
    queryFn: () => BookingService.getTourAvailability(tourId, start, end),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!tourId
  })

  // Convert API data to component format
  const availableDates: AvailableDate[] = availabilityData?.days?.map(day => ({
    date: new Date(day.date),
    timeSlots: day.time_slots.map(slot => ({
      id: slot.id,
      time: slot.time,
      available: slot.is_available && slot.available_spots > 0,
      available_spots: slot.available_spots,
      price: slot.price
    }))
  })) || []

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const isDateAvailable = (date: Date) => {
    return availableDates.some((availableDate) => availableDate.date.toDateString() === date.toDateString())
  }

  const isDateSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString()
  }

  const getSelectedDateTimeSlots = () => {
    if (!selectedDate) return []
    const dateData = availableDates.find((d) => d.date.toDateString() === selectedDate.toDateString())
    return dateData?.timeSlots || []
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTime(null)
  }

  const handleTimeSelect = (timeSlot: TimeSlot) => {
    setSelectedTime(timeSlot.time)
    setSelectedTimeSlot(timeSlot)
  }

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedTimeSlot || !user) {
      toast.error('Por favor, completa todos los campos requeridos')
      return
    }

    setIsCreatingBooking(true)
    
    try {
      const bookingData = {
        tour_id: tourId,
        availability_id: selectedTimeSlot.id,
        guest_count: guestCount,
        booking_date: selectedDate.toISOString().split('T')[0],
        booking_time: selectedTime
      }

      const booking = await BookingService.createBooking(bookingData)
      setBookingId(booking.id)
      setCurrentStep('payment')
      toast.success('Reserva creada correctamente')
    } catch (error: any) {
      console.error('Error creating booking:', error)
      toast.error(error.response?.data?.detail || 'Error al crear la reserva')
    } finally {
      setIsCreatingBooking(false)
    }
  }

  const handlePaymentSuccess = (transactionId: string) => {
    setTransactionId(transactionId)
    setCurrentStep('confirmation')
    // Call the original onBooking if provided
    if (onBooking && bookingId && selectedDate && selectedTime) {
      onBooking(bookingId, selectedDate, selectedTime)
    }
  }

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error)
    alert('Error en el pago. Por favor, inténtalo de nuevo.')
  }

  const handlePaymentCancel = () => {
    setCurrentStep('calendar')
  }

  const handleNewBooking = () => {
    setSelectedDate(null)
    setSelectedTime(null)
    setSelectedTimeSlot(null)
    setGuestCount(1)
    setBookingId(null)
    setTransactionId('')
    setCurrentStep('calendar')
  }

  const incrementGuests = () => {
    if (guestCount < 10) {
      setGuestCount(guestCount + 1)
    }
  }

  const decrementGuests = () => {
    if (guestCount > 1) {
      setGuestCount(guestCount - 1)
    }
  }

  // Render payment step
  if (currentStep === 'payment' && selectedDate && selectedTime && bookingId) {
    const bookingDetails = {
      tourId,
      tourTitle,
      bookingId,
      date: selectedDate,
      time: selectedTime,
      price: tourPrice,
      guestCount,
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Finalizar reserva</h3>
          <Button variant="outline" onClick={() => setCurrentStep('calendar')}>
            Volver al calendario
          </Button>
        </div>
        
        <PayPalPayment
          bookingDetails={bookingDetails}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onCancel={handlePaymentCancel}
        />
      </div>
    )
  }

  // Render confirmation step
  if (currentStep === 'confirmation' && selectedDate && selectedTime && transactionId) {
    const bookingDetails = {
      tourId,
      tourTitle,
      date: selectedDate,
      time: selectedTime,
      price: tourPrice,
      guestCount,
    }

    return (
      <BookingConfirmation
        transactionId={transactionId}
        bookingDetails={bookingDetails}
        tourInfo={tourInfo}
        onNewBooking={handleNewBooking}
        onDownloadTicket={() => console.log('Download ticket')}
        onEmailTicket={() => console.log('Email ticket')}
      />
    )
  }

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  const days = getDaysInMonth(currentMonth)

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Selecciona fecha y hora
        </h3>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error al cargar la disponibilidad. Por favor, inténtalo de nuevo.</p>
        </div>
      )}
      
      {isLoadingAvailability ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Cargando disponibilidad...</span>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card>
          <CardContent className="p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h4 className="font-semibold">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h4>
              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                if (!day) {
                  return <div key={index} className="p-2" />
                }

                const isAvailable = isDateAvailable(day)
                const isSelected = isDateSelected(day)
                const isPast = day < new Date()

                return (
                  <Button
                    key={day.toISOString()}
                    variant={isSelected ? "default" : "ghost"}
                    size="sm"
                    className={`p-2 h-10 ${
                      isAvailable && !isPast ? "hover:bg-primary/10 cursor-pointer" : "opacity-50 cursor-not-allowed"
                    } ${isSelected ? "bg-primary text-primary-foreground" : ""}`}
                    onClick={() => isAvailable && !isPast && handleDateSelect(day)}
                    disabled={!isAvailable || isPast}
                  >
                    {day.getDate()}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Time Slots */}
        <Card>
          <CardContent className="p-6">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Horarios disponibles
            </h4>

            {!selectedDate ? (
              <div className="text-center py-8 text-muted-foreground">
                Selecciona una fecha para ver los horarios disponibles
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground mb-4">
                  {selectedDate.toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {getSelectedDateTimeSlots().map((slot) => (
                    <Button
                      key={slot.id}
                      variant={selectedTime === slot.time ? "default" : "outline"}
                      size="sm"
                      className={`${!slot.available ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/10"}`}
                      onClick={() => slot.available && handleTimeSelect(slot)}
                      disabled={!slot.available}
                    >
                      {slot.time}
                      {slot.available && slot.available_spots <= 3 && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {slot.available_spots} disponibles
                        </Badge>
                      )}
                      {!slot.available && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Agotado
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>

                {selectedTime && (
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-4">
                      {/* Guest Count Selector */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Huéspedes
                          </div>
                          <div className="text-sm text-muted-foreground">Selecciona el número de personas</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={decrementGuests}
                            disabled={guestCount <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="font-medium text-lg min-w-[2rem] text-center">{guestCount}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={incrementGuests}
                            disabled={guestCount >= 10}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Booking Summary */}
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="font-medium">Resumen de reserva</div>
                            <div className="text-sm text-muted-foreground">
                              {selectedDate.toLocaleDateString("es-ES")} a las {selectedTime}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">Total</div>
                            <div className="text-xl font-bold">{(tourPrice * guestCount).toFixed(2)} €</div>
                            {guestCount > 1 && (
                              <div className="text-xs text-muted-foreground">
                                {tourPrice.toFixed(2)} € × {guestCount} personas
                              </div>
                            )}
                          </div>
                        </div>

                        <Button 
                          className="w-full bg-primary hover:bg-primary/90" 
                          size="lg" 
                          onClick={handleBooking}
                          disabled={isCreatingBooking || !user}
                        >
                          {isCreatingBooking ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Creando reserva...
                            </>
                          ) : (
                            'Proceder al pago'
                          )}
                        </Button>
                        {!user && (
                          <p className="text-sm text-muted-foreground text-center">
                            Debes iniciar sesión para realizar una reserva
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      )}
    </div>
  )
}
