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
  colors: readonly Color[];
  defaultColor: Color;
  namespace: string;
  github: {
    author: string;
    brand: string;
    project: string;
  };
}>;

export const config: Config = {
  name: "vorhdamUI",
  colors,
  defaultColor: "white",
  namespace: "@vorhdam",
  github: {
    author: "https://github.com/vorhdam",
    brand: "https://github.com/nordaun",
    project: "https://github.com/vorhdam/registry",
  },
};
