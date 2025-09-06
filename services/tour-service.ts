import { createClient, createAdminClient } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

// Define interfaces based on database schema
export type Tour = Database['public']['Tables']['tours']['Row'] & {
  discount_percentage?: number;
  coordinates?: any; // The type from DB is jsonb
}

export type CreateTourRequest = Database['public']['Tables']['tours']['Insert']
export type UpdateTourRequest = Database['public']['Tables']['tours']['Update']
export type TourAvailability = Database['public']['Tables']['tour_availability']['Row']

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  total_pages: number
}

export interface TourFilters {
  city?: string
  search?: string
  min_price?: number
  max_price?: number
  min_rating?: number
  has_availability?: boolean
  is_featured?: boolean
  is_active?: boolean
  max_days?: number
  min_days?: number
  category?: string
  location_type?: 'domestic' | 'international'
  tour_type?: 'tour' | 'ticket'
  destination?: string
  starting_point?: string
  services?: string[]
  duration?: [number, number]
}



export class TourService {
  /**
   * Get paginated list of tours with optional filters
   */
  static async getTours(
    filters: TourFilters = {},
    page = 1,
    size = 12
  ): Promise<PaginatedResponse<Tour>> {
    const supabase = createClient()
    
    let query = supabase
      .from('tours')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .range((page - 1) * size, page * size - 1)
      .order('is_featured', { ascending: false })
      .order('rating', { ascending: false })
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters.city) {
      query = query.eq('city', filters.city)
    }

    if (filters.destination) {
      query = query.eq('city', filters.destination) // Assuming destination maps to city
    }

