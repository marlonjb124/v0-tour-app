import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Database types definition
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          date_of_birth: string | null
          country: string | null
          role: 'admin' | 'user'
          is_active: boolean
          is_verified: boolean
          email_notifications: boolean
          sms_notifications: boolean
          created_at: string
          last_login: string | null
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone?: string | null
          date_of_birth?: string | null
          country?: string | null
          role?: 'admin' | 'user'
          is_active?: boolean
          is_verified?: boolean
          email_notifications?: boolean
          sms_notifications?: boolean
          created_at?: string
          last_login?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          date_of_birth?: string | null
          country?: string | null
          role?: 'admin' | 'user'
          is_active?: boolean
          is_verified?: boolean
          email_notifications?: boolean
          sms_notifications?: boolean
          created_at?: string
          last_login?: string | null
          updated_at?: string
        }
      }
      tours: {
        Row: {
          id: string
          title: string
          description: string
          full_description: string | null
          city: string
          location: string
          meeting_point: string
          price: number
          original_price: number | null
          duration: string
          max_group_size: number
          highlights: any[]
          included: any[]
          cancellation_policy: string
          rating: number
          review_count: number
          images: any[]
          is_featured: boolean
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          full_description?: string | null
          city: string
          location: string
          meeting_point: string
          price: number
          original_price?: number | null
          duration: string
          max_group_size: number
          highlights?: any[]
          included?: any[]
          cancellation_policy: string
          rating?: number
          review_count?: number
          images?: any[]
          is_featured?: boolean
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          full_description?: string | null
          city?: string
          location?: string
          meeting_point?: string
          price?: number
          original_price?: number | null
          duration?: string
          max_group_size?: number
          highlights?: any[]
          included?: any[]
          cancellation_policy?: string
          rating?: number
          review_count?: number
          images?: any[]
          is_featured?: boolean
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tour_availability: {
        Row: {
          id: string
          tour_id: string
          available_date: string
          time_slots: any[]
          available_spots: number
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tour_id: string
          available_date: string
          time_slots: any[]
          available_spots: number
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tour_id?: string
          available_date?: string
          time_slots?: any[]
          available_spots?: number
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          tour_id: string
          user_id: string
          availability_id: string
          booking_date: string
          booking_time: string
          guest_count: number
          total_amount: number
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status: 'pending' | 'paid' | 'refunded' | 'failed'
          payment_id: string | null
          special_requests: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tour_id: string
          user_id: string
          availability_id: string
          booking_date: string
          booking_time: string
          guest_count: number
          total_amount: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status?: 'pending' | 'paid' | 'refunded' | 'failed'
          payment_id?: string | null
          special_requests?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tour_id?: string
          user_id?: string
          availability_id?: string
          booking_date?: string
          booking_time?: string
          guest_count?: number
          total_amount?: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status?: 'pending' | 'paid' | 'refunded' | 'failed'
          payment_id?: string | null
          special_requests?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Client-side Supabase client (for browser/client components)
export const createClient = () => {
  return createClientComponentClient<Database>()
}

// Server-side Supabase client (for server components)
export const createServerClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

// Admin client with service role key (for server-side admin operations)
export const createAdminClient = () => {
  if (!supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }
  
  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Standard client for general use
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export type { Database }