# Supabase Backend Implementation Guide

## Overview
This guide provides step-by-step instructions to implement the Supabase backend for your tour management system, enabling free cloud deployment with Vercel + Supabase.

## 🚀 Quick Start Checklist

### Phase 1: Supabase Project Setup

#### 1. Create Supabase Project
- [ ] Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
- [ ] Click "New project"
- [ ] Choose your organization
- [ ] Set project name: `tour-camila-backend`
- [ ] Set database password (save securely)
- [ ] Choose region closest to your users
- [ ] Wait for project to be ready (~2 minutes)

#### 2. Get Project Credentials
- [ ] Go to Settings → API
- [ ] Copy **Project URL**
- [ ] Copy **anon/public key**
- [ ] Copy **service_role key** (keep secret)

#### 3. Configure Environment Variables
Create `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Phase 2: Database Setup

#### 4. Enable Extensions
Go to Database → Extensions and enable:
- [ ] `uuid-ossp` (for UUID generation)
- [ ] `pg_trgm` (for full-text search performance)

#### 5. Create Database Schema
Execute the SQL scripts in this order in your Supabase SQL Editor:

1. **Main Schema** (`supabase-schema.sql`):
   - [ ] Copy and execute the entire schema file
   - [ ] Verify all tables are created: `users`, `tours`, `tour_availability`, `bookings`
   - [ ] Check that indexes are created for performance

2. **Row Level Security** (`supabase-rls-policies.sql`):
   - [ ] Execute all RLS policies
   - [ ] Verify RLS is enabled on all tables

3. **Storage Setup** (`supabase-storage-setup.sql`):
   - [ ] Create storage buckets
   - [ ] Set up storage policies

#### 6. Verify Database Setup
Run these queries to confirm setup:

```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check storage buckets
SELECT * FROM storage.buckets;
```

### Phase 3: Authentication Setup

#### 7. Configure Supabase Auth
Go to Authentication → Settings:
- [ ] Enable email confirmations (optional)
- [ ] Configure email templates (optional)
- [ ] Set up redirect URLs for your domain
- [ ] Add your domain to redirect URL allowlist

#### 8. Create Admin User
1. Go to Authentication → Users
2. Create a new user with admin email
3. After creation, run this SQL to make them admin:

```sql
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'your-admin-email@example.com';
```

### Phase 4: Frontend Integration

#### 9. Install Dependencies
```bash
pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs
```

#### 10. Test Basic Connection
Create a test page to verify connection:

```tsx
// app/test-supabase/page.tsx
import { createClient } from '@/lib/supabase'

export default async function TestPage() {
  const supabase = createClient()
  
  const { data: tours } = await supabase
    .from('tours')
    .select('*')
    .limit(5)
  
  return (
    <div>
      <h1>Supabase Connection Test</h1>
      <pre>{JSON.stringify(tours, null, 2)}</pre>
    </div>
  )
}
```

### Phase 5: Data Migration (Optional)

#### 11. Migrate Existing Data
If you have existing data, create migration scripts:

```sql
-- Example: Insert sample tours
INSERT INTO public.tours (title, description, city, location, meeting_point, price, duration, max_group_size, cancellation_policy) VALUES
('Historic City Tour', 'Explore the historic center', 'Madrid', 'City Center', 'Plaza Mayor', 45.00, '3 hours', 15, 'Free cancellation up to 24 hours'),
('Food Tour', 'Taste local cuisine', 'Barcelona', 'Gothic Quarter', 'Cathedral', 65.00, '4 hours', 12, 'Free cancellation up to 48 hours');
```

### Phase 6: Production Deployment

#### 12. Deploy to Vercel
```bash
# Build the project
pnpm build

# Deploy to Vercel
vercel --prod
```

#### 13. Configure Production Environment
In Vercel dashboard:
- [ ] Add environment variables
- [ ] Update Supabase redirect URLs with your production domain
- [ ] Test production deployment

## 🔧 Advanced Configuration

### Performance Optimization

#### Database Indexes
The schema includes optimized indexes for:
- Tour search and filtering
- User lookups
- Booking queries
- Full-text search

#### Caching Strategy
- Use Supabase built-in caching
- Implement Next.js cache for static data
- Consider Redis for session storage (optional)

### Security Considerations

#### Row Level Security (RLS)
- ✅ Users can only access their own data
- ✅ Admins have full access to manage content
- ✅ Public access to active tours only
- ✅ Secure file uploads with proper permissions

#### API Security
- ✅ Service role key kept secure (server-side only)
- ✅ Anon key safe for client-side use
- ✅ Proper error handling without data exposure

### Monitoring and Analytics

#### Supabase Dashboard
Monitor in your Supabase dashboard:
- Database usage and performance
- API calls and rate limiting
- Storage usage
- Real-time connections

#### Next.js Analytics
- Enable Vercel Analytics for frontend performance
- Use Supabase's built-in analytics for backend metrics

## 🚨 Troubleshooting

### Common Issues

#### 1. Connection Errors
```
Failed to fetch tours: connect ECONNREFUSED
```
**Solution**: Check environment variables and project URL

#### 2. RLS Policy Errors
```
new row violates row-level security policy
```
**Solution**: Verify user authentication and RLS policies

#### 3. Storage Upload Errors
```
Failed to upload image: new row violates row-level security policy
```
**Solution**: Check storage policies and user permissions

#### 4. Type Errors
```
Type 'unknown' is not assignable to type 'Tour'
```
**Solution**: Regenerate types or check database schema alignment

### Debug Commands

```sql
-- Check current user
SELECT auth.uid(), auth.role();

-- Check RLS policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Check storage policies
SELECT * FROM storage.policies;
```

## 📊 Performance Benchmarks

### Expected Performance
- **Tour listing**: < 200ms
- **Single tour fetch**: < 100ms
- **User authentication**: < 150ms
- **Booking creation**: < 300ms
- **Image upload**: < 2s (depending on size)

### Scaling Considerations
- Supabase free tier: 500MB database, 1GB storage
- Upgrade to Pro ($25/month) for production use
- Consider CDN for image delivery
- Implement pagination for large datasets

## 🔄 Migration from FastAPI

### Data Migration
1. Export existing data from PostgreSQL
2. Transform data to match new schema
3. Import using SQL scripts or Supabase migration tools

### API Endpoint Mapping
- `/api/tours` → Supabase `tours` table
- `/api/bookings` → Supabase `bookings` table
- `/api/auth` → Supabase Auth
- `/api/upload` → Supabase Storage

### Code Changes Summary
- ✅ Authentication system migrated to Supabase Auth
- ✅ Database queries converted to Supabase client
- ✅ File uploads moved to Supabase Storage
- ✅ Real-time features available via Supabase subscriptions

## 🎯 Next Steps

### Immediate Actions
1. Follow Phase 1-4 for basic setup
2. Test all functionality in development
3. Deploy to staging environment
4. Migrate data if necessary
5. Deploy to production

### Future Enhancements
- [ ] Implement real-time booking notifications
- [ ] Add automated backup system
- [ ] Set up monitoring alerts
- [ ] Implement advanced analytics
- [ ] Add multi-language support
- [ ] Integrate payment processing

## 📞 Support

### Resources
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)

### Getting Help
- Supabase Discord community
- GitHub issues for project-specific problems
- Stack Overflow for general questions

---

**Total Implementation Time**: 2-4 hours
**Cost**: Free tier available, $25/month for production
**Performance**: High-performance with built-in optimizations