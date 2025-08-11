"use client"

import Cal from "@calcom/embed-react"
import { CircleNotchIcon } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function Meeting() {
  const { resolvedTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  const [key, setKey] = useState(0)

  // Force complete re-render when theme changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: resolvedTheme dependency is intentional for theme-based re-renders
  useEffect(() => {
    setKey(Date.now())
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [resolvedTheme])

  return (
    <div className="w-full h-full relative min-h-[600px]">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-50">
          <CircleNotchIcon className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Cal.com embed */}
      <div className="w-full h-full relative [&_iframe]:border-0 [&_iframe]:outline-0 [&_iframe]:rounded-none [&_*]:!rounded-none">
        <Cal
          key={`cal-${key}-${resolvedTheme || "system"}`}
          calLink="m4nuel/30min"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            borderRadius: "0",
            background: "transparent",
          }}
          config={{
            layout: "month_view",
            theme: resolvedTheme === "dark" ? "dark" : "light",
            hideEventTypeDetails: "false",
            branding: {
              hideBranding: "true",
            },
          }}
        />
      </div>
    </div>
  )
}
