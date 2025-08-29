import { createClient } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

type BookingStatus = Database['public']['Enums']['booking_status']

/**
 * Utility functions for common Supabase operations
 */

/**
 * Format Supabase error messages for user display
 */
export function formatSupabaseError(error: any): string {
  if (!error) return 'Error desconocido'

  const message = error.message || error.details || error.hint || 'Error desconocido'

  // Common error patterns and their user-friendly messages
  const errorMappings: Record<string, string> = {
    'duplicate key': 'Ya existe un registro con estos datos',
    'foreign key': 'No se pueden encontrar los datos relacionados',
    'check constraint': 'Los datos proporcionados no son válidos',
    'not null': 'Todos los campos requeridos deben completarse',
    'invalid input': 'Formato de datos inválido',
    'permission denied': 'No tienes permisos para realizar esta acción',
    'row level security': 'No tienes permisos para acceder a estos datos',
    'JWT expired': 'Tu sesión ha expirado, por favor inicia sesión nuevamente',
    'Invalid login': 'Email o contraseña incorrectos',
    'Email not confirmed': 'Por favor confirma tu email antes de continuar',
    'User already registered': 'Ya existe una cuenta con este email'
  }

  // Find matching error pattern
  for (const [pattern, userMessage] of Object.entries(errorMappings)) {
    if (message.toLowerCase().includes(pattern.toLowerCase())) {
      return userMessage
    }
  }

  // Return original message if no pattern matches
  return message
}

/**
 * Generate optimized database queries with proper joins
 */
export class QueryBuilder {
  private supabase = createClient()

  /**
   * Get tours with optimized joins and filtering
   */
  async getTours(options: {
    page?: number
    size?: number
    city?: string
    search?: string
    minPrice?: number
    maxPrice?: number
    isActive?: boolean
    isFeatured?: boolean
    withAvailability?: boolean
  } = {}) {
    const {
      page = 1,
      size = 12,
      city,
      search,
      minPrice,
      maxPrice,
      isActive = true,
      isFeatured,
      withAvailability
    } = options

    let query = this.supabase
      .from('tours')
      .select(
        withAvailability
          ? `
            *,
            tour_availability!inner(
              id,
              available_date,
              available_spots,
              is_available
            )
          `
          : '*',
        { count: 'exact' }
      )
      .eq('is_active', isActive)
      .range((page - 1) * size, page * size - 1)
      .order('is_featured', { ascending: false })
      .order('rating', { ascending: false })
      .order('created_at', { ascending: false })

    // Apply filters
    if (city) query = query.eq('city', city)
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }
    if (minPrice !== undefined) query = query.gte('price', minPrice)
    if (maxPrice !== undefined) query = query.lte('price', maxPrice)
    if (isFeatured !== undefined) query = query.eq('is_featured', isFeatured)
    if (withAvailability) {
      query = query.eq('tour_availability.is_available', true)
      query = query.gt('tour_availability.available_spots', 0)
    }

