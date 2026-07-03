"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 select-none", className)}
      classNames={{
        months:           "flex flex-col sm:flex-row gap-4",
        month:            "flex flex-col gap-4 w-full",
        month_caption:    "flex items-center justify-between pt-0.5",
        caption_label:    "text-sm font-semibold text-foreground",
        nav:              "flex items-center gap-1",
        button_previous:  cn(
          "h-7 w-7 inline-flex items-center justify-center rounded-lg border border-card-border",
          "bg-background text-muted hover:bg-primary/5 hover:text-primary transition-colors",
        ),
        button_next:      cn(
          "h-7 w-7 inline-flex items-center justify-center rounded-lg border border-card-border",
          "bg-background text-muted hover:bg-primary/5 hover:text-primary transition-colors",
        ),
        month_grid:       "w-full border-collapse mt-2",
        weekdays:         "flex",
        weekday:          "w-9 text-center text-[0.75rem] font-medium text-muted pb-2",
        weeks:            "flex flex-col gap-1",
        week:             "flex",
        day:              "relative p-0 text-center text-sm focus-within:z-20",
        day_button:       cn(
          "h-9 w-9 p-0 rounded-xl text-sm font-normal text-foreground inline-flex items-center justify-center",
          "hover:bg-primary/10 hover:text-primary transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        ),
        selected:         "[&>button]:!bg-primary [&>button]:!text-sidebar [&>button]:hover:!bg-primary/90",
        today:            "[&>button]:bg-primary/10 [&>button]:text-primary [&>button]:font-semibold",
        outside:          "[&>button]:text-muted-light/50 [&>button]:hover:text-muted",
        disabled:         "[&>button]:text-muted-light/30 [&>button]:pointer-events-none",
        range_middle:     "[&>button]:bg-primary/10 [&>button]:text-primary",
        focused:          "[&>button]:ring-2 [&>button]:ring-primary/40",
        hidden:           "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...rest }) =>
          orientation === "left"
            ? <ChevronLeft  className="h-4 w-4" {...rest as React.SVGProps<SVGSVGElement>} />
            : <ChevronRight className="h-4 w-4" {...rest as React.SVGProps<SVGSVGElement>} />,
      }}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
