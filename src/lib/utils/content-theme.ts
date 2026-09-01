export interface ContentSwatch {
  id: string;
  name: string;
  bg: string;
  card: string;
  cardBorder: string;
}

// Main-content surface palettes. Each entry coordinates the page background with
// a card surface + border so every shadcn component (Card, Table, Sheet,
// Popover) shifts together, not just the page backdrop.
//
// Two collections per mode, mirroring the accent picker:
//  - SOFT: barely-there neutral tints (the original set).
//  - BOLD: a more pronounced color cast, still within the luminance range that
//          keeps the fixed --foreground text comfortably readable.

// ── Light ────────────────────────────────────────────────────────────────────
export const CONTENT_SWATCHES_LIGHT_SOFT: ContentSwatch[] = [
  { id: "warm-cream",    name: "Warm Cream",    bg: "#f7f6f3", card: "#ffffff", cardBorder: "#ebe8e1" },
  { id: "cool-gray",     name: "Cool Gray",     bg: "#f2f3f5", card: "#ffffff", cardBorder: "#e2e4e8" },
  { id: "soft-blue",     name: "Soft Blue",     bg: "#eef3fa", card: "#ffffff", cardBorder: "#dbe6f3" },
  { id: "soft-sage",     name: "Soft Sage",     bg: "#eef4ee", card: "#ffffff", cardBorder: "#dbe8db" },
  { id: "soft-rose",     name: "Soft Rose",     bg: "#faf0f0", card: "#ffffff", cardBorder: "#f0dcdc" },
  { id: "soft-lavender", name: "Soft Lavender", bg: "#f3f0fa", card: "#ffffff", cardBorder: "#e2dcf0" },
];

export const CONTENT_SWATCHES_LIGHT_BOLD: ContentSwatch[] = [
  { id: "honey",  name: "Honey",  bg: "#faf1dd", card: "#fffdf6", cardBorder: "#efe1c0" },
  { id: "azure",  name: "Azure",  bg: "#e3edfb", card: "#f6faff", cardBorder: "#cddef4" },
  { id: "meadow", name: "Meadow", bg: "#e2f3e6", card: "#f5fdf7", cardBorder: "#c6e5cd" },
  { id: "coral",  name: "Coral",  bg: "#fce7e4", card: "#fff8f7", cardBorder: "#f4d1cc" },
  { id: "orchid", name: "Orchid", bg: "#f0e6fa", card: "#fbf8ff", cardBorder: "#dfceef" },
  { id: "steel",  name: "Steel",  bg: "#e5e8ef", card: "#f7f9fc", cardBorder: "#d1d7e2" },
];

export const CONTENT_SWATCHES_LIGHT: ContentSwatch[] = [
  ...CONTENT_SWATCHES_LIGHT_SOFT,
  ...CONTENT_SWATCHES_LIGHT_BOLD,
];

// ── Dark ─────────────────────────────────────────────────────────────────────
export const CONTENT_SWATCHES_DARK_SOFT: ContentSwatch[] = [
  { id: "charcoal",      name: "Charcoal",      bg: "#111219", card: "#1a1c27", cardBorder: "rgba(255,255,255,0.08)" },
  { id: "midnight-navy", name: "Midnight Navy", bg: "#0d1420", card: "#16202f", cardBorder: "rgba(255,255,255,0.08)" },
  { id: "deep-forest",   name: "Deep Forest",   bg: "#0d1712", card: "#16241c", cardBorder: "rgba(255,255,255,0.08)" },
  { id: "deep-plum",     name: "Deep Plum",     bg: "#17111f", card: "#241a30", cardBorder: "rgba(255,255,255,0.08)" },
  { id: "espresso",      name: "Espresso",      bg: "#1a140f", card: "#271e18", cardBorder: "rgba(255,255,255,0.08)" },
  { id: "near-black",    name: "Near Black",    bg: "#0a0a0a", card: "#161616", cardBorder: "rgba(255,255,255,0.08)" },
];

export const CONTENT_SWATCHES_DARK_BOLD: ContentSwatch[] = [
  { id: "teal-noir",   name: "Teal Noir",   bg: "#0a1a1d", card: "#142a2e", cardBorder: "rgba(255,255,255,0.08)" },
  { id: "ocean-noir",  name: "Ocean Noir",  bg: "#0b1626", card: "#15223a", cardBorder: "rgba(255,255,255,0.08)" },
  { id: "indigo-noir", name: "Indigo Noir", bg: "#12102b", card: "#1e1b40", cardBorder: "rgba(255,255,255,0.08)" },
  { id: "wine-noir",   name: "Wine Noir",   bg: "#1c0f17", card: "#2a1826", cardBorder: "rgba(255,255,255,0.08)" },
  { id: "moss-noir",   name: "Moss Noir",   bg: "#0f1a12", card: "#19291d", cardBorder: "rgba(255,255,255,0.08)" },
  { id: "rust-noir",   name: "Rust Noir",   bg: "#1d130c", card: "#2b1e14", cardBorder: "rgba(255,255,255,0.08)" },
];

export const CONTENT_SWATCHES_DARK: ContentSwatch[] = [
  ...CONTENT_SWATCHES_DARK_SOFT,
  ...CONTENT_SWATCHES_DARK_BOLD,
];

export function getContentSwatchById(mode: "light" | "dark", id: string | null | undefined): ContentSwatch | undefined {
  if (!id) return undefined;
  const list = mode === "dark" ? CONTENT_SWATCHES_DARK : CONTENT_SWATCHES_LIGHT;
  return list.find((s) => s.id === id);
}
