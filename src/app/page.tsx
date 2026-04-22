import { Button } from "@/components/ui/button";
import { config } from "@/config";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex flex-col gap-8 items-center">
      <h1 className="text-4xl font-bold max-w-140 text-center text-foreground">
        Simple components for your extraordinary creations.
      </h1>
      <h2 className="text-xl font-serif max-w-180 text-center text-foreground/75">
        A collection of beatufully designed components that extend the coverage
        of shadcn while staying consistent, modular and of course clean.
      </h2>
      <div className="flex flex-row gap-4">
        <Link href="/components">
          <Button size={"lg"} variant={"default"} className="px-4">
            View Components
          </Button>
        </Link>
        <Link href={config.urls.ui}>
          <Button size={"lg"} variant={"secondary"} className="px-4">
            Github
          </Button>
        </Link>
      </div>
    </div>
  );
}
