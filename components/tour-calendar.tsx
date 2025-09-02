"use client"

import { useState, useEffect } from "react"
import { Calendar, ChevronLeft, ChevronRight, Clock, Users, Minus, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import PayPalPayment from "./paypal-payment"
import BookingConfirmation from "./booking-confirmation"
import QuickRegistration from "./quick-registration"
import { BookingService, type AvailabilityCalendar, type TimeSlot as APITimeSlot } from "@/services/booking-service"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
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

type BookingStep = 'calendar' | 'registration' | 'payment' | 'confirmation'

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
  
  // Safely handle auth context - may not be available on public pages
  let user = null;
  try {
    const authContext = useAuth();
    user = authContext?.user || null;
  } catch (error) {
    // AuthProvider not available - user remains null
    user = null;
  }

  // Get start and end dates for availability query (6 months from now to support navigation)
  const getDateRange = () => {
    const today = new Date()
    const endDate = new Date()
    endDate.setDate(today.getDate() + 180) // 6 months ahead
    
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
    if (!selectedDate || !selectedTime || !selectedTimeSlot) {
      toast.error('Por favor, completa todos los campos requeridos')
      return
    }

    // If user is not logged in, show registration form
    if (!user) {
      setCurrentStep('registration')
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

  const handleRegistrationSuccess = () => {
    setCurrentStep('calendar')
    // Trigger booking creation after successful registration
    setTimeout(() => {
      handleBooking()
    }, 500)
  }

  const handleRegistrationCancel = () => {
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

  // Render registration step
  if (currentStep === 'registration') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Completa tu reserva</h3>
          <Button variant="outline" onClick={() => setCurrentStep('calendar')}>
            Volver al calendario
          </Button>
        </div>
        
        <QuickRegistration
          tourTitle={tourTitle}
          onSuccess={handleRegistrationSuccess}
          onCancel={handleRegistrationCancel}
        />
      </div>
    )
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

  // Only show current month instead of multiple months
  const displayMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const today = new Date()
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const isPreviousMonthDisabled = currentMonth <= currentMonthStart

  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    // Don't allow going to past months
    if (newMonth >= currentMonthStart) {
      setCurrentMonth(newMonth)
    }
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Selecciona fecha y hora</span>
          <span className="sm:hidden">Fecha y hora</span>
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
        <div className="space-y-4 sm:space-y-6">
          {/* Single Month Calendar with Navigation */}
          <Card className="shadow-lg">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              {/* Month Header with Navigation */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={goToPreviousMonth}
                  disabled={isPreviousMonthDisabled}
                  className="flex items-center gap-1 sm:gap-2 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed px-2 sm:px-3"
                >
                  <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Anterior</span>
                  <span className="sm:hidden text-xs">Ant</span>
                </Button>
                
                <h4 className="text-base sm:text-lg lg:text-xl font-bold text-center flex-1 mx-2 sm:mx-0">
                  <span className="hidden sm:inline">{monthNames[displayMonth.getMonth()]} {displayMonth.getFullYear()}</span>
                  <span className="sm:hidden">{monthNames[displayMonth.getMonth()].slice(0, 3)} {displayMonth.getFullYear()}</span>
                </h4>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={goToNextMonth}
                  className="flex items-center gap-1 sm:gap-2 hover:bg-muted px-2 sm:px-3"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <span className="sm:hidden text-xs">Sig</span>
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-xs sm:text-sm font-semibold text-muted-foreground p-1 sm:p-2">
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.slice(0, 1)}</span>
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {getDaysInMonth(displayMonth).map((day, index) => {
                  if (!day) {
                    return <div key={index} className="p-1 sm:p-2" />
                  }

                  const isAvailable = isDateAvailable(day)
                  const isSelected = isDateSelected(day)
                  const isPast = day < new Date()
                  const isToday = day.toDateString() === new Date().toDateString()

                  return (
                    <Button
                      key={day.toISOString()}
                      variant={isSelected ? "default" : "ghost"}
                      size="sm"
                      className={`
                        p-1 sm:p-2 h-8 sm:h-10 lg:h-12 text-xs sm:text-sm font-medium relative transition-all duration-200 min-w-0
                        ${
                          isAvailable && !isPast 
                            ? "hover:bg-primary/10 cursor-pointer hover:scale-105" 
                            : "opacity-50 cursor-not-allowed"
                        } 
                        ${
                          isSelected 
                            ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg scale-105" 
                            : ""
                        }
                        ${
                          isToday && !isSelected
                            ? "ring-1 sm:ring-2 ring-primary ring-offset-1 sm:ring-offset-2 font-bold"
                            : ""
                        }
                        ${
                          isAvailable && !isPast && !isSelected
                            ? "border-primary/20 bg-primary/5"
                            : ""
                        }
                      `}
                      onClick={() => isAvailable && !isPast && handleDateSelect(day)}
                      disabled={!isAvailable || isPast}
                    >
                      <span className="relative z-10">{day.getDate()}</span>
                      {isAvailable && !isPast && (
                        <div className="absolute bottom-0.5 sm:bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full" />
                      )}
                      {isToday && (
                        <div className="absolute top-0.5 sm:top-1 right-0.5 sm:right-1 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-blue-500 rounded-full" />
                      )}
                    </Button>
                  )
                })}
              </div>
              
              {/* Month Info */}
              <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-muted-foreground">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                  <span className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-green-500 rounded-full" />
                    <span className="text-xs">Disponible</span>
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    <span className="text-xs">Hoy</span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Slots */}
          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <h4 className="font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                Horarios disponibles
              </h4>

              {!selectedDate ? (
                <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm sm:text-base">
                  <span className="hidden sm:inline">Selecciona una fecha para ver los horarios disponibles</span>
                  <span className="sm:hidden">Selecciona una fecha primero</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                    {selectedDate.toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {getSelectedDateTimeSlots().map((slot) => (
                      <Button
                        key={slot.id}
                        variant={selectedTime === slot.time ? "default" : "outline"}
                        size="sm"
                        className={`${!slot.available ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/10"} text-xs sm:text-sm`}
                        onClick={() => slot.available && handleTimeSelect(slot)}
                        disabled={!slot.available}
                      >
                        {slot.time}
                        {slot.available && slot.available_spots <= 3 && (
                          <Badge variant="outline" className="ml-1 sm:ml-2 text-xs">
                            <span className="hidden sm:inline">{slot.available_spots} disponibles</span>
                            <span className="sm:hidden">{slot.available_spots}</span>
                          </Badge>
                        )}
                        {!slot.available && (
                          <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
                            <span className="hidden sm:inline">Agotado</span>
                            <span className="sm:hidden">Full</span>
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>

                  {selectedTime && (
                    <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-muted/50 rounded-lg">
                      <div className="space-y-3 sm:space-y-4">
                        {/* Guest Count Selector */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                          <div>
                            <div className="font-medium flex items-center gap-2 text-sm sm:text-base">
                              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                              Huéspedes
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              <span className="hidden sm:inline">Selecciona el número de personas</span>
                              <span className="sm:hidden">Número de personas</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={decrementGuests}
                              disabled={guestCount <= 1}
                              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                            >
                              <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                            <span className="font-medium text-base sm:text-lg min-w-[2rem] text-center">{guestCount}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={incrementGuests}
                              disabled={guestCount >= 10}
                              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                            >
                              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Booking Summary */}
                        <div className="border-t pt-3 sm:pt-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
                            <div>
                              <div className="font-medium text-sm sm:text-base">Resumen de reserva</div>
                              <div className="text-xs sm:text-sm text-muted-foreground">
                                {selectedDate.toLocaleDateString("es-ES", { 
                                  day: 'numeric', 
                                  month: 'short' 
                                })} a las {selectedTime}
                              </div>
                            </div>
                            <div className="text-left sm:text-right">
                              <div className="text-xs sm:text-sm text-muted-foreground">Total</div>
                              <div className="text-lg sm:text-xl font-bold">{(tourPrice * guestCount).toFixed(2)} €</div>
                              {guestCount > 1 && (
                                <div className="text-xs text-muted-foreground">
                                  {tourPrice.toFixed(2)} € × {guestCount} personas
                                </div>
                              )}
                            </div>
                          </div>

                          <Button 
                            className="w-full bg-primary hover:bg-primary/90 text-sm sm:text-base" 
                            size="lg" 
                            onClick={handleBooking}
                            disabled={isCreatingBooking}
                          >
                            {isCreatingBooking ? (
                              <>
                                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin mr-2" />
                                <span className="hidden sm:inline">Creando reserva...</span>
                                <span className="sm:hidden">Creando...</span>
                              </>
                            ) : (
                              <>
                                <span className="hidden sm:inline">
                                  {user ? 'Proceder al pago' : 'Continuar reserva'}
                                </span>
                                <span className="sm:hidden">Reservar</span>
                              </>
                            )}
                          </Button>
                          {!user && (
                            <p className="text-xs sm:text-sm text-muted-foreground text-center mt-2">
                              <span className="hidden sm:inline">Se te pedirá crear una cuenta o iniciar sesión</span>
                              <span className="sm:hidden">Registro rápido requerido</span>
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
