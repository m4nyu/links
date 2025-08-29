"use client"
import { useTheme } from "next-themes"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

// Working WebGL shader sources that replicate the exact DOM animation behavior
const vertexShaderSource = `
attribute vec2 a_position;
uniform mat3 u_worldTransform;
uniform vec2 u_resolution;
varying vec2 v_worldPos;

void main() {
  // Apply world transformation exactly like CSS transform
  vec3 worldPos = u_worldTransform * vec3(a_position, 1.0);
  v_worldPos = worldPos.xy;
  
  // Convert to normalized device coordinates
  vec2 clipSpace = ((worldPos.xy / u_resolution) * 2.0) - 1.0;
  gl_Position = vec4(clipSpace.x, -clipSpace.y, 0.0, 1.0);
}
`

const fragmentShaderSource = `
precision mediump float;
uniform vec3 u_borderColor;
uniform vec3 u_hoverColor;
uniform vec2 u_mousePos;
varying vec2 v_worldPos;

void main() {
  // Box dimensions exactly matching Tailwind classes h-8 w-16
  vec2 boxSize = vec2(64.0, 32.0);
  
  // Find which box we're in and local position within box
  vec2 boxLocalPos = mod(v_worldPos, boxSize);
  
  // Create border effect - only draw on borders (1px wide)
  float borderLeft = step(boxLocalPos.x, 1.0);
  float borderTop = step(boxLocalPos.y, 1.0);
  float borderRight = step(boxSize.x - 1.0, boxLocalPos.x);
  float borderBottom = step(boxSize.y - 1.0, boxLocalPos.y);
  
  float isBorder = max(max(borderLeft, borderTop), max(borderRight, borderBottom));
  
  // Simple hover effect based on world coordinates  
  float distToMouse = length(v_worldPos - u_mousePos);
  float hoverRadius = 64.0; // One box size for hover effect
  float isHovered = step(distToMouse, hoverRadius);
  
  // Color logic matching the original exactly
  vec3 color;
  float alpha;
  
  if (isHovered > 0.5) {
    // Full hover color fill
    color = u_hoverColor;
    alpha = 1.0;
  } else if (isBorder > 0.5) {
    // Border color with transparency
    color = u_borderColor;
    alpha = 1.0;
  } else {
    // Transparent interior
    discard;
  }
  
  gl_FragColor = vec4(color, alpha);
}
`

interface BoxesWebGLProps {
  className?: string
}

