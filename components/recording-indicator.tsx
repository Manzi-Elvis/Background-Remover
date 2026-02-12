'use client'

import { useEffect, useState } from 'react'

interface RecordingIndicatorProps {
  isRecording?: boolean
  duration?: number
}

export default function RecordingIndicator({
  isRecording = false,
  duration = 0,
}: RecordingIndicatorProps) {
  const [formattedTime, setFormattedTime] = useState('00:00:00')

  useEffect(() => {
    if (!isRecording) return

    const interval = setInterval(() => {
      const hours = Math.floor(duration / 3600)
      const minutes = Math.floor((duration % 3600) / 60)
      const seconds = duration % 60

      setFormattedTime(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [isRecording, duration])

  if (!isRecording) {
    return null
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 rounded-full bg-red-500/90 px-4 py-3 backdrop-blur-md shadow-lg">
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-white animate-pulse" />
        <span className="text-sm font-semibold text-white">Recording</span>
      </div>
      <div className="h-1 w-px bg-white/30" />
      <span className="text-sm font-mono text-white">{formattedTime}</span>
    </div>
  )
}
