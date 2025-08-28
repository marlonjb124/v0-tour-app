'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

interface LoginForm {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
}

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push('/')
    return null
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email) {
      newErrors.email = 'El email es requerido'
    } else if (!/\\S+@\\S+\\.\\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      await login(formData)
      router.push('/') // Redirect to homepage after successful login
    } catch (error: any) {
      console.error('Login error:', error)
      // Error is already handled by the auth context with toast
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  return (
    <div className=\"min-h-screen flex items-center justify-center bg-muted/30 px-4\">
      <Card className=\"w-full max-w-md\">
        <CardHeader className=\"text-center\">
          <CardTitle className=\"text-2xl font-bold\">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder a tu cuenta
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className=\"space-y-4\">
            {/* Email Field */}
            <div className=\"space-y-2\">
              <Label htmlFor=\"email\" className=\"text-sm font-medium\">
                Email
              </Label>
              <Input
                id=\"email\"
                name=\"email\"
                type=\"email\"
                value={formData.email}
                onChange={handleInputChange}
                placeholder=\"tu@email.com\"
                disabled={isSubmitting}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className=\"text-sm text-red-500\">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className=\"space-y-2\">
              <Label htmlFor=\"password\" className=\"text-sm font-medium\">
                Contraseña
              </Label>
              <div className=\"relative\">
                <Input
                  id=\"password\"
                  name=\"password\"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder=\"••••••••\"
                  disabled={isSubmitting}
                  className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
                />
                <Button
                  type=\"button\"
                  variant=\"ghost\"
                  size=\"sm\"
                  className=\"absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent\"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className=\"h-4 w-4\" />
                  ) : (
                    <Eye className=\"h-4 w-4\" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className=\"text-sm text-red-500\">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              type=\"submit\" 
              className=\"w-full\"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className=\"mr-2 h-4 w-4 animate-spin\" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>

          {/* Links */}
          <div className=\"mt-6 text-center space-y-2\">
            <p className=\"text-sm text-muted-foreground\">
              ¿No tienes una cuenta?{' '}
              <Link 
                href=\"/auth/register\" 
                className=\"text-primary hover:underline font-medium\"
              >
                Regístrate aquí
              </Link>
            </p>
            
            <p className=\"text-sm\">
              <Link 
                href=\"/auth/forgot-password\" 
                className=\"text-primary hover:underline\"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </p>
          </div>

          {/* Demo Accounts */}
          <div className=\"mt-6 p-4 bg-muted/50 rounded-lg\">
            <p className=\"text-sm font-medium mb-2\">Cuentas de demostración:</p>
            <div className=\"space-y-1 text-xs text-muted-foreground\">
              <p>Admin: admin@tours.com / admin123</p>
              <p>Usuario: usuario@tours.com / usuario123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}"