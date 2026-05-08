const colors = [
  "red",
  "orange",
  "yellow",
  "green",
  "emerald",
  "aqua",
  "blue",
  "purple",
  "pink",
  "white",
] as const;
const installers = ["npm", "yarn", "pnpm", "bun"] as const;

export type Color = (typeof colors)[number];
export type Installer = (typeof installers)[number];

type Config = Readonly<{
  name: string;
  brand: string;
  colors: readonly Color[];
  installers: readonly Installer[];
  defaultColor: Color;
  defaultInstaller: Installer;
  namespace: string;
  url: string;
  github: {
    author: string;
    brand: string;
    project: string;
  };
}>;

export const config: Config = {
  name: "nordaun/ui",
  brand: "Nordaun",
  colors,
  installers,
  defaultColor: "white",
  defaultInstaller: "bun",
  namespace: "@nordaun",
  url: "https://ui.nordaun.com",
  github: {
    author: "https://github.com/vorhdam",
    brand: "https://github.com/nordaun",
    project: "https://github.com/nordaun/ui",
  },
};
