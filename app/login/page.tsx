import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { LoginForm } from '@/components/auth/login-form'
import { SubnicheLogo } from '@/components/app-shell/subniche-logo'

const MAX_REDIRECT_LENGTH = 200

function safeRedirect(value: string | undefined): string {
  if (!value) return '/'
  if (value.length > MAX_REDIRECT_LENGTH) return '/'
  if (!value.startsWith('/') || value.startsWith('//')) return '/'
  return value
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const params = await searchParams
  const redirectTo = safeRedirect(params.redirect)

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
              <Link href="/" aria-label="SubNiche home" className="inline-block mb-6">
                <SubnicheLogo width={140} height={43} light priority />
              </Link>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back<span className="text-primary">.</span>
              </h1>
            </div>

            <LoginForm redirectTo={redirectTo} />

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Decorative panel */}
      <div className="relative hidden lg:block lg:w-1/2">
        <Image
          src="https://picsum.photos/seed/subniche-login/800/1200"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="absolute bottom-12 left-10 right-10">
          <p className="text-xl font-semibold leading-snug text-foreground">
            &ldquo;The best communities are built around shared passion. SubNiche
            makes that connection frictionless.&rdquo;
          </p>
          <p className="mt-3 text-sm italic text-muted-foreground">
            — Kyle K, Founder
          </p>
        </div>
      </div>
    </div>
  )
}
