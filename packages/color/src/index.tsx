"use client";

import cookies from "js-cookie";
import * as React from "react";

type ColorContextType<T extends string = string> = {
  color: T;
  colors: readonly T[];
  setColor: (color: T) => void;
  loading: boolean;
};

const ColorContext = React.createContext<ColorContextType>({
  color: "",
  colors: [],
  setColor: () => {},
  loading: true,
});

function useColor<T extends string = string>() {
  return React.useContext(ColorContext) as unknown as ColorContextType<T>;
}

type ColorProviderProps<T extends string> = {
  cookieName?: string;
  classPrefix?: string;
  classSuffix?: string;
  colors: readonly T[];
  defaultColor: T;
  children: React.ReactNode;
};

function buildClass(color: string, prefix = "", suffix = "") {
  return `${prefix}${color}${suffix}`;
}

function applyColor(
  color: string,
  allColors: readonly string[],
  prefix = "",
  suffix = "",
) {
  document.documentElement.classList.remove(
    ...allColors.map((c) => buildClass(c, prefix, suffix)),
  );
  document.documentElement.classList.add(buildClass(color, prefix, suffix));
}

function ColorProvider<T extends string>({
  cookieName = "COLOR",
  classPrefix,
  classSuffix,
  colors,
  defaultColor,
  children,
}: ColorProviderProps<T>) {
  const [current, setCurrent] = React.useState<T>(() => {
    if (typeof window === "undefined") return defaultColor;
    const saved = cookies.get(cookieName);
    if (saved && (colors as readonly string[]).includes(saved))
      return saved as T;
    return defaultColor;
  });

  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    applyColor(current, colors, classPrefix, classSuffix);
    cookies.set(cookieName, current, { expires: 365, sameSite: "lax" });
    setLoading(false);
  }, [current, colors, classPrefix, classSuffix, cookieName]);

  const setColor = React.useCallback(
    (color: T) => {
      if (!(colors as readonly string[]).includes(color)) {
        console.warn(
          `Ignored. "${color}" is not in the colors list of ColorProvider.`,
        );
        return;
      }
      applyColor(color, colors, classPrefix, classSuffix);
      cookies.set(cookieName, color, { expires: 365, sameSite: "lax" });
      setCurrent(color);
    },
    [colors, classPrefix, classSuffix, cookieName],
  );

  const value = React.useMemo<ColorContextType<T>>(
    () => ({ color: current, colors, setColor, loading }),
    [current, colors, setColor, loading],
  );

  if (loading) return null;

  return (
    <ColorContext.Provider value={value as unknown as ColorContextType}>
      {children}
    </ColorContext.Provider>
  );
}

export { useColor, ColorProvider };
