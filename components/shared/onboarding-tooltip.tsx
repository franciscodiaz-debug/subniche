"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronRight, X } from "lucide-react"

import { cn } from "@/lib/utils"

export interface OnboardingStep {
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
  delayMs?: number
}

export function OnboardingTooltip({
  steps,
  storageKey,
  onComplete,
  delayMs = 600,
}: OnboardingTooltipProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    const hasCompleted = window.localStorage.getItem(storageKey)
    if (hasCompleted) return
    const timer = window.setTimeout(() => setIsVisible(true), delayMs)
    return () => window.clearTimeout(timer)
  }, [storageKey, delayMs])

  useEffect(() => {
    if (!isVisible) return
    const step = steps[currentStep]
    if (!step) return

    const updatePosition = () => {
      if (step.position === "center") {
        setTargetRect(null)
        return
      }
      const target = document.querySelector(step.targetSelector)
      if (target) {
        setTargetRect(target.getBoundingClientRect())
      } else {
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

  const handleComplete = () => {
    setIsVisible(false)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, "true")
    }
    onComplete?.()
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1)
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => handleComplete()

  if (!isVisible || !steps[currentStep]) return null

  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  const getTooltipStyle = (): React.CSSProperties => {
    if (typeof window === "undefined") return {}
    if (step.position === "center" || !targetRect) {
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
    }

    const padding = 12
    const margin = 16
    const tooltipRect = tooltipRef.current?.getBoundingClientRect()
    const tooltipWidth = tooltipRect?.width || 288
    const tooltipHeight = tooltipRect?.height || 200
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const elementCenterX = targetRect.left + targetRect.width / 2
    const elementCenterY = targetRect.top + targetRect.height / 2
    const viewportCenterX = viewportWidth / 2
    const viewportCenterY = viewportHeight / 2
    const spaceLeft = targetRect.left
    const spaceRight = viewportWidth - targetRect.right
    const spaceTop = targetRect.top
    const spaceBottom = viewportHeight - targetRect.bottom

    let bestPosition: "top" | "bottom" | "left" | "right"
    const horizontalOffset = Math.abs(elementCenterX - viewportCenterX)
    const verticalOffset = Math.abs(elementCenterY - viewportCenterY)

    if (horizontalOffset > verticalOffset) {
      bestPosition = elementCenterX > viewportCenterX ? "left" : "right"
      if (bestPosition === "left" && spaceLeft < tooltipWidth + padding) {
        bestPosition =
          spaceRight > spaceTop && spaceRight > spaceBottom
            ? "right"
            : spaceBottom > spaceTop
              ? "bottom"
              : "top"
      } else if (bestPosition === "right" && spaceRight < tooltipWidth + padding) {
        bestPosition =
          spaceLeft > spaceTop && spaceLeft > spaceBottom
            ? "left"
            : spaceBottom > spaceTop
              ? "bottom"
              : "top"
      }
    } else {
      bestPosition = elementCenterY > viewportCenterY ? "top" : "bottom"
      if (bestPosition === "top" && spaceTop < tooltipHeight + padding) {
        bestPosition =
          spaceBottom > spaceLeft && spaceBottom > spaceRight
            ? "bottom"
            : spaceRight > spaceLeft
              ? "right"
              : "left"
      } else if (bestPosition === "bottom" && spaceBottom < tooltipHeight + padding) {
        bestPosition =
          spaceTop > spaceLeft && spaceTop > spaceRight
            ? "top"
            : spaceRight > spaceLeft
              ? "right"
              : "left"
      }
    }

    switch (bestPosition) {
      case "top": {
        let left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2
        if (left < margin) left = margin
        else if (left + tooltipWidth > viewportWidth - margin)
          left = viewportWidth - tooltipWidth - margin
        return { bottom: viewportHeight - targetRect.top + padding, left }
      }
      case "bottom": {
        let left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2
        if (left < margin) left = margin
        else if (left + tooltipWidth > viewportWidth - margin)
          left = viewportWidth - tooltipWidth - margin
        return { top: targetRect.bottom + padding, left }
      }
      case "left": {
        const right = viewportWidth - targetRect.left + padding
        let top = targetRect.top + targetRect.height / 2
        if (top < margin + tooltipHeight / 2) top = margin + tooltipHeight / 2
        else if (top + tooltipHeight / 2 > viewportHeight - margin)
          top = viewportHeight - margin - tooltipHeight / 2
        return { top, right, transform: "translateY(-50%)" }
      }
      case "right": {
        let left = targetRect.right + padding
        let top = targetRect.top + targetRect.height / 2
        if (left + tooltipWidth > viewportWidth - margin)
          left = viewportWidth - tooltipWidth - margin
        if (top < margin + tooltipHeight / 2) top = margin + tooltipHeight / 2
        else if (top + tooltipHeight / 2 > viewportHeight - margin)
          top = viewportHeight - margin - tooltipHeight / 2
        return { top, left, transform: "translateY(-50%)" }
      }
      default:
        return {}
    }
  }

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
      <svg className="pointer-events-auto absolute inset-0 h-full w-full">
        <defs>
          <mask id="subniche-onboarding-spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {targetRect && step.position !== "center" ? (
              <rect
                x={targetRect.left - 8}
                y={targetRect.top - 8}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx="8"
                fill="black"
              />
            ) : null}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.7)"
          mask="url(#subniche-onboarding-spotlight-mask)"
          onClick={handleSkip}
        />
      </svg>

      {targetRect && step.position !== "center" ? (
        <div
          className="pointer-events-none absolute rounded-lg border-2 border-primary ring-4 ring-primary/20 transition-all duration-300"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      ) : null}

      <div
        ref={tooltipRef}
        className="pointer-events-auto absolute z-10 w-72 rounded-lg border border-border bg-card shadow-2xl"
        style={getTooltipStyle()}
      >
        <div className="flex items-center justify-between px-4 pb-2 pt-3">
          <div className="flex gap-1.5">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  idx === currentStep
                    ? "w-4 bg-primary"
                    : idx < currentStep
                      ? "w-1.5 bg-primary/50"
                      : "w-1.5 bg-muted",
                )}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleSkip}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Skip onboarding"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-4 pb-2">
          <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {step.description}
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <button
            type="button"
            onClick={handleSkip}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Skip tour
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {isLastStep ? "Get started" : "Next"}
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
