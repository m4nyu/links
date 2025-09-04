"use client"

import { useEffect, useRef, useState } from "react"

interface FractalRenderer {
  resize(): void
  destroy(): void
}

export default function Mandelbrot() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<FractalRenderer | null>(null)
  const [mounted, setMounted] = useState(false)
  const [currentFractal, setCurrentFractal] = useState({ name: "", formula: "" })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!canvasRef.current || !mounted) return

    class FractalRenderer {
      canvas: HTMLCanvasElement
      gl: WebGLRenderingContext | null
      program: WebGLProgram | null
      uniforms: Map<string, WebGLUniformLocation>
      animationId: number | null
      frameCount: number
      lastTime: number
      fps: number
      time: number
      isPaused: boolean
      currentMode: number
      speed: number
      iterations: number
      autoQuality: boolean
      modeChangeTime: number
      modes: string[]
      formulas: string[]
      onModeChange: (name: string, formula: string) => void
      zoom: number

      constructor(canvas: HTMLCanvasElement, onModeChange: (name: string, formula: string) => void) {
        this.canvas = canvas
        this.gl = null
        this.program = null
        this.uniforms = new Map()
        this.animationId = null

        this.frameCount = 0
        this.lastTime = performance.now()
        this.fps = 60

        this.time = 0
        this.isPaused = false
        this.currentMode = 0
        this.speed = 1.5
        this.iterations = 30
        this.autoQuality = true
        this.modeChangeTime = 0
        this.onModeChange = onModeChange
        this.zoom = 2.0

        this.modes = [
          "Mandelbrot",
          "Multibrot",
          "Burning Ship",
          "Tricorn",
          "Magnet",
          "Celtic",
          "Perpendicular",
          "Heart",
          "Cubic",
          "Quartic",
          "Lambda",
          "Manowar",
          "Spider Web",
          "Collatz",
          "Barnsley",
          "Popcorn",
          "Thorn",
          "Cubic Newton",
          "Cosine",
          "Tangent",
          "Henon",
          "Ikeda",
          "Tinkerbell",
          "Chirikov",
        ]

        this.formulas = [
          "z² + c",
          "z^n + c (n = 2-4)",
          "(|Re(z)| - i|Im(z)|)² + c",
          "conj(z)² + c",
          "((z²+c-1)/(2z+c-2))²",
          "|Re(z²)| + i·Im(z²) + c",
          "Re(z²) + i·|Im(z²)| + c",
          "|z²| + c·morph",
          "z³ + c",
          "z⁴ + c",
          "c·z·(1-z)",
          "z² + c·z",
          "z² + c + sin(4x)cos(4y)",
          "z/2 + c or 3z+1 + c",
          "z±1 + c (conditional)",
          "z + sin(y+tan(3y)) + c",
          "z² + c/z",
          "z - (z³-2z+2)/(3z²-2) + c",
          "cos(z) + c",
          "tan(z) + c",
          "[1-ax²+y, bx] + c",
          "1 + 0.9ze^(it) + c",
          "[x²-y²+ax+by, 2xy+cx+dy] + c",
          "[x+y+k·sin(x), y+k·sin(x)] + c",
        ]

        this.init()
      }

      getVertexShader() {
        return `
          attribute vec2 a_position;
          void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
          }
        `
      }

      getFragmentShader() {
        return `
          precision highp float;
          
          uniform vec2 u_resolution;
          uniform float u_time;
          uniform float u_iterations;
          uniform int u_mode;
          uniform float u_speed;
          uniform float u_zoom;
          
          #define PI 3.14159265359
          
          vec2 cmul(vec2 a, vec2 b) {
            return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x);
          }
          
          vec2 cdiv(vec2 a, vec2 b) {
            float d = dot(b, b);
            if (d < 0.0001) return a;
            return vec2(dot(a,b), a.y*b.x - a.x*b.y) / d;
          }
          
          vec2 cpow(vec2 z, float n) {
            if (length(z) < 0.0001) return vec2(0.0);
            float r = length(z);
            float theta = atan(z.y, z.x);
            return pow(r, n) * vec2(cos(n * theta), sin(n * theta));
          }
          
          vec2 cexp(vec2 z) {
            return exp(z.x) * vec2(cos(z.y), sin(z.y));
          }
          
          vec2 csin(vec2 z) {
            float ex = exp(z.y);
            float emx = exp(-z.y);
            return vec2(sin(z.x) * (ex + emx) * 0.5, cos(z.x) * (ex - emx) * 0.5);
          }
          
          vec2 ccos(vec2 z) {
            float ex = exp(z.y);
            float emx = exp(-z.y);
            return vec2(cos(z.x) * (ex + emx) * 0.5, -sin(z.x) * (ex - emx) * 0.5);
          }
          
          vec3 getColor(float t) {
            if (t >= 1.0) return vec3(0.0); // Black background
            
            // Simple white fractal
            float intensity = smoothstep(0.0, 1.0, t);
            intensity = intensity * (0.9 + 0.1 * sin(t * 20.0));
            
            return vec3(intensity);
          }
          
          void main() {
            vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / min(u_resolution.x, u_resolution.y);
            // Center the fractal properly
            vec2 c = uv * u_zoom + vec2(-0.5, 0.0);
            vec2 z = vec2(0.0);
            vec2 zPrev = vec2(0.0);
            
            float phase = u_time * u_speed * 0.01;
            float sp = sin(phase);
            float cp = cos(phase);
            
            vec2 julia = vec2(-0.8 + 0.3 * cp, 0.156 + 0.3 * sp);
            
            float iter = 0.0;
            
            for (float i = 0.0; i < 200.0; i++) {
              if (i >= u_iterations) break;
              
              vec2 z2 = cmul(z, z);
              vec2 z3 = cmul(z2, z);
              vec2 zNew;
              
              int m = u_mode;
              
              if (m == 0) {
                // Mandelbrot
                zNew = z2 + c;
              } else if (m == 1) {
                // Multibrot (variable power)
                float power = 2.0 + 2.0 * (sin(phase * 0.5) * 0.5 + 0.5);
                zNew = cpow(z, power) + c;
              } else if (m == 2) {
                // Burning Ship
                vec2 zabs = vec2(abs(z.x), -abs(z.y));
                zNew = cmul(zabs, zabs) + c;
              } else if (m == 3) {
                // Tricorn
                vec2 zc = vec2(z.x, -z.y);
                zNew = cmul(zc, zc) + c;
              } else if (m == 4) {
                // Magnet
                vec2 num = z2 + c - vec2(1.0, 0.0);
                vec2 den = 2.0 * z + c - vec2(2.0, 0.0);
                vec2 ratio = cdiv(num, den);
                zNew = cmul(ratio, ratio);
              } else if (m == 5) {
                // Celtic
                zNew = vec2(abs(z2.x), z2.y) + c;
              } else if (m == 6) {
                // Perpendicular
                zNew = vec2(z2.x, abs(z2.y)) + c;
              } else if (m == 7) {
                // Heart
                vec2 morph = vec2(sin(phase), cos(phase));
                zNew = abs(z2) + c * morph;
              } else if (m == 8) {
                // Cubic
                zNew = z3 + c;
              } else if (m == 9) {
                // Quartic
                zNew = cmul(z2, z2) + c;
              } else if (m == 10) {
                // Lambda
                zNew = cmul(c, cmul(z, vec2(1.0, 0.0) - z));
              } else if (m == 11) {
                // Manowar
                zNew = z2 + cmul(c, z) + zPrev;
                zPrev = z;
              } else if (m == 12) {
                // Spider Web
                float web = sin(z.x * 4.0) * cos(z.y * 4.0);
                zNew = z2 + c + vec2(web * 0.1, 0.0);
              } else if (m == 13) {
                // Collatz
                if (mod(z.x, 2.0) < 1.0) {
                  zNew = z * 0.5 + c;
                } else {
                  zNew = 3.0 * z + vec2(1.0, 0.0) + c;
                }
              } else if (m == 14) {
                // Barnsley
                if (z.x >= 0.0) {
                  zNew = vec2(z.x - 1.0, z.y + 1.0) + c;
                } else {
                  zNew = vec2(z.x + 1.0, z.y - 1.0) + c;
                }
              } else if (m == 15) {
                // Popcorn
                zNew = z + vec2(sin(z.y + tan(3.0 * z.y)), sin(z.x + tan(3.0 * z.x))) * 0.5 + c;
              } else if (m == 16) {
                // Thorn
                zNew = cdiv(z2 + c, z + vec2(0.001, 0.0));
              } else if (m == 17) {
                // Cubic Newton
                vec2 f = z3 - 2.0 * z + vec2(2.0, 0.0);
                vec2 df = 3.0 * z2 - vec2(2.0, 0.0);
                zNew = z - cdiv(f, df) + c * 0.1;
              } else if (m == 18) {
                // Cosine
                zNew = ccos(z) + c;
              } else if (m == 19) {
                // Tangent
                vec2 sinz = csin(z);
                vec2 cosz = ccos(z);
                if (length(cosz) > 0.001) {
                  zNew = cdiv(sinz, cosz) + c;
                } else {
                  zNew = z2 + c;
                }
              } else if (m == 20) {
                // Henon
                float a = 1.4 + 0.2 * sin(phase);
                float b = 0.3;
                zNew = vec2(1.0 - a * z.x * z.x + z.y, b * z.x) + c * 0.1;
              } else if (m == 21) {
                // Ikeda
                float t = 0.4 - 6.0 / (1.0 + dot(z, z));
                zNew = vec2(1.0, 0.0) + 0.9 * cmul(z, cexp(vec2(0.0, t))) + c * 0.1;
              } else if (m == 22) {
                // Tinkerbell
                float a = 0.9, b = -0.6013, cc = 2.0, d = 0.5;
                zNew = vec2(z.x * z.x - z.y * z.y + a * z.x + b * z.y, 
                           2.0 * z.x * z.y + cc * z.x + d * z.y) + c * 0.1;
              } else {
                // Chirikov
                float k = 1.0 + 0.5 * sin(phase);
                zNew = vec2(z.x + z.y + k * sin(z.x), z.y + k * sin(z.x)) + c * 0.1;
              }
              
              z = zNew;
              
              if (dot(z, z) > 10.0) {
                iter = i + 1.0 - log2(log2(dot(z, z)));
                break;
              }
              
              iter = i;
            }
            
            vec3 color = getColor(iter / u_iterations);
            gl_FragColor = vec4(color, 1.0);
          }
        `
      }

      init() {
        this.gl = this.canvas.getContext("webgl", {
          alpha: false,
          depth: false,
          stencil: false,
          antialias: false,
          premultipliedAlpha: false,
          preserveDrawingBuffer: false,
          powerPreference: "high-performance",
        })

        if (!this.gl) {
          console.error("WebGL not supported!")
          return
        }

        this.resize()
        if (this.createShaders()) {
          this.setupGeometry()
          this.animate()
        }
      }

      createShader(source: string, type: number) {
        if (!this.gl) return null
        const shader = this.gl.createShader(type)
        if (!shader) return null
        this.gl.shaderSource(shader, source)
        this.gl.compileShader(shader)

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
          console.error("Shader error:", this.gl.getShaderInfoLog(shader))
          this.gl.deleteShader(shader)
          return null
        }

        return shader
      }

      createShaders() {
        if (!this.gl) return false
        const vertexShader = this.createShader(this.getVertexShader(), this.gl.VERTEX_SHADER)
        const fragmentShader = this.createShader(this.getFragmentShader(), this.gl.FRAGMENT_SHADER)

        if (!vertexShader || !fragmentShader) {
          console.error("Failed to create shaders")
          return false
        }

        this.program = this.gl.createProgram()
        if (!this.program) return false
        this.gl.attachShader(this.program, vertexShader)
        this.gl.attachShader(this.program, fragmentShader)
        this.gl.linkProgram(this.program)

        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
          console.error("Program link failed:", this.gl.getProgramInfoLog(this.program))
          return false
        }

        ;["u_resolution", "u_time", "u_iterations", "u_mode", "u_speed", "u_zoom"].forEach((name) => {
          if (this.gl && this.program) {
            const location = this.gl.getUniformLocation(this.program, name)
            if (location !== null) {
              this.uniforms.set(name, location)
            }
          }
        })

        this.gl.deleteShader(vertexShader)
        this.gl.deleteShader(fragmentShader)

        return true
      }

      setupGeometry() {
        if (!this.gl || !this.program) return
        const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])

        const buffer = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW)

        const positionLoc = this.gl.getAttribLocation(this.program, "a_position")
        this.gl.enableVertexAttribArray(positionLoc)
        this.gl.vertexAttribPointer(positionLoc, 2, this.gl.FLOAT, false, 0, 0)
      }

      resize() {
        if (!this.gl) return
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)

        // Calculate zoom to fit screen
        const aspectRatio = this.canvas.width / this.canvas.height
        const baseZoom = 2.0

        // Adjust zoom based on aspect ratio and screen size
        if (aspectRatio > 1.0) {
          // Wide screen - zoom out more
          this.zoom = baseZoom * (1.0 + (aspectRatio - 1.0) * 0.3)
        } else {
          // Tall screen - adjust less
          this.zoom = baseZoom * (1.0 + (1.0 / aspectRatio - 1.0) * 0.2)
        }

        // Scale based on screen size for mobile
        const minDimension = Math.min(this.canvas.width, this.canvas.height)
        if (minDimension < 600) {
          this.zoom *= 0.8 // Zoom in more on small screens
        }
      }

      updateQuality() {
        if (!this.autoQuality) return

        if (this.fps < 30 && this.iterations > 20) {
          this.iterations = Math.max(20, this.iterations - 5)
        } else if (this.fps > 55 && this.iterations < 100) {
          this.iterations = Math.min(100, this.iterations + 2)
        }
      }

      setUniforms() {
        if (!this.gl || !this.program) return

        const uniforms = [
          { name: "u_resolution", method: "uniform2f", values: [this.canvas.width, this.canvas.height] },
          { name: "u_time", method: "uniform1f", values: [this.time] },
          { name: "u_iterations", method: "uniform1f", values: [this.iterations] },
          { name: "u_mode", method: "uniform1i", values: [this.currentMode] },
          { name: "u_speed", method: "uniform1f", values: [this.speed] },
          { name: "u_zoom", method: "uniform1f", values: [this.zoom] },
        ]

        for (const uniform of uniforms) {
          const location = this.uniforms.get(uniform.name)
          if (location) {
            // biome-ignore lint/suspicious/noExplicitAny: WebGL methods require any for values array
            ;(this.gl as any)[uniform.method](location, ...uniform.values)
          }
        }
      }

      render() {
        if (!this.program || !this.gl) return

        // biome-ignore lint/correctness/useHookAtTopLevel: This is WebGL's useProgram, not a React hook
        this.gl.useProgram(this.program)
        this.setUniforms()
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4)
      }

      animate() {
        const currentTime = performance.now()
        const deltaTime = currentTime - this.lastTime

        this.frameCount++
        if (this.frameCount % 30 === 0) {
          this.fps = Math.round(30000 / (currentTime - this.lastTime + deltaTime * 29))
          this.updateQuality()
          this.frameCount = 0
        }

        this.lastTime = currentTime

        if (!this.isPaused) {
          this.time += deltaTime * 0.001
          this.modeChangeTime += deltaTime
        }

        // Cycle through modes every 12 seconds
        if (this.modeChangeTime > 12000) {
          this.currentMode = (this.currentMode + 1) % this.modes.length
          this.modeChangeTime = 0
          this.onModeChange(this.modes[this.currentMode], this.formulas[this.currentMode])
        }

        this.render()
        this.animationId = requestAnimationFrame(() => this.animate())
      }

      destroy() {
        if (this.animationId) {
          cancelAnimationFrame(this.animationId)
        }
        if (this.gl && this.program) {
          this.gl.deleteProgram(this.program)
        }
      }
    }

    const renderer = new FractalRenderer(canvasRef.current, (name, formula) => {
      setCurrentFractal({ name, formula })
    })
    rendererRef.current = renderer

    // Set initial fractal info
    setCurrentFractal({
      name: renderer.modes[0],
      formula: renderer.formulas[0],
    })

    const handleResize = () => {
      if (renderer) {
        renderer.resize()
      }
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (rendererRef.current) {
        rendererRef.current.destroy()
      }
    }
  }, [mounted])

  if (!mounted) return null

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none
                   bg-background invert opacity-[0.25]
                   dark:bg-background dark:invert-0 dark:opacity-[0.20]
                   motion-reduce:transition-none"
      />
      {currentFractal.name && (
        <div className="fixed top-2 right-2 pointer-events-none z-20">
          <div
            className="px-2 py-1 text-xs font-mono text-[10px]
                       bg-foreground/[0.08] text-foreground/40 backdrop-blur-sm
                       dark:text-foreground/70
                       contrast-more:bg-foreground/12 contrast-more:text-foreground/60
                       dark:contrast-more:text-foreground/80
                       motion-reduce:transition-none"
          >
            {currentFractal.name}: {currentFractal.formula}
          </div>
        </div>
      )}
    </>
  )
}
