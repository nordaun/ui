import config from "@repo/config";
import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  const { name } = config.ui;

  return {
    name,
    description:
      "A collection of beatifully designed components that extend the boundaries of shadcn while staying consistent, modular and of course clean.",
    start_url: "/",
    display: "standalone",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
    shortcuts: [
      {
        name: "Components",
        description: "Explore the UI components available",
        url: "/components",
      },
      {
        name: "Packages",
        description: "Explore the UI packages available",
        url: "/packages",
      },
    ],
    categories: ["developer tools", "productivity", "utilities", "shadcn"],
  };
}
