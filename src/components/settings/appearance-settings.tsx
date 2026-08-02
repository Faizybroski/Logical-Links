"use client";

import { Check, RotateCcw, Sun, Moon } from "lucide-react";
import { useAppearance } from "@/components/providers/appearance-provider";
import { useAuthStore } from "@/store/auth.store";
import { SIDEBAR_THEMES, getSidebarTheme } from "@/lib/utils/sidebar-theme";
import { CONTENT_SWATCHES_LIGHT, CONTENT_SWATCHES_DARK } from "@/lib/utils/content-theme";

type Mode = "light" | "dark";

// Picks black or white for the checkmark so it stays visible against any swatch.
function iconColorFor(hex: string): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return "#ffffff";
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#000000" : "#ffffff";
}

function SwatchButton({
  color,
  active,
  onClick,
  title,
}: {
  color: string;
  active: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`relative flex h-8 w-8 items-center justify-center rounded-full border transition-transform hover:scale-105 ${
        active ? "border-primary ring-2 ring-primary/40" : "border-card-border"
      }`}
      style={{ backgroundColor: color }}
    >
      {active && <Check className="h-3.5 w-3.5" style={{ color: iconColorFor(color) }} />}
    </button>
  );
}

function ModeRow({
  mode,
  swatches,
  activeId,
  defaultColor,
  onSelect,
  onReset,
}: {
  mode: Mode;
  swatches: { id: string; name: string; bg: string }[];
  activeId: string | null;
  defaultColor: string;
  onSelect: (id: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-16 shrink-0 items-center gap-1.5 text-xs font-medium text-muted">
        {mode === "light" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        {mode === "light" ? "Light" : "Dark"}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {swatches.map((s) => (
          <SwatchButton
            key={s.id}
            color={s.bg}
            active={activeId === s.id}
            onClick={() => onSelect(s.id)}
            title={s.name}
          />
        ))}
        <button
          type="button"
          onClick={onReset}
          title="Reset to default"
          className={`relative flex h-8 w-8 items-center justify-center rounded-full border transition-transform hover:scale-105 ${
            activeId === null ? "border-primary ring-2 ring-primary/40" : "border-card-border"
          }`}
          style={{ backgroundColor: defaultColor }}
        >
          <RotateCcw className="h-3.5 w-3.5" style={{ color: iconColorFor(defaultColor) }} />
        </button>
      </div>
    </div>
  );
}

export function AppearanceSettings() {
  const user = useAuthStore((s) => s.user);
  const {
    sidebarSwatchId,
    contentSwatchId,
    setSidebarSwatch,
    setContentSwatch,
  } = useAppearance();

  const defaultSidebar = getSidebarTheme(user?.id);

  return (
    <div className="rounded-3xl border border-card-border bg-card p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">Appearance</h2>
        <p className="mt-1 text-sm text-muted">
          Personalize your dashboard colors for light and dark mode.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Sidebar Color</h3>
        <ModeRow
          mode="light"
          swatches={SIDEBAR_THEMES}
          activeId={sidebarSwatchId.light}
          defaultColor={defaultSidebar.bg}
          onSelect={(id) => setSidebarSwatch("light", id)}
          onReset={() => setSidebarSwatch("light", null)}
        />
        <ModeRow
          mode="dark"
          swatches={SIDEBAR_THEMES}
          activeId={sidebarSwatchId.dark}
          defaultColor={defaultSidebar.bg}
          onSelect={(id) => setSidebarSwatch("dark", id)}
          onReset={() => setSidebarSwatch("dark", null)}
        />
      </div>

      <div className="space-y-3 border-t border-card-border pt-5">
        <h3 className="text-sm font-medium text-foreground">Main Content Color</h3>
        <ModeRow
          mode="light"
          swatches={CONTENT_SWATCHES_LIGHT}
          activeId={contentSwatchId.light}
          defaultColor={CONTENT_SWATCHES_LIGHT[0].bg}
          onSelect={(id) => setContentSwatch("light", id)}
          onReset={() => setContentSwatch("light", null)}
        />
        <ModeRow
          mode="dark"
          swatches={CONTENT_SWATCHES_DARK}
          activeId={contentSwatchId.dark}
          defaultColor={CONTENT_SWATCHES_DARK[0].bg}
          onSelect={(id) => setContentSwatch("dark", id)}
          onReset={() => setContentSwatch("dark", null)}
        />
      </div>
    </div>
  );
}
