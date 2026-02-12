'use client';

import { useEffect, useRef, useState, useCallback } from 'react'

export interface UseWebcamOptions {
  width?: number
  height?: number
  onError?: (error: Error) => void
}

export function useWebcam(options: UseWebcamOptions = {}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const startWebcam = useCallback(async () => {
    try {
      const constraints = {
        video: {
          width: { ideal: options.width || 1280 },
          height: { ideal: options.height || 720 },
          facingMode: 'user',
        },
        audio: false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      setHasPermission(true)
      setError(null)

      return stream
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))

      // Check if permission was denied
      if (
        error.name === 'NotAllowedError' ||
        error.name === 'PermissionDeniedError'
      ) {
        setHasPermission(false)
      }

      setError(error)
      options.onError?.(error)
      throw error
    }
  }, [options])

  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop()
      })
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setIsReady(false)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      video.play()
      setIsReady(true)
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [])

  return {
    videoRef,
    isReady,
    hasPermission,
    error,
    startWebcam,
    stopWebcam,
    stream: streamRef.current,
  }
}
