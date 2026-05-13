export const colors = {
  // Brand — green (accent)
  green: "var(--accent)",
  greenHover: "var(--accent-hover)",
  greenMid: "var(--accent-mid)",
  greenLight: "var(--accent-surface)",

  // Brand — blue (link / info)
  blue: "var(--link)",
  blueHover: "var(--link-hover)",
  blueLight: "var(--info-surface)",

  // Surfaces
  charcoal: "var(--text-primary)",   // kept for compat — use textPrimary going forward
  eggWhite: "var(--surface-page)",
  white: "var(--surface)",
  whiteHover: "var(--surface-hover)",
  border: "var(--border)",
  muted: "var(--surface-subtle)",

  // Text
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  textWhite: "var(--text-on-accent)",

  // Danger
  red: "var(--danger)",
  redLight: "var(--danger-surface)",
  redBorder: "var(--danger-border)",
  redText: "var(--danger-text)",

  // Warning
  yellow: "var(--warning)",
  yellowLight: "var(--warning-surface)",
  yellowBorder: "var(--warning-border)",

  // Sidebar
  navInactive: "var(--sidebar-text-muted)",
  sidebarBorder: "var(--sidebar-border)",
  sidebarHover: "var(--sidebar-hover)",
  sidebarActive: "var(--sidebar-active)",
  sidebarBg: "var(--sidebar-bg)",
  sidebarText: "var(--sidebar-text)",
} as const;
