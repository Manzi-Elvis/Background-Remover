'use client'

import { useEffect, useRef, useState } from 'react'
import WebcamContainer from '@/components/webcam-container'
import ControlPanel from '@/components/control-panel'
import PerformanceMonitor from '@/components/performance-monitor'
import SettingsPanel from '@/components/settings-panel'
import RecordingIndicator from '@/components/recording-indicator'

export default function Home() {
  const [cameraReady, setCameraReady] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [fps, setFps] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)

  useEffect(() => {
    // Request camera permission
    navigator.mediaDevices
      .getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } } })
      .then(() => {
        setCameraReady(true)
      })
      .catch((error) => {
        console.error('Camera permission denied:', error)
        setPermissionDenied(true)
      })
  }, [])

  useEffect(() => {
    if (!isRecording) return

    const interval = setInterval(() => {
      setRecordingDuration((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isRecording])

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between bg-linear-to-b from-black/40 to-transparent px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="text-2xl">✨</div>
          <h1 className="text-xl font-bold text-white">Background Remover</h1>
        </div>
        <div className="text-xs text-muted-foreground">Real-time Video Background Removal</div>
      </header>

      {permissionDenied ? (
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="mb-2 text-3xl font-bold text-foreground">Camera Permission Required</h1>
            <p className="mb-6 text-muted-foreground">
              Please allow camera access to use the background removal app
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground transition hover:opacity-90"
            >
              Retry
            </button>
          </div>
        </div>
      ) : !cameraReady ? (
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="text-center">
            <div className="mb-4 inline-block">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">Initializing Camera</h1>
            <p className="mt-2 text-muted-foreground">Loading MediaPipe model...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex h-screen flex-col gap-4 p-4 pt-24 lg:flex-row lg:gap-6 lg:p-6 lg:pt-24">
            <div className="flex-1 min-w-0">
              <WebcamContainer onFpsUpdate={setFps} />
            </div>
            <div className="flex flex-col gap-4 overflow-hidden lg:gap-6 lg:w-96">
              <ControlPanel />
              <PerformanceMonitor fps={fps} />
            </div>
          </div>

          {/* UI Overlays */}
          <SettingsPanel />
          <RecordingIndicator isRecording={isRecording} duration={recordingDuration} />

          {/* Recording Button */}
          <button
            onClick={() => {
              setIsRecording(!isRecording)
              if (!isRecording) {
                setRecordingDuration(0)
              }
            }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-full px-6 py-3 font-medium transition shadow-lg backdrop-blur-md ${
              isRecording
                ? 'bg-red-500/90 text-white hover:bg-red-600'
                : 'bg-primary/90 text-primary-foreground hover:bg-primary'
            }`}
          >
            <span className={`h-3 w-3 rounded-full ${isRecording ? 'bg-white animate-pulse' : 'bg-current'}`} />
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
        </>
      )}
    </div>
  )
}
