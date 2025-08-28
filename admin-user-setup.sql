-- Admin User Setup Script
-- Execute this in your Supabase SQL Editor to create an admin user
-- Replace the UUID and email with your actual Supabase Auth user details

-- Step 1: First, register a user through your app's registration form or Supabase Auth
-- Step 2: Find the user's UUID from auth.users table
-- Step 3: Run this script with the correct UUID and details

-- Example query to find your auth user UUID:
-- SELECT id, email, email_confirmed_at FROM auth.users WHERE email = 'your-email@example.com';

-- Insert admin user profile (replace the UUID and email with your actual values)
INSERT INTO public.users (
    id,
    email,
    full_name,
    role,
    is_active,
    is_verified,
    email_notifications,
    created_at,
    last_login,
    updated_at
) VALUES (
    'YOUR_AUTH_USER_UUID_HERE',  -- Replace with your actual UUID from auth.users
    'your-admin-email@example.com',  -- Replace with your email
    'Administrator',
    'admin',
    true,
    true,
    true,
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    is_active = true,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();

-- Verify the admin user was created
SELECT * FROM public.users WHERE role = 'admin';