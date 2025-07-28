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
    <div className="w-full h-full relative overflow-hidden">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-50">
          <CircleNotchIcon className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Cal.com embed with bottom masking */}
      <div className="w-full h-full relative overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0"
          style={{
            height: "calc(100% + 100px)",
            bottom: "-100px",
          }}
        >
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

        {/* Bottom overlay to hide Cal.com branding */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-background pointer-events-none"
          style={{
            height: "100px",
            zIndex: 100,
          }}
        />
      </div>
    </div>
  )
}
