import React from "react"
import { cn } from "../../lib/utils"
import { Heading } from "./Heading"
import { Text } from "./Text"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border-default bg-surface/50 px-6 py-12 text-center",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-active text-text-tertiary">
          {icon}
        </div>
      )}
      <Heading variant="h4" className="text-text-primary">
        {title}
      </Heading>
      {description && (
        <Text variant="body" className="mt-2 mb-6 max-w-sm text-text-secondary">
          {description}
        </Text>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
