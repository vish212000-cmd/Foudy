import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "destructive" | "success" | "warning"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-brand-primary text-text-inverse hover:bg-brand-hover shadow-sm",
    secondary: "border-transparent bg-surface-active text-text-primary hover:bg-surface-active/80",
    destructive: "border-transparent bg-danger-bg text-danger-text hover:bg-danger-hover hover:text-white shadow-sm",
    success: "border-transparent bg-success-bg text-success-text hover:bg-success-bg/80 shadow-sm",
    warning: "border-transparent bg-warning-bg text-warning-text hover:bg-warning-bg/80 shadow-sm",
    outline: "text-text-primary border-border-default",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
