"use client"

import type React from "react"

import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface PriceRangeSliderProps {
  min: number
  max: number
  minValue: number | null
  maxValue: number | null
  onChange: (min: number | null, max: number | null) => void
  histogram?: number[] // Array of counts per price bucket
  step?: number
  formatValue?: (value: number) => string
}

export function PriceRangeSlider({
  min,
  max,
  minValue,
  maxValue,
  onChange,
  histogram,
  step = 1,
  formatValue = (v) => `$${v}`,
}: PriceRangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [localMin, setLocalMin] = useState(minValue ?? min)
  const [localMax, setLocalMax] = useState(maxValue ?? max)
  const [dragging, setDragging] = useState<"min" | "max" | null>(null)

  useEffect(() => {
    setLocalMin(minValue ?? min)
    setLocalMax(maxValue ?? max)
  }, [minValue, maxValue, min, max])

  const getPercentage = (value: number) => ((value - min) / (max - min)) * 100

  const getValueFromPosition = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return min
      const rect = trackRef.current.getBoundingClientRect()
      const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const rawValue = min + percentage * (max - min)
      return Math.round(rawValue / step) * step
    },
    [min, max, step],
  )

  const handleMouseDown = (handle: "min" | "max") => (e: React.MouseEvent) => {
    e.preventDefault()
    setDragging(handle)
  }

  useEffect(() => {
    if (!dragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const value = getValueFromPosition(e.clientX)
      if (dragging === "min") {
        const newMin = Math.min(value, localMax - step)
        setLocalMin(Math.max(min, newMin))
      } else {
        const newMax = Math.max(value, localMin + step)
        setLocalMax(Math.min(max, newMax))
      }
    }

    const handleMouseUp = () => {
      setDragging(null)
      // Commit changes
      const finalMin = localMin === min ? null : localMin
      const finalMax = localMax === max ? null : localMax
      onChange(finalMin, finalMax)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [dragging, localMin, localMax, min, max, step, onChange, getValueFromPosition])

  // Generate histogram bars
  const maxHistogramValue = histogram ? Math.max(...histogram, 1) : 1
  const histogramBars = histogram?.length ? histogram : Array(20).fill(0)

  return (
    <div className="space-y-3">
      {/* Histogram visualization */}
      <div className="h-12 flex items-end gap-px">
        {histogramBars.map((count, i) => {
          const barMin = min + (i / histogramBars.length) * (max - min)
          const barMax = min + ((i + 1) / histogramBars.length) * (max - min)
          const isInRange = barMin >= localMin && barMax <= localMax
          const height = histogram ? (count / maxHistogramValue) * 100 : 20 + Math.random() * 60

          return (
            <div
              key={i}
              className={cn("flex-1 rounded-t-sm transition-colors", isInRange ? "bg-primary/60" : "bg-muted")}
              style={{ height: `${Math.max(4, height)}%` }}
            />
          )
        })}
      </div>

      {/* Slider track */}
      <div ref={trackRef} className="relative h-2 bg-muted rounded-full">
        {/* Active range */}
        <div
          className="absolute h-full bg-primary rounded-full"
          style={{
            left: `${getPercentage(localMin)}%`,
            right: `${100 - getPercentage(localMax)}%`,
          }}
        />

        {/* Min handle */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-foreground rounded-full cursor-grab shadow-lg border-2 border-background",
            dragging === "min" && "cursor-grabbing scale-110",
          )}
          style={{ left: `${getPercentage(localMin)}%` }}
          onMouseDown={handleMouseDown("min")}
        />

        {/* Max handle */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-foreground rounded-full cursor-grab shadow-lg border-2 border-background",
            dragging === "max" && "cursor-grabbing scale-110",
          )}
          style={{ left: `${getPercentage(localMax)}%` }}
          onMouseDown={handleMouseDown("max")}
        />
      </div>

      {/* Value labels */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{formatValue(localMin)}</span>
        <span className="text-muted-foreground">{formatValue(localMax)}</span>
      </div>
    </div>
  )
}
