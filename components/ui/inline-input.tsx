"use client"

import type React from "react"
import { useLayoutEffect, useRef } from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

export type Suggestion = {
  value: string
  confidence: "high" | "medium" | "low"
  accepted: boolean
}

export function scrollSectionIntoView(el: HTMLElement | null) {
  if (!el) return
  const container = el.closest("[data-section]") as HTMLElement | null
  ;(container || el).scrollIntoView({ behavior: "smooth", block: "nearest" })
}

export function useAutoGrowTextarea(
  ref: React.RefObject<HTMLTextAreaElement | HTMLInputElement | null>,
  value: string,
  enabled: boolean,
  minRows = 1,
) {
  useLayoutEffect(() => {
    if (!enabled) return
    const el = ref.current as HTMLTextAreaElement | null
    if (!el || el.tagName !== "TEXTAREA") return
    el.style.height = "auto"
    const styles = window.getComputedStyle(el)
    const lineHeightRaw = parseFloat(styles.lineHeight)
    const fontSize = parseFloat(styles.fontSize) || 14
    const lineHeight = Number.isFinite(lineHeightRaw) ? lineHeightRaw : fontSize * 1.4
    const paddingY = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom)
    const borderY = parseFloat(styles.borderTopWidth) + parseFloat(styles.borderBottomWidth)
    const minHeight = lineHeight * minRows + paddingY + borderY
    el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`
  }, [ref, value, enabled, minRows])
}

export function AutoGrowTextarea({
  value,
  onChange,
  placeholder,
  minRows = 2,
  className,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  minRows?: number
  className?: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useAutoGrowTextarea(ref, value, true, minRows)
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={minRows}
      className={className}
    />
  )
}

export function InlineInput({
  value,
  onChange,
  placeholder,
  className,
  inputClassName,
  as = "input",
  suggestion,
  onAcceptSuggestion,
  onFocus,
  onBlur,
  autoFocus,
  maxLength,
  ariaLabel,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  className?: string
  inputClassName?: string
  as?: "input" | "textarea"
  suggestion?: Suggestion
  onAcceptSuggestion?: () => void
  onFocus?: () => void
  onBlur?: () => void
  autoFocus?: boolean
  maxLength?: number
  ariaLabel?: string
}) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const Component = as === "textarea" ? "textarea" : "input"
  const showSuggestion = suggestion && !suggestion.accepted && !value
  useAutoGrowTextarea(inputRef, value, as === "textarea" && !showSuggestion)

  const handleFocus = () => {
    scrollSectionIntoView(inputRef.current)
    onFocus?.()
  }

  return (
    <div className={cn("group relative", className)}>
      {showSuggestion ? (
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <Component
              value={suggestion.value}
              readOnly
              className={cn(
                "w-full bg-primary/5 outline-none p-2 -mx-2 rounded-md border border-primary/20",
                "text-foreground/80 italic",
                as === "textarea" && "resize-none min-h-[100px]",
                inputClassName,
              )}
            />
          </div>
          <button
            type="button"
            onClick={onAcceptSuggestion}
            className="shrink-0 p-2 rounded-md bg-primary/20 hover:bg-primary/30 text-primary transition-colors"
            title="Accept suggestion"
          >
            <Check className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <Component
          ref={inputRef as never}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            onChange(e.target.value)
          }
          placeholder={placeholder}
          onFocus={handleFocus}
          onBlur={onBlur}
          autoFocus={autoFocus}
          maxLength={maxLength}
          aria-label={ariaLabel}
          className={cn(
            "w-full bg-transparent outline-none focus:ring-0 p-0 placeholder:text-muted-foreground/50",
            "transition-colors duration-200",
            "focus:bg-primary/5 px-2 -mx-2 rounded-md",
            as === "textarea" && "resize-none min-h-[100px] py-2",
            inputClassName,
          )}
        />
      )}
    </div>
  )
}
