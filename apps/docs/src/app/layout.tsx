import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Footer } from "@/components/blocks/footer";
import { Header } from "@/components/blocks/header";
import { TooltipProvider } from "@/components/ui/tooltip";
import { config } from "@repo/config";
import { ThemeProvider } from "@nordaun/theme";
import { ColorProvider } from "@nordaun/color";
import InstallerProvider from "@/components/providers/installer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: `%s | ${config.name}`,
    default: config.name,
  },
  description: "Simple components for your extraordinary creations.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      {
        url: "/light.ico",
        sizes: "any",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/dark.ico",
        sizes: "any",
        media: "(prefers-color-scheme: light)",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`flex flex-col ${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <ThemeProvider
          cookieName="theme"
          defaultTheme="system"
          enableSystem
          disableTransition
        >
          <ColorProvider
            cookieName="color"
            colors={config.colors}
            defaultColor="white"
            classPrefix="color-"
          >
            <InstallerProvider>
              <TooltipProvider>
                <Header />
                <main className="flex justify-center items-center min-h-[calc(100vh-8rem)] h-full w-full selection:bg-primary selection:text-primary-foreground">
                  {children}
                </main>
                <Footer />
              </TooltipProvider>
            </InstallerProvider>
          </ColorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
