import { InstallerContext } from "@/components/providers/installer";
import { useContext } from "react";

export function useInstaller() {
  const context = useContext(InstallerContext);
  if (!context)
    throw new Error(
      `The useInstaller() hook must be used within a InstallerProvider.`,
    );
  return context;
}
