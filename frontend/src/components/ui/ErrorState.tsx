import React from "react"
import { AlertCircle } from "lucide-react"
import { EmptyState } from "./EmptyState"

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  action?: React.ReactNode
}

export function ErrorState({
  title = "Something went wrong",
  description = "We encountered an unexpected error. Please try again or contact support if the issue persists.",
  action,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <EmptyState
      icon={<AlertCircle className="h-6 w-6 text-danger-text" />}
      title={title}
      description={description}
      action={action}
      className={className}
      {...props}
    />
  )
}
