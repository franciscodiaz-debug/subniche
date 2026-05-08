"use client"

import * as React from "react"
import Link from "next/link"
import { AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { verifyEmailAction } from "@/app/actions/auth"

export function VerifyHandler({
  token,
  niche,
}: {
  token: string
  niche?: string
}) {
  const [status, setStatus] = React.useState<"verifying" | "error">(
    "verifying",
  )
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const ranRef = React.useRef(false)

  React.useEffect(() => {
    if (ranRef.current) return
    ranRef.current = true
    verifyEmailAction(token, niche).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : "Something went wrong"
      // NEXT_REDIRECT is the internal symbol Next.js throws for redirect();
      // it surfaces here as an error but is actually a successful redirect.
      if (typeof msg === "string" && msg.includes("NEXT_REDIRECT")) return
      setStatus("error")
      setErrorMessage(msg)
    })
  }, [token, niche])

  if (status === "verifying") {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Loader2 className="h-7 w-7 animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Verifying…</h2>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
          We&apos;re confirming your email. This will only take a moment.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h2 className="text-2xl font-bold text-foreground">
        Link is invalid or expired
      </h2>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
        {errorMessage ??
          "This link is no longer valid. Request a new one to continue."}
      </p>
      <Button asChild className="mt-6">
        <Link href="/signup">Back to signup</Link>
      </Button>
    </div>
  )
}
