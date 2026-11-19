"use client"

import { useTheme } from "next-themes"
import { useEffect } from "react"

// The SVG favicon follows the chosen theme; "system" keeps icon.svg, which adapts by itself.
export default function FaviconSync() {
  const { theme } = useTheme()
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"][type="image/svg+xml"]')
    if (link) link.href = theme === "light" || theme === "dark" ? `/icon-${theme}.svg` : "/icon.svg"
  }, [theme])
  return null
}
