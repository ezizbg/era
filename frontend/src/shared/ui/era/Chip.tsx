import * as React from "react"
import { cn } from "@/shared/lib/utils"

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  children: React.ReactNode
}

/**
 * ERA2 Chip — pill filter button. Use for tags, filters, segmented controls.
 */
export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ active = false, children, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      data-active={active}
      className={cn(
        "inline-flex items-center gap-1.5 px-[14px] py-[8.5px] rounded-full",
        "text-[13px] font-medium leading-none",
        "border transition-colors duration-200",
        active
          ? "bg-[var(--c-accent)] border-[var(--c-accent)] text-white"
          : "bg-card border-[var(--c-line)] text-[var(--c-fg-mute)] hover:text-[var(--c-fg)] hover:border-[var(--c-fg-low)]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
)
Chip.displayName = "Chip"
