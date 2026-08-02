export interface ContentSwatch {
  id: string;
  name: string;
  bg: string;
  card: string;
  cardBorder: string;
}

// Light-mode surface palettes — kept light enough that the fixed dark
// `--foreground` text color stays comfortably readable, mirroring the
// sidebar palette's capped-luminance guarantee. Each entry coordinates the
// page background with a card surface + border so every shadcn component
// (Card, Table, Sheet, Popover) shifts together, not just the page backdrop.
export const CONTENT_SWATCHES_LIGHT: ContentSwatch[] = [
  { id: "warm-cream",    name: "Warm Cream",    bg: "#f7f6f3", card: "#ffffff", cardBorder: "#ebe8e1" },
  { id: "cool-gray",     name: "Cool Gray",     bg: "#f2f3f5", card: "#ffffff", cardBorder: "#e2e4e8" },
  { id: "soft-blue",     name: "Soft Blue",     bg: "#eef3fa", card: "#ffffff", cardBorder: "#dbe6f3" },
  { id: "soft-sage",     name: "Soft Sage",     bg: "#eef4ee", card: "#ffffff", cardBorder: "#dbe8db" },
  { id: "soft-rose",     name: "Soft Rose",     bg: "#faf0f0", card: "#ffffff", cardBorder: "#f0dcdc" },
  { id: "soft-lavender", name: "Soft Lavender", bg: "#f3f0fa", card: "#ffffff", cardBorder: "#e2dcf0" },
];

// Dark-mode surface palettes — kept dark enough that the fixed light
// `--foreground` text color stays comfortably readable. Card tone is a
// lighter step up from the page background, same relationship as today's
// default (bg #111219 → card #1a1c27).
export const CONTENT_SWATCHES_DARK: ContentSwatch[] = [
  { id: "charcoal",      name: "Charcoal",      bg: "#111219", card: "#1a1c27", cardBorder: "rgba(255,255,255,0.08)" },
  { id: "midnight-navy", name: "Midnight Navy", bg: "#0d1420", card: "#16202f", cardBorder: "rgba(255,255,255,0.08)" },
  { id: "deep-forest",   name: "Deep Forest",   bg: "#0d1712", card: "#16241c", cardBorder: "rgba(255,255,255,0.08)" },
  { id: "deep-plum",     name: "Deep Plum",     bg: "#17111f", card: "#241a30", cardBorder: "rgba(255,255,255,0.08)" },
  { id: "espresso",      name: "Espresso",      bg: "#1a140f", card: "#271e18", cardBorder: "rgba(255,255,255,0.08)" },
  { id: "near-black",    name: "Near Black",    bg: "#0a0a0a", card: "#161616", cardBorder: "rgba(255,255,255,0.08)" },
];

export function getContentSwatchById(mode: "light" | "dark", id: string | null | undefined): ContentSwatch | undefined {
  if (!id) return undefined;
  const list = mode === "dark" ? CONTENT_SWATCHES_DARK : CONTENT_SWATCHES_LIGHT;
  return list.find((s) => s.id === id);
}
