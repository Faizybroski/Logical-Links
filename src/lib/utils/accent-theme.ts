export interface AccentTheme {
  id: string;
  name: string;
  /** Maps to --primary (bg-primary, text-primary, border-primary, ring-primary…). */
  primary: string;
  /** Maps to --primary-light (bg-primary-light, gradient stops…). */
  primaryLight: string;
  /** Maps to --primary-dark (bg-primary-dark, hover:bg-primary-dark…). */
  primaryDark: string;
  /** Maps to --primary-foreground — text/icon color that sits on a primary fill
   *  (e.g. the active sidebar link label, primary buttons). */
  primaryForeground: string;
}

// User-selectable accent ("primary") palettes for the admin dashboard. Selecting
// one overrides the --primary* CSS variables on the dashboard shell, so every
// element that renders with primary / primary-dark backgrounds shifts together:
// page/section headers, primary + active buttons, the active sidebar link
// background, focus rings, badges, etc.
export const ACCENT_THEMES: AccentTheme[] = [
  { id: "sage",      name: "Sage",       primary: "#7a9384", primaryLight: "#9ab0a4", primaryDark: "#5f7568", primaryForeground: "#ffffff" },
  { id: "stone",     name: "Stone",      primary: "#6b7280", primaryLight: "#8b909c", primaryDark: "#4f545e", primaryForeground: "#ffffff" },
  { id: "denim",     name: "Denim",      primary: "#5c7291", primaryLight: "#7d93af", primaryDark: "#465872", primaryForeground: "#ffffff" },
  { id: "lightgray", name: "Light Gray", primary: "#9ca3af", primaryLight: "#c1c7d0", primaryDark: "#7c828c", primaryForeground: "#1c1f24" },
];

// The admin dashboard's out-of-the-box accent, applied whenever no swatch is
// stored (fresh install, or the picker's "reset to default"). Overrides the
// globals.css gold that the marketing site / corporate / residential portals
// keep using.
export const DEFAULT_ACCENT_ID = "stone";

// Hex of the default accent above, used only to render the "reset to default" swatch.
export const ACCENT_DEFAULT_HEX = ACCENT_THEMES.find((t) => t.id === DEFAULT_ACCENT_ID)!.primary;

export function getAccentThemeById(id: string | null | undefined): AccentTheme | undefined {
  if (!id) return undefined;
  return ACCENT_THEMES.find((t) => t.id === id);
}
