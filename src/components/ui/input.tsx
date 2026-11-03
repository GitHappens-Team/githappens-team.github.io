import * as React from "react"
import { cn } from "cn"

// git HAPPENS input: 2px ink outline, 6px corners, hard offset shadow on a paper field.
// Focus is the same 3px ink ring as buttons. `pt` compensates League Spartan's low baseline.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "min-h-11 w-full min-w-0 rounded-lg border-2 border-ink bg-paper px-4 pt-[0.18em] text-[17px] text-ink shadow-offset transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-ink-muted focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
