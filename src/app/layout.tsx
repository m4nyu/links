import "@/lib/styles/globals.css"
import type { ReactNode } from "react"
import { Analytics } from "@vercel/analytics/react"

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}