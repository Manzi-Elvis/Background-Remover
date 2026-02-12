'use client'

import { useRef, useEffect } from 'react'
import { useBackgroundStore } from '@/lib/background-store'

export default function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { blurStrength, backgroundMode } = useBackgroundStore()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || backgroundMode !== 'blur') return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to match container
    const rect = canvas.parentElement?.getBoundingClientRect()
    if (!rect) return

    canvas.width = rect.width
    canvas.height = rect.height

    // Create animated blur background
    const animate = () => {
      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, `rgba(20, 20, 30, 0.5)`)
      gradient.addColorStop(0.5, `rgba(30, 20, 40, 0.5)`)
      gradient.addColorStop(1, `rgba(20, 30, 40, 0.5)`)

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add subtle animation
      ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 * (blurStrength / 50)})`
      ctx.lineWidth = 2

      for (let i = 0; i < 5; i++) {
        const x = (Math.sin(Date.now() / 1000 + i) * canvas.width) / 2 + canvas.width / 2
        const y = (Math.cos(Date.now() / 1200 + i) * canvas.height) / 2 + canvas.height / 2
        ctx.beginPath()
        ctx.arc(x, y, 50 + i * 20, 0, Math.PI * 2)
        ctx.stroke()
      }

      requestAnimationFrame(animate)
    }

    animate()
  }, [blurStrength, backgroundMode])

  if (backgroundMode !== 'blur') {
    return null
  }

  return (
    <canvas
      ref={canvasRef}
      className="hidden"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 0,
      }}
    />
  )
}
