import type { Metadata } from "next"
import type React from "react"
import { ThemeProvider } from "@/lib/components/theme-provider"
import BoxesWrapper from "@/lib/components/ui/animation/boxes-wrapper"

const title = "portfolio"
const description =
    "Passionate Founder & Engineer, building the future one line of code at a time. Explore my startups and get in touch."
const url = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

export const metadata: Metadata = {
  title,
  description,
  keywords: ["founder", "engineer", "developer", "portfolio", "startups", "manuel"],
  authors: [{ name: "Manuel", url }],
  creator: "Manuel",
  openGraph: {
    type: "website",
    url,
    title,
    description,
    siteName: "portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: "@m4nuel",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon", type: "image/png" }
    ],
    apple: "/apple-icon",
  },
  manifest: `${url}/site.webmanifest`,
}

export default function LangLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="relative min-h-screen w-full overflow-hidden bg-background">
        <BoxesWrapper />
        <div className="relative z-10 flex h-full min-h-screen items-center justify-center p-4 pointer-events-none">
          <div className="pointer-events-auto">{children}</div>
        </div>
      </div>
    </ThemeProvider>
  );
}