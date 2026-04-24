import { config } from "@/config";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="flex items-center justify-center w-dwv p-4 text-muted-foreground h-14 text-sm text-center">
      <span>
        Built by <Link href={config.github.author}>vorhdam</Link> at{" "}
        <Link href={config.github.brand}>Nordaun.</Link> The source code is
        available on <Link href={config.github.project}>Github</Link>
      </span>
    </footer>
  );
}
