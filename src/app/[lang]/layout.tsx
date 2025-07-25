import type { Metadata } from "next"
import type React from "react"
import { ThemeProvider } from "@/lib/components/theme-provider"
import BoxesWrapper from "@/lib/components/ui/animation/boxes-wrapper"
import { PersonStructuredData, WebsiteStructuredData } from "@/lib/components/structured-data"

const title = "Manuel"
const description = "Founder and engineer. Portfolio and contact information."
const url = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: {
    default: title,
    template: "%s | Manuel"
  },
  description,
  keywords: ["manuel", "portfolio", "founder", "engineer", "contact"],
  authors: [{ name: "Manuel", url }],
  creator: "Manuel",
  publisher: "Manuel",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url,
    title,
    description,
    siteName: "Manuel",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Manuel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: "@ManuelSzedlak",
    images: ["/opengraph-image"],
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
  manifest: `${url}/site.webmanifest`,
}

export default function LangLayout({ children }: { children: React.ReactNode }) {
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