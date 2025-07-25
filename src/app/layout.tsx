import "@/lib/styles/globals.css"
import type { ReactNode } from "react"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Analytics />
        <SpeedInsights />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}