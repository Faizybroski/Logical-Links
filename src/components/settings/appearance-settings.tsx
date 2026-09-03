"use client";

import { Check, RotateCcw, Sun, Moon } from "lucide-react";
import { useAppearance } from "@/components/providers/appearance-provider";
import { useAuthStore } from "@/store/auth.store";
import {
  SIDEBAR_THEMES_NEUTRAL,
  SIDEBAR_THEMES_TINTED,
  getSidebarTheme,
} from "@/lib/utils/sidebar-theme";
import {
  CONTENT_SWATCHES_LIGHT_SOFT,
  CONTENT_SWATCHES_LIGHT_BOLD,
  CONTENT_SWATCHES_DARK_SOFT,
  CONTENT_SWATCHES_DARK_BOLD,
} from "@/lib/utils/content-theme";
import {
  ACCENT_THEMES_VIVID,
  ACCENT_THEMES_MUTED,
  ACCENT_DEFAULT_HEX,
} from "@/lib/utils/accent-theme";

type Mode = "light" | "dark";
type SwatchLite = { id: string; name: string; bg: string };

// The accent picker reuses ModeRow, which expects `{ id, name, bg }` swatches.
const ACCENT_SWATCHES_VIVID: SwatchLite[] = ACCENT_THEMES_VIVID.map((a) => ({ id: a.id, name: a.name, bg: a.primary }));
const ACCENT_SWATCHES_MUTED: SwatchLite[] = ACCENT_THEMES_MUTED.map((a) => ({ id: a.id, name: a.name, bg: a.primary }));

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

// A named collection: a "Light" and a "Dark" row of swatches sharing one
// selection. Same shape used by every picker (sidebar / content / accent).
function CollectionGroup({
  label,
  lightSwatches,
  darkSwatches,
  activeId,
  defaultLight,
  defaultDark,
  onSelect,
  onReset,
}: {
  label: string;
  lightSwatches: SwatchLite[];
  darkSwatches: SwatchLite[];
  activeId: { light: string | null; dark: string | null };
  defaultLight: string;
  defaultDark: string;
  onSelect: (mode: Mode, id: string) => void;
  onReset: (mode: Mode) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-light">
        {label}
      </p>
      <ModeRow
        mode="light"
        swatches={lightSwatches}
        activeId={activeId.light}
        defaultColor={defaultLight}
        onSelect={(id) => onSelect("light", id)}
        onReset={() => onReset("light")}
      />
      <ModeRow
        mode="dark"
        swatches={darkSwatches}
        activeId={activeId.dark}
        defaultColor={defaultDark}
        onSelect={(id) => onSelect("dark", id)}
        onReset={() => onReset("dark")}
      />
    </div>
  );
}

export function AppearanceSettings() {
  const user = useAuthStore((s) => s.user);
  // Accent color is an admin-portal-only customization — customer portals
  // (corporate / residential) don't get the picker.
  const isAdmin = user?.role === "admin";
  const {
    sidebarSwatchId,
    contentSwatchId,
    accentSwatchId,
    setSidebarSwatch,
    setContentSwatch,
    setAccentSwatch,
  } = useAppearance();

  const defaultSidebar = getSidebarTheme(user?.id);
  const defaultContentLight = CONTENT_SWATCHES_LIGHT_SOFT[0].bg;
  const defaultContentDark = CONTENT_SWATCHES_DARK_SOFT[0].bg;

  return (
    <div className="rounded-3xl border border-card-border bg-card p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">Appearance</h2>
        <p className="mt-1 text-sm text-muted">
          Personalize your dashboard colors for light and dark mode.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">Sidebar Color</h3>
        <CollectionGroup
          label="Neutral"
          lightSwatches={SIDEBAR_THEMES_NEUTRAL}
          darkSwatches={SIDEBAR_THEMES_NEUTRAL}
          activeId={sidebarSwatchId}
          defaultLight={defaultSidebar.bg}
          defaultDark={defaultSidebar.bg}
          onSelect={setSidebarSwatch}
          onReset={(m) => setSidebarSwatch(m, null)}
        />
        <CollectionGroup
          label="Tinted"
          lightSwatches={SIDEBAR_THEMES_TINTED}
          darkSwatches={SIDEBAR_THEMES_TINTED}
          activeId={sidebarSwatchId}
          defaultLight={defaultSidebar.bg}
          defaultDark={defaultSidebar.bg}
          onSelect={setSidebarSwatch}
          onReset={(m) => setSidebarSwatch(m, null)}
        />
      </div>

      <div className="space-y-4 border-t border-card-border pt-5">
        <h3 className="text-sm font-medium text-foreground">Main Content Color</h3>
        <CollectionGroup
          label="Soft"
          lightSwatches={CONTENT_SWATCHES_LIGHT_SOFT}
          darkSwatches={CONTENT_SWATCHES_DARK_SOFT}
          activeId={contentSwatchId}
          defaultLight={defaultContentLight}
          defaultDark={defaultContentDark}
          onSelect={setContentSwatch}
          onReset={(m) => setContentSwatch(m, null)}
        />
        <CollectionGroup
          label="Bold"
          lightSwatches={CONTENT_SWATCHES_LIGHT_BOLD}
          darkSwatches={CONTENT_SWATCHES_DARK_BOLD}
          activeId={contentSwatchId}
          defaultLight={defaultContentLight}
          defaultDark={defaultContentDark}
          onSelect={setContentSwatch}
          onReset={(m) => setContentSwatch(m, null)}
        />
      </div>

      {isAdmin && (
        <div className="space-y-4 border-t border-card-border pt-5">
          <div>
            <h3 className="text-sm font-medium text-foreground">Accent Color</h3>
            <p className="mt-1 text-xs text-muted">
              Applies to headers, primary &amp; active buttons, the active sidebar
              link, focus rings, and other primary-colored elements.
            </p>
          </div>
          <CollectionGroup
            label="Vivid"
            lightSwatches={ACCENT_SWATCHES_VIVID}
            darkSwatches={ACCENT_SWATCHES_VIVID}
            activeId={accentSwatchId}
            defaultLight={ACCENT_DEFAULT_HEX}
            defaultDark={ACCENT_DEFAULT_HEX}
            onSelect={setAccentSwatch}
            onReset={(m) => setAccentSwatch(m, null)}
          />
          <CollectionGroup
            label="Muted"
            lightSwatches={ACCENT_SWATCHES_MUTED}
            darkSwatches={ACCENT_SWATCHES_MUTED}
            activeId={accentSwatchId}
            defaultLight={ACCENT_DEFAULT_HEX}
            defaultDark={ACCENT_DEFAULT_HEX}
            onSelect={setAccentSwatch}
            onReset={(m) => setAccentSwatch(m, null)}
          />
        </div>
      )}
    </div>
  );
}
