interface WorkerJob {
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

interface WorkerResult {
  id: number
  imageData: Uint8ClampedArray
  width: number
  height: number
  startX: number
  startY: number
}

interface PendingJob {
  job: WorkerJob
  resolve: (result: WorkerResult) => void
  reject: (error: Error) => void
}

export class WorkerPool {
  private workers: Worker[] = []
  private availableWorkers: Worker[] = []
  private busyWorkers: Set<Worker> = new Set()
  private jobQueue: PendingJob[] = []
  private nextJobId = 0
  private pendingJobs = new Map<number, { resolve: (result: WorkerResult) => void; reject: (error: Error) => void }>()
  
  constructor(private numWorkers: number = navigator.hardwareConcurrency || 4) {
    this.initializeWorkers()
  }
  
  private async initializeWorkers() {
    console.log('Initializing workers...')
    
    // Create worker blob from our worker code
    const workerCode = `
      // Fast Mandelbrot calculation worker with SIMD-style optimizations
      
      // Fast complex number operations for better performance
      class Complex {
        constructor(real, imag) {
          this.real = real
          this.imag = imag
        }
        
        static multiply(a, b) {
          return new Complex(
            a.real * b.real - a.imag * b.imag,
            a.real * b.imag + a.imag * b.real
          )
        }
        
        static add(a, b) {
          return new Complex(a.real + b.real, a.imag + b.imag)
        }
        
        magnitudeSquared() {
          return this.real * this.real + this.imag * this.imag
        }
      }
      
      // Optimized Mandelbrot calculation with unrolled loops for better performance
      function calculateMandelbrotFast(cx, cy, maxIterations) {
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
      function calculateBurningShip(cx, cy, maxIterations) {
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
      
      function calculateJulia(zx, zy, cx, cy, maxIterations) {
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
      function hsvToRgb(h, s, v) {
        const c = v * s
        const x = c * (1 - Math.abs((h / 60) % 2 - 1))
        const m = v - c
        
        let r, g, b
        
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
      function getColor(iterations, maxIterations, escaped) {
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
      function processTile(job) {
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
            
            let result
            
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
      self.onmessage = function(e) {
        const job = e.data
        const result = processTile(job)
        self.postMessage(result)
      }
    `
    
    const workerBlob = new Blob([workerCode], { type: 'application/javascript' })
    const workerUrl = URL.createObjectURL(workerBlob)
    
    for (let i = 0; i < this.numWorkers; i++) {
      const worker = new Worker(workerUrl)
      
      worker.onmessage = (e: MessageEvent<WorkerResult>) => {
        this.handleWorkerMessage(worker, e.data)
      }
      
      worker.onerror = (error) => {
        console.error('Worker error:', error)
        this.handleWorkerError(worker, error)
      }
      
      this.workers.push(worker)
      this.availableWorkers.push(worker)
    }
    
    // Clean up the blob URL after workers are created
    URL.revokeObjectURL(workerUrl)
  }
  
  private handleWorkerMessage(worker: Worker, result: WorkerResult) {
    // Mark worker as available
    this.busyWorkers.delete(worker)
    this.availableWorkers.push(worker)
    
    // Resolve the pending job
    const pending = this.pendingJobs.get(result.id)
    if (pending) {
      pending.resolve(result)
      this.pendingJobs.delete(result.id)
    }
    
    // Process next job in queue
    this.processNextJob()
  }
  
  private handleWorkerError(worker: Worker, error: ErrorEvent) {
    // Find and reject any pending job for this worker
    for (const [jobId, pending] of this.pendingJobs) {
      pending.reject(new Error(`Worker error: ${error.message}`))
      this.pendingJobs.delete(jobId)
    }
    
    // Mark worker as available (it might still be usable)
    this.busyWorkers.delete(worker)
    if (!this.availableWorkers.includes(worker)) {
      this.availableWorkers.push(worker)
    }
  }
  
  private processNextJob() {
    if (this.jobQueue.length === 0 || this.availableWorkers.length === 0) {
      return
    }
    
    const worker = this.availableWorkers.pop()!
    const pendingJob = this.jobQueue.shift()!
    
    this.busyWorkers.add(worker)
    this.pendingJobs.set(pendingJob.job.id, {
      resolve: pendingJob.resolve,
      reject: pendingJob.reject
    })
    
    worker.postMessage(pendingJob.job)
  }
  
  async submitJob(job: Omit<WorkerJob, 'id'>): Promise<WorkerResult> {
    return new Promise((resolve, reject) => {
      const fullJob = { ...job, id: this.nextJobId++ }
      
      const pendingJob: PendingJob = {
        job: fullJob,
        resolve,
        reject
      }
      
      if (this.availableWorkers.length > 0) {
        const worker = this.availableWorkers.pop()!
        this.busyWorkers.add(worker)
        this.pendingJobs.set(fullJob.id, { resolve, reject })
        worker.postMessage(fullJob)
      } else {
        this.jobQueue.push(pendingJob)
      }
    })
  }
  
  // Submit multiple jobs and return results as they complete
  async *submitJobs(jobs: Omit<WorkerJob, 'id'>[]): AsyncIterableIterator<WorkerResult> {
    const promises = jobs.map(job => this.submitJob(job))
    
    // Yield results as they complete
    for (const promise of promises) {
      yield await promise
    }
  }
  
  // Cancel all pending jobs
  cancelAllJobs() {
    // Clear job queue
    for (const pendingJob of this.jobQueue) {
      pendingJob.reject(new Error('Job cancelled'))
    }
    this.jobQueue.length = 0
    
    // Reject all pending jobs
    for (const [jobId, pending] of this.pendingJobs) {
      pending.reject(new Error('Job cancelled'))
    }
    this.pendingJobs.clear()
    
    // Note: We can't actually stop workers that are already processing
    // But we can ignore their results by clearing the pending jobs map
  }
  
  // Get pool statistics
  getStats() {
    return {
      totalWorkers: this.workers.length,
      availableWorkers: this.availableWorkers.length,
      busyWorkers: this.busyWorkers.size,
      queuedJobs: this.jobQueue.length,
      pendingJobs: this.pendingJobs.size
    }
  }
  
  // Clean up resources
  destroy() {
    this.cancelAllJobs()
    
    for (const worker of this.workers) {
      worker.terminate()
    }
    
    this.workers.length = 0
    this.availableWorkers.length = 0
    this.busyWorkers.clear()
  }
}