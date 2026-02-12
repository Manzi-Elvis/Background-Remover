import { create } from 'zustand'

type BackgroundMode = 'original' | 'blur' | 'gradient' | 'solid' | 'image'
type GradientType = 'purple-blue' | 'sunset' | 'forest'

interface BackgroundStore {
  backgroundMode: BackgroundMode
  setBackgroundMode: (mode: BackgroundMode) => void

  blurStrength: number
  setBlurStrength: (strength: number) => void

  solidColor: string
  setSolidColor: (color: string) => void

  gradientType: GradientType
  setGradientType: (type: GradientType) => void

  uploadedImage: string | null
  setUploadedImage: (image: string | null) => void
}

export const useBackgroundStore = create<BackgroundStore>((set) => ({
  backgroundMode: 'gradient',
  setBackgroundMode: (mode) => set({ backgroundMode: mode }),

  blurStrength: 25,
  setBlurStrength: (strength) => set({ blurStrength: strength }),

  solidColor: '#1f2937',
  setSolidColor: (color) => set({ solidColor: color }),

  gradientType: 'purple-blue',
  setGradientType: (type) => set({ gradientType: type }),

  uploadedImage: null,
  setUploadedImage: (image) => set({ uploadedImage: image }),
}))
