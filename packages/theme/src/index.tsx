"use client";

import * as React from "react";
import cookies from "js-cookie";

const themes = ["light", "dark", "system"] as const;
const resolvable = ["light", "dark"] as const;

type Theme = (typeof themes)[number];
type Resolvable = (typeof resolvable)[number];

type ThemeContextType = {
  theme: Resolvable;
  themes: readonly Theme[];
  setTheme: (theme: Theme) => void;
  loading: boolean;
};

const ThemeContext = React.createContext<ThemeContextType>({
  theme: "light",
  themes,
  setTheme: () => {},
  loading: true,
});

function useTheme() {
  return React.useContext(ThemeContext);
}

type ThemeProviderProps = {
  cookieName?: string;
  defaultTheme: Theme;
  disableTransition?: boolean;
  enableSystem?: boolean;
  children: React.ReactNode;
};

function getSystemTheme(): Resolvable {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function disableAnimation() {
  const css = document.createElement("style");
  css.appendChild(
    document.createTextNode(
      `*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`,
    ),
  );
  document.head.appendChild(css);

  return () => {
    (() => window.getComputedStyle(document.body))();
    setTimeout(() => document.head.removeChild(css), 1);
  };
}

function applyTheme(resolved: Resolvable, disableTransition = false) {
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(resolved);
  if (disableTransition) disableAnimation();
}

function ThemeProvider({
  cookieName = "THEME",
  defaultTheme,
  disableTransition,
  enableSystem,
  children,
}: ThemeProviderProps) {
  const available = enableSystem ? themes : resolvable;

  const [current, setCurrent] = React.useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;
    const saved = cookies.get(cookieName) as Theme | undefined;
    if (saved && (available as readonly string[]).includes(saved)) return saved;
    return defaultTheme;
  });

  const [systemTheme, setSystemTheme] = React.useState<Resolvable>(() =>
    getSystemTheme(),
  );

  const resolved: Resolvable = current === "system" ? systemTheme : current;

  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    applyTheme(resolved, disableTransition);
    cookies.set(cookieName, current, { expires: 365, sameSite: "lax" });
    setLoading(false);
  }, [resolved, current, cookieName, disableTransition]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    if (media.addEventListener) {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }

    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  }, []);

  const setTheme = React.useCallback(
    (theme: Theme) => {
      if (!(available as readonly string[]).includes(theme)) return;
      setCurrent(theme);
      applyTheme(
        theme === "system" ? getSystemTheme() : theme,
        disableTransition,
      );
      cookies.set(cookieName, theme, { expires: 365, sameSite: "lax" });
    },
    [cookieName, available, disableTransition],
  );

  const value = React.useMemo<ThemeContextType>(
    () => ({
      theme: resolved,
      themes: available,
      setTheme,
      loading,
    }),
    [resolved, available, setTheme, loading],
  );

  if (loading) return null;

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export { useTheme, ThemeProvider };
