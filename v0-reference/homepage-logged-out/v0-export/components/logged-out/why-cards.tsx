import type { LucideIcon } from "lucide-react"
import { Guitar, Layers, PlayCircle, Repeat2 } from "lucide-react"

interface WhyCard {
  number: string
  icon: LucideIcon
  title: string
  description: string
}

const cards: WhyCard[] = [
  {
    number: "01",
    icon: Guitar,
    title: "Your niche, your people",
    description:
      "Trade, sell, and collect with others as obsessed as you are.",
  },
  {
    number: "02",
    icon: Repeat2,
    title: "Trades, not transactions",
    description:
      "Automated trade matching and offer flow — cash optional.",
  },
  {
    number: "03",
    icon: Layers,
    title: "Showcase your collection",
    description:
      "Show what you're into — and connect with others who get it.",
  },
]

export function WhyCards() {
  return (
    <section className="mt-8 md:mt-10">
      <div className="mb-4 flex items-center gap-2">
        <span
          aria-hidden="true"
          className="h-4 w-[3px] rounded-full bg-primary"
        />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Why SN / MusicGear?
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map(({ number, icon: Icon, title, description }) => (
          <article
            key={number}
            className="group flex flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {number}
                </span>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <PlayCircle className="h-3.5 w-3.5" aria-hidden="true" />
                Watch
              </button>
            </div>

            <h3 className="text-base font-semibold text-foreground">
              {title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
