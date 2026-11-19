import "@/lib/styles/globals.css"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Metadata, Viewport } from "next"
import type React from "react"
import FaviconSync from "@/lib/components/favicon-sync"
import Mandelbrot from "@/lib/components/mandelbrot"
import { ThemeProvider } from "@/lib/components/theme-provider"
import ZoomPrevent from "@/lib/components/zoom-prevent"
import { i18n } from "@/lib/hooks/use-i18n-config"

const title = "links"
const author = "Manuel Szedlak"
const description = "Manuel Szedlak, founder and engineer: blog, opinions, GitHub, LinkedIn, X and a meeting link."
// Previews link to themselves; production (and local) to the public domain,
// never to the login-protected *.vercel.app deployment URL.
const baseUrl =
  process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://m4nuel.com"
const site = "https://m4nuel.com"

// Locale mapping for OpenGraph
const localeMap: { [key: string]: string } = {
  en: "en_US",
  de: "de_DE",
  es: "es_ES",
  fr: "fr_FR",
  "zh-CN": "zh_CN",
  ja: "ja_JP",
  "pt-BR": "pt_BR",
  ru: "ru_RU",
  hi: "hi_IN",
  ar: "ar_SA",
}

// Pinch and ctrl-zoom stay off on purpose: wheel and drag belong to the fractal.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export function generateStaticParams() {
  return i18n.locales.map((locale) => ({
    lang: locale,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const url = `${baseUrl}/${lang}`
  const ogLocale = localeMap[lang] || "en_US"
  const image = { url: `${baseUrl}/og.png`, width: 1200, height: 630, alt: `${title}: ${author}`, type: "image/png" }

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: "%s | links",
    },
    description,
    keywords: ["Manuel Szedlak", "m4nuel", "founder", "engineer", "links", "contact"],
    authors: [{ name: author, url: site }],
    creator: author,
    publisher: author,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    icons: {
      // 32x32 rather than "any", so browsers that read SVG take icon.svg over the .ico.
      icon: [
        { url: "/favicon.ico", sizes: "32x32" },
        { url: "/icon.svg", type: "image/svg+xml" },
      ],
      apple: [{ url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" }],
    },
    openGraph: {
      type: "profile",
      locale: ogLocale,
      url,
      title,
      description,
      siteName: "links",
      firstName: "Manuel",
      lastName: "Szedlak",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@ManuelSzedlak",
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    manifest: "/site.webmanifest",
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(i18n.locales.map((l) => [l, `${baseUrl}/${l}`])),
        "x-default": `${baseUrl}/en`,
      },
      types: { "text/plain": `${baseUrl}/llms.txt` },
    },
  }
}

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: site,
    name: title,
    mainEntity: {
      "@type": "Person",
      name: author,
      alternateName: ["Manuel", "4nuel", "m4nuel"],
      jobTitle: "Founder & Engineer",
      description: "Founder and engineer: distributed systems, AI/ML training and inference, service architecture.",
      url: site,
      image: `${site}/avatar-416.webp`,
      sameAs: [
        "https://m4nuel.net",
        "https://m4nuel.blog",
        "https://github.com/m4nyu",
        "https://www.linkedin.com/in/manuel-szedlak",
        "https://x.com/ManuelSzedlak",
      ],
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: title,
    url: site,
    author: { "@type": "Person", name: author },
    inLanguage: [...i18n.locales],
  },
]

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  return (
    <html lang={lang} suppressHydrationWarning>
      <body>
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD; static data, "<" escaped so it cannot close the tag
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        />
        <ZoomPrevent />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <FaviconSync />
          <div className="relative min-h-screen w-full overflow-hidden bg-background">
            <Mandelbrot />
            <div className="relative z-10 flex h-full min-h-screen items-center justify-center p-4 pointer-events-none">
              <div className="pointer-events-auto">{children}</div>
            </div>
          </div>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
