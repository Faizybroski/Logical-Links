"use client";

import { forwardRef, useState } from "react";
import { format, parseISO, isValid } from "date-fns";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Props {
  /** ISO date string YYYY-MM-DD, or empty string for unset */
  value:        string;
  onChange:     (val: string) => void;
  onBlur?:      () => void;
  placeholder?: string;
  disabled?:    boolean;
  id?:          string;
  /** Show destructive border/ring when the field has a validation error */
  error?:       boolean;
}

function parseDate(val: string): Date | undefined {
  if (!val) return undefined;
  const d = parseISO(val);
  return isValid(d) ? d : undefined;
}

function formatDisplay(val: string): string {
  const d = parseDate(val);
  if (!d) return "";
  return format(d, "dd MMM yyyy");
}

export const DatePicker = forwardRef<HTMLButtonElement, Props>(
  function DatePicker({ value, onChange, onBlur, placeholder = "Select date", disabled, id, error }, ref) {
    const [open, setOpen] = useState(false);
    const selected = parseDate(value);

    function handleSelect(day: Date | undefined) {
      if (day) {
        onChange(format(day, "yyyy-MM-dd"));
        setOpen(false);
      } else {
        onChange("");
      }
    }

    function handleOpenChange(isOpen: boolean) {
      setOpen(isOpen);
      if (!isOpen) onBlur?.();
    }

    return (
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "h-10 w-full justify-start rounded-2xl border-card-border bg-background px-3 text-sm font-normal",
              "hover:border-primary/40 hover:bg-background",
              "focus:border-primary focus:ring-4 focus:ring-primary/10",
              "active:bg-background",
              "active:border-primary active:ring-4 active:ring-primary/10",
              "data-[state=open]:bg-background data-[state=open]:border-primary data-[state=open]:ring-4 data-[state=open]:ring-primary/10",
              !value && "text-muted-foreground",
              error && "border-destructive focus:border-destructive focus:ring-destructive/20 data-[state=open]:border-destructive data-[state=open]:ring-destructive/20",
            )}
          >
            <CalendarDays className="mr-2 h-4 w-4 shrink-0 text-muted" />
            <span className={cn(value ? "text-foreground" : "text-muted-light")}>
              {value ? formatDisplay(value) : placeholder}
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto" align="start">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            defaultMonth={selected}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    );
  },
);
