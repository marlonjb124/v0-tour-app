import { createClient, createAdminClient } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'
import { User } from './auth-service'
import { Tour, PaginatedResponse } from './tour-service'

export interface DashboardStats {
  total_tours: number
  total_bookings: number
  total_revenue: number
  total_users: number
  active_users: number
  revenue_chart: Array<{
    date: string
    revenue: number
  }>
  bookings_chart: Array<{
    date: string
    bookings: number
  }>
  recent_bookings: Array<{
    id: string
    tour_title: string
    user_name: string
    amount: number
    status: string
    created_at: string
  }>
  popular_tours: Array<{
    id: string
    title: string
    bookings_count: number
    revenue: number
  }>
}

export type BookingDetails = Database['public']['Tables']['bookings']['Row'] & {
  tour: {
    title: string
    city: string
    duration: string
  }
  user: {
    full_name: string
    email: string
  }
}

export interface UserFilters {
  search?: string
  role?: 'admin' | 'user'
  is_active?: boolean
}

export interface BookingFilters {
  search?: string
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  payment_status?: 'pending' | 'paid' | 'refunded' | 'failed'
  date_from?: string
  date_to?: string
  tour_id?: string
}

export class AdminService {
  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    const supabase = createClient()
    
    // Get basic counts
    const [
      { count: totalTours },
      { count: totalBookings },
      { count: totalUsers },
      { count: activeUsers }
    ] = await Promise.all([
      supabase.from('tours').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_active', true)
    ])

    // Get revenue data
    const { data: revenueData } = await supabase
      .from('bookings')
      .select('total_amount, created_at')
      .in('payment_status', ['paid'])

    const totalRevenue = (revenueData || []).reduce((sum, booking) => 
      sum + (booking.total_amount || 0), 0
    )

    // Get recent bookings
    const { data: recentBookingsData } = await supabase
      .from('bookings')
      .select(`
        id,
        total_amount,
        status,
        created_at,
        tour:tours(title),
        user:users(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    // Get popular tours
    const { data: popularToursData } = await supabase
      .from('tours')
      .select(`
        id,
        title,
        bookings:bookings(count)
      `)
      .order('review_count', { ascending: false })
      .limit(5)

    // Generate chart data (simplified)
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()

    const revenueChart = last30Days.map(date => ({
      date,
      revenue: (revenueData || [])
        .filter(booking => booking.created_at.split('T')[0] === date)
        .reduce((sum, booking) => sum + (booking.total_amount || 0), 0)
    }))

    const bookingsChart = last30Days.map(date => ({
      date,
      bookings: (recentBookingsData || [])
        .filter(booking => booking.created_at.split('T')[0] === date).length
    }))

    return {
      total_tours: totalTours || 0,
      total_bookings: totalBookings || 0,
      total_revenue: totalRevenue,
      total_users: totalUsers || 0,
      active_users: activeUsers || 0,
      revenue_chart: revenueChart,
      bookings_chart: bookingsChart,
      recent_bookings: (recentBookingsData || []).map(booking => ({
        id: booking.id,
        tour_title: booking.tour?.title || 'Unknown Tour',
        user_name: booking.user?.full_name || 'Unknown User',
        amount: booking.total_amount || 0,
        status: booking.status,
        created_at: booking.created_at
      })),
      popular_tours: (popularToursData || []).map(tour => ({
        id: tour.id,
        title: tour.title,
        bookings_count: tour.bookings?.length || 0,
        revenue: 0 // Would need to calculate from bookings
      }))
    }
  }

  /**
   * Get all tours (admin view)
   */
  static async getTours(
    filters: {
      search?: string
      city?: string
      is_active?: boolean
      is_featured?: boolean
    } = {},
    page = 1,
    size = 20
  ): Promise<PaginatedResponse<Tour>> {
    const supabase = createClient()
    
    let query = supabase
      .from('tours')
      .select('*', { count: 'exact' })
      .range((page - 1) * size, page * size - 1)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }
    if (filters.city) {
      query = query.eq('city', filters.city)
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }
    if (filters.is_featured !== undefined) {
      query = query.eq('is_featured', filters.is_featured)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching tours:', error)
      throw new Error(`Failed to fetch tours: ${error.message}`)
    }

    return {
      items: data || [],
      total: count || 0,
      page,
      size,
      total_pages: Math.ceil((count || 0) / size)
    }
  }

  /**
   * Get all users
   */
  static async getUsers(
    filters: UserFilters = {},
    page = 1,
    size = 20
  ): Promise<PaginatedResponse<User>> {
    const supabase = createClient()
    
    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .range((page - 1) * size, page * size - 1)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
    }
    if (filters.role) {
      query = query.eq('role', filters.role)
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching users:', error)
      throw new Error(`Failed to fetch users: ${error.message}`)
    }

    return {
      items: data || [],
      total: count || 0,
      page,
      size,
      total_pages: Math.ceil((count || 0) / size)
    }
  }

  /**
   * Get user details by ID
   */
  static async getUser(id: string): Promise<User> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching user:', error)
      throw new Error(`Failed to fetch user: ${error.message}`)
    }

    return data
  }

  /**
   * Update user
   */
  static async updateUser(id: string, data: Partial<User>): Promise<User> {
    const supabase = createClient()
    
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      throw new Error(`Failed to update user: ${error.message}`)
    }

    return updatedUser
  }

  /**
   * Delete user
   */
  static async deleteUser(id: string): Promise<void> {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting user:', error)
      throw new Error(`Failed to delete user: ${error.message}`)
    }
  }

  /**
   * Toggle user active status
   */
  static async toggleUserStatus(id: string): Promise<User> {
    const supabase = createClient()
    
    // First get current status
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('is_active')
      .eq('id', id)
      .single()
    
    if (fetchError) {
      throw new Error(`Failed to fetch user status: ${fetchError.message}`)
    }
    
    // Toggle the status
    const { data, error } = await supabase
      .from('users')
      .update({ is_active: !currentUser.is_active })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error toggling user status:', error)
      throw new Error(`Failed to toggle user status: ${error.message}`)
    }

    return data
  }

  /**
   * Get all bookings
   */
  static async getBookings(
    filters: BookingFilters = {},
    page = 1,
    size = 20
  ): Promise<PaginatedResponse<BookingDetails>> {
    const supabase = createClient()
    
    let query = supabase
      .from('bookings')
      .select(`
        *,
        tour:tours(
          title,
          city,
          duration
        ),
        user:users(
          full_name,
          email
        )
      `, { count: 'exact' })
      .range((page - 1) * size, page * size - 1)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.payment_status) {
      query = query.eq('payment_status', filters.payment_status)
    }
    if (filters.date_from) {
      query = query.gte('booking_date', filters.date_from)
    }
    if (filters.date_to) {
      query = query.lte('booking_date', filters.date_to)
    }
    if (filters.tour_id) {
      query = query.eq('tour_id', filters.tour_id)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching bookings:', error)
      throw new Error(`Failed to fetch bookings: ${error.message}`)
    }

    return {
      items: (data || []) as BookingDetails[],
      total: count || 0,
      page,
      size,
      total_pages: Math.ceil((count || 0) / size)
    }
  }

  /**
   * Get booking details by ID
   */
  static async getBooking(id: string): Promise<BookingDetails> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        tour:tours(
          title,
          city,
          duration
        ),
        user:users(
          full_name,
          email
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching booking:', error)
      throw new Error(`Failed to fetch booking: ${error.message}`)
    }

    return data as BookingDetails
  }

  /**
   * Update booking status
   */
  static async updateBookingStatus(
    id: string,
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  ): Promise<BookingDetails> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        tour:tours(
          title,
          city,
          duration
        ),
        user:users(
          full_name,
          email
        )
      `)
      .single()

