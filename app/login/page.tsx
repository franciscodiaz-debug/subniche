import Image from 'next/image'
import Link from 'next/link'
import { loginAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubnicheLogo } from '@/components/app-shell/subniche-logo'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const params = await searchParams
  const redirectTo = params.redirect || '/'

  return (
    <div className="flex min-h-screen bg-background">
      {/* Form panel */}
      <div className="flex w-full flex-col lg:w-1/2">
        <div className="px-8 py-6">
          <Link href="/" aria-label="SubNiche home">
            <SubnicheLogo width={117} height={36} light priority />
          </Link>
        </div>

        <div className="flex flex-1 flex-col justify-center px-8 pb-12 lg:px-16">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Sign in to your account to continue
              </p>
            </div>

            <form action={loginAction} className="space-y-4">
              <input type="hidden" name="redirect" value={redirectTo} />

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="bg-card"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="bg-card"
                />
              </div>

              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-12 left-10 right-10">
          <p className="text-xl font-semibold leading-snug text-white">
            &ldquo;The community for people who take their gear seriously.&rdquo;
          </p>
          <p className="mt-3 text-sm text-white/60">SubNiche — guitars &amp; beyond</p>
        </div>
      </div>
    </div>
  )
}
