"use client"
import { useTheme } from "next-themes"
import React, { useCallback, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface BoxesCanvasProps {
  className?: string
}

export const BoxesCanvas: React.FC<BoxesCanvasProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const startTimeRef = useRef<number>(Date.now())
  const mousePosRef = useRef({ x: -1000, y: -1000 })
  const hoverTrailRef = useRef<Array<{ i: number; j: number; timestamp: number }>>([])
  const { resolvedTheme } = useTheme()

  // Render function that exactly matches the original animation
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Complex animation logic needs to remain intact
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Resize canvas to match display size
    const displayWidth = canvas.clientWidth
    const displayHeight = canvas.clientHeight

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth
      canvas.height = displayHeight
    }

    // Clear canvas
    ctx.clearRect(0, 0, displayWidth, displayHeight)

    // Save context for transformation
    ctx.save()

    // MUCH SIMPLER APPROACH: Just draw some test hover boxes at screen coordinates first
    const currentMousePos = mousePosRef.current
    const mouseOnCanvas =
      currentMousePos.x > 0 &&
      currentMousePos.y > 0 &&
      currentMousePos.x < displayWidth &&
      currentMousePos.y < displayHeight

    // Theme colors
    const isDark = resolvedTheme === "dark"
    const hoverColor = isDark ? "#fff" : "#18181b"

    // Grid properties - EXACT match to original h-[500%] w-[500%]
    const rows = 250 * 5 // 5x bigger to match 500% height
    const cols = 200 * 5 // 5x bigger to match 500% width
    const boxWidth = 64
    const boxHeight = 32

    // Calculate which box in the grid the mouse is over by inverse transformation
    let hoveredBox: { i: number; j: number } | null = null

    if (mouseOnCanvas) {
      // Get animation progress for current transforms
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      const progress = (elapsed % 35) / 35

      const translateXPercent = -50 + progress * 10
      const translateYPercent = -50 - progress * 10

      const translateX = (translateXPercent / 100) * displayWidth
      const translateY = (translateYPercent / 100) * displayHeight

      // Inverse transform mouse position to get grid coordinates
      // Reverse the transforms: translate -> skew -> scale
      let mouseX = currentMousePos.x - translateX
      let mouseY = currentMousePos.y - translateY

      // Reverse skew transformations
      const skewXRad = (-48 * Math.PI) / 180
      const skewYRad = (14 * Math.PI) / 180

      // Create inverse transformation matrix
      const _cos_skewX = Math.cos(skewXRad)
      const _sin_skewX = Math.sin(skewXRad)
      const _cos_skewY = Math.cos(skewYRad)
      const _sin_skewY = Math.sin(skewYRad)
      const scale = 1.5

      // Apply inverse scale
      mouseX /= scale
      mouseY /= scale

      // Apply inverse skew - approximate by reversing the skew operations
      const tempMouseX = mouseX
      mouseX -= mouseY * Math.tan(skewXRad)
      mouseY -= tempMouseX * Math.tan(skewYRad)

      // Now mouseX, mouseY are in grid space coordinates
      // Each box is 64x32 pixels
      const boxCol = Math.floor(mouseX / 64)
      const boxRow = Math.floor(mouseY / 32)

      // Check if we're within grid bounds
      if (boxRow >= 0 && boxRow < rows && boxCol >= 0 && boxCol < cols) {
        hoveredBox = { i: boxRow, j: boxCol }

        // Add to hover trail for snake effect
        const now = Date.now()
        const trail = hoverTrailRef.current

        // Add current hover if it's different from the last one
        if (trail.length === 0 || trail[trail.length - 1].i !== boxRow || trail[trail.length - 1].j !== boxCol) {
          trail.push({ i: boxRow, j: boxCol, timestamp: now })
        }

        // Remove old trail entries (fade out after 300ms)
        hoverTrailRef.current = trail.filter((entry) => now - entry.timestamp < 300)
      }
    } else {
      // No mouse on canvas, clear trail gradually
      const now = Date.now()
      hoverTrailRef.current = hoverTrailRef.current.filter((entry) => now - entry.timestamp < 150)
    }

    // Now do the complex grid animation
    const elapsed = (Date.now() - startTimeRef.current) / 1000
    const progress = (elapsed % 35) / 35

    const translateXPercent = -50 + progress * 10 // -50% to -40%
    const translateYPercent = -50 - progress * 10 // -50% to -60%

    const translateX = (translateXPercent / 100) * displayWidth
    const translateY = (translateYPercent / 100) * displayHeight

    // Apply transforms
    ctx.translate(translateX, translateY)
    ctx.transform(1, 0, Math.tan((-48 * Math.PI) / 180), 1, 0, 0)
    ctx.transform(1, Math.tan((14 * Math.PI) / 180), 0, 1, 0, 0)
    ctx.scale(1.5, 1.5)

    const borderColor = isDark ? "rgba(51, 65, 85, 0.4)" : "rgba(203, 213, 225, 0.4)"

    // Get current hover trail
    const currentTime = Date.now()
    const trail = hoverTrailRef.current

    // Draw the grid with exact border pattern from original
    ctx.strokeStyle = borderColor
    ctx.lineWidth = 1

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const x = j * boxWidth
        const y = i * boxHeight

        // Check if this box is currently hovered
        const isCurrentHover = hoveredBox && hoveredBox.i === i && hoveredBox.j === j

        // Check if this box is in the trail (snake effect)
        const trailEntry = trail.find((entry) => entry.i === i && entry.j === j)
        const isInTrail = !!trailEntry

        if (isCurrentHover) {
          // Current hover - full opacity
          ctx.fillStyle = hoverColor
          ctx.fillRect(x, y, boxWidth, boxHeight)
        } else if (isInTrail && trailEntry) {
          // Trail hover - fading opacity based on age
          const age = currentTime - trailEntry.timestamp
          const opacity = Math.max(0, 1 - age / 300) // Fade over 300ms

          // Parse hover color and apply opacity
          const isHoverWhite = hoverColor === "#fff"
          if (isHoverWhite) {
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
          } else {
            ctx.fillStyle = `rgba(24, 24, 27, ${opacity})` // #18181b with opacity
          }
          ctx.fillRect(x, y, boxWidth, boxHeight)
        }

        // Draw borders exactly like original: border-r border-t (right and top borders only)
        ctx.beginPath()
        // Top border
        ctx.moveTo(x, y)
        ctx.lineTo(x + boxWidth, y)
        // Right border
        ctx.moveTo(x + boxWidth, y)
        ctx.lineTo(x + boxWidth, y + boxHeight)
        ctx.stroke()
      }
    }

    // Draw the left border for the first column (border-l from original)
    ctx.beginPath()
    for (let i = 0; i < rows; i++) {
      const y = i * boxHeight
      ctx.moveTo(0, y)
      ctx.lineTo(0, y + boxHeight)
    }
    ctx.stroke()

    ctx.restore()

    animationRef.current = requestAnimationFrame(render)
  }, [resolvedTheme]) // Remove mousePos from dependencies to prevent animation restart

  // Mouse move handler
  const handleMouseMove = useCallback((event: MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    mousePosRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
    // console.log('Mouse pos:', mousePosRef.current) // Debug
  }, [])

  // Initialize and start animation
  useEffect(() => {
    startTimeRef.current = Date.now()
    render()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [render])

  // Add mouse event listeners
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleMouseLeave = () => {
      mousePosRef.current = { x: -1000, y: -1000 }
    }

    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [handleMouseMove])

  const { resolvedTheme: theme } = useTheme()
  const blurColor = theme === "dark" ? "0, 0, 0" : "255, 255, 255"

  return (
    <div className="absolute inset-0 z-10">
      <canvas
        ref={canvasRef}
        className={cn("w-full h-full pointer-events-auto", className)}
        style={{ width: "100%", height: "100%" }}
      />
      {/* Circular fade overlay from center - EXACT match to original */}
      <div className="absolute inset-0 pointer-events-none z-20">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at center, transparent 30%, rgba(${blurColor}, 0.3) 70%, rgba(${blurColor}, 0.8) 95%)`,
          }}
        />
      </div>
    </div>
  )
}

export const BoxesCanvasMemo = React.memo(BoxesCanvas)
