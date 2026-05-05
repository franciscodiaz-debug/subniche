import Link from 'next/link'
import Image from 'next/image'
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
        <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary">
          SubNiche / MusicGear
        </span>

        <h1 className="mt-4 max-w-3xl text-balance text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl md:leading-[1.1]">
          Trade, sell, and collect gear{' '}
          <span className="text-primary">with people who get it.</span>
        </h1>

        <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
          SubNiche is a social marketplace built for musicians. Find rare instruments,
          trade with trusted sellers, and connect with communities around your obsession.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button asChild size="lg" className="rounded-xl">
            <Link href="/signup">Get started — it&apos;s free</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-xl border-border/50 bg-card/60 backdrop-blur">
            <Link href="/market?tab=for-sale">Browse the market</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
