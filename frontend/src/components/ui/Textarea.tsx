import * as React from "react"
import { cn } from "../../lib/utils"
import { Text } from "./Text"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <Text as="label" variant="label" className="text-text-primary">
            {label}
          </Text>
        )}
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-border-default bg-surface px-3 py-2 text-sm ring-offset-canvas placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow hover:border-border-strong",
            error && "border-danger-bg focus-visible:ring-danger-bg",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <Text variant="caption" className="text-danger-text font-medium">
            {error}
          </Text>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
