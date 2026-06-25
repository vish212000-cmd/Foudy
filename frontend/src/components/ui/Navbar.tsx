import React from "react"
import { cn } from "../../lib/utils"

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

export function Navbar({ className, children, ...props }: NavbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full border-b border-border-default bg-surface/80 backdrop-blur-md",
        className
      )}
      {...props}
    >
      <div className="flex h-16 items-center px-4 md:px-6">
        {children}
      </div>
    </header>
  )
}
