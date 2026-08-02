"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/cn";
import { fetchAddressSuggestions, type AddressSuggestion } from "@/lib/utils/geocode";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  /** Fired when the user picks a suggestion — carries coordinates + parsed city/region/postcode. */
  onSelect?: (suggestion: AddressSuggestion) => void;
  placeholder?: string;
  className?: string;
  as?: "input" | "textarea";
  rows?: number;
  disabled?: boolean;
  ariaInvalid?: boolean;
}

interface Rect {
  top: number;
  left: number;
  width: number;
}

export function AddressAutocomplete({
  value,
  onChange,
  onBlur,
  onSelect,
  placeholder,
  className,
  as = "input",
  rows,
  disabled,
  ariaInvalid,
}: Props) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen]               = useState(false);
  const [loading, setLoading]         = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [rect, setRect]               = useState<Rect | null>(null);

  const fieldRef          = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const menuRef            = useRef<HTMLDivElement>(null);
  const debounceRef       = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef      = useRef(0);
  const skipNextFetchRef  = useRef(false); // avoids re-querying right after picking a suggestion

  useEffect(() => {
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = value.trim();
    if (trimmed.length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      const results = await fetchAddressSuggestions(trimmed);
      if (requestId !== requestIdRef.current) return; // a newer keystroke superseded this request
      setLoading(false);
      setSuggestions(results);
      setOpen(results.length > 0);
      setActiveIndex(-1);
    }, 300);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Dropdown is portaled to <body> (so a card's `overflow-hidden` can't clip
  // it) and positioned with `fixed`, so its screen position has to be
  // recomputed on open and whenever the page scrolls/resizes underneath it.
  useEffect(() => {
    if (!open) return;

    function updateRect() {
      const el = fieldRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setRect({ top: r.bottom + 4, left: r.left, width: r.width });
    }

    updateRect();
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [open, suggestions.length]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (fieldRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(s: AddressSuggestion) {
    skipNextFetchRef.current = true;
    onChange(s.placeName);
    onSelect?.(s);
    setOpen(false);
    setSuggestions([]);
    setActiveIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0) {
        e.preventDefault();
        handleSelect(suggestions[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const sharedProps = {
    value,
    placeholder,
    disabled,
    "aria-invalid": ariaInvalid,
    autoComplete: "off",
    onFocus: () => { if (suggestions.length > 0) setOpen(true); },
    onBlur: () => onBlur?.(),
    onKeyDown: handleKeyDown,
    className: cn(loading || suggestions.length > 0 ? "pr-9" : undefined, className),
  };

  const dropdown = open && suggestions.length > 0 && rect
    ? createPortal(
        <div
          ref={menuRef}
          style={{ position: "fixed", top: rect.top, left: rect.left, width: rect.width }}
          className="z-[1000] overflow-hidden rounded-xl border border-card-border bg-card shadow-lg"
        >
          <div className="max-h-60 overflow-y-auto py-1">
            {suggestions.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()} // keep the field focused so onBlur doesn't fire before the click
                onClick={() => handleSelect(s)}
                className={cn(
                  "flex w-full items-start gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-primary/5",
                  i === activeIndex && "bg-primary/5",
                )}
              >
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="text-foreground">{s.placeName}</span>
              </button>
            ))}
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <div className="relative">
      {as === "textarea" ? (
        <Textarea
          ref={fieldRef as React.Ref<HTMLTextAreaElement>}
          {...sharedProps}
          rows={rows}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <Input
          ref={fieldRef as React.Ref<HTMLInputElement>}
          {...sharedProps}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {loading && (
        <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted" />
      )}

      {dropdown}
    </div>
  );
}
