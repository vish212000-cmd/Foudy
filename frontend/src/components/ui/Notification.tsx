import React from "react"
import { cn } from "../../lib/utils"
import { X, Info, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react"

export interface NotificationProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  variant?: "default" | "success" | "warning" | "destructive"
  onClose?: () => void
}

const icons = {
  default: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  destructive: AlertCircle,
}

const variants = {
  default: "bg-surface border-border-default text-text-primary",
  success: "bg-success-bg border-success-bg/50 text-success-text dark:border-success-bg",
  warning: "bg-warning-bg border-warning-bg/50 text-warning-text dark:border-warning-bg",
  destructive: "bg-danger-bg border-danger-bg/50 text-danger-text dark:border-danger-bg",
}

export function Notification({
  title,
  description,
  variant = "default",
  onClose,
  className,
  ...props
}: NotificationProps) {
  const Icon = icons[variant]

  return (
    <div
      className={cn(
        "relative flex w-full max-w-sm overflow-hidden rounded-lg border shadow-lg transition-all",
        variants[variant],
        className
      )}
      {...props}
    >
      <div className="flex w-full items-start p-4">
        <div className="flex-shrink-0">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="ml-3 w-0 flex-1 pt-0.5">
          <p className="text-sm font-medium">{title}</p>
          {description && <p className="mt-1 text-sm opacity-90">{description}</p>}
        </div>
        {onClose && (
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className="inline-flex rounded-md text-inherit opacity-50 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
