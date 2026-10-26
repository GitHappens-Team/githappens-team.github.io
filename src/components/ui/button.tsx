import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

// git HAPPENS buttons: 2px ink outline, 6px corners, hard offset shadow, bold type.
// Hover nudges up-left (the offset shadow stays put); focus is a 3px ink ring.
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border-2 border-ink pt-[0.18em] font-bold [&_svg]:-mt-[0.18em] whitespace-nowrap no-underline transition-transform duration-75 outline-none select-none focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        // primary: yellow field, ink text
        default:
          "bg-primary text-primary-foreground shadow-offset hover:-translate-x-0.5 hover:-translate-y-0.5",
        // ink field with a paper shadow, for use on yellow bands (hero CTA)
        dark: "bg-ink text-paper shadow-[4px_4px_0_var(--paper)] hover:-translate-x-0.5 hover:-translate-y-0.5",
        // paper field (footer buttons)
        outline:
          "bg-paper text-ink shadow-offset hover:-translate-x-0.5 hover:-translate-y-0.5",
        secondary:
          "bg-yellow-tint text-ink shadow-offset hover:-translate-x-0.5 hover:-translate-y-0.5",
        // folder chip: flat paper box, inverts to ink on hover (no shadow)
        chip: "bg-paper text-ink hover:bg-ink hover:text-paper",
        // nav text link: no box
        ghost:
          "border-transparent bg-transparent text-ink hover:underline",
        destructive:
          "bg-destructive text-paper shadow-offset hover:-translate-x-0.5 hover:-translate-y-0.5",
        link: "border-transparent bg-transparent text-ink underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-11 px-4 text-[17px]",
        sm: "min-h-9 px-3 text-sm [&_svg:not([class*='size-'])]:size-4",
        lg: "min-h-12 px-6 text-lg",
        icon: "size-11",
        "icon-sm": "size-9 [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
