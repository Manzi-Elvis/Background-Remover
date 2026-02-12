/**
 * Image Processing Utilities for Background Removal
 * Optimized for real-time video processing
 */

export class ImageProcessor {
  /**
   * Apply Gaussian blur to an image using separable convolution for performance
   */
  static gaussianBlur(
    imageData: ImageData,
    radius: number,
    sigma: number = radius / 2.5
  ): ImageData {
    const { width, height, data } = imageData
    const output = new Uint8ClampedArray(data.length)

    // Horizontal pass
    const temp = new Uint8ClampedArray(data.length)
    this.applyKernel(data, temp, width, height, radius, sigma, true)

    // Vertical pass
    this.applyKernel(temp, output, width, height, radius, sigma, false)

    return new ImageData(output, width, height)
  }

  /**
   * Apply separable Gaussian kernel for efficient blur
   */
  private static applyKernel(
    input: Uint8ClampedArray,
    output: Uint8ClampedArray,
    width: number,
    height: number,
    radius: number,
    sigma: number,
    horizontal: boolean
  ): void {
    const kernel = this.createGaussianKernel(radius, sigma)
    const kernelSum = kernel.reduce((a, b) => a + b, 0)

    if (horizontal) {
      // Horizontal blur
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let sum = 0

          for (let k = -radius; k <= radius; k++) {
            const px = Math.min(Math.max(x + k, 0), width - 1)
            const idx = (y * width + px) * 4
            sum += input[idx] * kernel[k + radius]
          }

          const outIdx = (y * width + x) * 4
          output[outIdx] = Math.round(sum / kernelSum)
          output[outIdx + 1] = output[outIdx]
          output[outIdx + 2] = output[outIdx]
          output[outIdx + 3] = input[outIdx + 3]
        }
      }
    } else {
      // Vertical blur
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let sum = 0

          for (let k = -radius; k <= radius; k++) {
            const py = Math.min(Math.max(y + k, 0), height - 1)
            const idx = (py * width + x) * 4
            sum += input[idx] * kernel[k + radius]
          }

          const outIdx = (y * width + x) * 4
          output[outIdx] = Math.round(sum / kernelSum)
          output[outIdx + 1] = output[outIdx]
          output[outIdx + 2] = output[outIdx]
          output[outIdx + 3] = input[outIdx + 3]
        }
      }
    }
  }

  /**
   * Create Gaussian kernel values
   */
  private static createGaussianKernel(radius: number, sigma: number): number[] {
    const size = radius * 2 + 1
    const kernel = new Array(size)
    const sigmaSquared = sigma * sigma

    let sum = 0
    for (let i = 0; i < size; i++) {
      const x = i - radius
      kernel[i] = Math.exp(-(x * x) / (2 * sigmaSquared))
      sum += kernel[i]
    }

    // Normalize
    for (let i = 0; i < size; i++) {
      kernel[i] /= sum
    }

    return kernel
  }

  /**
   * Blend two image frames using a mask
   */
  static blendWithMask(
    foreground: ImageData,
    background: ImageData,
    mask: Uint8ClampedArray
  ): ImageData {
    const { width, height } = foreground
    const blended = new Uint8ClampedArray(foreground.data.length)
    const fgData = foreground.data
    const bgData = background.data

    for (let i = 0; i < fgData.length; i += 4) {
      const maskIdx = i / 4
      const alpha = mask[maskIdx] / 255

      blended[i] = Math.round(fgData[i] * alpha + bgData[i] * (1 - alpha))
      blended[i + 1] = Math.round(fgData[i + 1] * alpha + bgData[i + 1] * (1 - alpha))
      blended[i + 2] = Math.round(fgData[i + 2] * alpha + bgData[i + 2] * (1 - alpha))
      blended[i + 3] = fgData[i + 3]
    }

    return new ImageData(blended, width, height)
  }

  /**
   * Dilate mask to smooth edges
   */
  static dilateMask(mask: Uint8ClampedArray, width: number, height: number, iterations: number = 1): Uint8ClampedArray {
    let current = mask
    const radius = 1

    for (let iter = 0; iter < iterations; iter++) {
      const output = new Uint8ClampedArray(current.length)

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let max = 0

          for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
              const ny = Math.min(Math.max(y + dy, 0), height - 1)
              const nx = Math.min(Math.max(x + dx, 0), width - 1)
              const idx = ny * width + nx
              max = Math.max(max, current[idx])
            }
          }

          output[y * width + x] = max
        }
      }

      current = output
    }

    return current
  }

  /**
   * Erode mask
   */
  static erodeMask(mask: Uint8ClampedArray, width: number, height: number, iterations: number = 1): Uint8ClampedArray {
    let current = mask
    const radius = 1

    for (let iter = 0; iter < iterations; iter++) {
      const output = new Uint8ClampedArray(current.length)

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let min = 255

          for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
              const ny = Math.min(Math.max(y + dy, 0), height - 1)
              const nx = Math.min(Math.max(x + dx, 0), width - 1)
              const idx = ny * width + nx
              min = Math.min(min, current[idx])
            }
          }

          output[y * width + x] = min
        }
      }

      current = output
    }

    return current
  }

  /**
   * Smoothen mask edges using blur and threshold
   */
  static smoothMaskEdges(mask: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
    // Create ImageData for processing
    const imageData = new ImageData(
      new Uint8ClampedArray(mask.buffer, mask.byteOffset, mask.length),
      width,
      height
    )

    // Apply slight blur for smoothing
    const blurred = this.gaussianBlur(imageData, 2, 1.5)

    return new Uint8ClampedArray(blurred.data.buffer, blurred.data.byteOffset, blurred.data.length)
  }
}
