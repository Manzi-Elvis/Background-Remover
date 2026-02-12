'use client'

import { useEffect, useState } from 'react'

interface PerformanceMonitorProps {
  fps: number
}

export default function PerformanceMonitor({ fps }: PerformanceMonitorProps) {
  const [memoryUsage, setMemoryUsage] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      if (performance.memory) {
        const used = Math.round(performance.memory.usedJSHeapSize / 1048576)
        setMemoryUsage(used)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const getFpsColor = (fps: number) => {
    if (fps >= 50) return 'text-green-400'
    if (fps >= 30) return 'text-yellow-400'
    return 'text-red-400'
  }

  const stats = [
    {
      label: 'FPS',
      value: fps,
      unit: '',
      color: getFpsColor(fps),
      target: '30-60',
    },
    {
      label: 'Memory',
      value: memoryUsage,
      unit: 'MB',
      color: 'text-blue-400',
      target: '<200MB',
    },
  ]

  return (
    <div className="w-full lg:w-80 rounded-2xl bg-card/50 p-4 backdrop-blur-md">
      {/* Header */}
      <div className="mb-4 border-b border-border/50 pb-4">
        <h2 className="text-lg font-semibold text-foreground">Performance</h2>
        <p className="text-sm text-muted-foreground">Real-time statistics</p>
      </div>

      {/* Stats Grid */}
      <div className="space-y-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg bg-secondary/20 p-3">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                  {stat.unit && <span className="text-sm text-muted-foreground">{stat.unit}</span>}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Target</p>
                <p className="text-sm font-medium text-foreground">{stat.target}</p>
              </div>
            </div>

            {/* Health bar */}
            <div className="mt-2 h-1 w-full rounded-full bg-secondary/50 overflow-hidden">
              <div
                className={`h-full transition-all ${stat.color.replace('text-', 'bg-')}`}
                style={{
                  width: `${Math.min(
                    (stat.value /
                      (stat.label === 'FPS'
                        ? 60
                        : stat.label === 'Memory'
                          ? 200
                          : 100)) *
                      100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="mt-4 space-y-2 rounded-lg bg-accent/10 px-3 py-2 text-xs text-muted-foreground">
        <p>• Use blur or solid backgrounds for better performance</p>
        <p>• Reduce browser tabs for optimal FPS</p>
        <p>• Close other applications consuming CPU</p>
      </div>
    </div>
  )
}

declare global {
  interface Performance {
    memory?: {
      usedJSHeapSize: number
      totalJSHeapSize: number
      jsHeapSizeLimit: number
    }
  }
}
