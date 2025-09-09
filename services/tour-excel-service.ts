import { createClient } from '@/lib/supabase'
import { TourExcel, TourExcelFilters, PaginatedResponse } from '@/lib/types-excel'

export class TourExcelService {
  /**
   * Obtener lista paginada de tours con filtros opcionales
   */
  static async getTours(
    filters: TourExcelFilters = {},
    page = 1,
    size = 12
  ): Promise<PaginatedResponse<TourExcel>> {
    const supabase = createClient()
    
    let query = supabase
      .from('tours_excel')
      .select('*', { count: 'exact' })
      .range((page - 1) * size, page * size - 1)
      .order('item', { ascending: true })

    // Aplicar filtros
    if (filters.country) {
      query = query.eq('country', filters.country)
    }

    if (filters.location) {
      query = query.eq('location', filters.location)
    }

    if (filters.tipo_tour) {
      query = query.eq('tipo_tour', filters.tipo_tour)
    }

    if (filters.min_duration_hours !== undefined) {
      query = query.gte('durations_hours', filters.min_duration_hours)
    }

    if (filters.max_duration_hours !== undefined) {
      query = query.lte('durations_hours', filters.max_duration_hours)
    }

    if (filters.languages) {
      query = query.ilike('languages', `%${filters.languages}%`)
    }

    if (filters.adult_min !== undefined) {
      query = query.gte('adult', filters.adult_min)
    }

    if (filters.adult_max !== undefined) {
      query = query.lte('adult', filters.adult_max)
    }

    if (filters.child_min !== undefined) {
      query = query.gte('child', filters.child_min)
    }

    if (filters.child_max !== undefined) {
      query = query.lte('child', filters.child_max)
    }

    if (filters.search) {
      query = query.or(`titulo.ilike.%${filters.search}%,highlights.ilike.%${filters.search}%,tour_program.ilike.%${filters.search}%`)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Supabase error:', error)
      throw new Error(`Error fetching tours: ${error.message}`)
    }

    // Validar que los datos sean válidos
    if (!data) {
      console.warn('No data returned from Supabase')
      return {
        items: [],
        total: 0,
        page,
        size,
        totalPages: 0
      }
    }

    return {
      items: data,
      total: count || 0,
      page,
      size,
      totalPages: Math.ceil((count || 0) / size)
    }
  }

  /**
   * Obtener tour por ID
   */
  static async getTourById(id: string): Promise<TourExcel | null> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('tours_excel')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // No encontrado
      }
      throw new Error(`Error fetching tour: ${error.message}`)
    }

    return data
  }

  /**
   * Obtener tours por ubicación
   */
  static async getToursByLocation(
    location: string,
    filters: TourExcelFilters = {},
    page = 1,
    size = 12
  ): Promise<PaginatedResponse<TourExcel>> {
    return this.getTours({ ...filters, location }, page, size)
  }

  /**
   * Obtener tours por tipo
   */
  static async getToursByType(
    tipo_tour: string,
    filters: TourExcelFilters = {},
    page = 1,
    size = 12
  ): Promise<PaginatedResponse<TourExcel>> {
    return this.getTours({ ...filters, tipo_tour }, page, size)
  }

  /**
   * Obtener tours por país
   */
  static async getToursByCountry(
    country: string,
    filters: TourExcelFilters = {},
    page = 1,
    size = 12
  ): Promise<PaginatedResponse<TourExcel>> {
    return this.getTours({ ...filters, country }, page, size)
  }

  /**
   * Obtener todas las ubicaciones únicas
   */
  static async getLocations(): Promise<string[]> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('tours_excel')
      .select('location')
      .order('location')

    if (error) {
      throw new Error(`Error fetching locations: ${error.message}`)
    }

    const uniqueLocations = [...new Set(data?.map(item => item.location) || [])]
    return uniqueLocations
  }

  /**
   * Obtener todos los países únicos
   */
  static async getCountries(): Promise<string[]> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('tours_excel')
      .select('country')
      .order('country')

    if (error) {
      throw new Error(`Error fetching countries: ${error.message}`)
    }

    const uniqueCountries = [...new Set(data?.map(item => item.country) || [])]
    return uniqueCountries
  }

  /**
   * Obtener todos los tipos de tour únicos
   */
  static async getTourTypes(): Promise<string[]> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('tours_excel')
      .select('tipo_tour')
      .order('tipo_tour')

    if (error) {
      throw new Error(`Error fetching tour types: ${error.message}`)
    }

    const uniqueTypes = [...new Set(data?.map(item => item.tipo_tour) || [])]
    return uniqueTypes
  }

  /**
   * Obtener todos los idiomas únicos
   */
  static async getLanguages(): Promise<string[]> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('tours_excel')
      .select('languages')
      .order('languages')

    if (error) {
      throw new Error(`Error fetching languages: ${error.message}`)
    }

    const allLanguages = data?.flatMap(item => 
      item.languages?.split(/[,;-]/).map(lang => lang.trim()) || []
    ) || []
    
    const uniqueLanguages = [...new Set(allLanguages)].filter(lang => lang.length > 0)
    return uniqueLanguages
  }

  /**
   * Obtener estadísticas de precios
   */
  static async getPriceStats(): Promise<{
    min_adult: number;
    max_adult: number;
    avg_adult: number;
    min_child: number;
    max_child: number;
    avg_child: number;
  }> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('tours_excel')
      .select('adult, child')

    if (error) {
      throw new Error(`Error fetching price stats: ${error.message}`)
    }

    const adults = data?.map(item => item.adult) || []
    const children = data?.map(item => item.child) || []

    return {
      min_adult: Math.min(...adults),
      max_adult: Math.max(...adults),
      avg_adult: adults.reduce((sum, price) => sum + price, 0) / adults.length,
      min_child: Math.min(...children),
      max_child: Math.max(...children),
      avg_child: children.reduce((sum, price) => sum + price, 0) / children.length
    }
  }

  /**
   * Buscar tours por texto
   */
  static async searchTours(
    searchTerm: string,
    filters: TourExcelFilters = {},
    page = 1,
    size = 12
  ): Promise<PaginatedResponse<TourExcel>> {
    return this.getTours({ ...filters, search: searchTerm }, page, size)
  }
}

