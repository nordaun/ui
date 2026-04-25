import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Footer } from "@/components/blocks/footer";
import { Header } from "@/components/blocks/header";
import ColorProvider from "@/components/providers/color";
import ThemeProvider from "@/components/providers/theme";
import { TooltipProvider } from "@/components/ui/tooltip";
import { config } from "@/config";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`flex flex-col ${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <ThemeProvider>
          <ColorProvider>
            <TooltipProvider>
              <Header />
              <main className="flex justify-center items-center min-h-[calc(100vh-8rem)] h-full w-full selection:bg-primary selection:text-primary-foreground">
                {children}
              </main>
              <Footer />
            </TooltipProvider>
          </ColorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
