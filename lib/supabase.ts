import { createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'

// Environment variables validation with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pmdeyjcxsogqtofusgri.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseAnonKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY - Supabase client will not work properly')
}

import type { Database } from './database.types'

// Export Database type for use in other files
export type { Database }

let client: SupabaseClient<Database> | undefined

// Client-side Supabase client (for browser/client components)
export function createClient() {
  if (client) {
    return client
  }

  if (!supabaseAnonKey) {
    console.error('Cannot create Supabase client: missing anon key')
    // Return a mock client that will fail gracefully
    return {
      from: () => ({
        select: () => ({
          eq: () => ({
            range: () => ({
              order: () => Promise.resolve({ data: [], error: { message: 'Missing Supabase configuration' }, count: 0 })
            })
          })
        })
      })
    } as any
  }

  client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
  return client
}

// Admin client with service role key (for server-side admin operations)
export function createAdminClient() {
  if (!supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }
  
  return createSupabaseClient<Database>(supabaseUrl!, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}