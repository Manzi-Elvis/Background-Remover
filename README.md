# Virtual Background Remover

A professional real-time webcam background removal web application built with Next.js, React, and MediaPipe. Remove, blur, or replace your video background instantly—comparable to Zoom, Google Meet, and Apple FaceTime.

## Features

✨ **Core Functionality**
- Real-time webcam background removal using MediaPipe Selfie Segmentation
- Multiple background modes: Original, Blur, Gradient, Solid Color, Custom Image
- 30-60 FPS performance on modern devices
- Smooth edge detection for hair and shoulders
- Adaptive quality based on device capabilities

🎨 **Background Modes**
- **Original**: Display unprocessed video feed
- **Blur**: Adjustable background blur (0-50% intensity)
- **Gradient**: 3 beautiful gradient presets (Purple-Blue, Sunset, Forest)
- **Solid Color**: Choose any color for your background
- **Image**: Upload custom background images

⚙️ **Advanced Features**
- Performance monitoring (FPS, memory usage)
- Recording UI with timer
- Settings panel for advanced options
- Adaptive performance optimization for low-end devices
- Mobile responsive design
- Premium dark mode UI with glassmorphism effects

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern web browser with WebRTC support
- Camera permission enabled

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd background-remover
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

5. Grant camera permission when prompted

## Project Structure

```
/
├── app/
│   ├── layout.tsx           # Root layout with metadata
│   ├── page.tsx             # Main application page
│   └── globals.css          # Global styles and theme
├── components/
│   ├── webcam-container.tsx # Core webcam & segmentation
│   ├── control-panel.tsx    # Background mode controls
│   ├── performance-monitor.tsx # FPS & performance stats
│   ├── settings-panel.tsx   # Advanced settings
│   ├── recording-indicator.tsx # Recording UI
│   ├── comparison-toggle.tsx # Before/after comparison
│   └── background-canvas.tsx # Background effects
├── lib/
│   ├── background-store.ts  # State management (Zustand)
│   ├── segmentation-service.ts # MediaPipe integration
│   ├── image-processing.ts  # Image processing utilities
│   ├── performance-optimizer.ts # FPS throttling & optimization
│   └── utils.ts             # Utility functions
├── hooks/
│   └── use-webcam.ts        # Webcam management hook
└── public/                  # Static assets
```

## How It Works

### 1. MediaPipe Integration
The app uses Google's MediaPipe Selfie Segmentation model to detect the person in the video frame. This model runs locally in the browser and generates a binary mask separating the foreground (person) from the background.

### 2. Real-time Processing
- Video frames are captured at 30-60 FPS
- MediaPipe processes each frame to generate a segmentation mask
- The mask is smoothed using Gaussian blur for natural edges
- Background is rendered based on selected mode
- Person and background are composited together

### 3. Performance Optimization
- Adaptive frame throttling maintains target FPS
- Canvas resolution scales based on device capabilities
- Low-end device detection reduces processing load
- GPU-accelerated rendering where possible

## Technologies Used

- **Framework**: Next.js 16 with React 19
- **AI/ML**: MediaPipe Selfie Segmentation
- **State Management**: Zustand
- **Styling**: Tailwind CSS 4 with custom theme
- **Deployment**: Vercel (ready)

## Configuration

### Theme Colors
Edit `/app/globals.css` to customize the dark theme:
- Primary: Purple accent color (#6366f1)
- Background: Deep black (#0a0a0a)
- Cards: Dark gray with 12% opacity

### Performance Settings
Edit `/lib/performance-optimizer.ts` to adjust:
- Target FPS (default: 30-24 FPS based on device)
- Adaptive quality thresholds
- Resolution scaling limits

## Performance Tips

1. **Use blur or solid backgrounds** for best FPS
2. **Close unnecessary browser tabs** to free resources
3. **Disable browser extensions** that consume CPU
4. **Use good lighting** for better segmentation accuracy
5. **Test on target devices** for optimal settings

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14.1+
- Mobile browsers (iOS Safari 14.5+, Chrome Android)

**Note**: Requires WebRTC support and HTTPS or localhost

## API Reference

### useBackgroundStore
Zustand store for background settings:
```typescript
const {
  backgroundMode,
  blurStrength,
  solidColor,
  gradientType,
  uploadedImage,
  // ... setters
} = useBackgroundStore()
```

### SegmentationService
Initialize and process video:
```typescript
const service = new SegmentationService()
await service.initialize()
await service.process(videoElement, callback)
```

### ImageProcessor
Image processing utilities:
```typescript
ImageProcessor.gaussianBlur(imageData, radius)
ImageProcessor.blendWithMask(foreground, background, mask)
ImageProcessor.smoothMaskEdges(mask, width, height)
```

## Troubleshooting

### Camera Permission Denied
- Check browser permissions for camera access
- Try in incognito/private mode
- Ensure HTTPS or localhost access

### Low FPS
- Close other applications
- Switch to blur or solid background
- Try different gradient or disable custom images
- Check device capabilities

### Poor Segmentation
- Improve lighting conditions
- Wear contrasting clothing vs. background
- Increase blur for softer edges
- Check for camera obstruction

## Future Improvements

- [ ] Desktop app with Electron
- [ ] Recording with codec selection
- [ ] Virtual background library
- [ ] Before/after comparison slider
- [ ] Depth blur effect
- [ ] Real-time body effects
- [ ] Cloud storage integration
- [ ] Multi-person support

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- [MediaPipe](https://mediapipe.dev/) for the Selfie Segmentation model
- [Vercel](https://vercel.com) for hosting and deployment
- [Next.js](https://nextjs.org/) framework
- [Tailwind CSS](https://tailwindcss.com/) for styling

## Support

For issues, feature requests, or questions:
- Open an issue on GitHub
- Check existing documentation
- Review troubleshooting section

---

Built with ❤️ for seamless video backgrounds
