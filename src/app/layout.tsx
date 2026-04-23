import { Footer } from "@/components/blocks/footer";
import { Header } from "@/components/blocks/header";
import { TooltipProvider } from "@/components/ui/tooltip";
import { config } from "@/config";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
    <html lang="en">
      <body
        className={`min-h-full flex flex-col ${geistSans.variable} ${geistMono.variable} antialiased dark`}
      >
        <Header />
        <TooltipProvider>
          <main className="flex justify-center items-center min-h-[calc(100vh-7rem)] w-full h-full p-2 selection:bg-primary selection:text-primary-foreground">
            {children}
          </main>
        </TooltipProvider>
        <Footer />
      </body>
    </html>
  );
}
