import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

// POST /api/admin/seed
// Headers: { 'x-seed-secret': process.env.SEED_ADMIN_SECRET }
// Body: { email: string, password: string, full_name?: string, role?: 'admin' | 'user' }
export async function POST(request: Request) {
  try {
    const secret = request.headers.get('x-seed-secret') || ''
    if (!process.env.SEED_ADMIN_SECRET) {
      return NextResponse.json({ error: 'SEED_ADMIN_SECRET not configured' }, { status: 500 })
    }
    if (secret !== process.env.SEED_ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, password, full_name, role } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'email and password are required' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient()

    // 1) Create or fetch Auth user (autoconfirmed)
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: full_name ? { full_name } : undefined,
    })

    // If user already exists, fetch it
    let authUser = created?.user
    if (createErr && createErr.message?.toLowerCase().includes('already registered')) {
      const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1,
        email,
      } as any)
      if (listErr || !list?.users?.length) {
        return NextResponse.json({ error: 'User exists but cannot be fetched' }, { status: 500 })
      }
      authUser = list.users[0]
    } else if (createErr) {
      return NextResponse.json({ error: createErr.message }, { status: 400 })
    }

    if (!authUser) {
      return NextResponse.json({ error: 'No auth user returned' }, { status: 500 })
    }

    // 2) Upsert profile in public.users
    const now = new Date().toISOString()
    const { data: profile, error: upsertErr } = await supabaseAdmin
      .from('users')
      .upsert(
        {
          id: authUser.id,
          email,
          full_name: full_name || email,
          role: (role || 'admin'),
          is_active: true,
          is_verified: true,
          email_notifications: true,
          sms_notifications: false,
          created_at: now,
          updated_at: now,
        },
        { onConflict: 'id' }
      )
      .select()
      .single()

    if (upsertErr) {
      return NextResponse.json({ error: `Profile upsert failed: ${upsertErr.message}` }, { status: 500 })
    }

    return NextResponse.json({ ok: true, user_id: authUser.id, profile })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}
