'use client'

import { useEffect, useRef, useState } from 'react'
import { useBackgroundStore } from '@/lib/background-store'
import { PerformanceOptimizer, DeviceCapabilities } from '@/lib/performance-optimizer'
import BackgroundCanvas from './background-canvas'

interface WebcamContainerProps {
  onFpsUpdate: (fps: number) => void
}

export default function WebcamContainer({ onFpsUpdate }: WebcamContainerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [modelLoaded, setModelLoaded] = useState(false)
  const selfieSegmentation = useRef<any>(null)
  const perfOptimizer = useRef(new PerformanceOptimizer(DeviceCapabilities.getOptimalTargetFps()))
  const animationFrameId = useRef<number>(0)
  const frameCount = useRef<number>(0)
  const lastTime = useRef<number>(Date.now())

  const { backgroundMode, blurStrength, solidColor, gradientType, uploadedImage } =
    useBackgroundStore()

  useEffect(() => {
    const loadModel = async () => {
      try {
        // Load MediaPipe Drawing Utils
        const drawingScript = document.createElement('script')
        drawingScript.src =
          'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.5.1675469925/drawing_utils.js'
        drawingScript.crossOrigin = 'anonymous'
        document.body.appendChild(drawingScript)

        // Load Selfie Segmentation with error handling
        const script = document.createElement('script')
        script.src =
          'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1.1675469925/selfie_segmentation.js'
        script.crossOrigin = 'anonymous'

        script.onload = async () => {
          try {
            // Add small delay to ensure library is fully loaded
            await new Promise((resolve) => setTimeout(resolve, 100))

            if (typeof window !== 'undefined' && window.SelfieSegmentation) {
              const segmentation = new window.SelfieSegmentation({
                locateFile: (file: string) => {
                  return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1.1675469925/${file}`
                },
              })

              segmentation.setOptions({
                modelSelection: 1,
                selfieMode: true,
              })

              segmentation.onResults(handleSegmentation)
              selfieSegmentation.current = segmentation
              setModelLoaded(true)
            }
          } catch (error) {
            console.error('Error initializing SelfieSegmentation:', error)
            setModelLoaded(true) // Allow app to run with fallback
          }
        }

        script.onerror = () => {
          console.error('Failed to load MediaPipe script')
          setModelLoaded(true) // Allow app to run with fallback
        }

        document.body.appendChild(script)
      } catch (error) {
        console.error('Failed to load MediaPipe model:', error)
        setModelLoaded(true) // Allow app to run with fallback
      }
    }

    loadModel()

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [])

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play()
              processFrame()
            }
          }
        }
      } catch (error) {
        console.error('Error accessing webcam:', error)
      }
    }

    if (modelLoaded) {
      startWebcam()
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [modelLoaded])

  const handleSegmentation = (results: any) => {
    if (!perfOptimizer.current.shouldProcessFrame()) {
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Fallback if results is invalid
    if (!results || !results.image) {
      if (videoRef.current) {
        ctx.drawImage(videoRef.current, 0, 0)
      }
      onFpsUpdate(perfOptimizer.current.getFps())
      return
    }

    // Get optimized dimensions
    const dimensions = perfOptimizer.current.getOptimizedDimensions(
      results.image.width,
      results.image.height
    )

    // Set canvas size to match video
    if (canvas.width !== dimensions.width || canvas.height !== dimensions.height) {
      canvas.width = dimensions.width
      canvas.height = dimensions.height
    }

    // Draw based on mode
    if (backgroundMode === 'original') {
      // Draw original video
      ctx.drawImage(results.image, 0, 0)
    } else if (backgroundMode === 'blur') {
      // For blur: draw full frame then apply selective blur based on mask
      ctx.drawImage(results.image, 0, 0)

      // Apply blur to background using mask
      const maskData = new Uint8Array(results.segmentationMask.data)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // Get blur amount (0-50)
      const blurAmount = Math.round((blurStrength / 100) * 20)

      // Create blurred version of the frame
      const blurredCanvas = document.createElement('canvas')
      blurredCanvas.width = canvas.width
      blurredCanvas.height = canvas.height
      const blurredCtx = blurredCanvas.getContext('2d')!
      blurredCtx.drawImage(results.image, 0, 0)
      blurredCtx.filter = `blur(${blurAmount}px)`
      blurredCtx.drawImage(results.image, 0, 0)

      const blurredData = blurredCtx.getImageData(0, 0, canvas.width, canvas.height).data

      // Blend based on mask
      for (let i = 0; i < data.length; i += 4) {
        const maskAlpha = maskData[i / 4]
        if (maskAlpha < 128) {
          // Background - use blurred version
          data[i] = blurredData[i]
          data[i + 1] = blurredData[i + 1]
          data[i + 2] = blurredData[i + 2]
        }
      }

      ctx.putImageData(imageData, 0, 0)
    } else {
      // Draw background first
      drawBackground(ctx, canvas.width, canvas.height)

      // Apply mask and draw person
      const maskData = new ImageData(
        new Uint8ClampedArray(results.segmentationMask.data),
        results.segmentationMask.width,
        results.segmentationMask.height
      )

      // Draw person with smooth edges
      ctx.globalAlpha = 1
      drawPersonWithSmoothEdges(ctx, results.image, maskData)
    }

    // Report FPS
    onFpsUpdate(perfOptimizer.current.getFps())
  }

  const drawBackground = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    if (backgroundMode === 'blur') {
      // For blur, we'll apply it via CSS filter instead
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, width, height)
    } else if (backgroundMode === 'solid') {
      ctx.fillStyle = solidColor
      ctx.fillRect(0, 0, width, height)
    } else if (backgroundMode === 'gradient') {
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      if (gradientType === 'purple-blue') {
        gradient.addColorStop(0, '#6366f1')
        gradient.addColorStop(1, '#3b82f6')
      } else if (gradientType === 'sunset') {
        gradient.addColorStop(0, '#f97316')
        gradient.addColorStop(1, '#ec4899')
      } else if (gradientType === 'forest') {
        gradient.addColorStop(0, '#059669')
        gradient.addColorStop(1, '#1e40af')
      }
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
    } else if (backgroundMode === 'image' && uploadedImage) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = uploadedImage
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height)
      }
    }
  }

  const drawPersonWithSmoothEdges = (
    ctx: CanvasRenderingContext2D,
    videoFrame: any,
    maskData: ImageData
  ) => {
    const imageData = ctx.createImageData(videoFrame.width, videoFrame.height)
    const data = imageData.data
    const maskValues = new Uint8Array(maskData.data)

    // Apply Gaussian blur to mask for smooth edges
    const blurredMask = gaussianBlur(maskValues, videoFrame.width, videoFrame.height, 3)

    const videoCanvas = document.createElement('canvas')
    videoCanvas.width = videoFrame.width
    videoCanvas.height = videoFrame.height
    const videoCtx = videoCanvas.getContext('2d')!
    videoCtx.drawImage(videoFrame, 0, 0)
    const videoData = videoCtx.getImageData(0, 0, videoFrame.width, videoFrame.height)
    const videoPixels = videoData.data

    // Composite video with mask
    for (let i = 0; i < data.length; i += 4) {
      const maskAlpha = blurredMask[i / 4]
      data[i] = videoPixels[i] // R
      data[i + 1] = videoPixels[i + 1] // G
      data[i + 2] = videoPixels[i + 2] // B
      data[i + 3] = maskAlpha // A - use mask as alpha
    }

    ctx.putImageData(imageData, 0, 0)
  }

  const gaussianBlur = (data: Uint8Array, width: number, height: number, radius: number) => {
    const kernel = createGaussianKernel(radius)
    const output = new Uint8Array(data.length)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0
        let weight = 0

        for (let ky = -radius; ky <= radius; ky++) {
          for (let kx = -radius; kx <= radius; kx++) {
            const ix = Math.min(Math.max(x + kx, 0), width - 1)
            const iy = Math.min(Math.max(y + ky, 0), height - 1)
            const idx = (iy * width + ix) * 4
            const kernelValue = kernel[radius + ky][radius + kx]
            sum += data[idx] * kernelValue
            weight += kernelValue
          }
        }

        const idx = (y * width + x) * 4
        output[idx] = Math.round(sum / weight)
        output[idx + 1] = output[idx]
        output[idx + 2] = output[idx]
        output[idx + 3] = output[idx]
      }
    }

    return output
  }

  const createGaussianKernel = (radius: number) => {
    const size = radius * 2 + 1
    const kernel: number[][] = []
    const sigma = radius / 2

    let sum = 0
    for (let y = -radius; y <= radius; y++) {
      const row: number[] = []
      for (let x = -radius; x <= radius; x++) {
        const value = Math.exp(-(x * x + y * y) / (2 * sigma * sigma))
        row.push(value)
        sum += value
      }
      kernel.push(row)
    }

    // Normalize
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        kernel[y][x] /= sum
      }
    }

    return kernel
  }

  const processFrame = () => {
    const canvas = canvasRef.current
    const video = videoRef.current

    // Fallback mode: display video directly if model hasn't loaded
    if (!selfieSegmentation.current && canvas && video && video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
        }

        // Draw video with background effect using CSS filters
        ctx.drawImage(video, 0, 0)

        // Apply simple background blur/effect using canvas
        if (backgroundMode === 'blur') {
          // Create a simple blur effect by drawing multiple times with opacity
          ctx.globalAlpha = 0.1
          for (let i = 0; i < 5; i++) {
            ctx.drawImage(video, -i, 0)
            ctx.drawImage(video, i, 0)
          }
          ctx.globalAlpha = 1
        }
      }
    } else if (selfieSegmentation.current && modelLoaded && video) {
      try {
        selfieSegmentation.current.send({ image: video })
      } catch (error) {
        console.error('Segmentation error:', error)
      }
    }

    animationFrameId.current = requestAnimationFrame(processFrame)
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Hidden video element */}
      <video ref={videoRef} className="hidden" />

      {/* Main canvas display with glassmorphism */}
      <div className="relative flex-1 overflow-hidden rounded-2xl bg-linear-to-br from-primary/10 to-accent/10 p-1">
        <div className="absolute inset-0 rounded-2xl bg-black/40 backdrop-blur-sm" />
        <div className="relative h-full w-full overflow-hidden rounded-xl bg-black">
          <canvas
            ref={canvasRef}
            className="h-full w-full object-cover"
            style={{ display: 'block' }}
          />

          {/* Glow effect */}
          <div className="pointer-events-none absolute inset-0 rounded-xl shadow-[inset_0_0_60px_rgba(99,102,241,0.1)]" />
        </div>
      </div>

      {/* Background canvas for blur effect */}
      <BackgroundCanvas />
    </div>
  )
}

declare global {
  interface Window {
    SelfieSegmentation: any
  }
}
