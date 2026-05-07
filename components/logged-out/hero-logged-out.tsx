import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroLoggedOut() {
  return (
    <section className="relative isolate overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/hero-guitar.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-30"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/40"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background"
        />
      </div>

      <div className="px-4 pb-14 pt-10 md:px-8 md:pb-20 md:pt-16">
        <div className="flex items-center gap-2 text-lg font-semibold md:text-xl">
          <span className="text-primary">SN</span>
          <span className="text-muted-foreground/60">/</span>
          <span className="text-foreground">MusicGear</span>
        </div>

        <h1 className="mt-3 max-w-3xl text-balance text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl md:leading-[1.1]">
          Where musicians{' '}
          <span className="text-primary">trade, sell, and collect.</span>
        </h1>

        <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
          Guitars, amps, pedals, synths, and the rare finds in between — for people
          who go deep on their gear.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4 md:gap-6">
          <Button asChild size="lg" className="rounded-xl gap-2 shrink-0">
            <Link href="/create-listing">
              List your gear
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="font-semibold text-foreground">12,487</span>
              <span className="text-muted-foreground">pieces of gear listed</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
              <span className="font-semibold text-foreground">42</span>
              <span className="text-muted-foreground">gear communities</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shrink-0" />
              <span className="font-semibold text-foreground">3,214</span>
              <span className="text-muted-foreground">musicians online</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
