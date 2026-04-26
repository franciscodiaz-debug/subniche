import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "../ui/button"
import { WhyCards } from "./why-cards"

const stats = [
  { dot: "bg-success", label: "12,487", suffix: "pieces of gear listed" },
  { dot: "bg-primary", label: "42", suffix: "gear communities" },
  { dot: "bg-info", label: "3,214", suffix: "musicians online" },
]

export function HeroLoggedOut() {
  return (
    <section className="relative isolate overflow-hidden bg-background">
      {/* Background image + overlays — matches the signed-in hero */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/hero-guitar.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/30"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/90"
        />
      </div>

      <div className="px-4 pb-4 pt-2 md:px-8 md:pb-6 md:pt-4">
        <div className="flex items-center gap-2 text-lg font-semibold md:text-xl">
          <span className="text-primary">SN</span>
          <span className="text-muted-foreground/60">/</span>
          <span className="text-foreground">MusicGear</span>
        </div>

        <h1 className="mt-2 max-w-3xl text-balance text-2xl font-bold leading-tight tracking-tight text-foreground md:text-[2rem] md:leading-[1.15]">
          Where musicians{" "}
          <span className="text-primary">trade, sell, and collect.</span>
        </h1>

        <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
          Guitars, amps, pedals, synths, and the rare finds in between &mdash;
          for people who go deep on their gear.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Button asChild size="default" className="gap-1.5 rounded-lg">
            <Link href="/signup">
              Join free
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>

          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            {stats.map((stat) => (
              <li key={stat.suffix} className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${stat.dot}`}
                />
                <span className="font-medium text-foreground">
                  {stat.label}
                </span>
                <span className="text-muted-foreground">{stat.suffix}</span>
              </li>
            ))}
          </ul>
        </div>

        <WhyCards />
      </div>
    </section>
  )
}
