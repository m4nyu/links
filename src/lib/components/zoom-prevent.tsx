"use client"

import { useEffect } from "react"

export default function ZoomPrevent() {
  useEffect(() => {
    const preventZoom = (e: WheelEvent | KeyboardEvent) => {
      if (e instanceof WheelEvent && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
      }
      if (
        e instanceof KeyboardEvent &&
        (e.ctrlKey || e.metaKey) &&
        (e.key === "=" || e.key === "-" || e.key === "+" || e.key === "0")
      ) {
        e.preventDefault()
      }
    }

    // Prevent pinch zoom on trackpad
    const preventGesture = (e: Event) => {
      e.preventDefault()
    }

    document.addEventListener("wheel", preventZoom, { passive: false })
    document.addEventListener("keydown", preventZoom, { passive: false })
    document.addEventListener("gesturestart", preventGesture)
    document.addEventListener("gesturechange", preventGesture)
    document.addEventListener("gestureend", preventGesture)

    return () => {
      document.removeEventListener("wheel", preventZoom)
      document.removeEventListener("keydown", preventZoom)
      document.removeEventListener("gesturestart", preventGesture)
      document.removeEventListener("gesturechange", preventGesture)
      document.removeEventListener("gestureend", preventGesture)
    }
  }, [])

  return null
}