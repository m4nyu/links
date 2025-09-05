interface TestJob {
  id: number
  x: number
  y: number
}

interface TestResult {
  id: number
  result: number
}

export class TestWorkerPool {
  private workers: Worker[] = []
  private availableWorkers: Worker[] = []
  private pendingJobs = new Map<number, { resolve: (result: TestResult) => void; reject: (error: Error) => void }>()
  private nextJobId = 0
  
  constructor() {
    this.initializeWorkers()
  }
  
  private initializeWorkers() {
    console.log('Creating test worker...')
    
    try {
      // Extremely simple worker script
      const workerScript = `
        console.log('Worker started');
        
        self.onmessage = function(e) {
          console.log('Worker received message:', e.data);
          const { id, x, y } = e.data;
          
          // Just return the sum as a test
          const result = x + y;
          
          console.log('Worker sending response:', { id, result });
          self.postMessage({ id, result });
        };
        
        self.onerror = function(error) {
          console.error('Worker script error:', error);
        };
      `
      
      console.log('Creating blob...')
      const blob = new Blob([workerScript], { type: 'application/javascript' })
      
      console.log('Creating object URL...')
      const workerUrl = URL.createObjectURL(blob)
      
      console.log('Creating worker...')
      const worker = new Worker(workerUrl)
      
      worker.onmessage = (e: MessageEvent<TestResult>) => {
        console.log('Main thread received worker message:', e.data)
        this.handleWorkerMessage(worker, e.data)
      }
      
      worker.onerror = (error) => {
        console.error('Worker error in main thread:', error)
      }
      
      worker.onmessageerror = (error) => {
        console.error('Worker message error in main thread:', error)
      }
      
      this.workers.push(worker)
      this.availableWorkers.push(worker)
      
      URL.revokeObjectURL(workerUrl)
      
      console.log('Test worker created successfully')
      
    } catch (error) {
      console.error('Failed to create test worker:', error)
    }
  }
  
  private handleWorkerMessage(worker: Worker, result: TestResult) {
    console.log('Handling worker message:', result)
    
    // Mark worker as available
    if (!this.availableWorkers.includes(worker)) {
      this.availableWorkers.push(worker)
    }
    
    // Resolve the pending job
    const pending = this.pendingJobs.get(result.id)
    if (pending) {
      console.log(`Resolving job ${result.id}`)
      pending.resolve(result)
      this.pendingJobs.delete(result.id)
    } else {
      console.error(`No pending job found for ID ${result.id}`)
    }
  }
  
  async testJob(): Promise<TestResult> {
    console.log('Starting test job...')
    
    return new Promise((resolve, reject) => {
      if (this.availableWorkers.length === 0) {
        console.error('No workers available for test!')
        reject(new Error('No workers available'))
        return
      }
      
      const worker = this.availableWorkers.pop()!
      const job = { id: this.nextJobId++, x: 5, y: 10 }
      
      console.log('Submitting test job:', job)
      
      this.pendingJobs.set(job.id, { resolve, reject })
      
      // Timeout
      setTimeout(() => {
        if (this.pendingJobs.has(job.id)) {
          console.error('Test job timed out')
          this.pendingJobs.delete(job.id)
          reject(new Error('Test job timeout'))
        }
      }, 2000)
      
      try {
        worker.postMessage(job)
        console.log('Test job message sent')
      } catch (error) {
        console.error('Failed to send test job:', error)
        this.pendingJobs.delete(job.id)
        reject(error)
      }
    })
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