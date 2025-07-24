"use client"

import dynamic from "next/dynamic"

const Boxes = dynamic(() => import("./boxes").then((mod) => ({ default: mod.Boxes })), {
  ssr: false,
  loading: () => null,
})

export default function BoxesWrapper() {
  return <Boxes />
}
