# Supabase Edge Functions

This directory contains Supabase Edge Functions for complex business logic.

## Functions

### 1. booking-management
- **Path**: `/functions/v1/booking-management`
- **Purpose**: Handle complex booking operations with race condition prevention
- **Features**:
  - Safe booking creation with availability checking
  - Booking status updates
  - Booking cancellation with availability restoration
  - Admin-only operations

### 2. tour-analytics
- **Path**: `/functions/v1/tour-analytics`
- **Purpose**: Generate advanced analytics and reports
- **Features**:
  - Dashboard analytics
  - Tour performance metrics
  - Revenue analysis
  - User behavior analytics

## Deployment

### Prerequisites
1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link to your project:
```bash
supabase link --project-ref your-project-ref
```

### Deploy Functions
```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy booking-management
supabase functions deploy tour-analytics
```

### Environment Variables
Set these environment variables in your Supabase dashboard (Settings → Edge Functions):

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Usage Examples

### Booking Management
```javascript
// Create a booking
const response = await fetch('https://your-project.supabase.co/functions/v1/booking-management', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    tour_id: 'tour-uuid',
    availability_id: 'availability-uuid',
    guest_count: 2,
    booking_date: '2024-01-15',
    booking_time: '10:00',
    special_requests: 'Vegetarian meals'
  })
})

// Update booking status (admin only)
const statusResponse = await fetch('https://your-project.supabase.co/functions/v1/booking-management', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${adminSession.access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    booking_id: 'booking-uuid',
    status: 'confirmed',
    admin_note: 'Confirmed after payment verification'
  })
})
```

### Analytics
```javascript
// Get dashboard analytics
const analyticsResponse = await fetch(
  'https://your-project.supabase.co/functions/v1/tour-analytics?type=dashboard',
  {
    headers: {
      'Authorization': `Bearer ${adminSession.access_token}`
    }
  }
)

// Get tour performance metrics
const tourMetrics = await fetch(
  'https://your-project.supabase.co/functions/v1/tour-analytics?type=tours',
  {
    headers: {
      'Authorization': `Bearer ${adminSession.access_token}`
    }
  }
)
```

## Local Development

### Start local development server
```bash
supabase start
supabase functions serve
```

### Test functions locally
```bash
# Test booking management
curl -X POST 'http://localhost:54321/functions/v1/booking-management' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"tour_id":"test-id","availability_id":"test-id","guest_count":2}'

# Test analytics
curl 'http://localhost:54321/functions/v1/tour-analytics?type=dashboard' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'
```

## Security

- All functions verify user authentication via JWT tokens
- Admin-only functions check user role from the database
- Row-level security policies are respected
- CORS headers are properly configured

## Performance

- Functions use connection pooling for database queries
- Optimized queries with proper indexing
- Error handling and graceful degradation
- Response caching where appropriate

## Monitoring

Monitor function performance in your Supabase dashboard:
- Function invocations
- Execution time
- Error rates
- Resource usage