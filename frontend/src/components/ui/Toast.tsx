import { Toaster as Sonner } from "sonner"
import React from "react"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group pointer-events-none"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-surface group-[.toaster]:text-text-primary group-[.toaster]:border-border-default group-[.toaster]:shadow-lg pointer-events-none",
          description: "group-[.toast]:text-text-secondary pointer-events-none",
          actionButton:
            "group-[.toast]:bg-brand-primary group-[.toast]:text-text-inverse",
          cancelButton:
            "group-[.toast]:bg-surface-active group-[.toast]:text-text-primary",
          success: "group-[.toaster]:bg-success-bg group-[.toaster]:text-success-text group-[.toaster]:border-success-bg/50",
          error: "group-[.toaster]:bg-danger-bg group-[.toaster]:text-danger-text group-[.toaster]:border-danger-bg/50",
          warning: "group-[.toaster]:bg-warning-bg group-[.toaster]:text-warning-text group-[.toaster]:border-warning-bg/50",
          info: "group-[.toaster]:bg-surface group-[.toaster]:text-text-primary group-[.toaster]:border-border-default",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
