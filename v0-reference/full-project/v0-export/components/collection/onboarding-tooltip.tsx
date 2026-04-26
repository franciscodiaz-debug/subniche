"use client"

import { useState, useEffect, useRef } from "react"
import { X, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface OnboardingStep {
  id: string
  targetSelector: string
  title: string
  description: string
  position?: "top" | "bottom" | "left" | "right" | "center"
}

interface OnboardingTooltipProps {
  steps: OnboardingStep[]
  storageKey: string
  onComplete?: () => void
}

export function OnboardingTooltip({ steps, storageKey, onComplete }: OnboardingTooltipProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  // Check if user has already completed onboarding
  useEffect(() => {
    const hasCompleted = localStorage.getItem(storageKey)
    if (!hasCompleted) {
      // Small delay to let the page render
      const timer = setTimeout(() => setIsVisible(true), 500)
      return () => clearTimeout(timer)
    }
  }, [storageKey])

  // Update target element position
  useEffect(() => {
    if (!isVisible || !steps[currentStep]) return

    const updatePosition = () => {
      const target = document.querySelector(steps[currentStep].targetSelector)
      if (target) {
        setTargetRect(target.getBoundingClientRect())
      } else if (steps[currentStep].position === "center") {
        setTargetRect(null)
      }
    }

    updatePosition()
    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition)

    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition)
    }
  }, [isVisible, currentStep, steps])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    setIsVisible(false)
    localStorage.setItem(storageKey, "true")
    onComplete?.()
  }

  if (!isVisible || !steps[currentStep]) return null

  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  // Calculate tooltip position based on target
  const getTooltipStyle = () => {
    if (step.position === "center" || !targetRect) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }
    }

    if (!tooltipRef.current) return {}

    const padding = 12
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const tooltipWidth = tooltipRect.width || 288 // 288px = w-72
    const tooltipHeight = tooltipRect.height || 200 // estimate

    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const margin = 16 // minimum margin from viewport edge

    const elementCenterX = targetRect.left + targetRect.width / 2
    const elementCenterY = targetRect.top + targetRect.height / 2
    const viewportCenterX = viewportWidth / 2
    const viewportCenterY = viewportHeight / 2

    // Calculate available space on each side
    const spaceLeft = targetRect.left
    const spaceRight = viewportWidth - targetRect.right
    const spaceTop = targetRect.top
    const spaceBottom = viewportHeight - targetRect.bottom

    // Determine best position: place tooltip toward the center of the screen
    let bestPosition: "top" | "bottom" | "left" | "right"

    // Check horizontal vs vertical - prefer the axis with more difference from center
    const horizontalOffset = Math.abs(elementCenterX - viewportCenterX)
    const verticalOffset = Math.abs(elementCenterY - viewportCenterY)

    if (horizontalOffset > verticalOffset) {
      // Element is more off-center horizontally, position tooltip left or right
      bestPosition = elementCenterX > viewportCenterX ? "left" : "right"
      // But check if there's enough space
      if (bestPosition === "left" && spaceLeft < tooltipWidth + padding) {
        bestPosition =
          spaceRight > spaceTop && spaceRight > spaceBottom ? "right" : spaceBottom > spaceTop ? "bottom" : "top"
      } else if (bestPosition === "right" && spaceRight < tooltipWidth + padding) {
        bestPosition =
          spaceLeft > spaceTop && spaceLeft > spaceBottom ? "left" : spaceBottom > spaceLeft ? "bottom" : "top"
      }
    } else {
      // Element is more off-center vertically, position tooltip top or bottom
      bestPosition = elementCenterY > viewportCenterY ? "top" : "bottom"
      // But check if there's enough space
      if (bestPosition === "top" && spaceTop < tooltipHeight + padding) {
        bestPosition =
          spaceBottom > spaceLeft && spaceBottom > spaceRight ? "bottom" : spaceRight > spaceLeft ? "right" : "left"
      } else if (bestPosition === "bottom" && spaceBottom < tooltipHeight + padding) {
        bestPosition = spaceTop > spaceLeft && spaceTop > spaceRight ? "top" : spaceRight > spaceLeft ? "right" : "left"
      }
    }

    // Apply the calculated position
    switch (bestPosition) {
      case "top": {
        let left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2
        if (left < margin) left = margin
        else if (left + tooltipWidth > viewportWidth - margin) left = viewportWidth - tooltipWidth - margin

        return {
          bottom: window.innerHeight - targetRect.top + padding,
          left: left,
        }
      }
      case "bottom": {
        let left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2
        if (left < margin) left = margin
        else if (left + tooltipWidth > viewportWidth - margin) left = viewportWidth - tooltipWidth - margin

        return {
          top: targetRect.bottom + padding,
          left: left,
        }
      }
      case "left": {
        const right = window.innerWidth - targetRect.left + padding
        let top = targetRect.top + targetRect.height / 2

        if (top < margin + tooltipHeight / 2) top = margin + tooltipHeight / 2
        else if (top + tooltipHeight / 2 > viewportHeight - margin) top = viewportHeight - margin - tooltipHeight / 2

        return {
          top: top,
          right: right,
          transform: "translateY(-50%)",
        }
      }
      case "right": {
        let left = targetRect.right + padding
        let top = targetRect.top + targetRect.height / 2

        if (left + tooltipWidth > viewportWidth - margin) left = viewportWidth - tooltipWidth - margin
        if (top < margin + tooltipHeight / 2) top = margin + tooltipHeight / 2
        else if (top + tooltipHeight / 2 > viewportHeight - margin) top = viewportHeight - margin - tooltipHeight / 2

        return {
          top: top,
          left: left,
          transform: "translateY(-50%)",
        }
      }
      default:
        return {}
    }
  }

  // Get spotlight clip path
  const getSpotlightPath = () => {
    if (!targetRect) return ""

    const padding = 8
    const x = targetRect.left - padding
    const y = targetRect.top - padding
    const w = targetRect.width + padding * 2
    const h = targetRect.height + padding * 2
    const r = 8 // border radius

    // Create a path that covers the entire viewport except for the target area
    return `
      M 0 0 
      H ${window.innerWidth} 
      V ${window.innerHeight} 
      H 0 
      V 0 
      Z
      M ${x + r} ${y}
      H ${x + w - r}
      Q ${x + w} ${y} ${x + w} ${y + r}
      V ${y + h - r}
      Q ${x + w} ${y + h} ${x + w - r} ${y + h}
      H ${x + r}
      Q ${x} ${y + h} ${x} ${y + h - r}
      V ${y + r}
      Q ${x} ${y} ${x + r} ${y}
      Z
    `
  }

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
      {/* Dimmed overlay with spotlight cutout */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {targetRect && step.position !== "center" && (
              <rect
                x={targetRect.left - 8}
                y={targetRect.top - 8}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx="8"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.75)" mask="url(#spotlight-mask)" onClick={handleSkip} />
      </svg>

      {/* Highlighted target border */}
      {targetRect && step.position !== "center" && (
        <div
          className="absolute pointer-events-none border-2 border-primary rounded-lg ring-4 ring-primary/20 transition-all duration-300"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute z-10 w-72 bg-card border border-border rounded-lg shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-auto"
        style={getTooltipStyle()}
      >
        {/* Progress indicator */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="flex gap-1.5">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  idx === currentStep ? "w-4 bg-primary" : idx < currentStep ? "w-1.5 bg-primary/50" : "w-1.5 bg-muted",
                )}
              />
            ))}
          </div>
          <button
            onClick={handleSkip}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Skip onboarding"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pb-2">
          <h3 className="font-semibold text-foreground text-sm">{step.title}</h3>
          <p className="text-muted-foreground text-sm mt-1 leading-relaxed">{step.description}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <button
            onClick={handleSkip}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip tour
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
          >
            {isLastStep ? "Get started" : "Next"}
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
