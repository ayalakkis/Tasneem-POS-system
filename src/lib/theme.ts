// Shared by the server (reads the cookie) and ThemeToggle (writes it).
// Namespaced: cookies are shared across ports, so a generic "theme" collides
// with other apps on the same host.
export const THEME_COOKIE = "pos-theme";

export const THEMES = ["system", "light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

export function parseTheme(value: string | undefined): Theme {
  return value === "light" || value === "dark" ? value : "system";
}
