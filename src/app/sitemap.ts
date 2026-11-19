import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  // Previews link to themselves; production (and local) to the public domain,
  // never to the login-protected *.vercel.app deployment URL.
  const baseUrl =
    process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://m4nuel.com"

  const languages = ["en", "de", "es", "fr", "zh-CN", "ja", "pt-BR", "ru", "hi", "ar"]

  const routes: MetadataRoute.Sitemap = []

  // Root redirect
  routes.push({
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  })

  // Language-specific routes
  languages.forEach((lang) => {
    // Main page
    routes.push({
      url: `${baseUrl}/${lang}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    })

    // Imprint page - temporarily removed
    // routes.push({
    //   url: `${baseUrl}/${lang}/imprint`,
    //   lastModified: new Date(),
    //   changeFrequency: "yearly",
    //   priority: 0.3,
    // })
  })

  return routes
}
