"use client"

/**
 * Inline coachmarks tour.
 *
 * Renders a sequence of contextual tooltips anchored to DOM targets. Persists
 * a "seen" flag in localStorage so it only fires on first use. Anchors are
 * resolved by `data-coachmark="<id>"` attributes on target elements.
 *
 * Usage:
 *   <Coachmarks
 *     storageKey="trade-interests-tour"
 *     steps={[
 *       { target: "intro", title: "...", body: "..." },
 *       { target: "add", title: "...", body: "..." },
 *     ]}
 *   />
 */

import * as React from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface CoachmarkStep {
  /** value used to find the anchor: <element data-coachmark={target}> */
  target: string
  title: string
  body: string
  /** placement relative to anchor */
  placement?: "top" | "bottom" | "left" | "right"
}

interface CoachmarksProps {
  storageKey: string
  steps: CoachmarkStep[]
  /** Override "seen" check — forces tour to start. Useful for "View tour" CTA. */
  forceShow?: boolean
  onComplete?: () => void
}

export function Coachmarks({
  storageKey,
  steps,
  forceShow = false,
  onComplete,
}: CoachmarksProps) {
  const [stepIndex, setStepIndex] = React.useState(-1)
  const [anchorRect, setAnchorRect] = React.useState<DOMRect | null>(null)

  // Initialize: skip if already seen, unless forced.
  React.useEffect(() => {
    if (typeof window === "undefined") return
    if (forceShow) {
      setStepIndex(0)
      return
    }
    const seen = window.localStorage.getItem(storageKey)
    if (!seen) {
      // Slight delay so target elements have mounted
      const t = setTimeout(() => setStepIndex(0), 350)
      return () => clearTimeout(t)
    }
  }, [storageKey, forceShow])

  // Update anchor rect when step changes or on resize
  const currentStep = stepIndex >= 0 ? steps[stepIndex] : null
  React.useEffect(() => {
    if (!currentStep) {
      setAnchorRect(null)
      return
    }
    const update = () => {
      const el = document.querySelector(
        `[data-coachmark="${currentStep.target}"]`,
      )
      if (el) {
        setAnchorRect(el.getBoundingClientRect())
        el.scrollIntoView({ behavior: "smooth", block: "center" })
      } else {
        setAnchorRect(null)
      }
    }
    update()
    const t = setTimeout(update, 400) // re-measure after scroll
    window.addEventListener("resize", update)
    window.addEventListener("scroll", update, true)
    return () => {
      clearTimeout(t)
      window.removeEventListener("resize", update)
      window.removeEventListener("scroll", update, true)
    }
  }, [currentStep])

  const handleClose = React.useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, "1")
    }
    setStepIndex(-1)
    onComplete?.()
  }, [storageKey, onComplete])

  const handleNext = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1)
    } else {
      handleClose()
    }
  }

  if (!currentStep || stepIndex < 0) return null

  const placement = currentStep.placement ?? "bottom"
  const isLast = stepIndex === steps.length - 1

  // Compute tooltip position
  const tooltipStyle: React.CSSProperties = anchorRect
    ? computeTooltipPosition(anchorRect, placement)
    : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }

  return (
    <>
      {/* Backdrop with cutout */}
      <div className="fixed inset-0 z-[70] bg-background/70 backdrop-blur-[2px]" />

      {/* Highlight ring around anchor */}
      {anchorRect && (
        <div
          className="pointer-events-none fixed z-[71] rounded-xl ring-2 ring-primary/80 ring-offset-2 ring-offset-background transition-all"
          style={{
            top: anchorRect.top - 4,
            left: anchorRect.left - 4,
            width: anchorRect.width + 8,
            height: anchorRect.height + 8,
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        role="dialog"
        aria-label={currentStep.title}
        className={cn(
          "fixed z-[72] w-[min(320px,calc(100vw-32px))] rounded-xl border border-border bg-card p-4 shadow-2xl",
        )}
        style={tooltipStyle}
      >
        <div className="mb-1 flex items-start gap-2">
          <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
            {stepIndex + 1} / {steps.length}
          </span>
          <button
            type="button"
            onClick={handleClose}
            className="ml-auto -mr-1 -mt-1 rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Close tour"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <h3 className="text-sm font-semibold text-foreground">{currentStep.title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {currentStep.body}
        </p>

        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Skip tour
          </button>
          <Button size="sm" onClick={handleNext}>
            {isLast ? "Done" : "Next"}
          </Button>
        </div>
      </div>
    </>
  )
}

function computeTooltipPosition(
  anchor: DOMRect,
  placement: "top" | "bottom" | "left" | "right",
): React.CSSProperties {
  const margin = 12
  const tooltipWidth = 320
  switch (placement) {
    case "top":
      return {
        top: Math.max(margin, anchor.top - margin) + "px",
        left:
          Math.max(
            margin,
            Math.min(
              anchor.left + anchor.width / 2 - tooltipWidth / 2,
              window.innerWidth - tooltipWidth - margin,
            ),
          ) + "px",
        transform: "translateY(-100%)",
      }
    case "right":
      return {
        top: anchor.top + "px",
        left: Math.min(anchor.right + margin, window.innerWidth - tooltipWidth - margin) + "px",
      }
    case "left":
      return {
        top: anchor.top + "px",
        left: Math.max(anchor.left - tooltipWidth - margin, margin) + "px",
      }
    case "bottom":
    default:
      return {
        top: anchor.bottom + margin + "px",
        left:
          Math.max(
            margin,
            Math.min(
              anchor.left + anchor.width / 2 - tooltipWidth / 2,
              window.innerWidth - tooltipWidth - margin,
            ),
          ) + "px",
      }
  }
}

/**
 * Reset helper — useful for a "Replay tour" CTA elsewhere in the app.
 */
export function resetCoachmarks(storageKey: string) {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(storageKey)
}
