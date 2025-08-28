# 🚀 Free Deployment Guide for Tour App

## Overview
This guide shows you how to deploy your tour application completely **FREE** using modern cloud platforms.

## 🎯 Recommended: Vercel + Supabase

### Frontend: Vercel (Already Configured!)
Your app is already set up for Vercel deployment.

#### Steps:
1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Import your repository
   - Deploy automatically!

3. **Environment Variables** (Add in Vercel dashboard):
   ```env
   NEXT_PUBLIC_API_URL=https://your-supabase-url.supabase.co/rest/v1
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-sandbox-id
   ```

### Backend: Supabase (Database + Auth + API)

#### Setup Steps:
1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create new project (free tier)
   - Note down URL and API keys

2. **Create Database Tables**:
   ```sql
   -- Users table (auto-created by Supabase Auth)
   
   -- Tours table
   CREATE TABLE tours (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     title VARCHAR(255) NOT NULL,
     description TEXT,
     price DECIMAL(10,2) NOT NULL,
     duration INTEGER,
     location VARCHAR(255),
     image_url TEXT,
     max_participants INTEGER DEFAULT 20,
     available_dates JSONB,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Bookings table
   CREATE TABLE bookings (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id),
     tour_id UUID REFERENCES tours(id),
     booking_date DATE NOT NULL,
     participants INTEGER DEFAULT 1,
     total_price DECIMAL(10,2) NOT NULL,
     status VARCHAR(20) DEFAULT 'pending',
     payment_id VARCHAR(255),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
   ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

   -- Policies
   CREATE POLICY "Tours are viewable by everyone" ON tours FOR SELECT USING (true);
   CREATE POLICY "Users can view their own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
   CREATE POLICY "Users can create their own bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
   ```

3. **Sample Data**:
   ```sql
   INSERT INTO tours (title, description, price, duration, location, image_url) VALUES
   ('Machu Picchu Adventure', 'Explore the ancient Inca citadel with expert guides', 299.99, 1, 'Cusco, Peru', 'https://images.unsplash.com/photo-1587595431973-160d0d94add1'),
   ('Lima Food Tour', 'Discover Lima''s culinary scene with local chefs', 89.99, 4, 'Lima, Peru', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5'),
   ('Sacred Valley Experience', 'Visit traditional markets and ancient ruins', 159.99, 8, 'Sacred Valley, Peru', 'https://images.unsplash.com/photo-1583416750470-965b2707b355');
   ```

## 🌟 Alternative Options

### Option 2: Netlify + PlanetScale
- **Frontend**: Netlify (Free tier: 100GB bandwidth)
- **Backend**: PlanetScale (Free MySQL database)
- **Auth**: Netlify Identity or Auth0

### Option 3: Railway (Full-Stack)
- **Everything**: Railway (Free tier: $5 credit/month)
- Deploy both frontend and backend together
- Built-in PostgreSQL

### Option 4: Render + MongoDB Atlas
- **Frontend**: Render Static Sites
- **Backend**: Render Web Services
- **Database**: MongoDB Atlas (Free 512MB)

## 📝 Environment Variables Setup

### Frontend (.env.local):
```env
NEXT_PUBLIC_API_URL=https://your-api-url.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id
NEXT_PUBLIC_CURRENCY=EUR
```

### Backend (if using custom API):
```env
DATABASE_URL=postgresql://user:pass@host:port/db
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-secret
JWT_SECRET=your-jwt-secret
```

## 🔧 Code Changes for Supabase

### Install Supabase Client:
```bash
pnpm add @supabase/supabase-js
```

### Create Supabase Client:
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Update API Services:
```typescript
// services/tour-service.ts
import { supabase } from '@/lib/supabase'

export const getTours = async () => {
  const { data, error } = await supabase
    .from('tours')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const createBooking = async (booking: any) => {
  const { data, error } = await supabase
    .from('bookings')
    .insert([booking])
    .select()
  
  if (error) throw error
  return data[0]
}
```

## 🚀 Deployment Commands

### Build and Test Locally:
```bash
# Frontend
pnpm build
pnpm start

# Check for errors
pnpm lint
```

### Deploy:
```bash
# Push to GitHub (auto-deploys to Vercel)
git add .
git commit -m "Deploy to production"
git push origin main
```

## 📊 Free Tier Limits

| Service | Storage | Bandwidth | Requests | Cost |
|---------|---------|-----------|----------|------|
| Vercel | 100GB | 100GB/month | Unlimited | Free |
| Supabase | 500MB DB | 2GB bandwidth | 50,000 monthly active users | Free |
| Netlify | 100GB | 100GB/month | 300 build minutes | Free |
| Railway | 1GB RAM | 100GB | $5 credit/month | Free |

## 🎯 Next Steps

1. **Choose your stack** (Recommended: Vercel + Supabase)
2. **Set up accounts** on chosen platforms
3. **Configure environment variables**
4. **Update code** to use chosen backend
5. **Deploy and test**

## 🔗 Useful Links

- [Vercel Deployment Docs](https://vercel.com/docs)
- [Supabase Quickstart](https://supabase.com/docs/guides/getting-started)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PayPal Developer](https://developer.paypal.com/)

---

Your tour app will be live and accessible worldwide in minutes! 🌍