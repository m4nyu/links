"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

const BoxesCanvas = dynamic(() => import("./boxes-canvas").then((mod) => ({ default: mod.BoxesCanvasMemo })), {
  ssr: false,
  loading: () => null,
})

const BoxesFallback = dynamic(() => import("./boxes").then((mod) => ({ default: mod.Boxes })), {
  ssr: false,
  loading: () => null,
})

function useCanvasSupport() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null)

  useEffect(() => {
    // Check Canvas support (should be universally supported, but just in case)
    try {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      setIsSupported(!!ctx)
    } catch {
      setIsSupported(false)
    }
  }, [])

  return isSupported
}

export default function BoxesWrapper() {
  const canvasSupported = useCanvasSupport()

  // Don't render anything until we know Canvas support status
  if (canvasSupported === null) {
    return null
  }

  // Use Canvas version if supported, fallback to DOM version
  return canvasSupported ? <BoxesCanvas /> : <BoxesFallback />
}
