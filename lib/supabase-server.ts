import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './supabase'

// Server-side Supabase client (for server components only)
export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Can't set cookies in Server Components
          // This is handled by middleware
        },
        remove(name: string, options: CookieOptions) {
          // Can't remove cookies in Server Components  
          // This is handled by middleware
        },
      },
    }
  )
}