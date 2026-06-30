import * as React from "react"
import { Info, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react"
import { cn } from "../../lib/utils"

const alertVariants = {
  default: "bg-surface text-text-primary border-border-default",
  destructive:
    "border-danger-bg/50 bg-danger-bg/10 text-danger-text dark:border-danger-bg [&>svg]:text-danger-text",
  success:
    "border-success-bg/50 bg-success-bg/10 text-success-text dark:border-success-bg [&>svg]:text-success-text",
  warning:
    "border-warning-bg/50 bg-warning-bg/10 text-warning-text dark:border-warning-bg [&>svg]:text-warning-text",
}

const icons = {
  default: Info,
  destructive: AlertCircle,
  success: CheckCircle2,
  warning: AlertTriangle,
}

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: keyof typeof alertVariants; hideIcon?: boolean }
>(({ className, variant = "default", hideIcon = false, children, ...props }, ref) => {
  const Icon = icons[variant]
  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-text-primary",
        alertVariants[variant],
        className
      )}
      {...props}
    >
      {!hideIcon && <Icon className="h-4 w-4" />}
      {children}
    </div>
  )
})
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed opacity-90", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
