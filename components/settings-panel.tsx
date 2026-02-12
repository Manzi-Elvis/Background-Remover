'use client'

import { useState } from 'react'

export default function SettingsPanel() {
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState({
    mirrorVideo: true,
    smoothEdges: true,
    autoAdjustLighting: true,
    edgeQuality: 'medium',
  })

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: typeof prev[key] === 'boolean' ? !prev[key] : prev[key],
    }))
  }

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-primary/90 p-3 text-primary-foreground backdrop-blur-md transition hover:bg-primary shadow-lg"
        title="Settings"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed bottom-24 right-6 z-40 w-72 rounded-2xl bg-card/95 p-6 backdrop-blur-md shadow-2xl border border-border/50">
          <div className="mb-6 border-b border-border/50 pb-4">
            <h3 className="text-lg font-semibold text-foreground">Settings</h3>
            <p className="text-sm text-muted-foreground">Customize your experience</p>
          </div>

          {/* Toggle Settings */}
          <div className="space-y-4">
            {/* Mirror Video */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-foreground">Mirror Video</span>
              <input
                type="checkbox"
                checked={settings.mirrorVideo}
                onChange={() => toggleSetting('mirrorVideo')}
                className="h-5 w-5 rounded border-border bg-secondary"
              />
            </label>

            {/* Smooth Edges */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-foreground">Smooth Edges</span>
              <input
                type="checkbox"
                checked={settings.smoothEdges}
                onChange={() => toggleSetting('smoothEdges')}
                className="h-5 w-5 rounded border-border bg-secondary"
              />
            </label>

            {/* Auto Adjust Lighting */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-foreground">Auto Lighting</span>
              <input
                type="checkbox"
                checked={settings.autoAdjustLighting}
                onChange={() => toggleSetting('autoAdjustLighting')}
                className="h-5 w-5 rounded border-border bg-secondary"
              />
            </label>

            {/* Edge Quality */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Edge Quality
              </label>
              <select
                value={settings.edgeQuality}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    edgeQuality: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground"
              >
                <option value="low">Low (Faster)</option>
                <option value="medium">Medium (Balanced)</option>
                <option value="high">High (Better)</option>
              </select>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setShowSettings(false)}
            className="mt-6 w-full rounded-lg bg-primary/20 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-primary/30"
          >
            Close
          </button>
        </div>
      )}
    </>
  )
}
