'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState({
    envVars: {},
    supabaseConnection: null,
    authStatus: null,
    error: null
  })

  useEffect(() => {
    const runDebug = async () => {
      try {
        // Check environment variables
        const envVars = {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          nodeEnv: process.env.NODE_ENV
        }

        console.log('Environment Variables:', envVars)

        // Test Supabase connection
        const supabase = createClient()
        console.log('Supabase client created')

        // Test basic connection
        try {
          console.log('Testing auth.getUser()...')
          const { data, error } = await supabase.auth.getUser()
          console.log('Auth result:', { data, error })
          
          setDebugInfo(prev => ({
            ...prev,
            envVars,
            supabaseConnection: 'success',
            authStatus: { hasUser: !!data.user, error: error?.message }
          }))
        } catch (authError) {
          console.error('Auth error:', authError)
          setDebugInfo(prev => ({
            ...prev,
            envVars,
            supabaseConnection: 'failed',
            error: authError.message
          }))
        }
      } catch (error) {
        console.error('Debug error:', error)
        setDebugInfo(prev => ({
          ...prev,
          error: error.message
        }))
      }
    }

    runDebug()
  }, [])

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">Environment Variables</h2>
          <pre className="text-sm mt-2">{JSON.stringify(debugInfo.envVars, null, 2)}</pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">Supabase Connection</h2>
          <p>Status: {debugInfo.supabaseConnection || 'pending...'}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">Auth Status</h2>
          <pre className="text-sm mt-2">{JSON.stringify(debugInfo.authStatus, null, 2)}</pre>
        </div>

        {debugInfo.error && (
          <div className="bg-red-100 p-4 rounded">
            <h2 className="font-semibold text-red-800">Error</h2>
            <p className="text-red-600">{debugInfo.error}</p>
          </div>
        )}
      </div>
    </div>
  )
}