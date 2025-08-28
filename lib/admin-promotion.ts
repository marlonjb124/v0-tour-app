/**
 * Admin User Promotion Utility
 * 
 * This script provides functions to promote users to admin role
 * Use this in your browser console or create an admin endpoint
 */

import { createClient } from '@supabase/supabase-js'

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Service role key needed for admin operations

const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!)

/**
 * Promote a user to admin role by email
 */
export async function promoteUserToAdmin(email: string) {
  try {
    console.log(`Promoting user ${email} to admin...`)
    
    // First, find the user in auth.users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) {
      console.error('Error fetching auth users:', authError)
      return { success: false, error: authError }
    }
    
    const authUser = authUsers.users.find(user => user.email === email)
    
    if (!authUser) {
      console.error('User not found in auth.users')
      return { success: false, error: 'User not found in authentication' }
    }
    
    console.log('Found auth user:', authUser.id)
    
    // Check if user profile exists in public.users
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error checking user profile:', profileError)
      return { success: false, error: profileError }
    }
    
    // Create or update user profile with admin role
    const userData = {
      id: authUser.id,
      email: authUser.email!,
      full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Admin User',
      role: 'admin' as const,
      is_active: true,
      is_verified: authUser.email_confirmed_at !== null,
      email_notifications: true,
      created_at: existingProfile?.created_at || new Date().toISOString(),
      last_login: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    if (existingProfile) {
      // Update existing profile
      const { data: updatedProfile, error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          role: 'admin',
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', authUser.id)
        .select()
        .single()
        
      if (updateError) {
        console.error('Error updating user profile:', updateError)
        return { success: false, error: updateError }
      }
      
      console.log('Successfully updated user to admin:', updatedProfile)
      return { success: true, user: updatedProfile }
    } else {
      // Create new profile
      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from('users')
        .insert([userData])
        .select()
        .single()
        
      if (insertError) {
        console.error('Error creating admin profile:', insertError)
        return { success: false, error: insertError }
      }
      
      console.log('Successfully created admin profile:', newProfile)
      return { success: true, user: newProfile }
    }
    
  } catch (error) {
    console.error('Unexpected error promoting user:', error)
    return { success: false, error }
  }
}

/**
 * List all admin users
 */
export async function listAdminUsers() {
  try {
    const { data: adminUsers, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('role', 'admin')
      .eq('is_active', true)
    
    if (error) {
      console.error('Error fetching admin users:', error)
      return { success: false, error }
    }
    
    console.log('Admin users:', adminUsers)
    return { success: true, users: adminUsers }
  } catch (error) {
    console.error('Error listing admin users:', error)
    return { success: false, error }
  }
}

// Example usage:
// promoteUserToAdmin('your-email@example.com')
//   .then(result => console.log('Promotion result:', result))
//   .catch(error => console.error('Promotion failed:', error))