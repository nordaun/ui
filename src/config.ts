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

export type Color = (typeof colors)[number];

type Config = Readonly<{
  name: string;
  brand: string;
  colors: readonly Color[];
  defaultColor: Color;
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
  defaultColor: "white",
  namespace: "@nordaun",
  url: "https://ui.nordaun.com",
  github: {
    author: "https://github.com/vorhdam",
    brand: "https://github.com/nordaun",
    project: "https://github.com/nordaun/ui",
  },
};
