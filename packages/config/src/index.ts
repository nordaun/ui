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
  /** The branding name of the project.*/
  brand: string;
  /** The namespace of the project packages on NPM.*/
  namespace: `@${string}`;
  /** The color provider config for all applications. */
  color: {
    /** The name of the color cookie. */
    cookieName: string;
    /** An array of all available colors in the application.*/
    colors: readonly Color[];
    /** The default color of the application.*/
    defaultColor: Color;
  };
  /** The theme provider config for all applications. */
  theme: {
    /** The name of the theme cookie. */
    cookieName: string;
  };
  /** The config for the UI application.*/
  ui: {
    /** The name of the UI project.*/
    name: string;
    /** The base URL (domain) of the UI application. */
    baseURL: `https://${string}`;
    /** The github config for the UI application. */
    github: {
      /** The author of the UI application. */
      author: `https://${string}`;
      /** The organization of the UI application. */
      organization: `https://${string}`;
      /** The public repository of the UI application. */
      repository: `https://${string}`;
    };
    /** The installer provider config for the UI application. */
    installer: {
      /** The name of the installer cookie. */
      cookieName: string;
      /** An array of all available installers for the UI packages. */
      installers: readonly Installer[];
      /** The default installer for the UI packages. */
      defaultInstaller: Installer;
    };
  };
}>;

/**
 * ## Config
 * @description The global configuration for the project.
 */
const config: Config = {
  brand: "Nordaun",
  namespace: "@nordaun",
  color: {
    cookieName: "color",
    colors,
    defaultColor: "white",
  },
  theme: {
    cookieName: "theme",
  },
  ui: {
    name: "nordaun/ui",
    baseURL: "https://ui.nordaun.com",
    github: {
      author: "https://github.com/vorhdam",
      organization: "https://github.com/nordaun",
      repository: "https://github.com/nordaun/ui",
    },
    installer: {
      cookieName: "installer",
      installers,
      defaultInstaller: "bun",
    },
  },
};

export default config;
