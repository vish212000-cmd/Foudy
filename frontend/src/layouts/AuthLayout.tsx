import React from 'react'
import { cn } from '../lib/utils'

interface AuthLayoutProps {
  children: React.ReactNode
  className?: string
}

/**
 * AuthLayout — Centered, minimal layout for unauthenticated screens.
 * Used by: Splash, Welcome, Login, Register
 */
export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div
      className={cn(
        'min-h-screen w-full bg-canvas flex flex-col items-center justify-center px-4',
        className
      )}
    >
      <div className="w-full max-w-md mx-auto">
        {children}
      </div>
    </div>
  )
}
