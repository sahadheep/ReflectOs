import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import * as React from "react"

const badgeVariants = cva(
  "inline-flex items-center rounded-sm px-2 py-0.5 text-[12px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-accent-muted text-accent hover:bg-accent-muted/80",
        neutral: "bg-bg-surface-raised text-text-secondary hover:bg-bg-surface-hover",
        destructive: "bg-danger/10 text-danger hover:bg-danger/20",
        outline: "text-text-secondary border border-border-subtle hover:bg-bg-surface-raised",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
