import type { MetadataRoute } from "next"
import { i18n } from "@/lib/hooks/use-i18n-config"

export default function sitemap(): MetadataRoute.Sitemap {
  // Previews link to themselves; production (and local) to the public domain,
  // never to the login-protected *.vercel.app deployment URL.
  const baseUrl =
    process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://m4nuel.com"
  const languages = Object.fromEntries(i18n.locales.map((l) => [l, `${baseUrl}/${l}`]))

  return i18n.locales.map((lang) => ({
    url: `${baseUrl}/${lang}`,
    changeFrequency: "monthly",
    priority: lang === i18n.defaultLocale ? 1 : 0.8,
    alternates: { languages },
  }))
}
