"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ComponentProps, useEffect, useState } from "react";

export default function ThemeProvider({
  children,
}: ComponentProps<typeof NextThemesProvider>) {
  const [mounted, setMounted] = useState<boolean>(false);

  // This pattern prevents hydration mismatches with next-themes
  // by ensuring the provider only renders after client-side mount
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!mounted) return <>{children}</>;

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