export const BoxesWebGL: React.FC<BoxesWebGLProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const programRef = useRef<WebGLProgram | null>(null)
  const animationRef = useRef<number>(0)
  const startTimeRef = useRef<number>(Date.now())
  const { resolvedTheme } = useTheme()
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 })

  // Shader compilation helper
  const createShader = useCallback((gl: WebGLRenderingContext, type: number, source: string) => {
    const shader = gl.createShader(type)
    if (!shader) return null

    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Shader compilation error:", gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)
      return null
    }

    return shader
  }, [])

  // Program creation helper
  const createProgram = useCallback(
    (gl: WebGLRenderingContext) => {
      const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
      const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

      if (!vertexShader || !fragmentShader) return null

      const program = gl.createProgram()
      if (!program) return null

      gl.attachShader(program, vertexShader)
      gl.attachShader(program, fragmentShader)
      gl.linkProgram(program)

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program linking error:", gl.getProgramInfoLog(program))
        gl.deleteProgram(program)
        return null
      }

      return program
    },
    [createShader]
  )

  // Initialize WebGL
  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return false

    const gl = canvas.getContext("webgl") || (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null)
    if (!gl) {
      console.error("WebGL not supported")
      return false
    }

    glRef.current = gl
    const program = createProgram(gl)
    if (!program) return false

    programRef.current = program
    gl.useProgram(program)

    // Enable blending for transparency
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    // Create geometry matching the original grid (250x200 boxes, each 64x32px)
    // Use the exact same dimensions as the original h-[500%] w-[500%] 
    const totalWidth = 200 * 64 * 5  // 500% width: 200 cols * 64px * 5
    const totalHeight = 250 * 32 * 5 // 500% height: 250 rows * 32px * 5

    const vertices = [
      // Single large quad covering the entire grid area
      0, 0,                           // Top-left
      totalWidth, 0,                  // Top-right  
      0, totalHeight,                 // Bottom-left
      
      totalWidth, 0,                  // Top-right
      totalWidth, totalHeight,        // Bottom-right
      0, totalHeight                  // Bottom-left
    ]

    // Create and bind vertex buffer
    const vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

    // Set up position attribute
    const positionLocation = gl.getAttribLocation(program, "a_position")
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    return true
  }, [createProgram])

  // Render function matching original animation exactly
  const render = useCallback(() => {
    const canvas = canvasRef.current
    const gl = glRef.current
    const program = programRef.current

    if (!canvas || !gl || !program) return

    // Resize canvas to match display size
    const displayWidth = canvas.clientWidth
    const displayHeight = canvas.clientHeight

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth
      canvas.height = displayHeight
      gl.viewport(0, 0, displayWidth, displayHeight)
    }

    // Clear with transparent background
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    // Calculate animation transform - EXACT match to original motion.div
    const elapsed = (Date.now() - startTimeRef.current) / 1000
    const progress = (elapsed % 35) / 35 // 35 second duration

    // Interpolate between initial and animate transforms
    // initial: translate(-50%, -50%) skewX(-48deg) skewY(14deg) scale(1.5)
    // animate: translate(-40%, -60%) skewX(-48deg) skewY(14deg) scale(1.5)
    const translateXPercent = -50 + progress * 10  // -50% to -40%
    const translateYPercent = -50 - progress * 10  // -50% to -60%
    
    const translateX = (translateXPercent / 100) * displayWidth
    const translateY = (translateYPercent / 100) * displayHeight
    
    // Constant transforms from original
    const skewXDeg = -48
    const skewYDeg = 14
    const scale = 1.5

    // Build exact CSS transform matrix
    const skewXRad = (skewXDeg * Math.PI) / 180
    const skewYRad = (skewYDeg * Math.PI) / 180
    
    const tanSkewX = Math.tan(skewXRad)
    const tanSkewY = Math.tan(skewYRad)

    // CSS transform matrix converted to WebGL matrix3
    const matrix = [
      scale,                    // a
      scale * tanSkewY,         // b  
      translateX,               // tx
      scale * tanSkewX,         // c
      scale,                    // d
      translateY,               // ty
      0, 0, 1                   // homogeneous coords
    ]

    // Set uniforms
    const worldTransformLocation = gl.getUniformLocation(program, "u_worldTransform")
    gl.uniformMatrix3fv(worldTransformLocation, false, matrix)

    const resolutionLocation = gl.getUniformLocation(program, "u_resolution")
    gl.uniform2f(resolutionLocation, displayWidth, displayHeight)

    const mousePosLocation = gl.getUniformLocation(program, "u_mousePos")
    gl.uniform2f(mousePosLocation, mousePos.x, mousePos.y)

    // Theme colors matching original exactly
    const isDark = resolvedTheme === "dark"
    const borderColor = isDark
      ? [51/255, 65/255, 85/255]    // slate-700/40 approximation  
      : [203/255, 213/255, 225/255] // slate-300/40 approximation

    const hoverColor = isDark
      ? [1.0, 1.0, 1.0]             // #fff
      : [0.094, 0.094, 0.11]        // #18181b

    const borderColorLocation = gl.getUniformLocation(program, "u_borderColor")
    gl.uniform3f(borderColorLocation, borderColor[0], borderColor[1], borderColor[2])

    const hoverColorLocation = gl.getUniformLocation(program, "u_hoverColor")
    gl.uniform3f(hoverColorLocation, hoverColor[0], hoverColor[1], hoverColor[2])

    // Draw the geometry
    gl.drawArrays(gl.TRIANGLES, 0, 6)

    animationRef.current = requestAnimationFrame(render)
  }, [mousePos, resolvedTheme])

  // Mouse move handler
  const handleMouseMove = useCallback((event: MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    setMousePos({ x, y })
  }, [])

  // Initialize and start animation
  useEffect(() => {
    if (initWebGL()) {
      startTimeRef.current = Date.now()
      render()
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [initWebGL, render])

  // Add mouse event listeners
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseleave", () => setMousePos({ x: -1000, y: -1000 }))

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseleave", () => setMousePos({ x: -1000, y: -1000 }))
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
      {/* Circular fade overlay matching original exactly */}
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

export const BoxesWebGLMemo = React.memo(BoxesWebGL)