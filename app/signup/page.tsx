import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'
import { SignupForm } from '@/components/auth/signup-form'
import { SubnicheLogo } from '@/components/app-shell/subniche-logo'

const FEATURES = [
  'Access the marketplace',
  'Connect directly with community',
  'Search and discover with ease',
  'Free to join — always',
]

const NICHE_SLUG_RE = /^[a-z0-9-]{1,64}$/

function safeNiche(value: string | undefined): string | undefined {
  if (!value) return undefined
  return NICHE_SLUG_RE.test(value) ? value : undefined
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ niche?: string }>
}) {
  const params = await searchParams
  const niche = safeNiche(params.niche)
  return (
    <div className="flex min-h-screen bg-background">
      {/* Form panel */}
      <div className="flex w-full flex-col lg:w-1/2">
        {/* Top bar — back link */}
        <div className="px-8 py-6 lg:px-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>

        <div className="flex flex-1 flex-col justify-center px-8 pb-12 lg:px-16">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8">
              <Link
                href="/"
                aria-label="SubNiche home"
                className="inline-block mb-6"
              >
                <SubnicheLogo width={140} height={43} light priority />
              </Link>
              <h1 className="text-3xl font-bold text-foreground">
                Join the community
              </h1>
              {niche && (
                <p className="mt-2 text-sm text-muted-foreground">
                  You&apos;ll join the{' '}
                  <span className="font-medium text-foreground">{niche}</span>{' '}
                  niche. You can add more later from your profile.
                </p>
              )}
            </div>

            <SignupForm niche={niche} />

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Decorative panel — features list */}
      <div className="relative hidden lg:block lg:w-1/2">
        <Image
          src="https://picsum.photos/seed/subniche-signup/800/1200"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-background/20" />
        <div className="absolute inset-x-10 bottom-12 space-y-4">
          {FEATURES.map((feature) => (
            <div key={feature} className="flex items-center gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Check className="h-4 w-4" />
              </div>
              <span className="text-base font-medium text-foreground">
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
