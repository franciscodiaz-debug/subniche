import { cn } from "@/lib/utils"

interface DSSectionProps {
  id: string
  title: string
  source: "shadcn/ui" | "Custom" | "Foundation"
  children: React.ReactNode
  className?: string
}

const sourceStyles: Record<DSSectionProps["source"], string> = {
  "shadcn/ui": "bg-blue-500/10 text-blue-400 border-blue-500/30",
  Custom: "bg-primary/10 text-primary border-primary/30",
  Foundation: "bg-muted text-muted-foreground border-border",
}

export function DSSection({ id, title, source, children, className }: DSSectionProps) {
  return (
    <section id={id} className={cn("scroll-mt-6", className)}>
      <div className="mb-4 flex items-center gap-3">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-[11px] font-medium",
            sourceStyles[source],
          )}
        >
          {source}
        </span>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card/40 p-6">
        {children}
      </div>
    </section>
  )
}
