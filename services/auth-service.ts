import { createClient, createServerClient } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export type User = Database['public']['Tables']['users']['Row']

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: SupabaseUser
  profile: User
  session: any
}

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
}

export interface ResetPasswordRequest {
  email: string
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}

export class AuthService {
  /**
   * Login user with email and password
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    })

    if (error) {
      console.error('Login error:', error)
      throw new Error(`Login failed: ${error.message}`)
    }

    if (!data.user) {
      throw new Error('Login failed: No user data received')
    }

    // Get user profile from database
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      throw new Error(`Failed to fetch user profile: ${profileError.message}`)
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.user.id)

    return {
      user: data.user,
      profile: userProfile,
      session: data.session
    }
  }

  /**
   * Register new user
   */
  static async register(userData: RegisterRequest): Promise<LoginResponse> {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.full_name
        }
      }
    })

    if (error) {
      console.error('Registration error:', error)
      throw new Error(`Registration failed: ${error.message}`)
    }

    if (!data.user) {
      throw new Error('Registration failed: No user data received')
    }

    // Create user profile in database
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: userData.email,
        full_name: userData.full_name,
        role: 'user',
        is_active: true,
        is_verified: false,
        email_notifications: true,
        sms_notifications: false
      })
      .select()
      .single()

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // If profile creation fails, we should still return the auth data
      // The profile will be created on next login attempt
    }

    return {
      user: data.user,
      profile: userProfile || {
        id: data.user.id,
        email: userData.email,
        full_name: userData.full_name,
        phone: null,
        date_of_birth: null,
        country: null,
        role: 'user' as const,
        is_active: true,
        is_verified: false,
        email_notifications: true,
        sms_notifications: false,
        created_at: new Date().toISOString(),
        last_login: null,
        updated_at: new Date().toISOString()
      },
      session: data.session
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(): Promise<User | null> {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return null
    }

    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return null
    }

    return userProfile
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    const supabase = createClient()
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Logout error:', error)
      throw new Error(`Logout failed: ${error.message}`)
    }
  }

  /**
   * Refresh access token (handled automatically by Supabase)
   */
  static async refreshToken(): Promise<string> {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.refreshSession()
    
    if (error) {
      throw new Error(`Token refresh failed: ${error.message}`)
    }
    
    return data.session?.access_token || ''
  }

  /**
   * Change user password
   */
  static async changePassword(data: ChangePasswordRequest): Promise<void> {
    const supabase = createClient()
    
    const { error } = await supabase.auth.updateUser({
      password: data.new_password
    })
    
    if (error) {
      console.error('Password change error:', error)
      throw new Error(`Password change failed: ${error.message}`)
    }
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(data: ResetPasswordRequest): Promise<void> {
    const supabase = createClient()
    
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    
    if (error) {
      console.error('Password reset error:', error)
      throw new Error(`Password reset failed: ${error.message}`)
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const supabase = createClient()
    
    const { data: { session } } = await supabase.auth.getSession()
    return !!session
  }

  /**
   * Check if user has admin role
   */
  static async isAdmin(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser()
      return user?.role === 'admin'
    } catch (error) {
      return false
    }
  }

  /**
   * Get current session
   */
  static async getSession() {
    const supabase = createClient()
    
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }

  /**
   * Update user profile
   */
  static async updateProfile(profileData: Partial<User>): Promise<User> {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    const { data, error } = await supabase
      .from('users')
      .update(profileData)
      .eq('id', user.id)
      .select()
      .single()
    
    if (error) {
      console.error('Profile update error:', error)
      throw new Error(`Profile update failed: ${error.message}`)
    }
    
    return data
  }

  /**
   * Create user profile (used during registration)
   */
  static async createUserProfile(userId: string, email: string, fullName: string): Promise<User> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        full_name: fullName,
        role: 'user',
        is_active: true,
        is_verified: false,
        email_notifications: true,
        sms_notifications: false
      })
      .select()
      .single()
    
    if (error) {
      console.error('Profile creation error:', error)
      throw new Error(`Profile creation failed: ${error.message}`)
    }
    
    return data
  }
}