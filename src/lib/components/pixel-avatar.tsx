"use client"

import { useEffect, useRef, useState } from "react"

// The photo at 16x16 (144 bytes), inline: it paints with the first HTML, before any request.
const PLACEHOLDER =
  "data:image/webp;base64,UklGRogAAABXRUJQVlA4IHwAAAAwAgCdASoQABAAAoBCJaACdAEPBv6r0Y5EgAD++iy2bp7zfY1r8s4n0bTLU39XchKliWTvnEobzHE8oDR9iUrDS9Hs9zMGiTlNSpsCLbKdA8WJaINm3a71Dwdn9Pt5ReakBXlfxlvIE884GMbEKGFNdoERIEpCUkAQAAAA"

// Pixels across per reveal frame: the photo sharpens out of a coarse grid.
const STEPS = [16, 24, 32, 48, 64, 96, 128, 192]
const FRAME_MS = 60

export default function PixelAvatar({ alt }: { alt: string }) {
  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const img = imgRef.current
    const canvas = canvasRef.current
    if (!img || !canvas) return
    let raf = 0

    const reveal = () => {
      const ctx = canvas.getContext("2d")
      const small = document.createElement("canvas").getContext("2d")
      if (!ctx || !small || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setRevealed(true)
        return
      }
      ctx.imageSmoothingEnabled = false
      let step = 0
      let last = 0
      const frame = (now: number) => {
        if (now - last >= FRAME_MS) {
          last = now
          const n = STEPS[step++]
          if (n === undefined) {
            setRevealed(true)
            return
          }
          small.canvas.width = n
          small.canvas.height = n
          small.drawImage(img, 0, 0, n, n)
          ctx.drawImage(small.canvas, 0, 0, canvas.width, canvas.height)
        }
        raf = requestAnimationFrame(frame)
      }
      raf = requestAnimationFrame(frame)
    }

    if (img.complete && img.naturalWidth > 0) reveal()
    else img.addEventListener("load", reveal, { once: true })
    return () => {
      cancelAnimationFrame(raf)
      img.removeEventListener("load", reveal)
    }
  }, [])

  return (
    <div
      className="relative size-44 sm:size-52 overflow-hidden rounded-full bg-cover [image-rendering:pixelated]"
      style={{ backgroundImage: `url(${PLACEHOLDER})` }}
    >
      {/* biome-ignore lint/performance/noImgElement: static, pre-sized WebP; the reveal needs the element itself */}
      <img
        ref={imgRef}
        src="/avatar-416.webp"
        srcSet="/avatar-208.webp 208w, /avatar-416.webp 416w"
        sizes="(min-width: 640px) 208px, 176px"
        width={208}
        height={208}
        alt={alt}
        fetchPriority="high"
        draggable={false}
        className={`size-full object-cover ${revealed ? "opacity-100" : "opacity-0"}`}
      />
      <canvas
        ref={canvasRef}
        width={416}
        height={416}
        className={`absolute inset-0 size-full ${revealed ? "hidden" : ""}`}
      />
    </div>
  )
}
