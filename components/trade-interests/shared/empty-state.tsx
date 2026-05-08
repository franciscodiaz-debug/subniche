"use client"

import { Repeat2, Sparkles, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface InterestEmptyStateProps {
  variant?: "compact" | "full"
  onAddNew?: () => void
  onLoadSaved?: () => void
  hasSavedAvailable?: boolean
  className?: string
}

export function InterestEmptyState({
  variant = "full",
  onAddNew,
  onLoadSaved,
  hasSavedAvailable = false,
  className,
}: InterestEmptyStateProps) {
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed border-border bg-card/40 px-5 py-6 text-center",
          className,
        )}
      >
        <Repeat2 className="mx-auto mb-2 h-5 w-5 text-muted-foreground/60" />
        <p className="text-sm font-medium text-foreground">No trade interests yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Add at least one to make this listing visible as For Trade.
        </p>
        {onAddNew && (
          <Button size="sm" className="mt-3 gap-1.5" onClick={onAddNew}>
            <Sparkles className="h-3.5 w-3.5" />
            Add your first interest
          </Button>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center sm:px-10",
        className,
      )}
    >
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <Target className="h-7 w-7 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">
        Tell us what you&apos;d trade for
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        Trade interests describe what you&apos;d accept in exchange for your
        item. The more specific you are, the better matches we surface.
      </p>

      <div className="mx-auto mt-6 grid max-w-lg gap-3 text-left sm:grid-cols-2">
        <ExampleCard
          title="Vintage Strat"
          chips={["Pre-CBS", "Sunburst", "$3-8k"]}
        />
        <ExampleCard
          title="Tube amp"
          chips={["Fender", "Combo", "<$2k"]}
        />
      </div>

      <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
        {onAddNew && (
          <Button size="lg" className="gap-2" onClick={onAddNew}>
            <Sparkles className="h-4 w-4" />
            Add your first interest
          </Button>
        )}
        {onLoadSaved && hasSavedAvailable && (
          <Button
            size="lg"
            variant="outline"
            className="gap-2"
            onClick={onLoadSaved}
          >
            Load from saved
          </Button>
        )}
      </div>
    </div>
  )
}

function ExampleCard({ title, chips }: { title: string; chips: string[] }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/50 px-3 py-2.5">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {chips.map((chip) => (
          <span
            key={chip}
            className="rounded-md bg-secondary/40 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  )
}
