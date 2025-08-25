"use client"

import { useState } from "react"
import { Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TimeSlot {
  time: string
  available: boolean
  price?: number
}

interface AvailableDate {
  date: Date
  timeSlots: TimeSlot[]
}

interface TourCalendarProps {
  tourPrice: number
  onBooking?: (date: Date, time: string) => void
}

export default function TourCalendar({ tourPrice, onBooking }: TourCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Generate mock available dates for the next 30 days
  const generateAvailableDates = (): AvailableDate[] => {
    const dates: AvailableDate[] = []
    const today = new Date()

    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      // Skip some dates to simulate unavailability
      if (date.getDay() === 1 || Math.random() < 0.2) continue

      const timeSlots: TimeSlot[] = [
        { time: "09:00", available: Math.random() > 0.3 },
        { time: "11:00", available: Math.random() > 0.2 },
        { time: "13:00", available: Math.random() > 0.4 },
        { time: "15:00", available: Math.random() > 0.3 },
        { time: "17:00", available: Math.random() > 0.5 },
      ]

      dates.push({ date, timeSlots })
    }

    return dates
  }

  const [availableDates] = useState<AvailableDate[]>(generateAvailableDates())

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

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleBooking = () => {
    if (selectedDate && selectedTime && onBooking) {
      onBooking(selectedDate, selectedTime)
    }
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
                      key={slot.time}
                      variant={selectedTime === slot.time ? "default" : "outline"}
                      size="sm"
                      className={`${!slot.available ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/10"}`}
                      onClick={() => slot.available && handleTimeSelect(slot.time)}
                      disabled={!slot.available}
                    >
                      {slot.time}
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
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="font-medium">Resumen de reserva</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedDate.toLocaleDateString("es-ES")} a las {selectedTime}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Total</div>
                        <div className="text-xl font-bold">{tourPrice.toFixed(2)} €</div>
                      </div>
                    </div>

                    <Button className="w-full bg-primary hover:bg-primary/90" size="lg" onClick={handleBooking}>
                      Confirmar reserva
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
