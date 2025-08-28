import axios from 'axios'
import Cookies from 'js-cookie'
import { toast } from 'react-hot-toast'

// Create axios instance
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const refreshToken = Cookies.get('refresh_token')
      
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            { refresh_token: refreshToken }
          )
          
          const { access_token } = response.data
          
          // Update cookies with new token
          Cookies.set('access_token', access_token, { 
            expires: 1, // 1 day
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
          })
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return apiClient(originalRequest)
          
        } catch (refreshError) {
          // Refresh failed, redirect to login
          Cookies.remove('access_token')
          Cookies.remove('refresh_token')
          
          // Only redirect if we're not already on auth pages
          if (typeof window !== 'undefined' && 
              !window.location.pathname.startsWith('/auth')) {
            window.location.href = '/auth/login'
          }
          
          return Promise.reject(refreshError)
        }
      } else {
        // No refresh token, redirect to login
        if (typeof window !== 'undefined' && 
            !window.location.pathname.startsWith('/auth')) {
          window.location.href = '/auth/login'
        }
      }
    }

    // Handle other errors
    const message = error.response?.data?.detail || 
                   error.response?.data?.message || 
                   error.message || 
                   'An unexpected error occurred'

    // Don't show toast for auth pages or certain endpoints
    const isAuthRequest = originalRequest.url?.includes('/auth/')
    const isHealthCheck = originalRequest.url?.includes('/health')
    
    if (!isAuthRequest && !isHealthCheck && error.response?.status !== 401) {
      toast.error(message)
    }

    return Promise.reject(error)
  }
)

export { apiClient }

// API response types
export interface ApiResponse<T> {
  data: T
  message?: string
  status_code: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

export interface ApiError {
  detail: string
  status_code: number
  path?: string
  method?: string
  errors?: Array<{
    loc: string[]
    msg: string
    type: string
  }>
}