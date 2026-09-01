export interface SidebarTheme {
  id: string;
  name: string;
  bg: string;
  secondary: string;
  border: string;
}

// Dark, low-saturation variants so text/icons stay legible — each user gets a
// consistent one based on their account id, purely for visual distinction.
// Luminance is capped (bg very dark) so every variant keeps the same white/zinc
// text contrast ratios as the original navy sidebar — no color choice can make
// sidebar content harder to read than another.
//
// Two collections, mirroring the accent picker:
//  - NEUTRAL: grayscale / blue-black, no visible hue.
//  - TINTED:  same darkness, but with a discernible color cast.

const SIDEBAR_THEMES_NEUTRAL: SidebarTheme[] = [
  { id: "black",         name: "Black",         bg: "#0a0a0a", secondary: "#161616", border: "rgba(255,255,255,0.06)" },
  { id: "charcoal",      name: "Charcoal",      bg: "#121212", secondary: "#1b1b1b", border: "rgba(255,255,255,0.06)" },
  { id: "graphite",      name: "Graphite",      bg: "#15171c", secondary: "#1f232b", border: "rgba(255,255,255,0.06)" },
  { id: "slate",         name: "Slate",         bg: "#0d1316", secondary: "#141c22", border: "rgba(255,255,255,0.06)" },
  { id: "midnight-navy", name: "Midnight Navy", bg: "#060b16", secondary: "#0c1424", border: "rgba(255,255,255,0.06)" },
  { id: "gunmetal",      name: "Gunmetal",      bg: "#101319", secondary: "#191d26", border: "rgba(255,255,255,0.06)" },
];

const SIDEBAR_THEMES_TINTED: SidebarTheme[] = [
  { id: "espresso",  name: "Espresso",  bg: "#16110e", secondary: "#211a14", border: "rgba(255,255,255,0.06)" },
  { id: "chocolate", name: "Chocolate", bg: "#18100b", secondary: "#251811", border: "rgba(255,255,255,0.07)" },
  { id: "forest",    name: "Forest",    bg: "#0a1410", secondary: "#0f1e18", border: "rgba(255,255,255,0.06)" },
  { id: "pine",      name: "Pine",      bg: "#08151a", secondary: "#0d2029", border: "rgba(255,255,255,0.06)" },
  { id: "ocean",     name: "Ocean",     bg: "#0a121f", secondary: "#10192b", border: "rgba(255,255,255,0.06)" },
  { id: "indigo",    name: "Indigo",    bg: "#0f0d1f", secondary: "#17142d", border: "rgba(255,255,255,0.07)" },
  { id: "plum",      name: "Plum",      bg: "#150e1c", secondary: "#22162d", border: "rgba(255,255,255,0.07)" },
  { id: "wine",      name: "Wine",      bg: "#170b10", secondary: "#25121a", border: "rgba(255,255,255,0.07)" },
];

const SIDEBAR_THEMES: SidebarTheme[] = [...SIDEBAR_THEMES_NEUTRAL, ...SIDEBAR_THEMES_TINTED];

export { SIDEBAR_THEMES, SIDEBAR_THEMES_NEUTRAL, SIDEBAR_THEMES_TINTED };

export function getSidebarThemeById(id: string | null | undefined): SidebarTheme | undefined {
  if (!id) return undefined;
  return SIDEBAR_THEMES.find((t) => t.id === id);
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getSidebarTheme(seed: string | null | undefined): SidebarTheme {
  if (!seed) return SIDEBAR_THEMES[0];
  return SIDEBAR_THEMES[hashString(seed) % SIDEBAR_THEMES.length];
}
