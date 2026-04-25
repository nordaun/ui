"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { config } from "@/config";
import { Copy, Terminal } from "lucide-react";

export function Installation({ name }: { name: string }) {
  const installers = ["npm", "yarn", "pnpm", "bun"] as const;
  type Installer = (typeof installers)[number];

  const [selected, setSelected] = useState<Installer>("bun");
  const [command, setCommand] = useState<string>(
    `bunx --bun shadcn@latest add ${config.namespace}/${name}`,
  );

  const handleClick = (installer: Installer) => {
    setSelected(installer);
    setCommand(createCommand(installer));
  };

  const createCommand = (installer: Installer): string => {
    switch (installer) {
      case "npm":
        return `npx shadcn@latest add ${config.namespace}/${name}`;
      case "yarn":
        return `yarn dlx shadcn@latest add ${config.namespace}/${name}`;
      case "pnpm":
        return `pnpm dlx shadcn@latest add ${config.namespace}/${name}`;
      case "bun":
        return `bunx --bun shadcn@latest add ${config.namespace}/${name}`;
    }
  };

  return (
    <div className="flex flex-col bg-card w-full h-24 rounded-2xl border border-border">
      <div className="flex h-full flex-1 justify-between items-center px-4">
        <div className="flex flex-row gap-4 items-center">
          <Terminal className="size-5 text-muted-foreground" />
          <div className="flex gap-2">
            {installers.map((installer) => (
              <Button
                key={installer}
                variant={selected === installer ? "default" : "outline"}
                className="h-7"
                onClick={() => handleClick(installer)}
              >
                {installer}
              </Button>
            ))}
          </div>
        </div>
        <Button
          variant={"ghost"}
          className={"h-8 aspect-square p-0 text-muted-foreground"}
          onClick={() => navigator.clipboard.writeText(command)}
        >
          <Copy />
        </Button>
      </div>
      <Separator />
      <div className="flex items-center h-full flex-1 px-4 font-mono text-sm text-foreground/80">
        {command}
      </div>
    </div>
  );
}
