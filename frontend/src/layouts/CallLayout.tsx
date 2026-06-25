import React from 'react'
import { Outlet } from 'react-router-dom'
import { cn } from '../lib/utils'

interface CallLayoutProps {
  className?: string
}

/**
 * CallLayout — Full-screen immersive layout for calling screens.
 * Used by: VideoChat, AudioChat, TextChat, MatchFound, Searching
 */
export function CallLayout({ className }: CallLayoutProps) {
  return (
    <div
      className={cn(
        'min-h-screen w-full bg-canvas dark flex flex-col',
        className
      )}
    >
      <Outlet />
    </div>
  )
}
