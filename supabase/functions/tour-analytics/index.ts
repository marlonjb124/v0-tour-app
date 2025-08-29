import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

type SupabaseClient = ReturnType<typeof createClient>

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    const { data: { user } } = await supabase.auth.getUser(authHeader?.replace('Bearer ', ''))
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify admin role
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

    const url = new URL(req.url)
    const reportType = url.searchParams.get('type') || 'dashboard'

    let analytics

    switch (reportType) {
      case 'dashboard':
        analytics = await getDashboardAnalytics(supabase)
        break
      case 'tours':
        analytics = await getTourAnalytics(supabase)
        break
      case 'revenue':
        analytics = await getRevenueAnalytics(supabase)
        break
      case 'users':
        analytics = await getUserAnalytics(supabase)
        break
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid report type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    return new Response(
      JSON.stringify({ data: analytics }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function getDashboardAnalytics(supabase: SupabaseClient) {
  // Get basic counts
  const [
    { count: totalTours },
    { count: totalBookings },
    { count: totalUsers },
    { count: activeUsers }
  ] = await Promise.all([
    supabase.from('tours').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_active', true)
  ])

  // Get revenue data
  const { data: revenueData } = await supabase
    .from('bookings')
    .select('total_amount, created_at, status')
    .in('status', ['confirmed', 'completed'])

  const totalRevenue = revenueData?.reduce((sum, booking) => sum + booking.total_amount, 0) || 0

  // Get recent bookings
  const { data: recentBookings } = await supabase
    .from('bookings')
    .select(`
      id,
      total_amount,
      status,
      created_at,
      tour:tours(title),
      user:users(full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  // Get popular tours
  const { data: popularTours } = await supabase
    .rpc('get_popular_tours', { limit_count: 5 })

  // Generate revenue chart for last 30 days
  const revenueChart = await generateRevenueChart(supabase, 30)

  return {
    summary: {
      total_tours: totalTours || 0,
      total_bookings: totalBookings || 0,
      total_revenue: totalRevenue,
      total_users: totalUsers || 0,
      active_users: activeUsers || 0
    },
    revenue_chart: revenueChart,
    recent_bookings: recentBookings || [],
    popular_tours: popularTours || []
  }
}

async function getTourAnalytics(supabase: SupabaseClient) {
  // Get tour performance metrics
  const { data: tourMetrics } = await supabase
    .from('tours')
    .select(`
      id,
      title,
      city,
      price,
      rating,
      review_count,
      is_featured,
      is_active,
      created_at,
      bookings:bookings(count)
    `)

  // Calculate tour statistics
  const tourStats = tourMetrics?.map(tour => {
    const bookingCount = tour.bookings?.length || 0
    const revenue = bookingCount * tour.price
    const conversionRate = tour.review_count > 0 ? (bookingCount / tour.review_count) * 100 : 0

    return {
      ...tour,
      booking_count: bookingCount,
      revenue,
      conversion_rate: Math.round(conversionRate * 100) / 100
    }
  })

  // Get city performance
  const { data: cityData } = await supabase
    .rpc('get_city_performance')

  return {
    tour_performance: tourStats || [],
    city_performance: cityData || [],
    top_performers: tourStats?.sort((a, b) => b.revenue - a.revenue).slice(0, 10) || []
  }
}

async function getRevenueAnalytics(supabase: SupabaseClient) {
  // Get detailed revenue breakdown
  const { data: revenueData } = await supabase
    .from('bookings')
    .select(`
      id,
      total_amount,
      status,
      payment_status,
      created_at,
      booking_date,
      tour:tours(title, city, price)
    `)
    .in('status', ['confirmed', 'completed'])

  // Revenue by month
  const revenueByMonth: Record<string, { revenue: number; bookings: number }> = {}
  revenueData?.forEach((booking: any) => {
    const month = booking.created_at.substring(0, 7) // YYYY-MM
    if (!revenueByMonth[month]) {
      revenueByMonth[month] = { revenue: 0, bookings: 0 }
    }
    revenueByMonth[month].revenue += booking.total_amount
    revenueByMonth[month].bookings += 1
  })

  // Revenue by city
  const revenueByCity: Record<string, { revenue: number; bookings: number }> = {}
  revenueData?.forEach((booking: any) => {
    const city = booking.tour?.city || 'Unknown'
    if (!revenueByCity[city]) {
      revenueByCity[city] = { revenue: 0, bookings: 0 }
    }
    revenueByCity[city].revenue += booking.total_amount
    revenueByCity[city].bookings += 1
  })

  // Payment status breakdown
  const paymentStatusBreakdown: Record<string, { count: number; amount: number }> = {}
  revenueData?.forEach((booking: any) => {
    const status = booking.payment_status
    if (!paymentStatusBreakdown[status]) {
      paymentStatusBreakdown[status] = { count: 0, amount: 0 }
    }
    paymentStatusBreakdown[status].count += 1
    paymentStatusBreakdown[status].amount += booking.total_amount
  })

  return {
    total_revenue: revenueData?.reduce((sum: number, booking: any) => sum + booking.total_amount, 0) || 0,
    revenue_by_month: Object.entries(revenueByMonth).map(([month, data]) => ({
      month,
      ...data
    })),
    revenue_by_city: Object.entries(revenueByCity).map(([city, data]) => ({
      city,
      ...data
    })),
    payment_status_breakdown: paymentStatusBreakdown
  }
}

async function getUserAnalytics(supabase: SupabaseClient) {
  // User registration trends
  const { data: users } = await supabase
    .from('users')
    .select('id, created_at, role, is_active, last_login')

  // Registration by month
  const registrationsByMonth: Record<string, number> = {}
  users?.forEach((user: any) => {
    const month = user.created_at.substring(0, 7)
    registrationsByMonth[month] = (registrationsByMonth[month] || 0) + 1
  })

  // Active users (logged in within last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const activeUsers = users?.filter((user: any) => 
    user.last_login && new Date(user.last_login) > thirtyDaysAgo
  ).length || 0

  // User booking behavior
  const { data: userBookings } = await supabase
    .from('users')
    .select(`
      id,
      full_name,
      email,
      created_at,
      bookings:bookings(count)
    `)

  const userSegments = {
    new_users: users?.filter((user: any) => {
      const createdDate = new Date(user.created_at)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return createdDate > thirtyDaysAgo
    }).length || 0,
    active_users: activeUsers,
    inactive_users: (users?.length || 0) - activeUsers
  }

  return {
    total_users: users?.length || 0,
    registrations_by_month: Object.entries(registrationsByMonth).map(([month, count]) => ({
      month,
      registrations: count
    })),
    user_segments: userSegments,
    top_customers: userBookings?.sort((a: any, b: any) => 
      (b.bookings?.length || 0) - (a.bookings?.length || 0)
    ).slice(0, 10) || []
  }
}

async function generateRevenueChart(supabase: SupabaseClient, days: number) {
  const chartData = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateString = date.toISOString().split('T')[0]
    
    const { data: dayRevenue } = await supabase
      .from('bookings')
      .select('total_amount')
      .gte('created_at', dateString)
      .lt('created_at', `${dateString}T23:59:59`)
      .in('status', ['confirmed', 'completed'])
    
    const revenue = dayRevenue?.reduce((sum: number, booking: any) => sum + booking.total_amount, 0) || 0
    
    chartData.push({
      date: dateString,
      revenue,
      bookings: dayRevenue?.length || 0
    })
  }
  
  return chartData
}