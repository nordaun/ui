"use client";

import { Color, config } from "@/config";
import cookies from "js-cookie";
import { createContext, ReactNode, useState } from "react";

type ColorContextType = {
  color: Color;
  setColor: (color: Color) => void;
  loading: boolean;
};

export const ColorContext = createContext<ColorContextType>({
  color: config.defaultColor,
  setColor: () => {},
  loading: true,
});

export default function ColorProvider({ children }: { children: ReactNode }) {
  const cookieName = "NEXT_COLOR";
  const colors = config.colors;
  const defaultColor = config.defaultColor;

  const [current, setCurrent] = useState<Color>(() => {
    let initialColor = cookies.get(cookieName) as Color;
    if (!colors.includes(initialColor)) initialColor = defaultColor;

    if (typeof document !== "undefined") {
      document.documentElement.classList.add(`color-${initialColor}`);
    }

    return initialColor;
  });

  const setColor = (newColor: Color) => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove(`color-${current}`);
      document.documentElement.classList.add(`color-${newColor}`);
    }
    setCurrent(newColor);
    cookies.set(cookieName, newColor);
  };

  return (
    <ColorContext.Provider value={{ color: current, setColor, loading: false }}>
      {children}
    </ColorContext.Provider>
  );
}
