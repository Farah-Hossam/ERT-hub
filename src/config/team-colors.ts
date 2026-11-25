// The colors a team can pick from. A team's color shows on its tasks, so
// anyone looking at the board can tell at a glance whose work it is.
export const teamColors = [
  { name: "Red", hex: "#D62832" },
  { name: "Orange", hex: "#EA580C" },
  { name: "Amber", hex: "#D97706" },
  { name: "Green", hex: "#16A34A" },
  { name: "Teal", hex: "#0D9488" },
  { name: "Blue", hex: "#2563EB" },
  { name: "Indigo", hex: "#4F46E5" },
  { name: "Violet", hex: "#7C3AED" },
  { name: "Pink", hex: "#DB2777" },
  { name: "Slate", hex: "#475569" },
] as const;

export const DEFAULT_TEAM_COLOR: string = teamColors[0].hex;
