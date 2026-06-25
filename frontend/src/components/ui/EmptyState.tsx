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
        "flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border-default bg-surface p-8 text-center",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-active text-text-tertiary">
          {icon}
        </div>
      )}
      <Heading variant="h4" className="mb-2 text-text-primary">
        {title}
      </Heading>
      {description && (
        <Text variant="body" className="mb-6 max-w-sm text-text-secondary">
          {description}
        </Text>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
