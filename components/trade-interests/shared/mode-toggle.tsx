"use client"

import { ListTree, Type } from "lucide-react"
import { cn } from "@/lib/utils"

export type AuthoringMode = "simple" | "advanced"

interface ModeToggleProps {
  value: AuthoringMode
  onChange: (mode: AuthoringMode) => void
  size?: "sm" | "md"
  className?: string
}

export function ModeToggle({
  value,
  onChange,
  size = "md",
  className,
}: ModeToggleProps) {
  const heightClass = size === "sm" ? "h-7" : "h-8"
  const padClass = size === "sm" ? "px-2.5" : "px-3"
  const textClass = size === "sm" ? "text-xs" : "text-sm"

  return (
    <div
      role="tablist"
      aria-label="Authoring mode"
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border border-border bg-card/60 p-0.5",
        className,
      )}
    >
      <ToggleButton
        active={value === "simple"}
        onClick={() => onChange("simple")}
        icon={Type}
        label="Simple"
        heightClass={heightClass}
        padClass={padClass}
        textClass={textClass}
      />
      <ToggleButton
        active={value === "advanced"}
        onClick={() => onChange("advanced")}
        icon={ListTree}
        label="Advanced"
        heightClass={heightClass}
        padClass={padClass}
        textClass={textClass}
      />
    </div>
  )
}

function ToggleButton({
  active,
  onClick,
  icon: Icon,
  label,
  heightClass,
  padClass,
  textClass,
}: {
  active: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  label: string
  heightClass: string
  padClass: string
  textClass: string
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md font-medium transition-colors",
        heightClass,
        padClass,
        textClass,
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}
