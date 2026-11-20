/**
 * ERT Hub brand and theme tokens.
 * Styling uses the CSS variables in globals.css.
 * Use this file only when code needs a raw hex value
 * (charts, PWA manifest, etc.). Keep both in sync.
 */
export const theme = {
  brand: {
    red: "#D62832",
    redDark: "#A71923",
  },
  light: {
    background: "#F5F6F7",
    surface: "#FFFFFF",
    surfaceSecondary: "#E9EAEC",
    border: "#D4D7DB",
    text: "#292C31",
    textMuted: "#70757C",
  },
  dark: {
    background: "#17191C",
    surface: "#24262A",
    surfaceSecondary: "#2F3136",
    border: "#3C3E42",
    text: "#F5F6F7",
    textMuted: "#B0B3B8",
  },
} as const;