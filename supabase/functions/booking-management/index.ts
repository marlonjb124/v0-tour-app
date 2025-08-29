import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

type SupabaseClient = ReturnType<typeof createClient>

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { method } = req
    const url = new URL(req.url)
    const pathname = url.pathname

    // Route to different handlers based on the path
    if (pathname.includes('/booking-management')) {
      return await handleBookingManagement(req, supabase)
    } else if (pathname.includes('/send-notification')) {
      return await handleSendNotification(req, supabase)
    } else if (pathname.includes('/analytics')) {
      return await handleAnalytics(req, supabase)
    } else {
      return new Response(
        JSON.stringify({ error: 'Not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleBookingManagement(req: Request, supabase: SupabaseClient) {
  const { method } = req

  switch (method) {
    case 'POST':
      return await createBooking(req, supabase)
    case 'PUT':
      return await updateBookingStatus(req, supabase)
    case 'DELETE':
      return await cancelBooking(req, supabase)
    default:
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
  }
}

async function createBooking(req: Request, supabase: SupabaseClient) {
  const authHeader = req.headers.get('Authorization')
  const { data: { user } } = await supabase.auth.getUser(authHeader?.replace('Bearer ', ''))
  
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const bookingData = await req.json()
  
  // Validate required fields
  const requiredFields = ['tour_id', 'availability_id', 'guest_count', 'booking_date', 'booking_time']
  for (const field of requiredFields) {
    if (!bookingData[field]) {
      return new Response(
        JSON.stringify({ error: `Missing required field: ${field}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  }

  // Check availability with row-level locking
  const { data: availability, error: availError } = await supabase
    .from('tour_availability')
    .select('*')
    .eq('id', bookingData.availability_id)
    .single()
  
  if (availError || !availability) {
    return new Response(
      JSON.stringify({ error: 'Availability not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (availability.available_spots < bookingData.guest_count) {
    return new Response(
      JSON.stringify({ error: 'Not enough spots available' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Get tour for pricing
  const { data: tour, error: tourError } = await supabase
    .from('tours')
    .select('price')
    .eq('id', bookingData.tour_id)
    .single()

  if (tourError || !tour) {
    return new Response(
      JSON.stringify({ error: 'Tour not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const totalAmount = tour.price * bookingData.guest_count

  // Create booking using the safe function
  const { data: bookingId, error: bookingError } = await supabase.rpc(
    'create_booking_safe',
    {
      p_tour_id: bookingData.tour_id,
      p_user_id: user.id,
      p_availability_id: bookingData.availability_id,
      p_booking_date: bookingData.booking_date,
      p_booking_time: bookingData.booking_time,
      p_guest_count: bookingData.guest_count,
      p_total_amount: totalAmount,
      p_special_requests: bookingData.special_requests || null
    }
  )

  if (bookingError) {
    return new Response(
      JSON.stringify({ error: bookingError.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Get the created booking with details
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select(`
      *,
      tour:tours(title, city, price),
      user:users(full_name, email)
    `)
    .eq('id', bookingId)
    .single()

  if (fetchError) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch created booking' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Send confirmation notification (optional)
  try {
    await sendBookingConfirmation(booking, supabase)
  } catch (error) {
    console.error('Failed to send confirmation:', error)
    // Don't fail the booking creation if notification fails
  }

  return new Response(
    JSON.stringify({ data: booking }),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updateBookingStatus(req: Request, supabase: SupabaseClient) {
  const authHeader = req.headers.get('Authorization')
  const { data: { user } } = await supabase.auth.getUser(authHeader?.replace('Bearer ', ''))
  
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Check if user is admin
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'admin') {
    return new Response(
      JSON.stringify({ error: 'Admin access required' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { booking_id, status, admin_note } = await req.json()

  const { data: booking, error } = await supabase
    .from('bookings')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', booking_id)
    .select()
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ data: booking }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function cancelBooking(req: Request, supabase: any) {
  const authHeader = req.headers.get('Authorization')
  const { data: { user } } = await supabase.auth.getUser(authHeader?.replace('Bearer ', ''))
  
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { booking_id, reason } = await req.json()

  // Get booking details first
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', booking_id)
    .single()

  if (fetchError || !booking) {
    return new Response(
      JSON.stringify({ error: 'Booking not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Check permissions (user can cancel their own booking, admin can cancel any)
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (booking.user_id !== user.id && userData?.role !== 'admin') {
    return new Response(
      JSON.stringify({ error: 'Not authorized to cancel this booking' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Update booking status
  const { data: updatedBooking, error: updateError } = await supabase
    .from('bookings')
    .update({ 
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('id', booking_id)
    .select()
    .single()

  if (updateError) {
    return new Response(
      JSON.stringify({ error: updateError.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Restore availability
  await supabase
    .from('tour_availability')
    .update({
      available_spots: supabase.raw(`available_spots + ${booking.guest_count}`)
    })
    .eq('id', booking.availability_id)

  return new Response(
    JSON.stringify({ data: updatedBooking }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleSendNotification(req: Request, supabase: any) {
  // This would integrate with email service like SendGrid, Resend, etc.
  const { to, subject, message, type } = await req.json()
  
  // For now, just log the notification
  console.log('Notification:', { to, subject, message, type })
  
  return new Response(
    JSON.stringify({ message: 'Notification sent successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleAnalytics(req: Request, supabase: any) {
  const authHeader = req.headers.get('Authorization')
  const { data: { user } } = await supabase.auth.getUser(authHeader?.replace('Bearer ', ''))
  
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Check if user is admin
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'admin') {
    return new Response(
      JSON.stringify({ error: 'Admin access required' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Get comprehensive analytics
  const [
    { count: totalBookings },
    { data: revenueData },
    { count: totalUsers },
    { count: activeTours }
  ] = await Promise.all([
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('total_amount, created_at').eq('payment_status', 'paid'),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('tours').select('*', { count: 'exact', head: true }).eq('is_active', true)
  ])

  const totalRevenue = revenueData?.reduce((sum, booking) => sum + booking.total_amount, 0) || 0
  
  return new Response(
    JSON.stringify({
      data: {
        total_bookings: totalBookings || 0,
        total_revenue: totalRevenue,
        total_users: totalUsers || 0,
        active_tours: activeTours || 0,
        revenue_data: revenueData || []
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function sendBookingConfirmation(booking: any, supabase: any) {
  // This would integrate with your email service
  // For now, we'll just log it
  console.log('Sending booking confirmation:', {
    to: booking.user.email,
    booking_id: booking.id,
    tour_title: booking.tour.title
  })
}