    return query
  }

  /**
   * Get bookings with user and tour information
   */
  async getBookings(options: {
    page?: number
    size?: number
    userId?: string
    tourId?: string
    status?: BookingStatus
    dateFrom?: string
    dateTo?: string
  } = {}) {
    const {
      page = 1,
      size = 10,
      userId,
      tourId,
      status,
      dateFrom,
      dateTo
    } = options

    let query = this.supabase
      .from('bookings')
      .select(`
        *,
        tour:tours(
          id,
          title,
          description,
          city,
          price,
          duration,
          images
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
    if (userId) query = query.eq('user_id', userId)
    if (tourId) query = query.eq('tour_id', tourId)
    if (status) query = query.eq('status', status)
    if (dateFrom) query = query.gte('booking_date', dateFrom)
    if (dateTo) query = query.lte('booking_date', dateTo)

    return query
  }

  /**
   * Get dashboard analytics
   */
  async getDashboardStats() {
    const [
      { count: totalTours },
      { count: totalBookings },
      { count: totalUsers },
      { data: revenueData }
    ] = await Promise.all([
      this.supabase.from('tours').select('*', { count: 'exact', head: true }),
      this.supabase.from('bookings').select('*', { count: 'exact', head: true }),
      this.supabase.from('users').select('*', { count: 'exact', head: true }),
      this.supabase
        .from('bookings')
        .select('total_amount, created_at')
        .in('payment_status', ['paid'])
    ])

    const totalRevenue = revenueData?.reduce((sum, booking) => 
      sum + (booking.total_amount || 0), 0
    ) || 0

    return {
      totalTours: totalTours || 0,
      totalBookings: totalBookings || 0,
      totalUsers: totalUsers || 0,
      totalRevenue,
      revenueData: revenueData || []
    }
  }
}

/**
 * Data transformation utilities
 */
export class DataTransformers {
  /**
   * Transform tour data for display
   */
  static transformTour(tour: any) {
    return {
      ...tour,
      discountPercentage: tour.original_price 
        ? Math.round(((tour.original_price - tour.price) / tour.original_price) * 100)
        : undefined,
      formattedPrice: new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
      }).format(tour.price),
      formattedOriginalPrice: tour.original_price
        ? new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
          }).format(tour.original_price)
        : undefined
    }
  }

  /**
   * Transform booking data for display
   */
  static transformBooking(booking: any) {
    const statusColorMap: Record<string, string> = {
      pending: 'yellow',
      confirmed: 'green',
      cancelled: 'red',
      completed: 'blue'
    }
    
    return {
      ...booking,
      formattedAmount: new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
      }).format(booking.total_amount),
      formattedDate: new Intl.DateTimeFormat('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(new Date(booking.booking_date)),
      statusColor: statusColorMap[booking.status] || 'gray'
    }
  }

  /**
   * Transform user data for display
   */
  static transformUser(user: any) {
    return {
      ...user,
      initials: user.full_name
        ?.split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U',
      memberSince: new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'long'
      }).format(new Date(user.created_at))
    }
  }

  /**
   * Generate chart data from raw data
   */
  static generateChartData(data: any[], dateField: string, valueField: string, days = 30) {
    const chartData = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateString = date.toISOString().split('T')[0]
      
      const dayData = data.filter(item => 
        item[dateField]?.split('T')[0] === dateString
      )
      
      const value = dayData.reduce((sum, item) => 
        sum + (item[valueField] || 0), 0
      )
      
      chartData.push({
        date: dateString,
        value,
        count: dayData.length,
        formattedDate: new Intl.DateTimeFormat('es-ES', {
          month: 'short',
          day: 'numeric'
        }).format(date)
      })
    }
    
    return chartData
  }
}

/**
 * Real-time subscription manager
 */
export class SubscriptionManager {
  private subscriptions = new Map<string, any>()
  private supabase = createClient()

  /**
   * Subscribe to table changes
   */
  subscribe(
    key: string,
    table: string,
    callback: (payload: any) => void,
    filter?: string
  ) {
    // Clean up existing subscription
    this.unsubscribe(key)

    const subscription = this.supabase
      .channel(`${table}_${key}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter
        },
        callback
      )
      .subscribe()

    this.subscriptions.set(key, subscription)
    return subscription
  }

  /**
   * Unsubscribe from table changes
   */
  unsubscribe(key: string) {
    const subscription = this.subscriptions.get(key)
    if (subscription) {
      this.supabase.removeChannel(subscription)
      this.subscriptions.delete(key)
    }
  }

  /**
   * Clean up all subscriptions
   */
  cleanup() {
    for (const subscription of this.subscriptions.values()) {
      this.supabase.removeChannel(subscription)
    }
    this.subscriptions.clear()
  }
}

/**
 * Cache management for Supabase data
 */
export class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  /**
   * Get cached data if valid
   */
  get<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    const now = Date.now()
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  /**
   * Set data in cache
   */
  set(key: string, data: any, ttl = 5 * 60 * 1000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  /**
   * Clear cache entry
   */
  clear(key: string) {
    this.cache.delete(key)
  }

  /**
   * Clear all cache
   */
  clearAll() {
    this.cache.clear()
  }
}

// Export instances
export const queryBuilder = new QueryBuilder()
export const subscriptionManager = new SubscriptionManager()
export const cacheManager = new CacheManager()