    if (filters.starting_point) {
      query = query.eq('starting_point', filters.starting_point)
    }
    
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }
    
    if (filters.min_price !== undefined) {
      query = query.gte('price', filters.min_price)
    }
    
    if (filters.max_price !== undefined) {
      query = query.lte('price', filters.max_price)
    }

    if (filters.min_rating !== undefined) {
      query = query.gte('rating', filters.min_rating)
    }

    if (filters.is_featured !== undefined) {
      query = query.eq('is_featured', filters.is_featured)
    }
    
    if (filters.location_type !== undefined) {
      query = query.eq('location_type', filters.location_type)
    }
    
    if (filters.tour_type !== undefined) {
      query = query.eq('tour_type', filters.tour_type)
    }
    
    if (filters.max_days !== undefined) {
      query = query.lte('duration', filters.max_days)
    }
    
    if (filters.min_days !== undefined) {
      query = query.gte('duration', filters.min_days)
    }
    
    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    if (filters.services && filters.services.length > 0) {
      // This is a bit tricky with Supabase. If services are stored in a JSONB array, you'd use `cs` (contains).
      // Assuming `services` is a JSONB column like `["hotel-pickup", "private-tour"]`
      query = query.cs('services', filters.services)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching tours:', error)
      throw new Error(`Failed to fetch tours: ${error.message || 'Unknown database error'}`)
    }

    // Add discount percentage calculation
    const toursWithDiscount = (data || []).map((tour: Tour) => ({
      ...tour,
      discount_percentage: tour.original_price 
        ? Math.round(((tour.original_price - tour.price) / tour.original_price) * 100)
        : undefined
    }))

    return {
      items: toursWithDiscount,
      total: count || 0,
      page,
      size,
      total_pages: Math.ceil((count || 0) / size)
    }
  }

  /**
   * Get single tour by ID
   */
  static async getTour(id: string): Promise<Tour> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('tours')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching tour:', error)
      throw new Error(`Failed to fetch tour: ${error.message}`)
    }

    // Add discount percentage
    const tourWithDiscount = {
      ...data,
      discount_percentage: data.original_price 
        ? Math.round(((data.original_price - data.price) / data.original_price) * 100)
        : undefined
    }

    return tourWithDiscount
  }

  /**
   * Get featured tours
   */
  static async getFeaturedTours(limit = 6, city?: string): Promise<Tour[]> {
    const supabase = createClient()
    
    let query = supabase
      .from('tours')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('rating', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (city) {
      query = query.eq('city', city)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching featured tours:', error)
      throw new Error(`Failed to fetch featured tours: ${error.message}`)
    }

    // Add discount percentage calculation
    const toursWithDiscount = (data || []).map((tour: Tour) => ({
      ...tour,
      discount_percentage: tour.original_price 
        ? Math.round(((tour.original_price - tour.price) / tour.original_price) * 100)
        : undefined
    }))

    return toursWithDiscount
  }

  /**
   * Get available cities
   */
  static async getCities(): Promise<string[]> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('tours')
      .select('city')
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching cities:', error)
      throw new Error(`Failed to fetch cities: ${error.message}`)
    }
    
    // Extract unique cities
    const uniqueCities = [...new Set((data || []).map((tour: { city: string | null }) => tour.city).filter(Boolean))] as string[]
    return uniqueCities.sort()
  }

  /**
   * Search tours by text
   */
  static async searchTours(
    query: string,
    page = 1,
    size = 12
  ): Promise<PaginatedResponse<Tour>> {
    return this.getTours({ search: query }, page, size)
  }

  /**
   * Get tours by category (peru_in, peru_out, one_day, multi_day)
   */
  static async getToursByCategory(
    category: string,
    filters: TourFilters = {},
    page = 1,
    size = 12
  ): Promise<PaginatedResponse<Tour>> {
    return this.getTours({ ...filters, category }, page, size);
  }

  /**
   * Get tours by duration
   */
  static async getToursByDuration(
    maxDays: number | null = null,
    minDays: number | null = null,
    filters: TourFilters = {},
    page = 1,
    size = 12
  ): Promise<PaginatedResponse<Tour>> {
    const durationFilters = { ...filters };
    if (maxDays !== null) {
      durationFilters.max_days = maxDays;
    }
    if (minDays !== null) {
      durationFilters.min_days = minDays;
    }
    return this.getTours(durationFilters, page, size);
  }

  /**
   * Get tours with coordinates for map
   */
  static async getToursWithCoordinates(
    filters: TourFilters = {}
  ): Promise<Tour[]> {
    const supabase = createClient();
    
    let query = supabase
      .from('tours')
      .select('*')
      .eq('is_active', true);
      
    // Apply additional filters
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters.city) {
      query = query.eq('city', filters.city);
    }

    if (filters.tour_type) {
      query = query.eq('tour_type', filters.tour_type);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching tours with coordinates:', error);
      throw new Error(`Failed to fetch tours with coordinates: ${error.message}`);
    }
    
    // Default coordinates for major Peruvian cities
    const cityCoordinates: { [key: string]: [number, number] } = {
      'Lima': [-12.0464, -77.0428],
      'Cusco': [-13.5319, -71.9675],
      'Arequipa': [-16.4090, -71.5375],
      'Trujillo': [-8.1116, -79.0287],
      'Chiclayo': [-6.7714, -79.8371],
      'Piura': [-5.1945, -80.6328],
      'Iquitos': [-3.7437, -73.2516],
      'Huancayo': [-12.0653, -75.2049],
      'Pucallpa': [-8.3791, -74.5539],
      'Tacna': [-18.0056, -70.2533],
      'Ica': [-14.0678, -75.7286],
      'Ayacucho': [-13.1586, -74.2236],
      'Cajamarca': [-7.1561, -78.5150],
      'Puno': [-15.8402, -70.0219],
      'Huaraz': [-9.5277, -77.5278],
      'Tarapoto': [-6.4869, -76.3649],
      'Tumbes': [-3.5669, -80.4515],
      'Chimbote': [-9.0853, -78.5784],
      'Juliaca': [-15.5000, -70.1333],
      'Sullana': [-4.9047, -80.6856],
      'Chincha': [-13.4099, -76.1319],
      'Huánuco': [-9.9306, -76.2422],
      'Pisco': [-13.7103, -76.2056],
      'Paracas': [-13.8608, -76.2511],
      'Nazca': [-14.8249, -74.9281],
      'Machu Picchu': [-13.1631, -72.5450],
      'Ollantaytambo': [-13.2594, -72.2653],
      'Pisac': [-13.4219, -71.8469],
      'Aguas Calientes': [-13.1547, -72.5253],
      'Sacsayhuamán': [-13.5086, -71.9836]
    };
    
    // Add discount percentage calculation and assign coordinates
    const toursWithDiscount = (data || []).map((tour: Tour) => {
      let coordinates = tour.coordinates;
      
      // If no coordinates, try to assign based on city
      if (!coordinates && tour.city) {
        const cityCoords = cityCoordinates[tour.city];
        if (cityCoords) {
          // Add small random offset to avoid overlapping markers
          const randomOffset = () => (Math.random() - 0.5) * 0.01;
          coordinates = [
            cityCoords[0] + randomOffset(),
            cityCoords[1] + randomOffset()
          ];
        }
      }
      
      return {
        ...tour,
        coordinates,
        discount_percentage: tour.original_price 
          ? Math.round(((tour.original_price - tour.price) / tour.original_price) * 100)
          : undefined
      };
    }).filter((tour: Tour) => tour.coordinates); // Only return tours with coordinates
    
    return toursWithDiscount;
  }

  /**
   * Get tours by location type (domestic/international)
   */
  static async getToursByLocationType(
    locationType: 'domestic' | 'international',
    filters: TourFilters = {},
    page = 1,
    size = 12
  ): Promise<PaginatedResponse<Tour>> {
    return this.getTours({ ...filters, location_type: locationType }, page, size);
  }

  /**
   * Get tickets only (tour_type = 'ticket')
   */
  static async getTickets(
    filters: TourFilters = {},
    page = 1,
    size = 12
  ): Promise<PaginatedResponse<Tour>> {
    return this.getTours({ ...filters, tour_type: 'ticket' }, page, size);
  }

  /**
   * Get available ticket categories
   */
  static async getTicketCategories(): Promise<string[]> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('tours')
      .select('category')
      .eq('is_active', true)
      .eq('tour_type', 'ticket')

    if (error) {
      console.error('Error fetching ticket categories:', error)
      throw new Error(`Failed to fetch ticket categories: ${error.message}`)
    }
    
    // Extract unique categories
    const uniqueCategories = [...new Set((data || []).map((tour: { category: string | null }) => tour.category).filter(Boolean))] as string[]
    return uniqueCategories.sort()
  }

  /**
   * Get tour availability for a specific date range
   */
  static async getTourAvailability(
    tourId: string,
    startDate: string,
    endDate: string
  ): Promise<TourAvailability[]> {
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

    return data || []
  }

  /**
   * Create new tour (Admin only)
   */
  static async createTour(tourData: CreateTourRequest): Promise<Tour> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('tours')
      .insert(tourData)
      .select()
      .single()

    if (error) {
      console.error('Error creating tour:', error)
      throw new Error(`Failed to create tour: ${error.message}`)
    }

    return data
  }

  /**
   * Update existing tour (Admin only)
   */
  static async updateTour(id: string, tourData: UpdateTourRequest): Promise<Tour> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('tours')
      .update(tourData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating tour:', error)
      throw new Error(`Failed to update tour: ${error.message}`)
    }

    return data
  }

  /**
   * Delete tour (Admin only)
   */
  static async deleteTour(id: string): Promise<void> {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('tours')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting tour:', error)
      throw new Error(`Failed to delete tour: ${error.message}`)
    }
  }

  /**
   * Bulk update tours (Admin only)
   */
  static async bulkUpdateTours(
    tourIds: string[],
    updateData: UpdateTourRequest
  ): Promise<void> {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('tours')
      .update(updateData)
      .in('id', tourIds)

    if (error) {
      console.error('Error bulk updating tours:', error)
      throw new Error(`Failed to bulk update tours: ${error.message}`)
    }
  }

  /**
   * Upload tour images (Admin only)
   */
  static async uploadTourImages(tourId: string, images: File[]): Promise<string[]> {
    const supabase = createClient()
    const imageUrls: string[] = []
    
    for (const image of images) {
      const fileExt = image.name.split('.').pop()
      const fileName = `${tourId}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('tour-images')
        .upload(fileName, image)
      
      if (error) {
        console.error('Error uploading image:', error)
        throw new Error(`Failed to upload image: ${error.message}`)
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('tour-images')
        .getPublicUrl(fileName)
      
      imageUrls.push(publicUrl)
    }
    
    return imageUrls
  }

  /**
   * Delete tour image (Admin only)
   */
  static async deleteTourImage(tourId: string, imageUrl: string): Promise<void> {
    const supabase = createClient()
    
    // Extract file name from URL
    const urlParts = imageUrl.split('/')
    const fileName = urlParts[urlParts.length - 1]
    
    const { error } = await supabase.storage
      .from('tour-images')
      .remove([fileName])
    
    if (error) {
      console.error('Error deleting image:', error)
      throw new Error(`Failed to delete image: ${error.message}`)
    }
  }

  /**
   * Toggle tour featured status (Admin only)
   */
  static async toggleFeatured(id: string): Promise<Tour> {
    const supabase = createClient()
    
    // First get current status
    const { data: currentTour, error: fetchError } = await supabase
      .from('tours')
      .select('is_featured')
      .eq('id', id)
      .single()
    
    if (fetchError) {
      throw new Error(`Failed to fetch current tour status: ${fetchError.message}`)
    }
    
    // Toggle the status
    const { data, error } = await supabase
      .from('tours')
      .update({ is_featured: !currentTour.is_featured })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error toggling featured status:', error)
      throw new Error(`Failed to toggle featured status: ${error.message}`)
    }

    return data
  }

  /**
   * Toggle tour active status (Admin only)
   */
  static async toggleActive(id: string): Promise<Tour> {
    const supabase = createClient()
    
    // First get current status
    const { data: currentTour, error: fetchError } = await supabase
      .from('tours')
      .select('is_active')
      .eq('id', id)
      .single()
    
    if (fetchError) {
      throw new Error(`Failed to fetch current tour status: ${fetchError.message}`)
    }
    
    // Toggle the status
    const { data, error } = await supabase
      .from('tours')
      .update({ is_active: !currentTour.is_active })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error toggling active status:', error)
      throw new Error(`Failed to toggle active status: ${error.message}`)
    }

    return data
  }

  /**
   * Get tour statistics (Admin only)
   */
  static async getTourStats(): Promise<{
    total_tours: number
    active_tours: number
    featured_tours: number
    average_rating: number
    total_bookings: number
  }> {
    const supabase = createClient()
    
    // Get tour counts and ratings
    const { data: tourData, error: tourError } = await supabase
      .from('tours')
      .select('is_active, is_featured, rating')
    
    if (tourError) {
      throw new Error(`Failed to fetch tour stats: ${tourError.message}`)
    }
    
    // Get booking count
    const { count: bookingCount, error: bookingError } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
    
    if (bookingError) {
      throw new Error(`Failed to fetch booking stats: ${bookingError.message}`)
    }
    
    const tours = tourData || []
    const totalTours = tours.length
    const activeTours = tours.filter((t: Tour) => t.is_active).length
    const featuredTours = tours.filter((t: Tour) => t.is_featured).length
    const averageRating = tours.length > 0 
      ? tours.reduce((sum: number, t: Tour) => sum + (t.rating || 0), 0) / tours.length
      : 0
    
    return {
      total_tours: totalTours,
      active_tours: activeTours,
      featured_tours: featuredTours,
      average_rating: Math.round(averageRating * 100) / 100,
      total_bookings: bookingCount || 0
    }
  }
}