"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

const BoxesWebGL = dynamic(() => import("./boxes-webgl").then((mod) => ({ default: mod.BoxesWebGLMemo })), {
  ssr: false,
  loading: () => null,
})

const BoxesCanvas = dynamic(() => import("./boxes-canvas").then((mod) => ({ default: mod.BoxesCanvasMemo })), {
  ssr: false,
  loading: () => null,
})

const BoxesFallback = dynamic(() => import("./boxes").then((mod) => ({ default: mod.Boxes })), {
  ssr: false,
  loading: () => null,
})

type RenderMode = "webgl" | "canvas" | "dom" | null

function useRenderSupport(): RenderMode {
  const [renderMode, setRenderMode] = useState<RenderMode>(null)

  useEffect(() => {
    // Check WebGL support first (best performance)
    try {
      const canvas = document.createElement("canvas")
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
      if (gl) {
        setRenderMode("webgl")
        return
      }
    } catch {
      // WebGL not supported, continue to Canvas check
    }

    // Check Canvas 2D support as fallback
    try {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (ctx) {
        setRenderMode("canvas")
        return
      }
    } catch {
      // Canvas not supported, continue to DOM fallback
    }

    // Use DOM as final fallback
    setRenderMode("dom")
  }, [])

  return renderMode
}

export default function BoxesWrapper() {
  const renderMode = useRenderSupport()

  // Don't render anything until we know which mode to use
  if (renderMode === null) {
    return null
  }

  // Use the best available rendering mode for maximum performance
  switch (renderMode) {
    case "webgl":
      return <BoxesWebGL />
    case "canvas":
      return <BoxesCanvas />
    default:
      return <BoxesFallback />
  }
}