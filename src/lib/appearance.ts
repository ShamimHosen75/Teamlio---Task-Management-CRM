export type ThemeMode = "light" | "dark" | "system";
export type FontStyle = "jakarta" | "manrope" | "work-sans" | "system";

export interface AppearanceSettings {
  mode: ThemeMode;
  primary: string;
  primaryForeground: string;
  text: string;
  font: FontStyle;
  radius: number;
}

export const APPEARANCE_KEY = "teamlio-appearance";
export const LEGACY_THEME_KEY = "teamlio-theme";

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  mode: "light",
  primary: "#3569d4",
  primaryForeground: "#ffffff",
  text: "#202738",
  font: "jakarta",
  radius: 12,
};

export const FONT_OPTIONS: Array<{ value: FontStyle; label: string; family: string }> = [
  { value: "jakarta", label: "Plus Jakarta Sans", family: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif' },
  { value: "manrope", label: "Manrope", family: '"Manrope", ui-sans-serif, system-ui, sans-serif' },
  { value: "work-sans", label: "Work Sans", family: '"Work Sans", ui-sans-serif, system-ui, sans-serif' },
  { value: "system", label: "System UI", family: "ui-sans-serif, system-ui, sans-serif" },
];

function isHex(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

export function readAppearance(): AppearanceSettings {
  if (typeof window === "undefined") return DEFAULT_APPEARANCE;
  try {
    const stored = window.localStorage.getItem(APPEARANCE_KEY);
    if (!stored) {
      const legacyMode = window.localStorage.getItem(LEGACY_THEME_KEY);
      return { ...DEFAULT_APPEARANCE, mode: legacyMode === "dark" ? "dark" : "light" };
    }
    const parsed = JSON.parse(stored) as Partial<AppearanceSettings>;
    return {
      mode: parsed.mode === "dark" || parsed.mode === "system" ? parsed.mode : "light",
      primary: isHex(parsed.primary) ? parsed.primary : DEFAULT_APPEARANCE.primary,
      primaryForeground: isHex(parsed.primaryForeground)
        ? parsed.primaryForeground
        : DEFAULT_APPEARANCE.primaryForeground,
      text: isHex(parsed.text) ? parsed.text : DEFAULT_APPEARANCE.text,
      font: FONT_OPTIONS.some((option) => option.value === parsed.font)
        ? (parsed.font as FontStyle)
        : DEFAULT_APPEARANCE.font,
      radius: typeof parsed.radius === "number" && parsed.radius >= 4 && parsed.radius <= 20
        ? parsed.radius
        : DEFAULT_APPEARANCE.radius,
    };
  } catch {
    return DEFAULT_APPEARANCE;
  }
}

export function applyAppearance(settings: AppearanceSettings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const isDark = settings.mode === "dark"
    || (settings.mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const font = FONT_OPTIONS.find((option) => option.value === settings.font)?.family ?? FONT_OPTIONS[0].family;

  root.classList.toggle("dark", isDark);
  root.style.colorScheme = isDark ? "dark" : "light";
  root.style.setProperty("--primary", settings.primary);
  root.style.setProperty("--ring", settings.primary);
  root.style.setProperty("--sidebar-primary", settings.primary);
  root.style.setProperty("--primary-foreground", settings.primaryForeground);
  root.style.setProperty("--sidebar-primary-foreground", settings.primaryForeground);
  if (isDark) {
    root.style.removeProperty("--foreground");
    root.style.removeProperty("--card-foreground");
    root.style.removeProperty("--popover-foreground");
  } else {
    root.style.setProperty("--foreground", settings.text);
    root.style.setProperty("--card-foreground", settings.text);
    root.style.setProperty("--popover-foreground", settings.text);
  }
  root.style.setProperty("--font-sans", font);
  root.style.setProperty("--font-display", font);
  root.style.setProperty("--radius", `${settings.radius / 16}rem`);
}

export function saveAppearance(settings: AppearanceSettings) {
  window.localStorage.setItem(APPEARANCE_KEY, JSON.stringify(settings));
  window.localStorage.setItem(LEGACY_THEME_KEY, settings.mode === "dark" ? "dark" : "light");
  applyAppearance(settings);
  window.dispatchEvent(new CustomEvent("teamlio-appearance-change", { detail: settings }));
}