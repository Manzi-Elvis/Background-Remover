'use client'

import { useState } from 'react'

interface ComparisonToggleProps {
  beforeImage: HTMLCanvasElement | null
  afterImage: HTMLCanvasElement | null
}

export default function ComparisonToggle({ beforeImage, afterImage }: ComparisonToggleProps) {
  const [showBefore, setShowBefore] = useState(false)

  if (!beforeImage || !afterImage) {
    return null
  }

  return (
    <div className="absolute top-4 right-4 z-10">
      <button
        onClick={() => setShowBefore(!showBefore)}
        className="flex items-center gap-2 rounded-lg bg-black/50 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition hover:bg-black/70"
      >
        <span className="relative h-5 w-9 rounded-full bg-white/20">
          <span
            className={`absolute top-0 h-5 w-5 rounded-full bg-primary transition-all ${
              showBefore ? 'left-0' : 'left-4'
            }`}
          />
        </span>
        <span>{showBefore ? 'Original' : 'Processed'}</span>
      </button>
    </div>
  )
}
