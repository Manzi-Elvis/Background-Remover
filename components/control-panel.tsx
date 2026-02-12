'use client'

import React from "react"

import { useRef, useState } from 'react'
import { useBackgroundStore } from '@/lib/background-store'

export default function ControlPanel() {
  const {
    backgroundMode,
    setBackgroundMode,
    blurStrength,
    setBlurStrength,
    solidColor,
    setSolidColor,
    gradientType,
    setGradientType,
    uploadedImage,
    setUploadedImage,
  } = useBackgroundStore()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const backgroundModes = [
    { id: 'original', label: 'Original', icon: '📷' },
    { id: 'blur', label: 'Blur', icon: '✨' },
    { id: 'gradient', label: 'Gradient', icon: '🎨' },
    { id: 'solid', label: 'Solid', icon: '⬛' },
    { id: 'image', label: 'Image', icon: '🖼️' },
  ]

  const gradients = [
    { id: 'purple-blue', label: 'Purple-Blue', colors: ['#6366f1', '#3b82f6'] },
    { id: 'sunset', label: 'Sunset', colors: ['#f97316', '#ec4899'] },
    { id: 'forest', label: 'Forest', colors: ['#059669', '#1e40af'] },
  ]

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-card/50 p-4 backdrop-blur-md lg:w-80">
      {/* Header */}
      <div className="border-b border-border/50 pb-4">
        <h2 className="text-lg font-semibold text-foreground">Background</h2>
        <p className="text-sm text-muted-foreground">Customize your virtual background</p>
      </div>

      {/* Background Mode Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Mode</label>
        <div className="grid grid-cols-3 gap-2">
          {backgroundModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setBackgroundMode(mode.id as any)}
              className={`flex flex-col items-center gap-2 rounded-lg px-3 py-3 text-sm transition-all ${
                backgroundMode === mode.id
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/50'
                  : 'bg-secondary/30 text-foreground hover:bg-secondary/50'
              }`}
            >
              <span className="text-lg">{mode.icon}</span>
              <span className="text-xs">{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Blur Strength Slider */}
      {backgroundMode === 'blur' && (
        <div className="space-y-3 rounded-lg bg-secondary/20 p-3">
          <label className="text-sm font-medium text-foreground">Blur Strength</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="50"
              value={blurStrength}
              onChange={(e) => setBlurStrength(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm font-medium text-foreground w-12 text-right">{blurStrength}%</span>
          </div>
          <p className="text-xs text-muted-foreground">Adjust background blur intensity</p>
        </div>
      )}

      {/* Solid Color Picker */}
      {backgroundMode === 'solid' && (
        <div className="space-y-3 rounded-lg bg-secondary/20 p-3">
          <label className="text-sm font-medium text-foreground">Color</label>
          <div className="flex gap-3">
            <input
              type="color"
              value={solidColor}
              onChange={(e) => setSolidColor(e.target.value)}
              className="h-12 w-full cursor-pointer rounded-lg border-2 border-border"
            />
            <div
              className="h-12 w-12 rounded-lg border-2 border-border"
              style={{ backgroundColor: solidColor }}
            />
          </div>
        </div>
      )}

      {/* Gradient Presets */}
      {backgroundMode === 'gradient' && (
        <div className="space-y-3 rounded-lg bg-secondary/20 p-3">
          <label className="text-sm font-medium text-foreground">Preset</label>
          <div className="space-y-2">
            {gradients.map((gradient) => (
              <button
                key={gradient.id}
                onClick={() => setGradientType(gradient.id as any)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-all ${
                  gradientType === gradient.id
                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-card'
                    : ''
                }`}
                style={{
                  background: `linear-gradient(to right, ${gradient.colors[0]}, ${gradient.colors[1]})`,
                  color: 'white',
                  fontWeight: gradientType === gradient.id ? 600 : 400,
                }}
              >
                {gradient.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image Upload */}
      {backgroundMode === 'image' && (
        <div className="space-y-3 rounded-lg bg-secondary/20 p-3">
          <label className="text-sm font-medium text-foreground">Upload Image</label>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-lg border-2 border-dashed border-primary/50 bg-primary/5 py-4 text-center transition hover:border-primary hover:bg-primary/10"
          >
            <div className="text-2xl">📁</div>
            <p className="text-xs text-foreground mt-1">Click to upload</p>
            <p className="text-xs text-muted-foreground">PNG, JPG, GIF</p>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          {uploadedImage && (
            <div className="rounded-lg overflow-hidden border border-border">
              <img
                src={uploadedImage || "/placeholder.svg"}
                alt="Background preview"
                className="h-20 w-full object-cover"
              />
            </div>
          )}
        </div>
      )}

      {/* Performance Tip */}
      <div className="rounded-lg bg-accent/10 px-3 py-2 text-xs text-muted-foreground">
        💡 Tip: Use blur or gradient for best performance. Images may reduce FPS on slower devices.
      </div>
    </div>
  )
}
