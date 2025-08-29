import { createClient } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'
import { z } from 'zod'

// Type definitions based on Supabase schema
export type Booking = Database['public']['Tables']['bookings']['Row'] & {
  tour?: {
    id: string
    title: string
    description: string
    city: string
    price: number
  }
  user?: {
    id: string
    full_name: string
    email: string
    phone?: string
  }
}

export type BookingCreate = Database['public']['Tables']['bookings']['Insert']
export type BookingUpdate = Database['public']['Tables']['bookings']['Update']
export type TourAvailability = Database['public']['Tables']['tour_availability']['Row']

export interface TimeSlot {
  id: string
  time: string
  available_spots: number
  price?: number
  is_available: boolean
}

export interface AvailabilityCalendarDay {
  date: string
  time_slots: TimeSlot[]
  has_availability: boolean
}

export interface AvailabilityCalendar {
  tour_id: string
  start_date: string
  end_date: string
  days: AvailabilityCalendarDay[]
}

export interface BookingListResponse {
  items: Booking[]
  total: number
  page: number
  size: number
}

export interface BookingRequest {
  tour_id: string
  availability_id: string
  guest_count: number
  booking_date: string
  booking_time: string
  special_requests?: string
}

// Zod schemas for validation
export const bookingRequestSchema = z.object({
  tour_id: z.string().uuid(),
  availability_id: z.string().uuid(),
  guest_count: z.number().min(1).max(20),
  booking_date: z.string(),
  booking_time: z.string(),
  special_requests: z.string().max(500).optional(),
})

export class BookingService {
  // Availability methods
  static async getTourAvailability(
    tourId: string, 
    startDate: string, 
    endDate: string
  ): Promise<AvailabilityCalendar> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('tour_availability')
      .select('*')
      .eq('tour_id', tourId)
      .gte('available_date', startDate)
      .lte('available_date', endDate)
      .eq('is_available', true)
      .order('available_date')

    if (error) {
      console.error('Error fetching tour availability:', error)
      throw new Error(`Failed to fetch tour availability: ${error.message}`)
    }

    // Transform data into calendar format
    const days: AvailabilityCalendarDay[] = (data || []).map(availability => ({
      date: availability.available_date,
      time_slots: (availability.time_slots as string[]).map((time, index) => ({
        id: `${availability.id}-${index}`,
        time,
        available_spots: availability.available_spots,
        is_available: availability.is_available && availability.available_spots > 0
      })),
      has_availability: availability.is_available && availability.available_spots > 0
    }))

