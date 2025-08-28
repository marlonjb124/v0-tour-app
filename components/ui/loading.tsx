'use client'

import { Loader2, Plane } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'plane' | 'dots' | 'pulse'
  text?: string
  className?: string
  fullScreen?: boolean
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

export function Loading({
  size = 'md',
  variant = 'spinner',
  text,
  className,
  fullScreen = false
}: LoadingProps) {
  const iconSize = sizeClasses[size]

  const LoadingIcon = () => {
    switch (variant) {
      case 'spinner':
        return <Loader2 className={cn(iconSize, 'animate-spin')} />
      case 'plane':
        return <Plane className={cn(iconSize, 'animate-bounce')} />
      case 'dots':
        return (
          <div className="flex space-x-1">
            <div className={cn('rounded-full bg-current animate-bounce', size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4')} style={{ animationDelay: '0ms' }} />
            <div className={cn('rounded-full bg-current animate-bounce', size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4')} style={{ animationDelay: '150ms' }} />
            <div className={cn('rounded-full bg-current animate-bounce', size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4')} style={{ animationDelay: '300ms' }} />
          </div>
        )
      case 'pulse':
        return (
          <div className={cn('rounded-full bg-current animate-pulse', iconSize)} />
        )
      default:
        return <Loader2 className={cn(iconSize, 'animate-spin')} />
    }
  }

  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center gap-3 text-muted-foreground',
      fullScreen && 'min-h-screen',
      className
    )}>
      <LoadingIcon />
      {text && (
        <p className={cn(
          'text-center',
          size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : size === 'lg' ? 'text-base' : 'text-lg'
        )}>
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    )
  }

  return content
}

// Skeleton Loading Components
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="bg-muted rounded-lg h-48 mb-4" />
      <div className="space-y-2">
        <div className="bg-muted h-4 rounded w-3/4" />
        <div className="bg-muted h-4 rounded w-1/2" />
        <div className="bg-muted h-4 rounded w-2/3" />
      </div>
    </div>
  )
}

export function SkeletonTable({ 
  rows = 5, 
  columns = 4, 
  className 
}: { 
  rows?: number
  columns?: number
  className?: string 
}) {
  return (
    <div className={cn('animate-pulse space-y-4', className)}>
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="bg-muted h-4 rounded flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="bg-muted h-4 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonForm({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse space-y-6', className)}>
      <div className="space-y-2">
        <div className="bg-muted h-4 rounded w-1/4" />
        <div className="bg-muted h-10 rounded" />
      </div>
      
      <div className="space-y-2">
        <div className="bg-muted h-4 rounded w-1/3" />
        <div className="bg-muted h-20 rounded" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="bg-muted h-4 rounded w-1/2" />
          <div className="bg-muted h-10 rounded" />
        </div>
        <div className="space-y-2">
          <div className="bg-muted h-4 rounded w-1/2" />
          <div className="bg-muted h-10 rounded" />
        </div>
      </div>
      
      <div className="bg-muted h-10 rounded w-1/4" />
    </div>
  )
}