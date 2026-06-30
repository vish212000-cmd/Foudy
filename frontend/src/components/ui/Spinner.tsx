import { cn } from "../../lib/utils"
import React from "react"
import { Loader2 } from "lucide-react"

export interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  size?: "sm" | "md" | "lg" | "xl"
}

export function Spinner({ className, size = "md", ...props }: SpinnerProps) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  }

  return (
    <Loader2 
      className={cn("animate-spin text-brand-primary", sizes[size], className)}
      {...props} 
    />
  )
}