    return {
      tour_id: tourId,
      start_date: startDate,
      end_date: endDate,
      days
    }
  }

  static async checkAvailability(
    tourId: string,
    date: string,
    time: string
  ): Promise<TimeSlot | null> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('tour_availability')
      .select('*')
      .eq('tour_id', tourId)
      .eq('available_date', date)
      .eq('is_available', true)
      .single()

    if (error || !data) {
      return null
    }

    // Check if the specific time slot exists
    const timeSlots = data.time_slots as string[]
    const timeIndex = timeSlots.indexOf(time)
    
    if (timeIndex === -1) {
      return null
    }

    return {
      id: `${data.id}-${timeIndex}`,
      time,
      available_spots: data.available_spots,
      is_available: data.is_available && data.available_spots > 0
    }
  }

  // Booking methods
  static async createBooking(bookingData: BookingRequest): Promise<Booking> {
    const supabase = createClient()
    
    // Validate data
    const validatedData = bookingRequestSchema.parse(bookingData)
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('User must be authenticated to create a booking')
    }

    // Get tour information for pricing
    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .select('price')
      .eq('id', validatedData.tour_id)
      .single()

    if (tourError || !tour) {
      throw new Error('Tour not found')
    }

    // Calculate total amount
    const totalAmount = tour.price * validatedData.guest_count

    // Use the safe booking function to avoid race conditions
    const { data, error } = await supabase.rpc('create_booking_safe', {
      p_tour_id: validatedData.tour_id,
      p_user_id: user.id,
      p_availability_id: validatedData.availability_id,
      p_booking_date: validatedData.booking_date,
      p_booking_time: validatedData.booking_time,
      p_guest_count: validatedData.guest_count,
      p_total_amount: totalAmount,
      p_special_requests: validatedData.special_requests || null
    })

    if (error) {
      console.error('Error creating booking:', error)
      throw new Error(`Failed to create booking: ${error.message}`)
    }

    // Fetch the created booking with tour details
    return this.getBooking(data)
  }

  static async getBooking(bookingId: string): Promise<Booking> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        tour:tours(
          id,
          title,
          description,
          city,
          price
        ),
        user:users(
          id,
          full_name,
          email,
          phone
        )
      `)
      .eq('id', bookingId)
      .single()

    if (error) {
      console.error('Error fetching booking:', error)
      throw new Error(`Failed to fetch booking: ${error.message}`)
    }

    return data as Booking
  }

  static async getUserBookings(params?: {
    status?: string
    page?: number
    size?: number
  }): Promise<BookingListResponse> {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('User must be authenticated')
    }

    const page = params?.page || 1
    const size = params?.size || 10
    
    let query = supabase
      .from('bookings')
      .select(`
        *,
        tour:tours(
          id,
          title,
          description,
          city,
          price
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .range((page - 1) * size, page * size - 1)
      .order('created_at', { ascending: false })

    if (params?.status) {
      query = query.eq('status', params.status)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching user bookings:', error)
      throw new Error(`Failed to fetch user bookings: ${error.message}`)
    }

    return {
      items: (data || []) as Booking[],
      total: count || 0,
      page,
      size
    }
  }

  static async getAllBookings(params?: {
    status?: string
    tour_id?: string
    user_id?: string
    start_date?: string
    end_date?: string
    page?: number
    size?: number
  }): Promise<BookingListResponse> {
    const supabase = createClient()
    
    const page = params?.page || 1
    const size = params?.size || 10
    
    let query = supabase
      .from('bookings')
      .select(`
        *,
        tour:tours(
          id,
          title,
          description,
          city,
          price
        ),
        user:users(
          id,
          full_name,
          email,
          phone
        )
      `, { count: 'exact' })
      .range((page - 1) * size, page * size - 1)
      .order('created_at', { ascending: false })

    // Apply filters
    if (params?.status) {
      query = query.eq('status', params.status)
    }
    if (params?.tour_id) {
      query = query.eq('tour_id', params.tour_id)
    }
    if (params?.user_id) {
      query = query.eq('user_id', params.user_id)
    }
    if (params?.start_date) {
      query = query.gte('booking_date', params.start_date)
    }
    if (params?.end_date) {
      query = query.lte('booking_date', params.end_date)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching all bookings:', error)
      throw new Error(`Failed to fetch bookings: ${error.message}`)
    }

    return {
      items: (data || []) as Booking[],
      total: count || 0,
      page,
      size
    }
  }

  static async updateBookingStatus(
    bookingId: string, 
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed',
    adminNote?: string
  ): Promise<Booking> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('bookings')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select(`
        *,
        tour:tours(
          id,
          title,
          description,
          city,
          price
        )
      `)
      .single()

    if (error) {
      console.error('Error updating booking status:', error)
      throw new Error(`Failed to update booking status: ${error.message}`)
    }

    return data as Booking
  }

  static async cancelBooking(
    bookingId: string,
    reason?: string
  ): Promise<Booking> {
    const supabase = createClient()
    
    // First get the booking to restore availability
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('availability_id, guest_count')
      .eq('id', bookingId)
      .single()

    if (fetchError || !booking) {
      throw new Error('Booking not found')
    }

    // Update booking status to cancelled
    const { data, error } = await supabase
      .from('bookings')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select(`
        *,
        tour:tours(
          id,
          title,
          description,
          city,
          price
        )
      `)
      .single()

    if (error) {
      console.error('Error cancelling booking:', error)
      throw new Error(`Failed to cancel booking: ${error.message}`)
    }

    // Restore availability spots
    await supabase
      .from('tour_availability')
      .update({
        available_spots: supabase.raw(`available_spots + ${booking.guest_count}`)
      })
      .eq('id', booking.availability_id)

    return data as Booking
  }

  // Payment methods (to be integrated with PayPal/Stripe)
  static async createPayment(paymentData: PaymentCreate): Promise<PaymentOrder> {
    // This would integrate with your payment provider
    // For now, we'll update the booking payment status
    const supabase = createClient()
    
    const { error } = await supabase
      .from('bookings')
      .update({ payment_status: 'paid' })
      .eq('id', paymentData.booking_id)

    if (error) {
      throw new Error(`Failed to update payment status: ${error.message}`)
    }

    // Return mock payment order - replace with actual payment provider integration
    return {
      id: `pay_${Date.now()}`,
      status: 'completed',
      links: []
    }
  }

  static async createPayPalOrder(
    bookingId: string,
    returnUrl: string,
    cancelUrl: string
  ): Promise<PaymentOrder> {
    // This would integrate with PayPal API
    // Implementation depends on your PayPal integration
    throw new Error('PayPal integration to be implemented')
  }

  static async capturePayPalPayment(
    orderId: string
  ): Promise<{ booking: Booking; payment: any }> {
    // This would integrate with PayPal API
    // Implementation depends on your PayPal integration
    throw new Error('PayPal integration to be implemented')
  }

  static async getBookingStats(params?: {
    start_date?: string
    end_date?: string
  }): Promise<{
    total_bookings: number
    total_revenue: number
    confirmed_bookings: number
    pending_bookings: number
    cancelled_bookings: number
    revenue_by_status: Record<string, number>
    bookings_by_month: Array<{
      month: string
      bookings: number
      revenue: number
    }>
  }> {
    const supabase = createClient()
    
    let query = supabase
      .from('bookings')
      .select('status, total_amount, created_at')

    if (params?.start_date) {
      query = query.gte('created_at', params.start_date)
    }
    if (params?.end_date) {
      query = query.lte('created_at', params.end_date)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching booking stats:', error)
      throw new Error(`Failed to fetch booking stats: ${error.message}`)
    }

    const bookings = data || []
    
    // Calculate statistics
    const totalBookings = bookings.length
    const totalRevenue = bookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + (b.total_amount || 0), 0)
    
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length
    const pendingBookings = bookings.filter(b => b.status === 'pending').length
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length
    
    // Revenue by status
    const revenueByStatus = bookings.reduce((acc, booking) => {
      const status = booking.status || 'unknown'
      acc[status] = (acc[status] || 0) + (booking.total_amount || 0)
      return acc
    }, {} as Record<string, number>)
    
    // Bookings by month (simplified)
    const bookingsByMonth = bookings.reduce((acc, booking) => {
      const month = booking.created_at?.slice(0, 7) || 'unknown' // YYYY-MM
      const existing = acc.find(item => item.month === month)
      
      if (existing) {
        existing.bookings += 1
        existing.revenue += booking.total_amount || 0
      } else {
        acc.push({
          month,
          bookings: 1,
          revenue: booking.total_amount || 0
        })
      }
      
      return acc
    }, [] as Array<{ month: string; bookings: number; revenue: number }>)
    
    return {
      total_bookings: totalBookings,
      total_revenue: totalRevenue,
      confirmed_bookings: confirmedBookings,
      pending_bookings: pendingBookings,
      cancelled_bookings: cancelledBookings,
      revenue_by_status: revenueByStatus,
      bookings_by_month: bookingsByMonth
    }
  }

  // Utility methods
  static formatBookingReference(tourId: string, bookingId: string): string {
    return `PT-${tourId.slice(0, 4)}-${bookingId.slice(-8).toUpperCase()}`
  }

  static calculateTotalAmount(price: number, numberOfPeople: number): number {
    return price * numberOfPeople
  }

  static isBookingCancellable(booking: Booking): boolean {
    const allowedStatuses = ['pending', 'confirmed']
    return allowedStatuses.includes(booking.status || '')
  }

  static canRefundBooking(booking: Booking): boolean {
    return booking.status === 'confirmed' && booking.payment_status === 'paid'
  }
}

export default BookingService