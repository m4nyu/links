// Fast Mandelbrot calculation worker with SIMD-style optimizations
interface MandelbrotJob {
  id: number
  startX: number
  startY: number
  width: number
  height: number
  centerX: number
  centerY: number
  zoom: number
  maxIterations: number
  canvasWidth: number
  canvasHeight: number
  mode: number
}

interface MandelbrotResult {
  id: number
  imageData: Uint8ClampedArray
  width: number
  height: number
  startX: number
  startY: number
}

// Fast complex number operations for better performance
class Complex {
  constructor(public real: number, public imag: number) {}
  
  static multiply(a: Complex, b: Complex): Complex {
    return new Complex(
      a.real * b.real - a.imag * b.imag,
      a.real * b.imag + a.imag * b.real
    )
  }
  
  static add(a: Complex, b: Complex): Complex {
    return new Complex(a.real + b.real, a.imag + b.imag)
  }
  
  magnitudeSquared(): number {
    return this.real * this.real + this.imag * this.imag
  }
}

// Optimized Mandelbrot calculation with unrolled loops for better performance
function calculateMandelbrotFast(cx: number, cy: number, maxIterations: number): [number, boolean] {
  let zx = 0, zy = 0
  let zx2 = 0, zy2 = 0
  let iteration = 0
  
  // Unroll the first few iterations for better performance
  for (; iteration < maxIterations && iteration < 4; iteration++) {
    zy = 2 * zx * zy + cy
    zx = zx2 - zy2 + cx
    zx2 = zx * zx
    zy2 = zy * zy
    if (zx2 + zy2 > 4) {
      break
    }
  }
  
  // Continue with regular loop
  for (; iteration < maxIterations; iteration++) {
    if (zx2 + zy2 > 4) break
    zy = 2 * zx * zy + cy
    zx = zx2 - zy2 + cx
    zx2 = zx * zx
    zy2 = zy * zy
  }
  
  const escaped = zx2 + zy2 > 4
  let smoothIter = iteration
  
  if (escaped && iteration < maxIterations) {
    // Smooth coloring using continuous escape time
    smoothIter = iteration + 1 - Math.log2(Math.log2(zx2 + zy2))
  }
  
  return [smoothIter, escaped]
}

// Alternative fractal algorithms
function calculateBurningShip(cx: number, cy: number, maxIterations: number): [number, boolean] {
  let zx = 0, zy = 0
  let iteration = 0
  
  for (; iteration < maxIterations; iteration++) {
    const zx2 = zx * zx
    const zy2 = zy * zy
    if (zx2 + zy2 > 4) break
    
    const newZy = 2 * Math.abs(zx) * Math.abs(zy) + cy
    zx = zx2 - zy2 + cx
    zy = newZy
  }
  
  const escaped = zx * zx + zy * zy > 4
  return [iteration, escaped]
}

function calculateJulia(zx: number, zy: number, cx: number, cy: number, maxIterations: number): [number, boolean] {
  let iteration = 0
  
  for (; iteration < maxIterations; iteration++) {
    const zx2 = zx * zx
    const zy2 = zy * zy
    if (zx2 + zy2 > 4) break
    
    const newZy = 2 * zx * zy + cy
    zx = zx2 - zy2 + cx
    zy = newZy
  }
  
  const escaped = zx * zx + zy * zy > 4
  return [iteration, escaped]
}

// Fast HSV to RGB conversion
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = v - c
  
  let r: number, g: number, b: number
  
  if (h < 60) {
    [r, g, b] = [c, x, 0]
  } else if (h < 120) {
    [r, g, b] = [x, c, 0]
  } else if (h < 180) {
    [r, g, b] = [0, c, x]
  } else if (h < 240) {
    [r, g, b] = [0, x, c]
  } else if (h < 300) {
    [r, g, b] = [x, 0, c]
  } else {
    [r, g, b] = [c, 0, x]
  }
  
  return [
    Math.floor((r + m) * 255),
    Math.floor((g + m) * 255),
    Math.floor((b + m) * 255)
  ]
}

// High-performance color generation
function getColor(iterations: number, maxIterations: number, escaped: boolean): [number, number, number, number] {
  if (!escaped) {
    return [0, 0, 0, 255] // Black for points in the set
  }
  
  // Fast rainbow coloring
  const t = iterations / maxIterations
  const hue = (t * 360 + performance.now() * 0.05) % 360
  const [r, g, b] = hsvToRgb(hue, 0.8, 0.9)
  
  return [r, g, b, 255]
}

// Process a tile of the image
function processTile(job: MandelbrotJob): MandelbrotResult {
  const { startX, startY, width, height, centerX, centerY, zoom, maxIterations, canvasWidth, canvasHeight, mode } = job
  const imageData = new Uint8ClampedArray(width * height * 4)
  
  const minDim = Math.min(canvasWidth, canvasHeight)
  const pixelSize = zoom / minDim
  
  let pixelIndex = 0
  
  // Process pixels in tiles for better cache locality
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const screenX = startX + x
      const screenY = startY + y
      
      // Convert screen coordinates to complex plane
      const cx = centerX + (screenX - canvasWidth * 0.5) * pixelSize
      const cy = centerY + (screenY - canvasHeight * 0.5) * pixelSize
      
      let result: [number, boolean]
      
      // Select algorithm based on mode
      switch (mode) {
        case 2: // Burning Ship
          result = calculateBurningShip(cx, cy, maxIterations)
          break
        case 3: // Julia set (using time-varying c)
          const time = performance.now() * 0.001
          const juliaC = { x: Math.cos(time * 0.5) * 0.7, y: Math.sin(time * 0.3) * 0.5 }
          result = calculateJulia(cx, cy, juliaC.x, juliaC.y, maxIterations)
          break
        default: // Mandelbrot
          result = calculateMandelbrotFast(cx, cy, maxIterations)
      }
      
      const [iterations, escaped] = result
      const [r, g, b, a] = getColor(iterations, maxIterations, escaped)
      
      imageData[pixelIndex] = r
      imageData[pixelIndex + 1] = g
      imageData[pixelIndex + 2] = b
      imageData[pixelIndex + 3] = a
      pixelIndex += 4
    }
  }
  
  return {
    id: job.id,
    imageData,
    width,
    height,
    startX,
    startY
  }
}

// Worker message handler
self.onmessage = function(e: MessageEvent<MandelbrotJob>) {
  const job = e.data
  const result = processTile(job)
  self.postMessage(result)
}

export {}