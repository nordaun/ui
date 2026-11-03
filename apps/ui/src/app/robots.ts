import config from "@repo/config";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const { baseURL } = config.ui;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${baseURL}/sitemap.xml`,
  };
}
