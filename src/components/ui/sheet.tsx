"use client";

import { useEffect } from "react";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: "md" | "lg" | "xl" | "2xl" | "3xl";
}

const SIZE: Record<NonNullable<SheetProps["size"]>, string> = {
  md:    "w-full sm:max-w-md",
  lg:    "w-full sm:max-w-lg",
  xl:    "w-full sm:max-w-xl",
  "2xl": "w-full sm:max-w-2xl",
  "3xl": "w-full sm:max-w-3xl",
};

export function Sheet({ open, onClose, children, size = "xl" }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-40 ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Sliding panel */}
      <div
        className={`absolute inset-y-0 right-0 flex h-full flex-col border-l border-card-border bg-background shadow-2xl transition-transform duration-300 ease-in-out ${SIZE[size]} ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
