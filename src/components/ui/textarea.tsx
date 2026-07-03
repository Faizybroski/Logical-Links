import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md border border-input px-2.5 py-2  shadow-xs transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 w-full rounded-2xl border border-card-border bg-background text-sm text-foreground outline-none transition-all placeholder:text-muted-light focus:border-primary focus:ring-4 focus:ring-primary/10",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
