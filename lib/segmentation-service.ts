/**
 * MediaPipe Selfie Segmentation Service
 * Handles model loading and video processing with performance optimizations
 */

export interface SegmentationResult {
  image: CanvasImageSource
  segmentationMask: ImageData
  timestamp: number
  width: number
  height: number
}

export type SegmentationCallback = (results: SegmentationResult) => void

export class SegmentationService {
  private selfieSegmentation: any = null
  private isReady = false
  private modelLoadingPromise: Promise<void> | null = null

  async initialize(): Promise<void> {
    if (this.isReady) return
    if (this.modelLoadingPromise) return this.modelLoadingPromise

    this.modelLoadingPromise = new Promise((resolve, reject) => {
      try {
        const script = document.createElement('script')
        script.src =
          'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1.1675469925/selfie_segmentation.js'
        script.crossOrigin = 'anonymous'

        script.onload = () => {
          if (!window.SelfieSegmentation) {
            reject(new Error('SelfieSegmentation not loaded'))
            return
          }

          try {
            this.selfieSegmentation = new window.SelfieSegmentation({
              locateFile: (file: string) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1.1675469925/${file}`
              },
            })

            this.selfieSegmentation.setOptions({
              modelSelection: 1, // Landscape optimized
              selfieMode: true,
            })

            this.isReady = true
            resolve()
          } catch (error) {
            reject(error)
          }
        }

        script.onerror = () => {
          reject(new Error('Failed to load MediaPipe script'))
        }

        document.body.appendChild(script)
      } catch (error) {
        reject(error)
      }
    })

    return this.modelLoadingPromise
  }

  async process(
    videoElement: HTMLVideoElement,
    callback: SegmentationCallback
  ): Promise<void> {
    if (!this.isReady) {
      throw new Error('Segmentation service not initialized')
    }

    this.selfieSegmentation.onResults((results: any) => {
      callback({
        image: results.image,
        segmentationMask: results.segmentationMask,
        timestamp: results.timestamp,
        width: results.image.width,
        height: results.image.height,
      })
    })

    return this.selfieSegmentation.send({ image: videoElement })
  }

  isInitialized(): boolean {
    return this.isReady
  }

  getModel() {
    return this.selfieSegmentation
  }
}

declare global {
  interface Window {
    SelfieSegmentation: any
  }
}
