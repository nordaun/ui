import { config } from "@/config";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="flex items-center justify-center w-full p-4 text-muted-foreground h-14 text-sm text-center gap-1">
      Built by <Link href={config.urls.vorhdam}>vorhdam</Link> at{" "}
      <Link href={config.urls.nordaun}>Nordaun.</Link> The source code is
      available on <Link href={config.urls.ui}>Github</Link>
    </footer>
  );
}
