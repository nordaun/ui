import packages from "@/packages";
import components from "@/registry";
import config from "@repo/config";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const { baseURL } = config.ui;

  const componentMap: MetadataRoute.Sitemap = components.items.map((item) => ({
    url: `${baseURL}/components/${item.name}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const packageMap: MetadataRoute.Sitemap = packages.items.map((item) => ({
    url: `${baseURL}/components/${item.name}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    {
      url: `${baseURL}`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: `${baseURL}/about`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${baseURL}/components`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...componentMap,
    {
      url: `${baseURL}/packages`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...packageMap,
  ];
}