    if (error) {
      console.error('Error updating booking status:', error)
      throw new Error(`Failed to update booking status: ${error.message}`)
    }

    return data as BookingDetails
  }

  /**
   * Cancel booking and process refund
   */
  static async cancelBooking(id: string, reason?: string): Promise<BookingDetails> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('bookings')
      .update({ 
        status: 'cancelled',
        payment_status: 'refunded'
      })
      .eq('id', id)
      .select(`
        *,
        tour:tours(
          title,
          city,
          duration
        ),
        user:users(
          full_name,
          email
        )
      `)
      .single()

    if (error) {
      console.error('Error cancelling booking:', error)
      throw new Error(`Failed to cancel booking: ${error.message}`)
    }

    return data as BookingDetails
  }

  /**
   * Export data to CSV (simplified implementation)
   */
  static async exportData(
    type: 'tours' | 'users' | 'bookings',
    filters: any = {}
  ): Promise<Blob> {
    const supabase = createClient()
    
    let data: any[] = []
    
    switch (type) {
      case 'tours':
        const { data: tours } = await supabase.from('tours').select('*')
        data = tours || []
        break
      case 'users':
        const { data: users } = await supabase.from('users').select('*')
        data = users || []
        break
      case 'bookings':
        const { data: bookings } = await supabase
          .from('bookings')
          .select(`
            *,
            tour:tours(title),
            user:users(full_name, email)
          `)
        data = bookings || []
        break
    }
    
    // Convert to CSV format
    const csvContent = this.convertToCSV(data)
    return new Blob([csvContent], { type: 'text/csv' })
  }
  
  private static convertToCSV(data: any[]): string {
    if (data.length === 0) return ''
    
    const headers = Object.keys(data[0])
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          return typeof value === 'string' ? `"${value}"` : value
        }).join(',')
      )
    ]
    
    return csvRows.join('\n')
  }

  /**
   * Get system statistics
   */
  static async getSystemStats(): Promise<{
    database_size: string
    total_images: number
    storage_used: string
    api_calls_today: number
    active_sessions: number
  }> {
    // This would require custom functions or external monitoring
    // For now, return mock data
    return {
      database_size: 'N/A',
      total_images: 0,
      storage_used: 'N/A',
      api_calls_today: 0,
      active_sessions: 0
    }
  }

  /**
   * Backup database
   */
  static async createBackup(): Promise<{ backup_id: string; download_url: string }> {
    // This would require custom Edge Functions
    // For now, return mock data
    throw new Error('Database backup feature to be implemented')
  }

  /**
   * Get activity logs (simplified implementation)
   */
  static async getActivityLogs(
    page = 1,
    size = 20,
    filters: {
      user_id?: string
      action?: string
      date_from?: string
      date_to?: string
    } = {}
  ): Promise<PaginatedResponse<{
    id: string
    user_id: string
    action: string
    entity_type: string
    entity_id: string
    details: any
    ip_address: string
    user_agent: string
    created_at: string
    user: {
      full_name: string
      email: string
    }
  }>> {
    // Activity logs would require a separate table and implementation
    // For now, return empty data
    return {
      items: [],
      total: 0,
      page,
      size,
      total_pages: 0
    }
  }
}