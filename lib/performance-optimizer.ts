/**
 * Performance Optimizer for Real-time Video Processing
 * Handles frame throttling, resolution scaling, and adaptive quality
 */

export class PerformanceOptimizer {
  private targetFps = 30
  private frameTime = 1000 / this.targetFps
  private lastFrameTime = 0
  private frameCount = 0
  private fps = 0
  private lastReportTime = 0
  private shouldThrottle = false
  private scaleFactor = 1

  constructor(targetFps: number = 30) {
    this.targetFps = targetFps
    this.frameTime = 1000 / targetFps
  }

  /**
   * Check if frame should be processed based on FPS target
   */
  shouldProcessFrame(): boolean {
    const now = performance.now()
    const deltaTime = now - this.lastFrameTime

    if (deltaTime < this.frameTime) {
      return false
    }

    this.lastFrameTime = now
    this.trackFrameTime(now)
    return true
  }

  /**
   * Track frame timing and calculate FPS
   */
  private trackFrameTime(now: number): void {
    this.frameCount++

    if (now - this.lastReportTime >= 1000) {
      this.fps = this.frameCount
      this.frameCount = 0
      this.lastReportTime = now

      // Adaptive quality adjustment
      if (this.fps < this.targetFps * 0.7) {
        this.shouldThrottle = true
        this.scaleFactor = Math.max(0.5, this.scaleFactor * 0.9)
      } else if (this.fps > this.targetFps * 1.2) {
        this.shouldThrottle = false
        this.scaleFactor = Math.min(1, this.scaleFactor * 1.05)
      }
    }
  }

  /**
   * Get current FPS
   */
  getFps(): number {
    return this.fps
  }

  /**
   * Check if processing should be throttled
   */
  isThrottled(): boolean {
    return this.shouldThrottle
  }

  /**
   * Get adaptive scale factor for canvas resolution
   */
  getScaleFactor(): number {
    return this.scaleFactor
  }

  /**
   * Calculate optimized canvas dimensions
   */
  getOptimizedDimensions(width: number, height: number): { width: number; height: number } {
    return {
      width: Math.round(width * this.scaleFactor),
      height: Math.round(height * this.scaleFactor),
    }
  }

  /**
   * Request animation frame with throttling
   */
  requestAnimationFrame(callback: FrameRequestCallback): number {
    return window.requestAnimationFrame((timestamp) => {
      if (this.shouldProcessFrame()) {
        callback(timestamp)
      } else {
        window.requestAnimationFrame((t) => {
          if (this.shouldProcessFrame()) {
            callback(t)
          }
        })
      }
    })
  }
}

/**
 * Utility to detect device capabilities
 */
export class DeviceCapabilities {
  static isLowEndDevice(): boolean {
    if (!navigator.deviceMemory) return false
    return navigator.deviceMemory <= 4
  }

  static isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  static getOptimalTargetFps(): number {
    if (this.isLowEndDevice() || this.isMobileDevice()) {
      return 24
    }
    return 30
  }

  static getOptimalResolution(): { width: number; height: number } {
    const width = window.innerWidth
    const height = window.innerHeight

    if (this.isLowEndDevice()) {
      return { width: Math.min(width, 640), height: Math.min(height, 480) }
    }

    return { width: Math.min(width, 1280), height: Math.min(height, 720) }
  }
}

declare global {
  interface Navigator {
    deviceMemory?: number
  }
}
