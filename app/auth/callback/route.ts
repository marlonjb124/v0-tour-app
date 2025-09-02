import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function POST(req: Request) {
  try {
    const { event, session } = await req.json()

    // Bind cookies to the actual response so Set-Cookie headers are returned
    const response = NextResponse.json({ ok: true })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            // Reading from incoming request cookies isn't necessary for this endpoint
            return undefined
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      if (!session?.access_token || !session?.refresh_token) {
        return NextResponse.json({ error: 'Missing session tokens' }, { status: 400 })
      }
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      })
    }

    if (event === 'SIGNED_OUT') {
      await supabase.auth.signOut()
    }

    return response
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Callback error' }, { status: 500 })
  }
}

