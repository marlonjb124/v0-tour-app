import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

async function getServerClient() {
  const cookieStore = cookies()
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch {}
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: '', ...options })
        } catch {}
      }
    }
  })
}

async function requireAdmin() {
  const supabase = await getServerClient()
  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr || !user) return { ok: false as const, status: 401, message: 'Unauthorized' }

  const { data: profile, error: profileErr } = await supabase
    .from('users')
    .select('id, role, is_active')
    .eq('id', user.id)
    .single()

  if (profileErr || !profile) return { ok: false as const, status: 403, message: 'Forbidden' }
  if (profile.role !== 'admin' || profile.is_active === false) return { ok: false as const, status: 403, message: 'Admin only' }

  return { ok: true as const, userId: user.id }
}

// GET /api/admin/tours/:id
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const adminCheck = await requireAdmin()
    if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.message }, { status: adminCheck.status })

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('tours')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 404 })
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

// PATCH /api/admin/tours/:id
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const adminCheck = await requireAdmin()
    if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.message }, { status: adminCheck.status })

    const body = await request.json()
    if (Array.isArray(body.highlights)) body.highlights = body.highlights.filter((s: string) => typeof s === 'string' && s.trim() !== '')
    if (Array.isArray(body.included)) body.included = body.included.filter((s: string) => typeof s === 'string' && s.trim() !== '')

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('tours')
      .update(body)
      .eq('id', params.id)
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

// DELETE /api/admin/tours/:id
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const adminCheck = await requireAdmin()
    if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.message }, { status: adminCheck.status })

    const admin = createAdminClient()
    const { error } = await admin
      .from('tours')
      .delete()
      .eq('id', params.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
