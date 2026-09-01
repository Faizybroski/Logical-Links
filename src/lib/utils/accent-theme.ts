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

// User-selectable accent ("primary") palettes for the dashboard. Selecting one
// overrides the --primary* CSS variables on the dashboard shell, so every
// element that renders with primary / primary-dark backgrounds shifts together:
// page/section headers, primary + active buttons, the active sidebar link
// background, focus rings, badges, etc. The default gold is represented by the
// reset swatch (no id stored) and keeps the globals.css :root values.

// ── Vivid ────────────────────────────────────────────────────────────────────
// Saturated, high-energy hues.
export const ACCENT_THEMES_VIVID: AccentTheme[] = [
  { id: "amber",   name: "Amber",   primary: "#f59e0b", primaryLight: "#fbbf24", primaryDark: "#b45309", primaryForeground: "#1c1400" },
  { id: "orange",  name: "Orange",  primary: "#f97316", primaryLight: "#fb923c", primaryDark: "#c2410c", primaryForeground: "#1c0d00" },
  { id: "red",     name: "Red",     primary: "#ef4444", primaryLight: "#f87171", primaryDark: "#b91c1c", primaryForeground: "#ffffff" },
  { id: "rose",    name: "Rose",    primary: "#f43f5e", primaryLight: "#fb7185", primaryDark: "#be123c", primaryForeground: "#ffffff" },
  { id: "pink",    name: "Pink",    primary: "#ec4899", primaryLight: "#f472b6", primaryDark: "#be185d", primaryForeground: "#ffffff" },
  { id: "fuchsia", name: "Fuchsia", primary: "#d946ef", primaryLight: "#e879f9", primaryDark: "#a21caf", primaryForeground: "#ffffff" },
  { id: "violet",  name: "Violet",  primary: "#8b5cf6", primaryLight: "#a78bfa", primaryDark: "#6d28d9", primaryForeground: "#ffffff" },
  { id: "indigo",  name: "Indigo",  primary: "#6366f1", primaryLight: "#818cf8", primaryDark: "#4338ca", primaryForeground: "#ffffff" },
  { id: "blue",    name: "Blue",    primary: "#3b82f6", primaryLight: "#60a5fa", primaryDark: "#1d4ed8", primaryForeground: "#ffffff" },
  { id: "sky",     name: "Sky",     primary: "#0ea5e9", primaryLight: "#38bdf8", primaryDark: "#0369a1", primaryForeground: "#ffffff" },
  { id: "teal",    name: "Teal",    primary: "#14b8a6", primaryLight: "#2dd4bf", primaryDark: "#0f766e", primaryForeground: "#04211d" },
  { id: "emerald", name: "Emerald", primary: "#10b981", primaryLight: "#34d399", primaryDark: "#047857", primaryForeground: "#04231a" },
  { id: "green",   name: "Green",   primary: "#22c55e", primaryLight: "#4ade80", primaryDark: "#15803d", primaryForeground: "#052e16" },
  { id: "lime",    name: "Lime",    primary: "#84cc16", primaryLight: "#a3e635", primaryDark: "#4d7c0f", primaryForeground: "#1a2e05" },
  { id: "slate",   name: "Slate",   primary: "#64748b", primaryLight: "#94a3b8", primaryDark: "#475569", primaryForeground: "#ffffff" },
];

// ── Muted ────────────────────────────────────────────────────────────────────
// The opposite of the vivid set: low-chroma, earthy, mid-dark tones that are
// easy on the eyes for long sessions. Same 15 hue families, calmed down.
export const ACCENT_THEMES_MUTED: AccentTheme[] = [
  { id: "stone",      name: "Stone",      primary: "#6b7280", primaryLight: "#8b909c", primaryDark: "#4f545e", primaryForeground: "#ffffff" },
  { id: "clay",       name: "Clay",       primary: "#9d6b57", primaryLight: "#b88a78", primaryDark: "#7c5343", primaryForeground: "#ffffff" },
  { id: "terracotta", name: "Terracotta", primary: "#b06f56", primaryLight: "#c68d78", primaryDark: "#8a5642", primaryForeground: "#ffffff" },
  { id: "sand",       name: "Sand",       primary: "#a58f68", primaryLight: "#bfab8a", primaryDark: "#837152", primaryForeground: "#ffffff" },
  { id: "olive",      name: "Olive",      primary: "#7c7f4b", primaryLight: "#999c6a", primaryDark: "#61633a", primaryForeground: "#ffffff" },
  { id: "moss",       name: "Moss",       primary: "#6d8560", primaryLight: "#8aa17e", primaryDark: "#55684a", primaryForeground: "#ffffff" },
  { id: "sage",       name: "Sage",       primary: "#7a9384", primaryLight: "#9ab0a4", primaryDark: "#5f7568", primaryForeground: "#ffffff" },
  { id: "fern",       name: "Fern",       primary: "#5b8a6b", primaryLight: "#7ba889", primaryDark: "#466b53", primaryForeground: "#ffffff" },
  { id: "lagoon",     name: "Lagoon",     primary: "#4f8a88", primaryLight: "#70a8a6", primaryDark: "#3c6a68", primaryForeground: "#ffffff" },
  { id: "ocean",      name: "Ocean",      primary: "#4c7a99", primaryLight: "#6d98b4", primaryDark: "#3a5f77", primaryForeground: "#ffffff" },
  { id: "denim",      name: "Denim",      primary: "#5c7291", primaryLight: "#7d93af", primaryDark: "#465872", primaryForeground: "#ffffff" },
  { id: "twilight",   name: "Twilight",   primary: "#6b6a99", primaryLight: "#8a89b4", primaryDark: "#525177", primaryForeground: "#ffffff" },
  { id: "mauve",      name: "Mauve",      primary: "#8a6b8f", primaryLight: "#a88bac", primaryDark: "#6b526f", primaryForeground: "#ffffff" },
  { id: "dusty-rose", name: "Dusty Rose", primary: "#a56d78", primaryLight: "#c08d97", primaryDark: "#82545d", primaryForeground: "#ffffff" },
  { id: "mulberry",   name: "Mulberry",   primary: "#8a5866", primaryLight: "#a87783", primaryDark: "#6b4350", primaryForeground: "#ffffff" },
];

// Every accent, for id → theme lookup.
export const ACCENT_THEMES: AccentTheme[] = [...ACCENT_THEMES_VIVID, ...ACCENT_THEMES_MUTED];

// Approximate hex of the default gold (globals.css: oklch(70.5% 0.112 80.68)),
// used only to render the "reset to default" swatch.
export const ACCENT_DEFAULT_HEX = "#c8983f";

export function getAccentThemeById(id: string | null | undefined): AccentTheme | undefined {
  if (!id) return undefined;
  return ACCENT_THEMES.find((t) => t.id === id);
}
