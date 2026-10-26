import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

// git HAPPENS pill: 2px ink outline, fully rounded, bold small type, no shadow.
// `pt` compensates League Spartan's low baseline (same trick as Button).
const badgeVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full border-2 border-ink pt-[0.18em] whitespace-nowrap text-ink [&_svg]:-mt-[0.18em] [&_svg]:pointer-events-none [&_svg]:size-4",
  {
    variants: {
      variant: {
        // pale yellow: document counts
        default: "bg-yellow-tint",
        // brand yellow: "PDF" tags
        yellow: "bg-primary",
        outline: "bg-paper",
      },
      size: {
        default: "min-h-8 px-4 text-sm font-bold",
        sm: "min-h-7 px-3 text-sm font-extrabold tracking-[0.04em]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
