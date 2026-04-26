import Link from "next/link";
import { ArrowRight, GalleryVerticalEnd, Repeat2, Store } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeader } from "@/components/ui/section-header";

const entryCards = [
  {
    href: "/market",
    title: "Market",
    description:
      "The future browse surface for high-signal niche inventory, filters, and item context.",
    icon: Store,
  },
  {
    href: "/trade",
    title: "Trade",
    description:
      "The trade-mode entry point where True Match, Inbound Interest, and Suggested stay distinct.",
    icon: Repeat2,
  },
  {
    href: "/collections",
    title: "Collections",
    description:
      "The trust and taste layer for showing ownership, curation, and niche credibility.",
    icon: GalleryVerticalEnd,
  },
];

export default function HomePage() {
  return (
    <PageShell>
      <SectionHeader
        eyebrow="SubNiche"
        title="A focused marketplace shell for enthusiast communities."
        description="This branch establishes the app frame: global layout, navigation, theme tokens, and placeholder routes. Full marketplace, profile, listing, inbox, and community pages come later."
        action={
          <Link
            href="/add-item"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-card transition hover:bg-primary/90"
          >
            Create Listing
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        }
      />

      <section className="grid gap-4 pt-8 md:grid-cols-3" aria-label="App shell entry points">
        {entryCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-xl border border-border bg-surface p-5 shadow-card transition hover:border-accent/40"
            >
              <div className="mb-5 grid size-11 place-items-center rounded-lg bg-accent/10 text-accent">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {card.description}
              </p>
              <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent">
                Open placeholder
                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
              </div>
            </Link>
          );
        })}
      </section>
    </PageShell>
  );
}
