'use client'

import React from 'react'

export default function AdminSetupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xl w-full text-center">
        <h1 className="text-2xl font-bold mb-2">Admin setup deshabilitado</h1>
        <p className="text-muted-foreground mb-4">
          La creación y asignación de administradores se realiza manualmente en Supabase.
        </p>
        <p className="text-sm text-gray-600">
          Si necesitas acceso de administrador, solicita a un owner que actualice tu fila en la tabla <code>public.users</code>
          estableciendo <code>role = 'admin'</code> para tu <code>id = auth.uid()</code>.
        </p>
      </div>
    </div>
  )
}