import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 px-2.5 py-1  shadow-xs outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger aria-invalid:ring-3 aria-invalid:ring-danger/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-danger/50 dark:aria-invalid:ring-danger/40 rounded-2xl border border-card-border bg-background text-sm text-foreground transition-all placeholder:text-muted-light focus:border-primary focus:ring-4 focus:ring-primary/10",
        className
      )}
      {...props}
    />
  )
}

export { Input }
