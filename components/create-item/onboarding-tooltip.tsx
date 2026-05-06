"use client"

import { useEffect, useRef, useState } from "react"
import { X, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface OnboardingStep {
  id: string
  targetSelector: string
  title: string
  description: React.ReactNode
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

  useEffect(() => {
    const hasCompleted = localStorage.getItem(storageKey)
    if (!hasCompleted) {
      const timer = setTimeout(() => setIsVisible(true), 500)
      return () => clearTimeout(timer)
    }
  }, [storageKey])

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
    window.addEventListener("scroll", updatePosition, true)

    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition, true)
    }
  }, [isVisible, currentStep, steps])

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep((s) => s + 1)
    else handleComplete()
  }

  const handleComplete = () => {
    setIsVisible(false)
    localStorage.setItem(storageKey, "true")
    onComplete?.()
  }

  if (!isVisible || !steps[currentStep]) return null

  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  const getTooltipStyle = (): React.CSSProperties => {
    if (step.position === "center" || !targetRect) {
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
    }

    const padding = 12
    const tooltipWidth = 288
    const tooltipHeight = 180
    const margin = 16
    const vw = window.innerWidth
    const vh = window.innerHeight

    const spaceBelow = vh - targetRect.bottom
    const spaceAbove = targetRect.top

    if (spaceBelow >= tooltipHeight + padding || spaceBelow > spaceAbove) {
      let left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2
      if (left < margin) left = margin
      if (left + tooltipWidth > vw - margin) left = vw - tooltipWidth - margin
      return { top: targetRect.bottom + padding, left }
    }

    let left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2
    if (left < margin) left = margin
    if (left + tooltipWidth > vw - margin) left = vw - tooltipWidth - margin
    return { bottom: vh - targetRect.top + padding, left }
  }

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
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
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.7)"
          mask="url(#spotlight-mask)"
          onClick={handleComplete}
        />
      </svg>

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

      <div
        ref={tooltipRef}
        className="absolute z-10 w-72 bg-card border border-border rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-auto"
        style={getTooltipStyle()}
      >
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
            type="button"
            onClick={handleComplete}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Skip onboarding"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-4 pb-2">
          <h3 className="font-semibold text-foreground text-sm">{step.title}</h3>
          {typeof step.description === "string" ? (
            <p className="text-muted-foreground text-sm mt-1 leading-relaxed">{step.description}</p>
          ) : (
            <div className="text-muted-foreground text-sm mt-1 leading-relaxed">{step.description}</div>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <button
            type="button"
            onClick={handleComplete}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip tour
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:bg-primary/90 transition-colors"
          >
            {isLastStep ? "Get started" : "Next"}
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
