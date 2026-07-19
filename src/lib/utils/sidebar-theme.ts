export interface SidebarTheme {
  name: string;
  bg: string;
  secondary: string;
  border: string;
}

// Dark, low-saturation variants so text/icons stay legible — each user gets a
// consistent one based on their account id, purely for visual distinction.
// Luminance is capped (bg ≤ 0.006, secondary ≤ 0.011) so every variant keeps
// the same white/zinc text contrast ratios as the original navy sidebar —
// no color choice can make sidebar content harder to read than another.
const SIDEBAR_THEMES: SidebarTheme[] = [
  { name: "Black", bg: "#0a0a0a", secondary: "#161616", border: "rgba(255,255,255,0.06)" },
  { name: "Midnight Navy", bg: "#060b16", secondary: "#0c1424", border: "rgba(255,255,255,0.06)" },
  { name: "Dark Chocolate", bg: "#18100b", secondary: "#251811", border: "rgba(255,255,255,0.07)" },
  { name: "Light Chocolate", bg: "#19100a", secondary: "#241910", border: "rgba(255,255,255,0.07)" },
  { name: "Espresso", bg: "#16110e", secondary: "#211a14", border: "rgba(255,255,255,0.06)" },
  { name: "Charcoal", bg: "#121212", secondary: "#1b1b1b", border: "rgba(255,255,255,0.06)" },
  { name: "Forest", bg: "#0a1410", secondary: "#0f1e18", border: "rgba(255,255,255,0.06)" },
  { name: "Wine", bg: "#170b10", secondary: "#25121a", border: "rgba(255,255,255,0.07)" },
  { name: "Slate", bg: "#0d1316", secondary: "#141c22", border: "rgba(255,255,255,0.06)" },
  { name: "Plum", bg: "#150e1c", secondary: "#22162d", border: "rgba(255,255,255,0.07)" },
];

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
