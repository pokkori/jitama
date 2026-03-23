import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://jitama.vercel.app";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/game`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/daily`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/en`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/share`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/legal`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];
}
