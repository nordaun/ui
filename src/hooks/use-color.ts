import { ColorContext } from "@/components/providers/color";
import { useContext } from "react";

export function useColor() {
  const context = useContext(ColorContext);
  if (!context)
    throw new Error(`The useColor() hook must be used within a ColorProvider.`);
  return context;
}
