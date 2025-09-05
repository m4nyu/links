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

export class SimpleWorkerPool {
  private workers: Worker[] = []
  private availableWorkers: Worker[] = []
  private pendingJobs = new Map<number, { resolve: (result: WorkerResult) => void; reject: (error: Error) => void }>()
  private nextJobId = 0
  
  constructor(private numWorkers: number = Math.min(4, navigator.hardwareConcurrency || 2)) {
    this.initializeWorkers()
  }
  
  private initializeWorkers() {
    console.log(`Creating ${this.numWorkers} workers...`)
    
    try {
      // Test if workers are even supported
      if (typeof Worker === 'undefined') {
        throw new Error('Web Workers not supported')
      }
      
      console.log('Web Workers supported, creating workers...')
    
      // Simple inline worker that avoids blob issues
      for (let i = 0; i < this.numWorkers; i++) {
        console.log(`Creating worker ${i + 1}/${this.numWorkers}`)
        
        try {
          // Create worker using data URL to avoid blob permission issues
          const workerScript = `
          function mandelbrot(cx, cy, maxIter) {
            let zx = 0, zy = 0, zx2 = 0, zy2 = 0, iter = 0;
            
            while (iter < maxIter && zx2 + zy2 <= 4) {
              zy = 2 * zx * zy + cy;
              zx = zx2 - zy2 + cx;
              zx2 = zx * zx;
              zy2 = zy * zy;
              iter++;
            }
            
            return iter;
          }
          
          function hsvToRgb(h, s, v) {
            const c = v * s;
            const x = c * (1 - Math.abs((h / 60) % 2 - 1));
            const m = v - c;
            let r, g, b;
            
            if (h < 60) [r, g, b] = [c, x, 0];
            else if (h < 120) [r, g, b] = [x, c, 0];
            else if (h < 180) [r, g, b] = [0, c, x];
            else if (h < 240) [r, g, b] = [0, x, c];
            else if (h < 300) [r, g, b] = [x, 0, c];
            else [r, g, b] = [c, 0, x];
            
            return [Math.floor((r + m) * 255), Math.floor((g + m) * 255), Math.floor((b + m) * 255)];
          }
          
          self.onmessage = function(e) {
            const { id, startX, startY, width, height, centerX, centerY, zoom, maxIterations, canvasWidth, canvasHeight } = e.data;
            const imageData = new Uint8ClampedArray(width * height * 4);
            const minDim = Math.min(canvasWidth, canvasHeight);
            const pixelSize = zoom / minDim;
            
            let pixelIndex = 0;
            
            for (let y = 0; y < height; y++) {
              for (let x = 0; x < width; x++) {
                const screenX = startX + x;
                const screenY = startY + y;
                const cx = centerX + (screenX - canvasWidth * 0.5) * pixelSize;
                const cy = centerY + (screenY - canvasHeight * 0.5) * pixelSize;
                
                const iterations = mandelbrot(cx, cy, maxIterations);
                
                if (iterations >= maxIterations) {
                  imageData[pixelIndex] = 0;
                  imageData[pixelIndex + 1] = 0;
                  imageData[pixelIndex + 2] = 0;
                  imageData[pixelIndex + 3] = 255;
                } else {
                  const t = iterations / maxIterations;
                  const hue = (t * 360 + performance.now() * 0.05) % 360;
                  const [r, g, b] = hsvToRgb(hue, 0.8, 0.9);
                  
                  imageData[pixelIndex] = r;
                  imageData[pixelIndex + 1] = g;
                  imageData[pixelIndex + 2] = b;
                  imageData[pixelIndex + 3] = 255;
                }
                
                pixelIndex += 4;
              }
            }
            
            self.postMessage({ id, imageData, width, height, startX, startY });
          };
        `
        
          console.log(`Creating blob for worker ${i + 1}`)
          const blob = new Blob([workerScript], { type: 'application/javascript' })
          console.log(`Created blob, creating URL for worker ${i + 1}`)
          const workerUrl = URL.createObjectURL(blob)
          console.log(`Creating Worker object for worker ${i + 1}`)
          const worker = new Worker(workerUrl)
          
          worker.onmessage = (e: MessageEvent<WorkerResult>) => {
            console.log(`Worker ${i + 1} sent message:`, e.data.id)
            this.handleWorkerMessage(worker, e.data)
          }
          
          worker.onerror = (error) => {
            console.error(`Worker ${i + 1} error:`, error)
          }
          
          worker.onmessageerror = (error) => {
            console.error(`Worker ${i + 1} message error:`, error)
          }
          
          console.log(`Worker ${i + 1} created successfully`)
          this.workers.push(worker)
          this.availableWorkers.push(worker)
          
          // Clean up URL after worker is created
          URL.revokeObjectURL(workerUrl)
          
        } catch (error) {
          console.error(`Failed to create worker ${i + 1}:`, error)
        }
      }
    } catch (error) {
      console.error('Worker initialization failed:', error)
    }
    
    console.log(`Successfully created ${this.workers.length} workers`)
  }
  
