"use client"

import dynamic from "next/dynamic"

// Optimized DOM version - fast and works perfectly
const BoxesOptimized = dynamic(() => import("./boxes").then((mod) => ({ default: mod.Boxes })), {
  ssr: false,
  loading: () => null,
})

export default function BoxesWrapper() {
  return <BoxesOptimized />
}