"use client"

import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

interface PriceHistogramSliderProps {
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  histogramData?: number[]
  step?: number
}

const DEFAULT_HISTOGRAM = [
  12, 28, 45, 67, 89, 102, 134, 156, 178, 189, 167, 145, 123, 98, 76, 54, 43,
  32, 21, 15,
]

export function PriceHistogramSlider({
  min,
  max,
  value,
  onChange,
  histogramData = DEFAULT_HISTOGRAM,
  step = 1,
}: PriceHistogramSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState<"min" | "max" | null>(null)
  const [localValue, setLocalValue] = useState<[number, number]>(value)

  useEffect(() => {
    setLocalValue(value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value[0], value[1]])

  const maxHistogramValue = Math.max(...histogramData)

  const getPercentage = (val: number) =>
    ((val - min) / Math.max(1, max - min)) * 100

  const getValueFromPercentage = (percentage: number) => {
    const raw = (percentage / 100) * (max - min) + min
    const stepped = Math.round(raw / step) * step
    return Math.max(min, Math.min(max, stepped))
  }

  const handleMouseDown = (handle: "min" | "max") => (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(handle)
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !trackRef.current) return
      const rect = trackRef.current.getBoundingClientRect()
      const percentage = Math.max(
        0,
        Math.min(100, ((e.clientX - rect.left) / rect.width) * 100),
      )
      const newValue = getValueFromPercentage(percentage)
      setLocalValue((prev) => {
        if (isDragging === "min") {
          return [Math.min(newValue, prev[1]), prev[1]]
        }
        return [prev[0], Math.max(newValue, prev[0])]
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDragging, min, max, step],
  )

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      onChange(localValue)
      setIsDragging(null)
    }
  }, [isDragging, localValue, onChange])

  useEffect(() => {
    if (!isDragging) return
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const minPercentage = getPercentage(localValue[0])
  const maxPercentage = getPercentage(localValue[1])

  return (
    <div className="space-y-3">
      <div className="relative flex h-16 items-end gap-[2px] px-1">
        {histogramData.map((count, index) => {
          const barPercentage = (index / (histogramData.length - 1)) * 100
          const isInRange =
            barPercentage >= minPercentage && barPercentage <= maxPercentage
          const heightPercentage = (count / maxHistogramValue) * 100
          return (
            <div
              key={index}
              className={cn(
                "flex-1 rounded-t-sm transition-colors",
                isInRange ? "bg-primary/70" : "bg-muted",
              )}
              style={{ height: `${heightPercentage}%` }}
            />
          )
        })}
      </div>

      <div className="relative py-2">
        <div ref={trackRef} className="relative h-1.5 rounded-full bg-muted">
          <div
            className="absolute h-full rounded-full bg-primary"
            style={{
              left: `${minPercentage}%`,
              width: `${Math.max(0, maxPercentage - minPercentage)}%`,
            }}
          />
          <button
            type="button"
            onMouseDown={handleMouseDown("min")}
            aria-label={`Minimum price: $${localValue[0]}`}
            className={cn(
              "absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-primary bg-background transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing",
              isDragging === "min" && "scale-110 shadow-lg",
            )}
            style={{ left: `${minPercentage}%` }}
          />
          <button
            type="button"
            onMouseDown={handleMouseDown("max")}
            aria-label={`Maximum price: $${localValue[1]}`}
            className={cn(
              "absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-primary bg-background transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing",
              isDragging === "max" && "scale-110 shadow-lg",
            )}
            style={{ left: `${maxPercentage}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">
          ${localValue[0].toLocaleString()}
        </span>
        <span className="font-medium text-foreground">
          ${localValue[1].toLocaleString()}
        </span>
      </div>
    </div>
  )
}
