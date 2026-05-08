import Link from 'next/link'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SubnicheLogo } from '@/components/app-shell/subniche-logo'
import { VerifyHandler } from '@/components/auth/verify-handler'

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; niche?: string }>
}) {
  const { token, niche } = await searchParams

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <div className="px-8 py-6 lg:px-16">
        <Link href="/" aria-label="SubNiche home" className="inline-block">
          <SubnicheLogo width={140} height={43} light priority />
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 pb-12">
        <div className="mx-auto w-full max-w-sm">
          {token ? (
            <VerifyHandler token={token} niche={niche} />
          ) : (
            <MissingTokenView />
          )}
        </div>
      </div>
    </div>
  )
}

function MissingTokenView() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h2 className="text-2xl font-bold text-foreground">
        Missing verification token
      </h2>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
        This link is incomplete. Use the button in the email we sent you, or
        request a new one.
      </p>
      <Button asChild className="mt-6 gap-2">
        <Link href="/signup">
          <ArrowLeft className="h-4 w-4" />
          Back to signup
        </Link>
      </Button>
    </div>
  )
}
