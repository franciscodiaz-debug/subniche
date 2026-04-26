"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface PriceHistogramSliderProps {
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  histogramData?: number[]
}

export function PriceHistogramSlider({
  min = 0,
  max = 500,
  value,
  onChange,
  histogramData = [12, 28, 45, 67, 89, 102, 134, 156, 178, 189, 167, 145, 123, 98, 76, 54, 43, 32, 21, 15],
}: PriceHistogramSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState<"min" | "max" | null>(null)
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const maxHistogramValue = Math.max(...histogramData)

  const getPercentage = (val: number) => {
    return ((val - min) / (max - min)) * 100
  }

  const getValueFromPercentage = (percentage: number) => {
    const value = (percentage / 100) * (max - min) + min
    return Math.round(value)
  }

  const handleMouseDown = (handle: "min" | "max") => (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(handle)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !trackRef.current) return

    const rect = trackRef.current.getBoundingClientRect()
    const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    const newValue = getValueFromPercentage(percentage)

    setLocalValue((prev) => {
      if (isDragging === "min") {
        return [Math.min(newValue, prev[1]), prev[1]]
      } else {
        return [prev[0], Math.max(newValue, prev[0])]
      }
    })
  }

  const handleMouseUp = () => {
    if (isDragging) {
      onChange(localValue)
      setIsDragging(null)
    }
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, localValue])

  const minPercentage = getPercentage(localValue[0])
  const maxPercentage = getPercentage(localValue[1])

  return (
    <div className="space-y-3">
      {/* Histogram */}
      <div className="relative h-16 flex items-end gap-[2px] px-1">
        {histogramData.map((count, index) => {
          const barPercentage = (index / (histogramData.length - 1)) * 100
          const isInRange = barPercentage >= minPercentage && barPercentage <= maxPercentage
          const heightPercentage = (count / maxHistogramValue) * 100

          return (
            <div
              key={index}
              className={cn("flex-1 transition-colors rounded-t-sm", isInRange ? "bg-primary/70" : "bg-muted")}
              style={{ height: `${heightPercentage}%` }}
            />
          )
        })}
      </div>

      {/* Slider Track */}
      <div className="relative py-2">
        <div ref={trackRef} className="relative h-1.5 bg-muted rounded-full">
          {/* Active range */}
          <div
            className="absolute h-full bg-primary rounded-full"
            style={{
              left: `${minPercentage}%`,
              width: `${maxPercentage - minPercentage}%`,
            }}
          />

          {/* Min handle */}
          <button
            onMouseDown={handleMouseDown("min")}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-background border-2 border-primary cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all hover:scale-110",
              isDragging === "min" && "scale-110 shadow-lg",
            )}
            style={{ left: `${minPercentage}%` }}
            aria-label={`Minimum price: $${localValue[0]}`}
          />

          {/* Max handle */}
          <button
            onMouseDown={handleMouseDown("max")}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-background border-2 border-primary cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all hover:scale-110",
              isDragging === "max" && "scale-110 shadow-lg",
            )}
            style={{ left: `${maxPercentage}%` }}
            aria-label={`Maximum price: $${localValue[1]}`}
          />
        </div>
      </div>

      {/* Value labels */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium">${localValue[0]}</span>
        <span className="font-medium">${localValue[1]}</span>
      </div>
    </div>
  )
}
