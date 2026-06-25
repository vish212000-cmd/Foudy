import * as React from "react"
import { Search } from "lucide-react"
import { cn } from "../../lib/utils"
import { TextInput } from "./TextInput"
import type { TextInputProps } from "./TextInput"

export const SearchInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <Search className="absolute left-3 top-[38px] h-4 w-4 -translate-y-1/2 text-text-tertiary" />
        <TextInput
          type="search"
          className={cn("pl-10", className)}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
SearchInput.displayName = "SearchInput"
