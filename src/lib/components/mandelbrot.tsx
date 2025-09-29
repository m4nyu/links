"use client"

import { CrosshairIcon, MinusIcon, PlayIcon, PlusIcon, StopIcon } from "@phosphor-icons/react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/lib/components/ui/button"

interface FractalRenderer {
  resize(): void
  destroy(): void
  isPaused: boolean
  zoomAt(screenX: number, screenY: number, factor: number): void
  panBy(deltaScreenX: number, deltaScreenY: number): void
  resetView(): void
  togglePause(): void
  canvas: HTMLCanvasElement
}

export default function Mandelbrot() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<FractalRenderer | null>(null)
  const [mounted, setMounted] = useState(false)
  const [currentFractal, setCurrentFractal] = useState({ name: "", formula: "" })
  const [isPausedUI, setIsPausedUI] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [fps, setFps] = useState(60)
  const dragStartRef = useRef({ x: 0, y: 0 })

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
      fpsSampleFrames: number
      fpsSampleStart: number
      targetFps: number
      time: number
      isPaused: boolean
      currentMode: number
      speed: number
      iterations: number
      autoQuality: boolean
      modeChangeTime: number
      modes: { name: string; formula: string }[]
      onModeChange: (name: string, formula: string) => void
      zoom: number
      renderScale: number
      center: { x: number; y: number }
      baseZoom: number

      constructor(canvas: HTMLCanvasElement, onModeChange: (name: string, formula: string) => void) {
        this.canvas = canvas
        this.gl = null
        this.program = null
        this.uniforms = new Map()
        this.animationId = null

        this.frameCount = 0
        this.lastTime = performance.now()
        this.fps = 60
        this.fpsSampleFrames = 0
        this.fpsSampleStart = performance.now()
        this.targetFps = 120

        this.time = 0
        this.isPaused = false
        this.currentMode = 0
        this.speed = 1.5
        this.iterations = 80
        this.autoQuality = true
        this.modeChangeTime = 0
        this.onModeChange = onModeChange
        this.zoom = 2.0
        this.renderScale = 1.0
        this.center = { x: -0.5, y: 0.0 }
        this.baseZoom = 2.0

        this.modes = [
          { name: "Mandelbrot", formula: "z² + c" },
          { name: "Multibrot", formula: "z^n + c (n = 2-4)" },
          { name: "Burning Ship", formula: "(|Re(z)| - i|Im(z)|)² + c" },
          { name: "Magnet", formula: "((z²+c-1)/(2z+c-2))²" },
          { name: "Perpendicular", formula: "Re(z²) + i·|Im(z²)| + c" },
          { name: "Cubic", formula: "z³ + c" },
          { name: "Quartic", formula: "z⁴ + c" },
          { name: "Spider Web", formula: "z² + c + sin(4x)cos(4y)" },
          { name: "Thorn", formula: "z² + c/z" },
          { name: "Cubic Newton", formula: "z - (z³-2z+2)/(3z²-2) + c" },
          { name: "Cosine", formula: "cos(z) + c" },
          { name: "Tinkerbell", formula: "[x²-y²+ax+by, 2xy+cx+dy] + c" },
          { name: "Chirikov", formula: "[x+y+k·sin(x), y+k·sin(x)] + c" },
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

      getModeShaderParts(name: string) {
        switch (name) {
          case "Mandelbrot":
            return {
              f: `vec2 F(vec2 z, vec2 zPrev, vec2 c, float phase){ vec2 z2=cmul(z,z); return z2 + c; }`,
              fp: `vec2 fPrime(vec2 z, float phase){ return 2.0*z; }`,
              analytic: true,
            }
          case "Multibrot":
            return {
              f: `vec2 F(vec2 z, vec2 zPrev, vec2 c, float phase){ float p=2.0+2.0*(sin(phase*0.5)*0.5+0.5); return cpow(z,p)+c; }`,
              fp: `vec2 fPrime(vec2 z, float phase){ float p=2.0+2.0*(sin(phase*0.5)*0.5+0.5); return p*cpow(z,max(p-1.0,0.0)); }`,
              analytic: true,
            }
          case "Cubic":
            return {
              f: `vec2 F(vec2 z, vec2 zPrev, vec2 c, float phase){ vec2 z2=cmul(z,z); vec2 z3=cmul(z2,z); return z3 + c; }`,
              fp: `vec2 fPrime(vec2 z, float phase){ return 3.0*cmul(z,z); }`,
              analytic: true,
            }
          case "Quartic":
            return {
              f: `vec2 F(vec2 z, vec2 zPrev, vec2 c, float phase){ vec2 z2=cmul(z,z); return cmul(z2,z2) + c; }`,
              fp: `vec2 fPrime(vec2 z, float phase){ vec2 z2=cmul(z,z); return 4.0*cmul(z2,z); }`,
              analytic: true,
            }
          case "Burning Ship":
            return {
              f: `vec2 F(vec2 z, vec2 zPrev, vec2 c, float phase){ vec2 a=vec2(abs(z.x),-abs(z.y)); return cmul(a,a)+c; }`,
              fp: "",
              analytic: false,
            }
          case "Magnet":
            return {
              f: `vec2 F(vec2 z, vec2 zPrev, vec2 c, float phase){ vec2 z2=cmul(z,z); vec2 num=z2+c-vec2(1.0,0.0); vec2 den=2.0*z+c-vec2(2.0,0.0); vec2 ratio=cdiv(num,den); return cmul(ratio,ratio); }`,
              fp: "",
              analytic: false,
            }
          case "Perpendicular":
            return {
              f: `vec2 F(vec2 z, vec2 zPrev, vec2 c, float phase){ vec2 z2=cmul(z,z); return vec2(z2.x, abs(z2.y))+c; }`,
              fp: "",
              analytic: false,
            }
          case "Spider Web":
            return {
              f: `vec2 F(vec2 z, vec2 zPrev, vec2 c, float phase){ vec2 z2=cmul(z,z); float w=sin(z.x*4.0)*cos(z.y*4.0); return z2 + c + vec2(w*0.1,0.0); }`,
              fp: "",
              analytic: false,
            }
          case "Thorn":
            return {
              f: `vec2 F(vec2 z, vec2 zPrev, vec2 c, float phase){ vec2 z2=cmul(z,z); return cdiv(z2+c, z+vec2(0.001,0.0)); }`,
              fp: "",
              analytic: false,
            }
          case "Cubic Newton":
            return {
              f: `vec2 F(vec2 z, vec2 zPrev, vec2 c, float phase){ vec2 z2=cmul(z,z); vec2 z3=cmul(z2,z); vec2 f=z3-2.0*z+vec2(2.0,0.0); vec2 df=3.0*z2-vec2(2.0,0.0); return z - cdiv(f,df) + c*0.1; }`,
              fp: "",
              analytic: false,
            }
          case "Cosine":
            return {
              f: `vec2 F(vec2 z, vec2 zPrev, vec2 c, float phase){ return ccos(z) + c; }`,
              fp: "",
              analytic: false,
            }
          case "Tinkerbell":
            return {
              f: `vec2 F(vec2 z, vec2 zPrev, vec2 c, float phase){ float a=0.9,b=-0.6013,cc=2.0,d=0.5; return vec2(z.x*z.x - z.y*z.y + a*z.x + b*z.y, 2.0*z.x*z.y + cc*z.x + d*z.y) + c*0.1; }`,
              fp: "",
              analytic: false,
            }
          default:
            return {
              f: `vec2 F(vec2 z, vec2 zPrev, vec2 c, float phase){ float k=1.0+0.5*sin(phase); return vec2(z.x+z.y+k*sin(z.x), z.y+k*sin(z.x)) + c*0.1; }`,
              fp: "",
              analytic: false,
            }
        }
      }

      getFragmentShaderForMode(modeIndex: number) {
        const modeName = this.modes[modeIndex]?.name ?? ""
        const parts = this.getModeShaderParts(modeName)
        const fDecl = parts.f
        const fPrimeDecl = parts.fp
        const supportsAnalytic = parts.analytic

        const derivativeDecl = supportsAnalytic
          ? `
              vec2 updateDzdc(vec2 z, vec2 dzdc, float phase){
                vec2 fp = fPrime(z, phase);
                return cmul(fp, dzdc) + vec2(1.0, 0.0);
              }
            `
          : `
              vec2 updateDzdc(vec2 z, vec2 dzdc, float phase){ return dzdc; }
              mat2 jacobianZ_f(vec2 z, vec2 zPrev, vec2 c, float phase, vec2 f0) {
                float h = 0.001;
                vec2 fx1 = F(z + vec2(h, 0.0), zPrev, c, phase);
                vec2 fy1 = F(z + vec2(0.0, h), zPrev, c, phase);
                vec2 dfdx = (fx1 - f0) / h;
                vec2 dfdy = (fy1 - f0) / h;
                return mat2(dfdx.x, dfdy.x, dfdx.y, dfdy.y);
              }
              vec2 dFdc_x_f(vec2 z, vec2 zPrev, vec2 c, float phase, vec2 f0) {
                float h=0.001; vec2 f1 = F(z, zPrev, c+vec2(h,0.0), phase); return (f1 - f0)/h;
              }
              vec2 dFdc_y_f(vec2 z, vec2 zPrev, vec2 c, float phase, vec2 f0) {
                float h=0.001; vec2 f1 = F(z, zPrev, c+vec2(0.0,h), phase); return (f1 - f0)/h;
              }
            `

        return `
          precision highp float;
          
          uniform vec2 u_resolution;
          uniform float u_time;
          uniform float u_iterations;
          uniform int u_mode;
          uniform float u_speed;
          uniform float u_zoom;
          uniform int u_isDark;
          uniform vec2 u_center;
          uniform vec2 u_center_hi;
          uniform vec2 u_center_lo;
          uniform float u_zoom_hi;
          uniform float u_zoom_lo;
          uniform float u_edgeThicknessPx;
          
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
          
          vec2 two_sum(float a, float b) {
            float s = a + b;
            float bb = s - a;
            float err = (a - (s - bb)) + (b - bb);
            return vec2(s, err);
          }
          vec2 quick_two_sum(float a, float b) {
            float s = a + b;
            float err = b - (s - a);
            return vec2(s, err);
          }
          vec2 two_prod(float a, float b) {
            float p = a * b;
            const float SPLIT = 4097.0;
            float a_t = a * SPLIT;
            float a_hi = a_t - (a_t - a);
            float a_lo = a - a_hi;
            float b_t = b * SPLIT;
            float b_hi = b_t - (b_t - b);
            float b_lo = b - b_hi;
            float err = ((a_hi * b_hi - p) + a_hi * b_lo + a_lo * b_hi) + a_lo * b_lo;
            return vec2(p, err);
          }
          vec2 dd_add(vec2 a, vec2 b) {
            vec2 s = two_sum(a.x, b.x);
            float e = a.y + b.y + s.y;
            return quick_two_sum(s.x, e);
          }
          vec2 dd_mul(vec2 a, vec2 b) {
            vec2 p = two_prod(a.x, b.x);
            float e = a.x * b.y + a.y * b.x + p.y;
            return quick_two_sum(p.x, e);
          }
          vec2 dd_from_float(float a) { return vec2(a, 0.0); }

          ${fDecl}
          ${supportsAnalytic ? fPrimeDecl : ""}
          ${derivativeDecl}

          vec3 getColor(float t, float didEscape) {
            if (didEscape < 0.5) return vec3(0.0);
              float hue = mod(t * 20.0 + u_time * 0.2, 6.0);
              float r, g, b;
              if (hue < 1.0) {
              r = 1.0; g = hue; b = 0.0;
              } else if (hue < 2.0) {
              r = 2.0 - hue; g = 1.0; b = 0.0;
              } else if (hue < 3.0) {
              r = 0.0; g = 1.0; b = hue - 2.0;
              } else if (hue < 4.0) {
              r = 0.0; g = 4.0 - hue; b = 1.0;
              } else if (hue < 5.0) {
              r = hue - 4.0; g = 0.0; b = 1.0;
              } else {
              r = 1.0; g = 0.0; b = 6.0 - hue;
            }
            return vec3(r, g, b);
          }

          vec4 evalSample(vec2 uv) {
            vec2 zoom_dd = vec2(u_zoom_hi, u_zoom_lo);
            vec2 cx = dd_add(vec2(u_center_hi.x, u_center_lo.x), dd_mul(zoom_dd, dd_from_float(uv.x)));
            vec2 cy = dd_add(vec2(u_center_hi.y, u_center_lo.y), dd_mul(zoom_dd, dd_from_float(uv.y)));
            vec2 c = vec2(cx.x + cx.y, cy.x + cy.y);
            vec2 z = vec2(0.0);
            vec2 zPrev = vec2(0.0);
            float didEscape = 0.0;
            vec2 dzdc = vec2(0.0);
            vec2 dzdcX = vec2(0.0), dzdcY = vec2(0.0);
            float phase = u_time * u_speed * 0.01;
            float iter = 0.0;
            for (float i = 0.0; i < 200.0; i++) {
              if (i >= u_iterations) break;
              vec2 zNew = F(z, zPrev, c, phase);
              ${supportsAnalytic ? `dzdc = updateDzdc(z, dzdc, phase);` : `{ vec2 f0 = zNew; float h=0.0005; vec2 fx1 = F(z+vec2(h,0.0), zPrev, c, phase); vec2 fy1 = F(z+vec2(0.0,h), zPrev, c, phase); vec2 dfdx=(fx1-f0)/h; vec2 dfdy=(fy1-f0)/h; mat2 J=mat2(dfdx.x, dfdy.x, dfdx.y, dfdy.y); vec2 gcx=(F(z, zPrev, c+vec2(h,0.0), phase)-f0)/h; vec2 gcy=(F(z, zPrev, c+vec2(0.0,h), phase)-f0)/h; dzdcX = J*dzdcX + gcx; dzdcY = J*dzdcY + gcy; }`}
              if (${modeIndex} == 11) { zPrev = z; }
              z = zNew;
              if (dot(z, z) > 4.0) { iter = i + 1.0 - log2(log2(dot(z, z))); didEscape = 1.0; break; }
              iter = i;
            }
            float t = iter / u_iterations;
            vec3 color = vec3(0.0);
            float pixel = u_zoom / min(u_resolution.x, u_resolution.y);
            float width = pixel * max(u_edgeThicknessPx, 0.25);
            float aa = pixel * 0.9;
            float alpha = 0.0;
            if (didEscape > 0.5) {
              float r = length(z);
              float dAbs = ${supportsAnalytic ? `length(dzdc)` : `sqrt(dot(dzdcX, dzdcX) + dot(dzdcY, dzdcY))`};
              if (r > 0.0 && dAbs > 0.0) {
                float de = (r * log(r)) / dAbs;
                alpha = 1.0 - smoothstep(width - aa, width + aa, de);
                alpha = pow(alpha, 0.75);
                color = getColor(t, 1.0) * 0.9;
              }
            } else {
              color = vec3(0.0);
              alpha = 0.0;
            }
            return alpha < 0.001 ? vec4(0.0,0.0,0.0,0.0) : vec4(color, clamp(alpha, 0.0, 1.0));
          }

          void main() {
            vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / min(u_resolution.x, u_resolution.y);
            gl_FragColor = evalSample(uv);
          }
        `
      }

      init() {
        this.gl = this.canvas.getContext("webgl", {
          alpha: true,
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
        if (this.createShaders(this.currentMode)) {
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

      private setupUniforms() {
        const uniformNames = [
          "u_resolution",
          "u_time",
          "u_iterations",
          "u_mode",
          "u_speed",
          "u_zoom",
          "u_isDark",
          "u_center",
          "u_center_hi",
          "u_center_lo",
          "u_zoom_hi",
          "u_zoom_lo",
          "u_edgeThicknessPx",
        ]

        this.uniforms.clear()
        for (const name of uniformNames) {
          if (this.gl && this.program) {
            const location = this.gl.getUniformLocation(this.program, name)
            if (location !== null) {
              this.uniforms.set(name, location)
            }
          }
        }
      }

      private linkProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): boolean {
        if (!this.gl) return false

        if (this.program) {
          this.gl.deleteProgram(this.program)
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

        return true
      }

      createShaders(modeIndex?: number) {
        if (!this.gl) return false

        const vertexShader = this.createShader(this.getVertexShader(), this.gl.VERTEX_SHADER)
        const fragmentShader = this.createShader(
          this.getFragmentShaderForMode(modeIndex ?? this.currentMode),
          this.gl.FRAGMENT_SHADER
        )

        if (!vertexShader || !fragmentShader) {
          console.error("Failed to create shaders")
          return false
        }

        const success = this.linkProgram(vertexShader, fragmentShader)
        if (success) {
          this.setupUniforms()
        }

        this.gl.deleteShader(vertexShader)
        this.gl.deleteShader(fragmentShader)

        return success
      }

      setMode(modeIndex: number) {
        this.currentMode = modeIndex
        this.createShaders(modeIndex)
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
        // Dynamic DPR scaling based on performance
        let dpr = window.devicePixelRatio || 1
        if (this.fps < 30) {
          dpr = Math.max(1, dpr * 0.75) // Reduce resolution for better performance
        } else if (this.fps > 90) {
          dpr = Math.min(2, dpr * 1.25) // Increase resolution when performance allows
        }
        dpr = Math.max(1, Math.min(2, Math.floor(dpr)))

        this.canvas.width = Math.floor(window.innerWidth * dpr * this.renderScale)
        this.canvas.height = Math.floor(window.innerHeight * dpr * this.renderScale)
        this.canvas.style.width = `${window.innerWidth}px`
        this.canvas.style.height = `${window.innerHeight}px`

        if (this.gl) {
          this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
        }

        const aspectRatio = this.canvas.width / this.canvas.height
        const baseZoom = 2.0

        if (aspectRatio > 1.0) {
          this.zoom = baseZoom * (1.0 + (aspectRatio - 1.0) * 0.3)
        } else {
          this.zoom = baseZoom * (1.0 + (1.0 / aspectRatio - 1.0) * 0.2)
        }
        this.baseZoom = this.zoom
        if (!this.center) this.center = { x: -0.5, y: 0.0 }

        const minDimension = Math.min(this.canvas.width, this.canvas.height)
        if (minDimension < 600) {
          this.zoom *= 0.8
        }
      }

      private adjustIterationsDown() {
        if (this.iterations > 30) {
          this.iterations = Math.max(30, this.iterations - 4)
        }
      }

      private adjustIterationsUp() {
        if (this.iterations < 120) {
          this.iterations = Math.min(120, this.iterations + 2)
        }
      }

      updateQuality(currentFps: number) {
        if (!this.autoQuality) return

        const lower = this.targetFps - 5
        const upper = this.targetFps + 5

        if (currentFps < lower) {
          this.adjustIterationsDown()
        } else if (currentFps > upper) {
          this.adjustIterationsUp()
        }
      }

      private split(x: number): [number, number] {
        const hi = Math.fround(x)
        const lo = Math.fround(x - hi)
        return [hi, lo]
      }

      private applyUniform(
        gl: WebGLRenderingContext,
        location: WebGLUniformLocation,
        method: string,
        values: number[]
      ) {
        switch (method) {
          case "uniform1f":
            gl.uniform1f(location, values[0])
            break
          case "uniform1i":
            gl.uniform1i(location, values[0])
            break
          case "uniform2f":
            gl.uniform2f(location, values[0], values[1])
            break
        }
      }

      setUniforms() {
        if (!this.gl || !this.program) return

        const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? 1 : 0
        const [cx_hi, cx_lo] = this.split(this.center.x)
        const [cy_hi, cy_lo] = this.split(this.center.y)
        const [zoom_hi, zoom_lo] = this.split(this.zoom)

        const uniforms = [
          { name: "u_resolution", method: "uniform2f", values: [this.canvas.width, this.canvas.height] },
          { name: "u_time", method: "uniform1f", values: [this.time] },
          { name: "u_iterations", method: "uniform1f", values: [this.iterations] },
          { name: "u_mode", method: "uniform1i", values: [this.currentMode] },
          { name: "u_speed", method: "uniform1f", values: [this.speed] },
          { name: "u_zoom", method: "uniform1f", values: [this.zoom] },
          { name: "u_isDark", method: "uniform1i", values: [isDark] },
          { name: "u_center", method: "uniform2f", values: [this.center.x, this.center.y] },
          { name: "u_center_hi", method: "uniform2f", values: [cx_hi, cy_hi] },
          { name: "u_center_lo", method: "uniform2f", values: [cx_lo, cy_lo] },
          { name: "u_zoom_hi", method: "uniform1f", values: [zoom_hi] },
          { name: "u_zoom_lo", method: "uniform1f", values: [zoom_lo] },
          { name: "u_edgeThicknessPx", method: "uniform1f", values: [3.0] },
        ]

        for (const uniform of uniforms) {
          const location = this.uniforms.get(uniform.name)
          if (location) {
            this.applyUniform(this.gl, location, uniform.method, uniform.values)
          }
        }
      }

      render() {
        if (!this.program || !this.gl) return

        // biome-ignore lint/correctness/useHookAtTopLevel: This is WebGL useProgram method, not React hook
        this.gl.useProgram(this.program)
        this.gl.clearColor(0, 0, 0, 0)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT)
        this.setUniforms()
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4)
      }

      animate() {
        const currentTime = performance.now()
        const deltaTime = currentTime - this.lastTime

        this.fpsSampleFrames += 1
        const elapsed = currentTime - this.fpsSampleStart
        if (elapsed >= 250) {
          this.fps = (this.fpsSampleFrames * 1000) / elapsed
          this.updateQuality(this.fps)
          this.fpsSampleFrames = 0
          this.fpsSampleStart = currentTime
        }

        this.lastTime = currentTime

        if (!this.isPaused) {
          this.time += deltaTime * 0.001
          this.modeChangeTime += deltaTime
        }

        if (this.modeChangeTime > 12000) {
          this.currentMode = (this.currentMode + 1) % this.modes.length
          this.setMode(this.currentMode)
          this.modeChangeTime = 0
          this.onModeChange(this.modes[this.currentMode].name, this.modes[this.currentMode].formula)
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

      zoomAt(screenX: number, screenY: number, factor: number) {
        const minDim = Math.min(this.canvas.width, this.canvas.height)
        const uv = {
          x: (screenX - this.canvas.width * 0.5) / minDim,
          y: (screenY - this.canvas.height * 0.5) / minDim,
        }
        const worldX = this.center.x + uv.x * this.zoom
        const worldY = this.center.y + uv.y * this.zoom
        this.zoom *= factor
        this.center.x = worldX - uv.x * this.zoom
        this.center.y = worldY - uv.y * this.zoom
      }

      panBy(deltaScreenX: number, deltaScreenY: number) {
        const minDim = Math.min(this.canvas.width, this.canvas.height)
        this.center.x -= (deltaScreenX / minDim) * this.zoom
        this.center.y += (deltaScreenY / minDim) * this.zoom
      }

      resetView() {
        this.center.x = -0.5
        this.center.y = 0.0
        this.zoom = this.baseZoom
      }

      togglePause() {
        this.isPaused = !this.isPaused
      }
    }

    const renderer = new FractalRenderer(canvasRef.current, (name, formula) => {
      setCurrentFractal({ name, formula })
    })
    rendererRef.current = renderer

    setCurrentFractal({
      name: renderer.modes[0].name,
      formula: renderer.modes[0].formula,
    })
    setIsPausedUI(renderer.isPaused)

    // Performance monitoring
    const updateStats = () => {
      if (renderer) {
        setFps(Math.round(renderer.fps))
      }
    }

    const statsInterval = setInterval(updateStats, 250)

    const handleResize = () => {
      if (renderer) {
        renderer.resize()
      }
    }

    const handleVisibility = () => {
      if (!rendererRef.current) return
      rendererRef.current.isPaused = document.hidden
      setIsPausedUI(document.hidden)
    }

    window.addEventListener("resize", handleResize)
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      window.removeEventListener("resize", handleResize)
      document.removeEventListener("visibilitychange", handleVisibility)
      clearInterval(statsInterval)
      if (rendererRef.current) {
        rendererRef.current.destroy()
      }
    }
  }, [mounted])

  const handleCanvasWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (!rendererRef.current || !canvasRef.current) return
    e.preventDefault()
    const factor = e.deltaY < 0 ? 0.9 : 1.1
    const canvas = canvasRef.current
    rendererRef.current.zoomAt(
      e.clientX * (canvas.width / window.innerWidth),
      e.clientY * (canvas.height / window.innerHeight),
      factor
    )
  }

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsDragging(true)
    dragStartRef.current = { x: e.clientX, y: e.clientY }
  }

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging || !rendererRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    rendererRef.current.panBy(dx * (canvas.width / window.innerWidth), dy * (canvas.height / window.innerHeight))
  }

  const handleCanvasPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId)
    setIsDragging(false)
  }

  const handleCanvasPointerCancel = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId)
    setIsDragging(false)
  }

  if (!mounted) return null

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full isolate mix-blend-normal motion-reduce:transition-none touch-none select-none"
        onWheel={handleCanvasWheel}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
        onPointerCancel={handleCanvasPointerCancel}
        onLostPointerCapture={handleCanvasPointerCancel}
      />
      {currentFractal.name && (
        <div className="fixed top-2 right-2 pointer-events-none z-20 flex flex-col items-end gap-1 select-none">
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
          <div
            className="px-2 py-1 text-xs font-mono text-[9px]
                       bg-foreground/[0.08] text-foreground/40 backdrop-blur-sm
                       dark:text-foreground/70
                       contrast-more:bg-foreground/12 contrast-more:text-foreground/60
                       dark:contrast-more:text-foreground/80
                       motion-reduce:transition-none"
          >
            WEBGL | {fps} FPS
          </div>
        </div>
      )}
      <div className="fixed bottom-6 right-3 z-20 pointer-events-auto flex flex-col items-end gap-1.5 select-none">
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 [&_svg]:size-3"
          onClick={() => {
            const r = rendererRef.current
            if (!r) return
            r.zoomAt(r.canvas.width / 2, r.canvas.height / 2, 0.9)
          }}
          aria-label="Zoom in"
        >
          <PlusIcon weight="bold" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 [&_svg]:size-3"
          onClick={() => {
            const r = rendererRef.current
            if (!r) return
            r.zoomAt(r.canvas.width / 2, r.canvas.height / 2, 1.1)
          }}
          aria-label="Zoom out"
        >
          <MinusIcon weight="bold" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 [&_svg]:size-3"
          onClick={() => {
            if (!rendererRef.current) return
            rendererRef.current.resetView()
          }}
          aria-label="Center"
        >
          <CrosshairIcon weight="bold" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 [&_svg]:size-3"
          onClick={() => {
            if (!rendererRef.current) return
            rendererRef.current.togglePause()
            setIsPausedUI(rendererRef.current.isPaused)
          }}
          aria-label={isPausedUI ? "Play" : "Pause"}
        >
          <span
            className={`inline-block transition-transform duration-150 ${isPausedUI ? "scale-100" : "scale-95"}`}
          >
            {isPausedUI ? <PlayIcon weight="fill" /> : <StopIcon weight="fill" />}
          </span>
        </Button>
      </div>
    </>
  )
}
