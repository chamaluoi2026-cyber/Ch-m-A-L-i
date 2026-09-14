import type { MetadataRoute } from "next";
import { places } from "@/data/places";
import { blogPosts, packages, products } from "@/data/site";
import { siteUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/places", "/blog", "/products", "/book-tour", "/about"].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date()
  }));

  return [
    ...staticRoutes,
    { url: `${siteUrl}/book-tour/package`, lastModified: new Date() },
    { url: `${siteUrl}/book-tour/self-guided`, lastModified: new Date() },
    ...packages.flatMap((item) => [
      { url: `${siteUrl}/book-tour/package/${item.id}`, lastModified: new Date() },
      { url: `${siteUrl}/book-tour/package/${item.id}/operators`, lastModified: new Date() }
    ]),
    ...places.map((item) => ({ url: `${siteUrl}/places/${item.slug}`, lastModified: new Date() })),
    ...products.map((item) => ({ url: `${siteUrl}/products/${item.slug}`, lastModified: new Date() })),
    ...blogPosts.map((item) => ({ url: `${siteUrl}/blog/${item.slug}`, lastModified: new Date(item.date) }))
  ];
}
