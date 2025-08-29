'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function AdminSetupPage() {
  const { user, supabaseUser, refreshUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const supabase = createClient()

  const promoteToAdmin = async (targetEmail?: string) => {
    if (!supabaseUser && !targetEmail) {
      toast.error('No authenticated user found')
      return
    }

    setIsLoading(true)
    try {
      const userEmail = targetEmail || supabaseUser?.email
      const userId = targetEmail ? null : supabaseUser?.id

      if (!userEmail) {
        throw new Error('Email is required')
      }

      // If promoting current user, use their ID directly
      let targetUserId = userId
      
      // If promoting someone else by email, we'd need to find their ID
      if (targetEmail && !userId) {
        toast.error('Cannot promote other users without service role key')
        return
      }

      // Ensure we have a valid user ID
      if (!targetUserId) {
        throw new Error('User ID is required')
      }

      // Create or update user profile with admin role
      const userData = {
        id: targetUserId,
        email: userEmail,
        full_name: supabaseUser?.user_metadata?.full_name || userEmail.split('@')[0] || 'Admin User',
        role: 'admin' as const,
        is_active: true,
        is_verified: supabaseUser?.email_confirmed_at !== null,
        email_notifications: true,
        phone: null,
        date_of_birth: null,
        country: null,
        sms_notifications: false,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // First try to insert, if conflict then update
      const { data: newProfile, error: insertError } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single()

      if (insertError) {
        if (insertError.code === '23505') { // Unique constraint violation
          // User exists, update their role
          const { data: updatedProfile, error: updateError } = await supabase
            .from('users')
            .update({
              role: 'admin',
              is_active: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', targetUserId)
            .select()
            .single()

          if (updateError) {
            throw updateError
          }

          toast.success(`Successfully promoted ${userEmail} to admin!`)
          console.log('Updated user profile:', updatedProfile)
        } else {
          throw insertError
        }
      } else {
        toast.success(`Successfully created admin profile for ${userEmail}!`)
        console.log('Created admin profile:', newProfile)
      }

      // Refresh the current user's data
      if (!targetEmail) {
        await refreshUser()
      }

    } catch (error: any) {
      console.error('Error promoting to admin:', error)
      toast.error(error.message || 'Failed to promote to admin')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Admin Setup
            </CardTitle>
            <CardDescription className="text-center">
              Promote yourself or another user to admin role
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current User Info */}
            {supabaseUser && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Current User</h3>
                <p className="text-sm text-blue-700">Email: {supabaseUser.email}</p>
                <p className="text-sm text-blue-700">ID: {supabaseUser.id}</p>
                <p className="text-sm text-blue-700">
                  Profile Role: {user?.role || 'No profile found'}
                </p>
              </div>
            )}

            {/* Promote Current User */}
            <div className="space-y-4">
              <Button
                onClick={() => promoteToAdmin()}
                disabled={isLoading || !supabaseUser}
                className="w-full"
              >
                {isLoading ? 'Promoting...' : 'Promote Current User to Admin'}
              </Button>
            </div>

            {/* Promote by Email */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Or promote by email:
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button
                onClick={() => promoteToAdmin(email)}
                disabled={isLoading || !email}
                variant="outline"
                className="w-full"
              >
                {isLoading ? 'Promoting...' : 'Promote User by Email'}
              </Button>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-medium text-yellow-900 mb-2">Instructions</h3>
              <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1">
                <li>Make sure you're logged in with your Supabase account</li>
                <li>Click "Promote Current User to Admin" to make yourself an admin</li>
                <li>After promotion, navigate to /admin to access the admin panel</li>
                <li>Delete this page after setup for security</li>
              </ol>
            </div>

            {/* Warning */}
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-medium text-red-900 mb-2">Security Warning</h3>
              <p className="text-sm text-red-700">
                This page should be deleted after initial admin setup. 
                It allows anyone to promote themselves to admin role.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}