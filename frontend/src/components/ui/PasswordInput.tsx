import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { TextInput } from "./TextInput"
import type { TextInputProps } from "./TextInput"

export const PasswordInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    const toggleButton = (
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="rounded-sm p-1 text-text-tertiary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas transition-colors"
        title={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    )

    return (
      <TextInput
        type={showPassword ? "text" : "password"}
        className={className}
        ref={ref}
        rightElement={toggleButton}
        {...props}
      />
    )
  }
)
PasswordInput.displayName = "PasswordInput"
