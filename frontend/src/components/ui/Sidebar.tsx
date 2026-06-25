import React from "react"
import { cn } from "../../lib/utils"

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

export function Sidebar({ className, children, ...props }: SidebarProps) {
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-20 hidden h-screen w-64 flex-col border-r border-border-default bg-surface pt-16 md:flex",
        className
      )}
      {...props}
    >
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {children}
      </div>
    </aside>
  )
}
