import type { Metadata } from "next"
import type React from "react"
import { ThemeProvider } from "@/lib/components/theme-provider"
import BoxesWrapper from "@/lib/components/ui/animation/boxes-wrapper"
import { PersonStructuredData, WebsiteStructuredData } from "@/lib/components/structured-data"

const title = "Manuel"
const description = "Founder and engineer. Portfolio and contact information."
const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://m4nuel.com"

// Locale mapping for OpenGraph
const localeMap: { [key: string]: string } = {
  'en': 'en_US',
  'de': 'de_DE', 
  'es': 'es_ES',
  'fr': 'fr_FR',
  'zh-CN': 'zh_CN',
  'ja': 'ja_JP',
  'pt-BR': 'pt_BR',
  'ru': 'ru_RU',
  'hi': 'hi_IN',
  'ar': 'ar_SA'
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const url = `${baseUrl}/${lang}`
  const ogLocale = localeMap[lang] || 'en_US'

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: "%s | Manuel"
    },
    description,
    keywords: ["manuel", "portfolio", "founder", "engineer", "contact"],
    authors: [{ name: "Manuel", url: baseUrl }],
    creator: "Manuel",
    publisher: "Manuel",
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
      siteName: "Manuel",
      images: [
        {
          url: `${baseUrl}/${lang}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: "Manuel",
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
        'en': `${baseUrl}/en`,
        'de': `${baseUrl}/de`,
        'es': `${baseUrl}/es`,
        'fr': `${baseUrl}/fr`,
        'zh-CN': `${baseUrl}/zh-CN`,
        'ja': `${baseUrl}/ja`,
        'pt-BR': `${baseUrl}/pt-BR`,
        'ru': `${baseUrl}/ru`,
        'hi': `${baseUrl}/hi`,
        'ar': `${baseUrl}/ar`,
      }
    }
  }
}

export default function LangLayout({ 
  children
}: { 
  children: React.ReactNode
}) {
  return (
    <>
      <PersonStructuredData />
      <WebsiteStructuredData />
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="relative min-h-screen w-full overflow-hidden bg-background">
          <BoxesWrapper />
          <div className="relative z-10 flex h-full min-h-screen items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto">{children}</div>
          </div>
        </div>
      </ThemeProvider>
    </>
  )
}