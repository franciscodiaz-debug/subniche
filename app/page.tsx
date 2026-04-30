import Link from "next/link"
import { ArrowUpRight, Plus, Telescope, Users } from "lucide-react"

import { Button } from "@/components/ui/button"

/**
 * Home page placeholder.
 *
 * Exists purely so visiting `/` doesn't render Next.js's default 404. The
 * global app shell (sidebar, header, mobile menu) is supplied by the root
 * ClientLayout, so this file only needs to provide a content area.
 */
export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 md:px-6 md:py-16 lg:px-8">
      <section className="flex flex-col items-start gap-6 text-pretty">
        <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary">
          SubNiche
        </span>
        <h1 className="font-serif text-4xl leading-tight text-foreground md:text-5xl lg:text-6xl">
          Your gear community, one listing at a time.
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Buy, sell, and trade with people who actually care about the stuff.
          Start by listing something you&apos;re open to moving, or explore what
          the community is offering.
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Button asChild size="lg" className="gap-2">
            <Link href="/create-listing">
              <Plus className="h-4 w-4" />
              Add a listing
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="gap-2">
            <Link href="/market?tab=for-sale">
              <Telescope className="h-4 w-4" />
              Explore the market
            </Link>
          </Button>
        </div>
      </section>

      {/* Lightweight “what lives here” row so the page feels intentional
          instead of blank while the real home experience is being designed. */}
      <section className="mt-16 grid gap-4 md:mt-20 md:grid-cols-3">
        <HomeCard
          icon={<Plus className="h-5 w-5 text-primary" />}
          title="List your gear"
          body="Create a for-sale, trade, or collection listing in a couple of minutes."
          href="/create-listing"
          cta="Start a listing"
        />
        <HomeCard
          icon={<Telescope className="h-5 w-5 text-primary" />}
          title="Browse the market"
          body="See what neighbors and fellow hobbyists have up for grabs right now."
          href="/market?tab=for-sale"
          cta="Open market"
        />
        <HomeCard
          icon={<Users className="h-5 w-5 text-primary" />}
          title="Find your people"
          body="Join communities built around the niches you spend the most time on."
          href="/communities"
          cta="Browse communities"
        />
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* Published listing demo index.                                        */}
      {/*                                                                      */}
      {/* Quick access row that exposes each state variant of the new          */}
      {/* listing detail page so reviewers don't have to guess the URL. Hidden */}
      {/* on small screens until the sm breakpoint because it is a prototype   */}
      {/* affordance, not a production surface.                                */}
      {/* -------------------------------------------------------------------- */}
      <section className="mt-12 rounded-xl border border-dashed border-border bg-card/40 p-5 md:mt-16 md:p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Prototype
            </p>
            <h2 className="mt-1 text-base font-semibold text-foreground md:text-lg">
              Preview a published listing
            </h2>
          </div>
          <span className="rounded-full border border-border bg-card px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            4 states
          </span>
        </div>

        <ul className="grid gap-2 sm:grid-cols-2">
          <DemoListingLink
            label="Viewer · mutual match"
            subline="1965 Fender Stratocaster"
            href="/listings/vintage-strat-1965"
          />
          <DemoListingLink
            label="Viewer · no match"
            subline="Two Rock Classic Reverb"
            href="/listings/dumble-overdrive"
          />
          <DemoListingLink
            label="Collection only"
            subline="1959 Les Paul Standard"
            href="/listings/les-paul-59"
          />
          <DemoListingLink
            label="Owner view"
            subline="'63 Telecaster Relic"
            href="/listings/owner-demo"
          />
        </ul>
      </section>
    </div>
  )
}

function DemoListingLink({
  label,
  subline,
  href,
}: {
  label: string
  subline: string
  href: string
}) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40 hover:bg-card/70"
      >
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="truncate text-xs text-muted-foreground">{subline}</p>
        </div>
        <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
      </Link>
    </li>
  )
}

function HomeCard({
  icon,
  title,
  body,
  href,
  cta,
}: {
  icon: React.ReactNode
  title: string
  body: string
  href: string
  cta: string
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-card/70"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
        {icon}
      </span>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
      <span className="mt-1 text-sm font-medium text-primary transition-transform group-hover:translate-x-0.5">
        {cta} →
      </span>
    </Link>
  )
}
