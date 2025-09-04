import type { Metadata } from "next"
import type React from "react"
import Mandelbrot from "@/lib/components/mandelbrot"
import { ThemeProvider } from "@/lib/components/theme-provider"

const title = "links"
const description = "Founder and engineer. Portfolio and contact information."
const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://m4nuel.com"

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

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const url = `${baseUrl}/${lang}`
  const ogLocale = localeMap[lang] || "en_US"

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: "%s | links",
    },
    description,
    keywords: ["manuel", "portfolio", "founder", "engineer", "contact"],
    authors: [{ name: "links", url: baseUrl }],
    creator: "links",
    publisher: "links",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: "website",
      locale: ogLocale,
      url,
      title,
      description,
      siteName: "links",
      images: [
        {
          url: `${baseUrl}/${lang}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: "links",
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@ManuelSzedlak",
      images: [`${baseUrl}/${lang}/opengraph-image`],
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
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/icon", type: "image/png" },
      ],
      apple: "/apple-icon",
    },
    manifest: `${baseUrl}/site.webmanifest`,
    alternates: {
      canonical: url,
      languages: {
        en: `${baseUrl}/en`,
        de: `${baseUrl}/de`,
        es: `${baseUrl}/es`,
        fr: `${baseUrl}/fr`,
        "zh-CN": `${baseUrl}/zh-CN`,
        ja: `${baseUrl}/ja`,
        "pt-BR": `${baseUrl}/pt-BR`,
        ru: `${baseUrl}/ru`,
        hi: `${baseUrl}/hi`,
        ar: `${baseUrl}/ar`,
      },
    },
  }
}

function PersonStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Manuel",
    alternateName: "Manuel Szedlak",
    jobTitle: "Founder & Engineer",
    description: "Founder and engineer. Links and contact information.",
    url: "https://m4nuel.com",
    image: "https://m4nuel.com/image.jpg",
    sameAs: ["https://github.com/m4nyu", "https://www.linkedin.com/in/manuel-szedlak", "https://x.com/ManuelSzedlak"],
    knowsAbout: [
      "Software Engineering",
      "Entrepreneurship",
      "Full-stack Development",
      "Web Development",
      "Product Development",
    ],
    worksFor: {
      "@type": "Organization",
      name: "Independent",
    },
  }

  // biome-ignore lint/security/noDangerouslySetInnerHtml: Structured data requires JSON-LD script injection for SEO
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
}

function WebsiteStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Manuel - Links",
    alternateName: "Manuel Szedlak Links",
    url: "https://m4nuel.com",
    description: "Founder and engineer. Links and contact information.",
    author: {
      "@type": "Person",
      name: "Manuel",
      alternateName: "Manuel Szedlak",
    },
    publisher: {
      "@type": "Person",
      name: "Manuel",
    },
    inLanguage: ["en", "de", "es", "fr", "zh-CN", "ja", "pt-BR", "ru", "hi", "ar"],
    potentialAction: {
      "@type": "SearchAction",
      target: "https://m4nuel.com/{search_term_string}",
      "query-input": "required name=search_term_string",
    },
  }

  // biome-ignore lint/security/noDangerouslySetInnerHtml: Structured data requires JSON-LD script injection for SEO
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
}

export default function LangLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PersonStructuredData />
      <WebsiteStructuredData />
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="relative min-h-screen w-full overflow-hidden bg-background">
          <Mandelbrot />
          <div className="relative z-10 flex h-full min-h-screen items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto">{children}</div>
          </div>
        </div>
      </ThemeProvider>
    </>
  )
}