  private handleWorkerMessage(worker: Worker, result: WorkerResult) {
    // Mark worker as available
    if (!this.availableWorkers.includes(worker)) {
      this.availableWorkers.push(worker)
    }
    
    // Resolve the pending job
    const pending = this.pendingJobs.get(result.id)
    if (pending) {
      pending.resolve(result)
      this.pendingJobs.delete(result.id)
    }
  }
  
  async submitJob(job: Omit<WorkerJob, 'id'>): Promise<WorkerResult> {
    console.log('submitJob called, available workers:', this.availableWorkers.length)
    
    return new Promise((resolve, reject) => {
      if (this.availableWorkers.length === 0) {
        console.error('No workers available!')
        reject(new Error('No workers available'))
        return
      }
      
      const worker = this.availableWorkers.pop()!
      const fullJob = { ...job, id: this.nextJobId++ }
      
      console.log(`Submitting job ${fullJob.id} to worker`)
      
      this.pendingJobs.set(fullJob.id, { resolve, reject })
      
      // Set timeout to avoid hanging
      const timeoutId = setTimeout(() => {
        if (this.pendingJobs.has(fullJob.id)) {
          console.error(`Job ${fullJob.id} timed out`)
          this.pendingJobs.delete(fullJob.id)
          // Return worker to available pool
          if (!this.availableWorkers.includes(worker)) {
            this.availableWorkers.push(worker)
          }
          reject(new Error(`Worker timeout for job ${fullJob.id}`))
        }
      }, 5000)
      
      // Store timeout ID so we can clear it when job completes
      this.pendingJobs.set(fullJob.id, { 
        resolve: (result) => {
          clearTimeout(timeoutId)
          resolve(result)
        }, 
        reject: (error) => {
          clearTimeout(timeoutId)
          reject(error)
        }
      })
      
      try {
        console.log(`Posting message to worker for job ${fullJob.id}`)
        worker.postMessage(fullJob)
        console.log(`Message posted successfully for job ${fullJob.id}`)
      } catch (error) {
        console.error(`Failed to post message for job ${fullJob.id}:`, error)
        clearTimeout(timeoutId)
        this.pendingJobs.delete(fullJob.id)
        // Return worker to available pool
        if (!this.availableWorkers.includes(worker)) {
          this.availableWorkers.push(worker)
        }
        reject(error)
      }
    })
  }
  
  getStats() {
    return {
      totalWorkers: this.workers.length,
      availableWorkers: this.availableWorkers.length,
      busyWorkers: this.workers.length - this.availableWorkers.length,
      queuedJobs: 0,
      pendingJobs: this.pendingJobs.size
    }
  }
  
  destroy() {
    for (const worker of this.workers) {
      worker.terminate()
    }
    
    this.workers.length = 0
    this.availableWorkers.length = 0
    this.pendingJobs.clear()
  }
}